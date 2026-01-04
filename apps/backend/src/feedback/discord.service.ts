import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DiscordService {
    private readonly logger = new Logger(DiscordService.name);
    private readonly webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    async sendNotification(title: string, message: string, color: number = 0x5865F2) {
        if (!this.webhookUrl) {
            this.logger.warn('Discord webhook URL not found');
            return;
        }

        try {
            await axios.post(this.webhookUrl, {
                embeds: [
                    {
                        title: title,
                        description: message,
                        color: color,
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: 'School It Notification System',
                        },
                    },
                ],
            });
            this.logger.log(`Discord notification sent: ${title}`);
        } catch (error) {
            // Safe fail: Don't crash the app if Discord is down
            this.logger.error('Failed to send Discord notification', error);
        }
    }

    // Helper method for feedback specific styling
    async sendFeedbackNotification(category: string, content: string, userEmail: string = 'Anonymous', feedbackId: number) {
        const colors: Record<string, number> = {
            'PROPOSAL': 0xF1C40F, // Yellow
            'BUG': 0xE74C3C,      // Red
            'PRAISE': 0x2ECC71,   // Green
            'INQUIRY': 0x3498DB   // Blue
        };

        const color = colors[category] || 0x95A5A6; // Gray default
        const title = `[New Feedback] ${category}`;
        const message = `**User**: ${userEmail}\n**Content**: ${content}\n\n[Manage in Dashboard](http://localhost:3000/dashboard/admin/feedback)`; // TODO: Update URL for prod

        await this.sendNotification(title, message, color);
    }
}
