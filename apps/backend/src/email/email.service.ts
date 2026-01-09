import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;

  constructor(private configService: ConfigService) { }

  onModuleInit() {
    this.logger.log('Initializing Resend Email Client...');
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY is not set in .env. Email sending will fail.');
    }

    this.resend = new Resend(apiKey);
  }

  async sendVerificationCode(email: string, code: string) {
    // Verified domain: schoolit.shop
    // Use the root domain instead of the 'send' subdomain for the FROM address.
    const from = 'Schoolit <onboarding@schoolit.shop>';

    this.logger.log(`Attempting to send email to ${email} via Resend...`);

    try {
      const { data, error } = await this.resend.emails.send({
        from: from,
        to: [email],
        subject: '[Schoolit] 학교/기관 인증번호 안내',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #0070f3; text-align: center;">학교/기관 인증 번호</h2>
          <p style="font-size: 16px; color: #333; line-height: 1.5;">
            안녕하세요,<br>
            Schoolit 서비스를 이용해 주셔서 감사합니다.<br>
            요청하신 학교/기관 인증 번호는 다음과 같습니다.
          </p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">${code}</span>
          </div>
          <p style="font-size: 14px; color: #777; text-align: center;">
            본 인증 번호는 5분간 유효합니다.<br>
            본인이 요청하지 않았다면 이 메일을 무시해 주세요.
          </p>
        </div>
      `,
      });

      if (error) {
        this.logger.error(`Resend API Error: ${error.message}`);
        throw new Error(error.message);
      }

      this.logger.log(`Email sent successfully: ${data?.id}`);
      return true;
    } catch (error: any) {
      this.logger.error(`==== EMAIL SEND ERROR ====`);
      this.logger.error(error.message);
      throw error;
    }
  }
}
