import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { PrismaModule } from '../prisma.module';
import { StorageModule } from '../common/storage/storage.module';

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [BoardController],
    providers: [BoardService],
    exports: [BoardService],
})
export class BoardModule { }
