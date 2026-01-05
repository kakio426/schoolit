import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PdfGeneratorService } from '../../common/pdf/pdf-generator.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('contracts')
export class ContractsController {
    constructor(
        private pdfService: PdfGeneratorService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('finalize')
    async finalizeContract(@Body() body: any) {
        // Generate PDF contract (using pdf-lib, no Puppeteer)
        const pdfBuffer = await this.pdfService.generateContract(body, []);

        // Note: File storage removed - using text-only approach
        // Schools will receive physical documents during hiring process

        return { success: true };
    }
}
