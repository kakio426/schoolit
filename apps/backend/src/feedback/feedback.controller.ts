import { Controller, Post, Body, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) { }

    @Post()
    async create(@Body() body: { category: string; content: string; userId?: number }) {
        return this.feedbackService.create(body);
    }

    @Get()
    async findAll() {
        return this.feedbackService.findAll();
    }

    @Patch(':id/reply')
    async reply(@Param('id') id: string, @Body('reply') reply: string) {
        return this.feedbackService.reply(Number(id), reply);
    }
}
