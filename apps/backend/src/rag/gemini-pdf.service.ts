import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini API를 사용한 PDF 텍스트 추출 서비스
 * pdf-parse 대신 사용하여 Railway 메모리 문제 해결
 */
@Injectable()
export class GeminiPdfService {
    private readonly logger = new Logger(GeminiPdfService.name);
    private readonly genAI: GoogleGenerativeAI;
    private readonly MAX_FILE_SIZE_MB = 20;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not configured');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    /**
     * Base64 인코딩된 PDF에서 텍스트 추출
     * @param base64Data Base64 인코딩된 PDF 데이터
     * @returns 추출된 텍스트
     */
    async extractTextFromPdf(base64Data: string): Promise<string> {
        // 파일 크기 검증 (Base64는 원본보다 약 33% 큼)
        const estimatedSizeMB = (base64Data.length * 0.75) / (1024 * 1024);
        if (estimatedSizeMB > this.MAX_FILE_SIZE_MB) {
            throw new Error(
                `파일이 너무 큽니다. 최대 ${this.MAX_FILE_SIZE_MB}MB까지 업로드 가능합니다. (예상 크기: ${estimatedSizeMB.toFixed(2)}MB)`,
            );
        }

        this.logger.log(`Extracting text from PDF (estimated ${estimatedSizeMB.toFixed(2)}MB)`);

        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const result = await model.generateContent([
                {
                    inlineData: {
                        mimeType: 'application/pdf',
                        data: base64Data,
                    },
                },
                {
                    text: '이 PDF 문서의 모든 텍스트 내용을 그대로 추출해 주세요. 요약하지 말고, 원문 그대로 출력해 주세요. 마크다운 형식 없이 순수 텍스트만 출력하세요.',
                },
            ]);

            const response = await result.response;
            const text = response.text();

            this.logger.log(`Extracted ${text.length} characters from PDF`);
            return text;
        } catch (error) {
            this.logger.error('Failed to extract text from PDF:', error);
            throw new Error(`PDF 텍스트 추출 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        }
    }
}
