import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
    private readonly logger = new Logger(SmsService.name);
    private readonly aligoKey: string;
    private readonly aligoUserId: string;
    private readonly senderNumber: string;

    constructor(private configService: ConfigService) {
        this.aligoKey = this.configService.get<string>('ALIGO_API_KEY');
        this.aligoUserId = this.configService.get<string>('ALIGO_USER_ID');
        this.senderNumber = this.configService.get<string>('ALIGO_SENDER');
    }

    async sendSms(receiver: string, msg: string) {
        if (!this.aligoKey || !this.aligoUserId) {
            this.logger.warn('[SmsService] Aligo credentials missing. Logging to console instead.');
            this.logger.log(`[SMS Mock] To ${receiver}: ${msg}`);
            return { success: true, mock: true };
        }

        try {
            const params = new URLSearchParams();
            params.append('key', this.aligoKey);
            params.append('userid', this.aligoUserId);
            params.append('sender', this.senderNumber);
            params.append('receiver', receiver);
            params.append('msg', msg);

            const response = await axios.post('https://apis.aligo.in/send/', params);

            if (response.data.result_code === '1') {
                this.logger.log(`[SmsService] SMS sent to ${receiver}`);
                return { success: true, data: response.data };
            } else {
                this.logger.error(`[SmsService] Failed to send SMS: ${response.data.message}`);
                return { success: false, error: response.data.message };
            }
        } catch (error) {
            this.logger.error(`[SmsService] Error calling Aligo API: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async sendVerificationCode(phone: string, code: string) {
        const msg = `[Schoolit] 인증번호는 [${code}] 입니다.`;
        return this.sendSms(phone, msg);
    }
}
