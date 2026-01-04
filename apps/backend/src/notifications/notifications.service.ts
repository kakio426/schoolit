import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationsGateway,
  ) {}

  async create(data: {
    userId: number;
    type: string;
    title: string;
    content: string;
    link?: string;
  }) {
    const notification = await this.prisma.notification.create({
      data,
    });
    this.gateway.server.to(`user_${data.userId}`).emit('notification', notification);
    return notification;
  }

  async findAll(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }
}
