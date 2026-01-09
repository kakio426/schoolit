import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) { }

  onModuleInit() {
    this.logger.log('Initializing Email Transporter...');
    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.configService.get<string>('EMAIL_PASSWORD');

    if (!user || !pass) {
      this.logger.warn('EMAIL_USER or EMAIL_PASSWORD is not set in .env. Email sending will fail.');
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: user,
        pass: pass,
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });

    // Verify connection configuration
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('Email Transporter verification failed:');
        this.logger.error(error);
      } else {
        this.logger.log('Email Transporter is ready to take messages');
      }
    });
  }

  async sendVerificationCode(email: string, code: string) {
    const from = this.configService.get<string>('EMAIL_FROM') || 'Schoolit <no-reply@edupin.com>';

    this.logger.log(`Attempting to send email to ${email}...`);

    const mailOptions = {
      from,
      to: email,
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
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error: any) {
      this.logger.error(`==== EMAIL SEND ERROR ====`);
      this.logger.error(`Error: ${error.message}`);
      if (error.code === 'EAUTH') {
        this.logger.error('Authentication failed. Check your Gmail App Password.');
      } else if (error.code === 'ECONNECTION') {
        this.logger.error('Connection failed. Check your network or firewall.');
      }
      this.logger.error(error.stack);
      throw error;
    }
  }
}
