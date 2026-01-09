import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');
const sendMailMock = jest.fn();
(nodemailer.createTransport as jest.Mock).mockReturnValue({
    sendMail: sendMailMock,
});

const mockConfigService = {
    get: jest.fn((key: string) => {
        switch (key) {
            case 'EMAIL_USER': return 'test@gmail.com';
            case 'EMAIL_PASSWORD': return 'password';
            case 'EMAIL_FROM': return 'test@edupin.com';
            default: return null;
        }
    }),
};

describe('EmailService', () => {
    let service: EmailService;

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
        sendMailMock.mockClear();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should send verification code using nodemailer', async () => {
        const email = 'test@korea.kr';
        const code = '123456';

        await service.sendVerificationCode(email, code);

        expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({
            service: 'gmail',
            auth: {
                user: 'test@gmail.com',
                pass: 'password'
            }
        }));

        expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
            to: email,
            subject: expect.stringContaining('인증번호'),
            html: expect.stringContaining(code),
        }));
    });
});
