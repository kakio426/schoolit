import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { IStorageService } from './interfaces/storage.interface';

@Injectable()
export class CloudinaryService implements IStorageService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    // Cloudinary 설정 초기화
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });

    this.logger.log('Cloudinary configured successfully');
  }

  /**
   * Multer 파일을 Cloudinary에 업로드하고 public_id를 반환
   */
  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `edupin/${folder}`,
          resource_type: 'auto',
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error(`Upload failed: ${error.message}`);
            reject(error);
          } else if (result) {
            this.logger.log(`File uploaded: ${result.public_id}`);
            resolve(result.public_id);
          }
        },
      );

      // Buffer를 스트림으로 전송
      uploadStream.end(file.buffer);
    });
  }

  /**
   * Buffer 데이터를 Cloudinary에 업로드
   */
  async uploadBuffer(buffer: Buffer, folder: string, filename?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `edupin/${folder}`,
          resource_type: 'auto',
          public_id: filename,
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error(`Buffer upload failed: ${error.message}`);
            reject(error);
          } else if (result) {
            this.logger.log(`Buffer uploaded: ${result.public_id}`);
            resolve(result.public_id);
          }
        },
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Cloudinary에서 파일 삭제
   */
  async deleteFile(imageId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(imageId);
      if (result.result === 'ok') {
        this.logger.log(`File deleted: ${imageId}`);
      } else {
        this.logger.warn(`File deletion result: ${result.result} for ${imageId}`);
      }
    } catch (error) {
      this.logger.error(`Delete failed for ${imageId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * public_id로 Cloudinary URL 생성
   */
  getFileUrl(imageId: string): string {
    if (!imageId) return '';

    // Cloudinary URL 직접 생성
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    return `https://res.cloudinary.com/${cloudName}/image/upload/${imageId}`;
  }

  /**
   * 최적화된 URL 생성 (리사이징, 포맷 변환 등)
   */
  getOptimizedUrl(
    imageId: string,
    options?: { width?: number; height?: number; format?: string },
  ): string {
    if (!imageId) return '';

    const transformations: string[] = [];

    if (options?.width) transformations.push(`w_${options.width}`);
    if (options?.height) transformations.push(`h_${options.height}`);
    if (options?.format) transformations.push(`f_${options.format}`);

    // 자동 퀄리티 및 포맷 최적화
    transformations.push('q_auto', 'f_auto');

    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const transformation = transformations.join(',');

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${imageId}`;
  }
}
