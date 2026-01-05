import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';

// Mock S3Client
jest.mock('@aws-sdk/client-s3', () => {
    return {
        S3Client: jest.fn().mockImplementation(() => {
            return {
                send: jest.fn().mockResolvedValue({})
            };
        }),
        PutObjectCommand: jest.fn()
    };
});

describe('StorageService', () => {
    let service: StorageService;

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'AWS_S3_REGION') return 'ap-northeast-2';
            if (key === 'AWS_ACCESS_KEY_ID') return 'test-key';
            if (key === 'AWS_SECRET_ACCESS_KEY') return 'test-secret';
            if (key === 'AWS_S3_BUCKET_NAME') return 'test-bucket';
            return null;
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StorageService,
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        service = module.get<StorageService>(StorageService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should throw error if config is missing', async () => {
        const badConfigService = { get: jest.fn(() => null) };
        await expect(Test.createTestingModule({
            providers: [
                StorageService,
                { provide: ConfigService, useValue: badConfigService }
            ]
        }).compile()).rejects.toThrow('AWS credentials missing');
    });

    it('should upload file', async () => {
        const file = {
            originalname: 'test.jpg',
            buffer: Buffer.from('data'),
            mimetype: 'image/jpeg'
        };

        const result = await service.upload(file, 'Tag');

        expect(result.key).toContain('.jpg');
        expect(result.location).toContain('test-bucket');
    });
});
