import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';
import { STORAGE_SERVICE } from './interfaces/storage.interface';
import { StorageController } from './storage.controller';

/**
 * Storage Module
 *
 * 여기서 Provider를 변경하면 전체 앱의 Storage 구현체가 바뀝니다.
 * 예: CloudinaryService → S3Service
 */
@Module({
  imports: [ConfigModule],
  controllers: [StorageController],
  providers: [
    {
      provide: STORAGE_SERVICE,
      useClass: CloudinaryService, // 이 줄만 바꾸면 S3, GCS 등으로 교체 가능
    },
    CloudinaryService, // 직접 주입도 가능하도록
  ],
  exports: [STORAGE_SERVICE, CloudinaryService],
})
export class StorageModule {}
