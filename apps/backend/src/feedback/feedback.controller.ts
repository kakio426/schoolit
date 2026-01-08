import { Controller, Post, Body, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) { }

  @Post()
  async create(@Body() body: { category: string; content: string; userId?: number }) {
    return this.feedbackService.create(body);
  }

  @Post('report')
  async report(@Body() body: { targetUserId: number; reason: string; description: string; reporterId?: number }) {
    // Map report to feedback structure for now, but prefix category
    return this.feedbackService.create({
      category: `REPORT:${body.reason}`,
      content: `TARGET_USER_ID: ${body.targetUserId}\nDETAILS: ${body.description}`,
      userId: body.reporterId
    });
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async findAll() {
    return this.feedbackService.findAll();
  }

  @Patch(':id/reply')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async reply(@Param('id') id: string, @Body('reply') reply: string) {
    return this.feedbackService.reply(Number(id), reply);
  }
}
