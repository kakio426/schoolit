import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Body, ForbiddenException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { UploadFileDto } from './dto/upload-file.dto';

@Controller('upload')
export class FileUploadController {
    constructor(private readonly storageService: StorageService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: any, @Body() body: UploadFileDto) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        // Note: In a real "Zero-File" or "Hybrid" scenario, we might want to validate stricter.
        // Also, body.consent comes in as string 'true' from FormData usually, but ValidationPipe with transform handles it if configured.
        // We'll rely on ValidationPipe.

        if (!body || !body.consent) {
            throw new ForbiddenException('Consent for overseas transfer and temporary storage is required');
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Invalid file type');
        }

        // 7 Days expiration
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);

        // Tagging for Lifecycle
        const result = await this.storageService.upload(file, 'Expire=True');

        return {
            ...result,
            expirationDate,
        };
    }
}
