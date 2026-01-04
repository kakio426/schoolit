import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { PrismaService } from '../prisma.service';
import { DiscordService } from './discord.service';

@Module({
    controllers: [FeedbackController],
    providers: [FeedbackService, PrismaService, DiscordService],
})
export class FeedbackModule { }
