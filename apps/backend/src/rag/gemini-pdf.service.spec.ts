import { Test, TestingModule } from '@nestjs/testing';
import { GeminiPdfService } from './gemini-pdf.service';
import { ConfigService } from '@nestjs/config';

// Mock @google/generative-ai
jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: jest.fn().mockResolvedValue({
                response: {
                    text: jest.fn().mockReturnValue('Extracted text from PDF document'),
                },
            }),
        }),
    })),
}));

/**
 * TDD GREEN Phase: Gemini API를 사용한 PDF 텍스트 추출 테스트
 * pdf-parse 대신 Gemini API를 사용하여 Railway 메모리 문제 해결
 */
describe('GeminiPdfService', () => {
    let service: GeminiPdfService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GeminiPdfService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('mock-api-key'),
                    },
                },
            ],
        }).compile();

        service = module.get<GeminiPdfService>(GeminiPdfService);
    });

    /**
     * TEST 1: Base64 PDF에서 텍스트 추출 메서드가 존재해야 함
     */
    it('should have extractTextFromPdf method', () => {
        expect(service.extractTextFromPdf).toBeDefined();
        expect(typeof service.extractTextFromPdf).toBe('function');
    });

    /**
     * TEST 2: Base64 인코딩된 PDF를 받아 텍스트를 반환해야 함
     */
    it('should extract text from base64 PDF', async () => {
        const mockBase64 = 'JVBERi0xLjQKMSAwIG9iago...';
        const result = await service.extractTextFromPdf(mockBase64);

        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result).toBe('Extracted text from PDF document');
    });

    /**
     * TEST 3: 파일 크기 제한 검증 (20MB 초과 시 에러)
     */
    it('should reject base64 data larger than 20MB', async () => {
        const largeBase64 = 'A'.repeat(28 * 1024 * 1024); // 28MB Base64 ≈ 21MB 원본

        await expect(service.extractTextFromPdf(largeBase64))
            .rejects.toThrow('파일이 너무 큽니다');
    });
});
