import { Test, TestingModule } from '@nestjs/testing';
import { PdfService } from './pdf.service';

describe('PdfService', () => {
    let service: PdfService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PdfService],
        }).compile();

        service = module.get<PdfService>(PdfService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('generatePdf', () => {
        it('should generate a PDF buffer from HTML content', async () => {
            const htmlContent = '<h1>Hello World</h1>';
            const pdfBuffer = await service.generatePdf(htmlContent);

            expect(pdfBuffer).toBeInstanceOf(Buffer);
            // PDF magic number check (starts with %PDF)
            expect(pdfBuffer.toString('utf-8', 0, 4)).toBe('%PDF');
        });

        it('should handle complex HTML with CSS', async () => {
            const htmlContent = `
            <style>body { color: red; }</style>
            <h1>Red Text</h1>
        `;
            const pdfBuffer = await service.generatePdf(htmlContent);
            expect(pdfBuffer).toBeInstanceOf(Buffer);
        });
    });
});
