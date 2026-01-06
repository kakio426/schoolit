import { Injectable } from '@nestjs/common';
import { PDFDocument, rgb } from 'pdf-lib';
import * as fontkit from '@pdf-lib/fontkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfGeneratorService {
  async generateContract(data: any, images: any[]): Promise<Buffer> {
    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();

    // Register fontkit
    pdfDoc.registerFontkit(fontkit);

    // Load Korean Font
    const fontPath = path.join(__dirname, 'NanumGothic-Regular.ttf');
    const fontBytes = fs.readFileSync(fontPath);
    const customFont = await pdfDoc.embedFont(fontBytes);

    // Add a blank page
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12;

    // Draw text with custom font
    page.drawText(`계약서 (Contract Agreement)`, {
      x: 50,
      y: height - 50,
      size: 20,
      font: customFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(`성명 (Teacher): ${data.teacherName}`, {
      x: 50,
      y: height - 100,
      size: fontSize,
      font: customFont,
    });

    page.drawText(`기관명 (School): ${data.schoolName}`, {
      x: 50,
      y: height - 120,
      size: fontSize,
      font: customFont,
    });

    page.drawText(`공고명 (Job Title): ${data.jobTitle}`, {
      x: 50,
      y: height - 140,
      size: fontSize,
      font: customFont,
    });

    page.drawText(`작성일 (Date): ${data.date}`, {
      x: 50,
      y: height - 160,
      size: fontSize,
      font: customFont,
    });

    // Save
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}

