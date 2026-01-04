import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DiscordService } from './discord.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FeedbackService {
    constructor(
        private prisma: PrismaService,
        private discord: DiscordService,
        private notifications: NotificationsService
    ) { }

    async create(data: { userId?: number; category: string; content: string }) {
        // 1. Save to Database
        const feedback = await this.prisma.feedback.create({
            data: {
                category: data.category,
                content: data.content,
                userId: data.userId,
            },
            include: {
                user: true
            }
        });

        // 2. Send Discord Notification (Async, don't block response)
        const userEmail = feedback.user ? feedback.user.email : 'Anonymous';
        this.discord.sendFeedbackNotification(data.category, data.content, userEmail, feedback.id);

        return feedback;
    }

    async findAll() {
        return this.prisma.feedback.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { email: true, name: true } } }
        });
    }

    async reply(id: number, replyContent: string) {
        const feedback = await this.prisma.feedback.update({
            where: { id },
            data: {
                reply: replyContent,
                status: 'ANSWERED'
            }
        });

        // Send Notification to User if userId exists
        if (feedback.userId) {
            await this.notifications.createNotification(
                feedback.userId,
                'SYSTEM', // Or 'FEEDBACK_REPLY' if enum supports it, but SYSTEM is safe
                '관리자 답변 등록',
                `보내주신 의견(${feedback.category})에 대한 답변이 등록되었습니다.`,
                '/dashboard/profile' // Link to where they can see it? Or maybe just alert logic. For now profile.
            );
        }

        return feedback;
    }
}
