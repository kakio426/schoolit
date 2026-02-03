
import { AiParserService } from '../../ai-parser/ai-parser.service';
import { ConfigService } from '@nestjs/config';

// Mock ConfigService
const mockConfigService = {
    get: jest.fn(),
};

// Mock the Gemini SDK
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn().mockReturnValue({
    generateContent: mockGenerateContent,
});

jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: mockGetGenerativeModel,
            };
        }),
    };
});

describe('AiParserService', () => {
    let service: AiParserService;

    beforeEach(() => {
        // Mock API key return
        (mockConfigService.get as jest.Mock).mockReturnValue('TEST_API_KEY');

        service = new AiParserService(mockConfigService as unknown as ConfigService);
        jest.clearAllMocks();
        // Re-apply mock return because clearAllMocks clears it
        (mockConfigService.get as jest.Mock).mockReturnValue('TEST_API_KEY');
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should extract job details from text', async () => {
        const rawText = `
        Seoul Elementary School is hiring a Math Teacher.
        Salary: 2.5 million KRW.
        Deadline: 2026-03-01.
        Contact: 02-123-4567.
        `;

        const mockJsonResponse = JSON.stringify({
            schoolName: 'Seoul Elementary School',
            subject: 'Math',
            salary: '2.5 million KRW',
            closingDate: '2026-03-01'
        });

        // Mock the response structure from Gemini
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => mockJsonResponse
            }
        });

        const result = await service.parseJobPost(rawText);
        expect(result.schoolName).toBe('Seoul Elementary School');
        expect(result.subject).toBe('Math');
        expect(result.closingDate).toBe('2026-03-01');
    });

    it('should handle invalid JSON response from AI gracefully', async () => {
        const rawText = "Some random text";
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => "This is not JSON"
            }
        });

        await expect(service.parseJobPost(rawText)).rejects.toThrow();
    });
});
