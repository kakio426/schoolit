import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { Resend } from 'resend';

// Mock Resend
jest.mock('resend', () => {
    return {
        Resend: jest.fn().mockImplementation(() => ({
            emails: {
                send: jest.fn().mockResolvedValue({ data: { id: 'test-email-id' }, error: null }),
            },
        })),
    };
});

const mockConfigService = {
    get: jest.fn((key: string) => {
        switch (key) {
            case 'RESEND_API_KEY': return 're_123456789';
            case 'EMAIL_FROM': return 'test@edupin.com';
            default: return null;
        }
    }),
};

describe('EmailService', () => {
    let service: EmailService;
    let resendMock: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailService,
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<EmailService>(EmailService);

        // Get the instance of the mocked Resend class
        resendMock = (service as any).resend;

        // Manually trigger onModuleInit since tests don't always do it automatically
        service.onModuleInit();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should initialize Resend with API key', () => {
        expect(Resend).toHaveBeenCalledWith('re_123456789');
    });

    it('should send verification code using Resend API', async () => {
        const email = 'test@korea.kr';
        const code = '123456';

        await service.sendVerificationCode(email, code);

        // Access the mock directly from the service instance
        expect((service as any).resend.emails.send).toHaveBeenCalledWith(expect.objectContaining({
            to: [email],
            subject: expect.stringContaining('인증번호'),
            html: expect.stringContaining(code),
        }));
    });
});
