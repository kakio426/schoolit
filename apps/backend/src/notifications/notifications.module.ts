import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from '../prisma.service';
import { NotificationsController } from './notifications.controller';

@Module({
    controllers: [NotificationsController],
    providers: [NotificationsService, NotificationsGateway, PrismaService],
    exports: [NotificationsService]
})
export class NotificationsModule { }
