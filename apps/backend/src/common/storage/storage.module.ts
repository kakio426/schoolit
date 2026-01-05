import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileUploadController } from './file-upload.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    controllers: [FileUploadController],
    providers: [StorageService],
    exports: [StorageService],
})
export class StorageModule { }
