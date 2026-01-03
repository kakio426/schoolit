import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { PrismaModule } from '../prisma.module';
import { ChatModule } from '../chat/chat.module';

@Module({
    imports: [PrismaModule, ChatModule],
    providers: [ApplicationsService],
    controllers: [ApplicationsController],
    exports: [ApplicationsService],
})
export class ApplicationsModule { }
