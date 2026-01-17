import { Test, TestingModule } from '@nestjs/testing';
import { GeminiPdfService } from './gemini-pdf.service';
import { ConfigService } from '@nestjs/config';

// Mock ConfigService
const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-api-key'),
};

// Mock classes
const mockGoogleAIFileManager = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
};

const mockGoogleGenerativeAI = {
    getGenerativeModel: jest.fn(),
};

const mockModel = {
    generateContent: jest.fn(),
};

// Mock Dependencies
jest.mock('@google/generative-ai/server', () => ({
    GoogleAIFileManager: jest.fn().mockImplementation(() => mockGoogleAIFileManager),
}));

jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => mockGoogleGenerativeAI),
}));

describe('GeminiPdfService (File API)', () => {
    let service: GeminiPdfService;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GeminiPdfService,
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<GeminiPdfService>(GeminiPdfService);

        // Setup default mocks
        mockGoogleGenerativeAI.getGenerativeModel.mockReturnValue(mockModel);
        mockModel.generateContent.mockResolvedValue({
            response: {
                text: () => 'Extracted text content',
            },
        });
        mockGoogleAIFileManager.uploadFile.mockResolvedValue({
            file: {
                uri: 'https://generativelanguage.googleapis.com/v1beta/files/mock-file-uri',
                name: 'files/mock-file-name',
            },
        });
        mockGoogleAIFileManager.deleteFile.mockResolvedValue({});
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('processFile', () => {
        const mockFilePath = '/tmp/test.pdf';
        const mockMimeType = 'application/pdf';

        it('should upload file, generate content, and delete file', async () => {
            const result = await service.processFile(mockFilePath, mockMimeType);

            // 1. Upload
            expect(mockGoogleAIFileManager.uploadFile).toHaveBeenCalledWith(mockFilePath, {
                mimeType: mockMimeType,
                displayName: expect.any(String),
            });

            // 2. Generate Content with URI
            expect(mockModel.generateContent).toHaveBeenCalledWith([
                {
                    fileData: {
                        mimeType: mockMimeType,
                        fileUri: 'https://generativelanguage.googleapis.com/v1beta/files/mock-file-uri',
                    },
                },
                expect.objectContaining({ text: expect.stringContaining('추출해 주세요') }),
            ]);

            // 3. Delete File
            expect(mockGoogleAIFileManager.deleteFile).toHaveBeenCalledWith('files/mock-file-name');

            // 4. Return text
            expect(result).toBe('Extracted text content');
        });

        it('should delete file even if generation fails', async () => {
            mockModel.generateContent.mockRejectedValue(new Error('Generation Error'));

            await expect(service.processFile(mockFilePath, mockMimeType)).rejects.toThrow('PDF 텍스트 추출 실패');

            // Verify delete is called
            expect(mockGoogleAIFileManager.deleteFile).toHaveBeenCalledWith('files/mock-file-name');
        });
    });
});
