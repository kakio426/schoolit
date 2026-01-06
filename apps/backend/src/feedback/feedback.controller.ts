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
