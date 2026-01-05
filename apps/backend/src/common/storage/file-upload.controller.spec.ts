import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadController } from './file-upload.controller';
import { StorageService } from './storage.service';
import { BadRequestException } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';

// Define a simple mock for StorageService
const mockStorageService = {
    upload: jest.fn(),
};

describe('FileUploadController', () => {
    let controller: FileUploadController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FileUploadController],
            providers: [
                { provide: StorageService, useValue: mockStorageService },
            ],
        }).compile();

        controller = module.get<FileUploadController>(FileUploadController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('uploadFile', () => {
        it('should throw BadRequestException if file is missing', async () => {
            // We pass 'undefined' as file
            await expect(controller.uploadFile(undefined, { consent: true } as any))
                .rejects.toThrow(BadRequestException);
        });

        it('should throw ForbiddenException if consent is missing', async () => {
            const file = { mimetype: 'application/pdf' };
            // We pass consent: false or undefined
            await expect(controller.uploadFile(file, { consent: false } as any))
                .rejects.toThrow(ForbiddenException);
        });

        it('should throw BadRequestException for invalid mime type', async () => {
            const file = { mimetype: 'application/x-msdownload' }; // exe
            await expect(controller.uploadFile(file, { consent: true } as any))
                .rejects.toThrow(BadRequestException);
        });

        it('should upload valid file if consent is given', async () => {
            const file = { mimetype: 'application/pdf', originalname: 'test.pdf', buffer: Buffer.from('') };
            mockStorageService.upload.mockResolvedValue({ key: 'uuid.pdf', location: 's3://...' });

            const result = await controller.uploadFile(file, { consent: true } as any);

            expect(result).toHaveProperty('expirationDate');
            expect(mockStorageService.upload).toHaveBeenCalledWith(file, 'Expire=True');
        });
    });
});
