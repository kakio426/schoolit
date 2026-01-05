import { Injectable } from '@nestjs/common';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

@Injectable()
export class PdfGeneratorService {
    async generateContract(data: any, images: any[]): Promise<Buffer> {
        // Create a new PDFDocument
        const pdfDoc = await PDFDocument.create();

        // Add a blank page
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();

        // Embed font
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 12;

        // Draw text
        page.drawText(`Contract Agreement`, {
            x: 50,
            y: height - 50,
            size: 20,
            font,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Teacher: ${data.teacherName}`, {
            x: 50,
            y: height - 100,
            size: fontSize,
            font,
        });

        page.drawText(`School: ${data.schoolName}`, {
            x: 50,
            y: height - 120,
            size: fontSize,
            font,
        });

        page.drawText(`Period: ${data.contractPeriod}`, {
            x: 50,
            y: height - 140,
            size: fontSize,
            font,
        });

        // Save
        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    }
}
