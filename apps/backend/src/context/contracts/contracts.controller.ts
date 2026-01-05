import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { PdfGeneratorService } from '../../common/pdf/pdf-generator.service';
import { StorageService } from '../../common/storage/storage.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('contracts')
export class ContractsController {
    constructor(
        private pdfService: PdfGeneratorService,
        private storageService: StorageService
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('finalize')
    async finalizeContract(@Body() body: any) {
        // 1. Generate PDF
        const pdfBuffer = await this.pdfService.generateContract(body, []);

        // 2. Upload Final Contract (Permanent Storage)
        // const finalContract = await this.storageService.upload({ buffer: pdfBuffer, mimetype: 'application/pdf', originalname: 'contract.pdf' }, 'UserValidated=True');

        // 3. Trigger Clean-up of Transient Files (The core "Hybrid" Logic)
        if (body.transientDocKeys && Array.isArray(body.transientDocKeys)) {
            await this.storageService.deleteMany(body.transientDocKeys);
        }

        return { success: true };
    }
}
