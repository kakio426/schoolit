import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfGeneratorService } from './pdf-generator.service';

@Module({
    providers: [PdfService, PdfGeneratorService],
    exports: [PdfService, PdfGeneratorService],
})
export class PdfModule { }
