import { Test, TestingModule } from '@nestjs/testing';
import { PdfGeneratorService } from './pdf-generator.service';

describe('PdfGeneratorService', () => {
    let service: PdfGeneratorService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PdfGeneratorService],
        }).compile();

        service = module.get<PdfGeneratorService>(PdfGeneratorService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should generate a PDF with mixed data', async () => {
        const templateData = {
            teacherName: 'John Doe',
            schoolName: 'Test School',
            contractPeriod: '2024-01-01 ~ 2024-12-31'
        };
        const images = [
            { url: 'https://example.com/sign.png', buffer: Buffer.from('fake-image-data') }
        ];

        const pdfBuffer = await service.generateContract(templateData, images);

        expect(pdfBuffer).toBeInstanceOf(Buffer);
        // PDF header check
        expect(pdfBuffer.toString('utf-8', 0, 4)).toEqual('%PDF');
    });
});
