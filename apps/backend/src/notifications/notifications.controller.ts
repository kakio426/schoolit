import { Controller, Get, Patch, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  async getNotifications(@Request() req) {
    return this.service.findAll(req.user.userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.service.markAsRead(id);
  }
}
