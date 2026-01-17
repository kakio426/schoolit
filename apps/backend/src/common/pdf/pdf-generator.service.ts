import { Injectable } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fontkit from '@pdf-lib/fontkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfGeneratorService {
  async generateContract(data: any, images: any[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // Load Korean Font
    const fontPath = path.join(__dirname, 'NanumGothic-Regular.ttf');

    // Debug Log
    if (!fs.existsSync(fontPath)) {
      console.error(`[PDF Error] Font file not found at: ${fontPath}`);
      // Fallback or let it crash but with log
    }

    const fontBytes = fs.readFileSync(fontPath);
    const customFont = await pdfDoc.embedFont(fontBytes);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Create page
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    const margin = 50;
    let yPos = height - margin;

    // Header Box
    page.drawRectangle({
      x: margin,
      y: yPos - 60,
      width: width - 2 * margin,
      height: 60,
      color: rgb(0.95, 0.95, 0.95),
      borderColor: rgb(0.6, 0.6, 0.6),
      borderWidth: 1,
    });

    const templateType = data.templateType || 'TEACHER';
    const isVendor = templateType === 'VENDOR';

    // Title
    page.drawText(isVendor ? '표준 용역 계약서' : '표준 근로 계약서', {
      x: margin + 150,
      y: yPos - 25,
      size: 24,
      font: customFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(isVendor ? 'Standard Service Agreement' : 'Standard Employment Contract', {
      x: margin + 120,
      y: yPos - 45,
      size: 12,
      font: boldFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    yPos -= 90;

    // Contract Details Section
    const drawField = (label: string, value: string, y: number) => {
      page.drawRectangle({
        x: margin,
        y: y - 25,
        width: width - 2 * margin,
        height: 30,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 0.5,
      });

      page.drawText(label, {
        x: margin + 10,
        y: y - 15,
        size: 11,
        font: customFont,
        color: rgb(0.3, 0.3, 0.3),
      });

      page.drawText(value || '-', {
        x: margin + 150,
        y: y - 15,
        size: 12,
        font: customFont,
        color: rgb(0, 0, 0),
      });
    };

    drawField('학 교 명 (Institution):', data.schoolName || '', yPos);
    yPos -= 35;

    if (isVendor) {
      drawField('업 체 명 (Vendor):', data.vendorName || '', yPos);
      yPos -= 35;
      drawField('대 표 자 (Representative):', data.representativeName || '', yPos);
      yPos -= 35;
      drawField('용 역 명 (Service Name):', data.jobTitle || '', yPos);
      yPos -= 35;
      drawField('계 약 금 (Amount):', data.amount ? `${data.amount} 원` : '-', yPos);
    } else {
      drawField('교 사 명 (Teacher):', data.teacherName || '', yPos);
      yPos -= 35;
      drawField('직위/과목 (Position):', data.jobTitle || '', yPos);
      yPos -= 35;
      drawField('급 여 (Salary):', data.amount ? `${data.amount} 원` : '-', yPos);
    }

    yPos -= 35;
    drawField('계 약 일 (Date):', data.date || '', yPos);
    yPos -= 50;

    // Terms Section
    page.drawRectangle({
      x: margin,
      y: yPos - 100,
      width: width - 2 * margin,
      height: 110,
      borderColor: rgb(0.7, 0.7, 0.7),
      borderWidth: 1,
    });

    page.drawText('계약 조건 (Terms & Conditions)', {
      x: margin + 10,
      y: yPos - 20,
      size: 13,
      font: customFont,
      color: rgb(0, 0, 0),
    });

    const teacherTerms = [
      '1. 본 계약은 양 당사자의 합의 하에 체결되었습니다.',
      '2. 근무 조건 및 급여는 별도 협의된 사항을 따릅니다.',
      '3. 계약 해지 시 1개월 전 사전 통보를 원칙으로 합니다.',
    ];

    const vendorTerms = [
      '1. 본 계약은 지방계약법 및 관련 규정에 따릅니다.',
      '2. 과업 수행은 학교의 지시 및 감독 하에 성실히 수행해야 합니다.',
      '3. 계약 불이행 시 계약 보증금 귀속 및 손해배상 책임이 있습니다.',
    ];

    const terms = isVendor ? vendorTerms : teacherTerms;

    let termY = yPos - 45;
    terms.forEach((term) => {
      page.drawText(term, {
        x: margin + 15,
        y: termY,
        size: 9,
        font: customFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      termY -= 20;
    });

    yPos -= 130;

    // Signature Section
    page.drawRectangle({
      x: margin,
      y: yPos - 80,
      width: (width - 2 * margin) / 2 - 10,
      height: 80,
      borderColor: rgb(0.6, 0.6, 0.6),
      borderWidth: 1,
    });

    page.drawRectangle({
      x: margin + (width - 2 * margin) / 2 + 10,
      y: yPos - 80,
      width: (width - 2 * margin) / 2 - 10,
      height: 80,
      borderColor: rgb(0.6, 0.6, 0.6),
      borderWidth: 1,
    });

    page.drawText('학교 대표 (School)', {
      x: margin + 50,
      y: yPos - 20,
      size: 10,
      font: customFont,
    });

    page.drawText('서명: _____________', {
      x: margin + 30,
      y: yPos - 50,
      size: 9,
      font: customFont,
      color: rgb(0, 0, 0), // Explicit color
    });

    page.drawText(isVendor ? '업체 대표 (Vendor)' : '교사 (Teacher)', {
      x: margin + (width - 2 * margin) / 2 + 60,
      y: yPos - 20,
      size: 10,
      font: customFont,
    });

    // 🚀 서명 이미지 임베딩 로직 (Signature Image Embedding)
    if (data.signatureImage && data.signatureImage.startsWith('data:image')) {
      try {
        // "data:image/png;base64,..." 형식을 버퍼로 변환
        const imageBytes = Buffer.from(data.signatureImage.split(',')[1], 'base64');
        const embeddedImage = await pdfDoc.embedPng(imageBytes);

        // 서명란 위치에 이미지 그리기 (좌표 조정)
        const sigWidth = 80;
        const sigHeight = 40;

        page.drawImage(embeddedImage, {
          x: margin + (width - 2 * margin) / 2 + 50, // 서명란 X 좌표
          y: yPos - 60, // 서명란 Y 좌표
          width: sigWidth,
          height: sigHeight,
        });
      } catch (e) {
        console.error('서명 이미지 처리 실패:', e);
        // 실패 시 대체 텍스트 표시
        page.drawText('(서명 이미지 오류)', {
          x: margin + (width - 2 * margin) / 2 + 30,
          y: yPos - 50,
          size: 8,
          font: customFont,
          color: rgb(1, 0, 0),
        });
      }
    } else {
      // 이미지가 없으면 밑줄 유지 (서명 대기 상태)
      page.drawText('서명: _____________', {
        x: margin + (width - 2 * margin) / 2 + 30,
        y: yPos - 50,
        size: 9,
        font: customFont,
      });
    }

    yPos -= 100;

    // Footer
    page.drawText('본 계약서는 Edupin 플랫폼을 통해 생성되었습니다.', {
      x: margin + 100,
      y: yPos - 30,
      size: 8,
      font: customFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText('Edupin Secure Contract System', {
      x: margin + 140,
      y: yPos - 45,
      size: 7,
      font: boldFont,
      color: rgb(0.6, 0.6, 0.6),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
