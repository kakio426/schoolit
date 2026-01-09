import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendVerificationCode(email: string, code: string) {
    const from = this.configService.get<string>('EMAIL_FROM') || 'Edupin <no-reply@edupin.com>';

    const mailOptions = {
      from,
      to: email,
      subject: '[Edupin] 학교/기관 인증번호 안내',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #0070f3; text-align: center;">학교/기관 인증 번호</h2>
          <p style="font-size: 16px; color: #333; line-height: 1.5;">
            안녕하세요,<br>
            Edupin 서비스를 이용해 주셔서 감사합니다.<br>
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
    };

    try {
      this.logger.log(`Sending email to ${email}...`);
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error;
    }
  }
}
