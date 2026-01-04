import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DiscordService } from './discord.service';

@Injectable()
export class FeedbackService {
    constructor(
        private prisma: PrismaService,
        private discord: DiscordService
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

        // TODO: Send Notification to User (Phase 4)

        return feedback;
    }
}
