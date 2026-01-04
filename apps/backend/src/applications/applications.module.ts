import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { PrismaModule } from '../prisma.module';
import { ChatModule } from '../chat/chat.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [PrismaModule, ChatModule, NotificationsModule],
    providers: [ApplicationsService],
    controllers: [ApplicationsController],
    exports: [ApplicationsService],
})
export class ApplicationsModule { }
