import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import * as fs from 'fs';

/**
 * Gemini File API를 사용한 PDF 텍스트 추출 서비스
 * 메모리 효율적인 파일 처리로 Railway OOM 문제 해결
 */
@Injectable()
export class GeminiPdfService {
    private readonly logger = new Logger(GeminiPdfService.name);
    private readonly genAI: GoogleGenerativeAI;
    private readonly fileManager: GoogleAIFileManager;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not configured');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.fileManager = new GoogleAIFileManager(apiKey);
    }

    /**
     * PDF 파일을 업로드하고 텍스트를 추출 (Memory-Safe)
     * @param filePath 로컬 임시 파일 경로
     * @param mimeType 파일 MIME 타입 (기본: application/pdf)
     * @returns 추출된 텍스트
     */
    async processFile(filePath: string, mimeType: string = 'application/pdf'): Promise<string> {
        this.logger.log(`Processing file via Gemini File API: ${filePath}`);
        let uploadResult = null;

        try {
            // 1. Upload file to Gemini
            uploadResult = await this.fileManager.uploadFile(filePath, {
                mimeType,
                displayName: `upload_${Date.now()}`,
            });
            const fileUri = uploadResult.file.uri;
            const fileName = uploadResult.file.name;
            this.logger.log(`File uploaded to Gemini: ${fileUri}`);

            // 2. Generate content using file URI
            const model = this.genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
            const result = await model.generateContent([
                {
                    fileData: {
                        mimeType,
                        fileUri: fileUri,
                    },
                },
                {
                    text: '이 문서의 모든 텍스트 내용을 그대로 추출해 주세요. 요약하지 말고, 원문 그대로 출력해 주세요. 마크다운 형식 없이 순수 텍스트만 출력하세요.',
                },
            ]);

            const response = await result.response;
            const text = response.text();
            this.logger.log(`Extracted ${text.length} characters via File API`);

            // 3. Delete file from Gemini (Cleanup)
            await this.fileManager.deleteFile(fileName);
            this.logger.log(`Remote file deleted: ${fileName}`);

            return text;

        } catch (error) {
            this.logger.error('Failed to process file with Gemini:', error);
            // Cleanup on error if upload succeeded
            if (uploadResult?.file?.name) {
                try {
                    await this.fileManager.deleteFile(uploadResult.file.name);
                } catch (cleanupError) {
                    this.logger.warn(`Failed to cleanup remote file: ${cleanupError}`);
                }
            }
            throw new Error(`PDF 텍스트 추출 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
            // 4. Delete local temp file
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    this.logger.log(`Local temp file deleted: ${filePath}`);
                }
            } catch (fsError) {
                this.logger.warn(`Failed to delete local temp file: ${fsError}`);
            }
        }
    }
}
