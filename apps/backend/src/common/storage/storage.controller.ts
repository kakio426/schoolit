import {
    Controller,
    Post,
    Delete,
    Get,
    Param,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { IStorageService, STORAGE_SERVICE } from './interfaces/storage.interface';

/**
 * Storage Controller
 *
 * 파일 업로드/삭제/조회 API 제공
 * 테스트 및 범용 파일 업로드에 사용
 */
@Controller('api/storage')
export class StorageController {
    constructor(
        @Inject(STORAGE_SERVICE) private readonly storageService: IStorageService,
    ) { }

    /**
     * 이미지 업로드 (테스트용)
     * POST /api/storage/upload
     */
    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(), // Cloudinary로 직접 업로드하기 위해 메모리에 저장
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
                    return cb(
                        new BadRequestException('Only image files are allowed'),
                        false,
                    );
                }
                cb(null, true);
            },
        }),
    )
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
    ): Promise<{ imageId: string; url: string }> {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        const imageId = await this.storageService.uploadFile(file, 'uploads');
        const url = this.storageService.getFileUrl(imageId);

        return { imageId, url };
    }

    /**
     * 이미지 정보 조회
     * GET /api/storage/:imageId
     */
    @Get(':imageId(*)')
    getFileUrl(@Param('imageId') imageId: string): { imageId: string; url: string } {
        const url = this.storageService.getFileUrl(imageId);
        return { imageId, url };
    }

    /**
     * 이미지 삭제
     * DELETE /api/storage/:imageId
     */
    @Delete(':imageId(*)')
    async deleteFile(
        @Param('imageId') imageId: string,
    ): Promise<{ deleted: boolean; imageId: string }> {
        await this.storageService.deleteFile(imageId);
        return { deleted: true, imageId };
    }
}
