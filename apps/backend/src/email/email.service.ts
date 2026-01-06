import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    async sendVerificationCode(email: string, code: string) {
        // In a real app, integrate Nodemailer or AWS SES here.
        // For now, we log the code to the console for development.
        this.logger.log(`[Email Mock] Sending OTP to ${email}: ${code}`);
        console.log(`\n\n==================================================`);
        console.log(`[Email Mock] Verification Code for ${email}: ${code}`);
        console.log(`==================================================\n\n`);
        return true;
    }
}
