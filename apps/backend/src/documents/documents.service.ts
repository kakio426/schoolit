import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import puppeteer from 'puppeteer';
import { format, differenceInMonths } from 'date-fns';

// Types for document generation
export interface HiringDocumentData {
  documentNumber: string; // 문서번호 (ex: 초등-2026-0001)
  schoolName: string; // 학교명
  schoolAddress: string; // 학교 주소
  adminName: string; // 담당자 이름
  adminPhone: string; // 담당자 연락처
  teacherName: string; // 채용 대상 강사명
  subject: string; // 담당 과목
  contractPeriod: string; // 계약 기간 (ex: 2026.03.01 ~ 2026.08.31)
  teachingHours: number; // 주당 수업 시수
  salary?: number; // 급여 (선택)
  jobTitle: string; // 채용 공고 제목
  enforcementDate: string; // 시행일 (ex: 2026.01.15)
}

export interface ContractDocumentData {
  documentNumber: string; // 문서번호
  partyAName: string; // 갑 (학교/기관명)
  partyAAddress: string; // 갑 주소
  partyARepresentative: string; // 갑 대표자
  partyBName: string; // 을 (업체명)
  partyBAddress: string; // 을 주소
  partyBRepresentative: string; // 을 대표자
  partyBS2bNumber?: string; // 을 S2B 등록번호
  contractSubject: string; // 계약 목적/내용
  contractAmount: number; // 계약 금액
  contractPeriod: string; // 계약 기간
  paymentTerms: string; // 대금 지급 조건 (ex: 행사 완료 후 7일 이내)
  warrantyPeriod?: string; // 하자 보수 기간 (선택)
  enforcementDate: string; // 시행일
}

@Injectable()
export class DocumentsService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null; // @google/generative-ai does not expose a clear Model type easily without extra steps


  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    }
  }

  // [CORE] PDF 생성 메인 로직
  async generateHiringPlanPdf(data: HiringDocumentData | any): Promise<Buffer> {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Docker 환경 호환용
      });
      const page = await browser.newPage();

      // HTML 템플릿 생성 (아래 메서드 호출)
      const htmlContent = this.getHiringPlanTemplate(data);

      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true, // 배경색/이미지 출력 허용
        margin: {
          top: '20mm',
          bottom: '15mm',
          left: '20mm',
          right: '20mm',
        },
      });

      await browser.close();
      // Puppeteer 반환 타입이 Uint8Array로 변경됨에 따라 Buffer로 변환
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw new InternalServerErrorException('PDF 생성 중 오류가 발생했습니다.');
    }
  }

  // [TEMPLATE] 교육청 공문 스타일 HTML/CSS
  private getHiringPlanTemplate(data: any): string {
    const docNumber = `제 ${new Date().getFullYear()} - ${Math.floor(Math.random() * 100)}호`;

    // 날짜 파싱 시도 (단순 문자열일 경우 대비)
    const parseDate = (d: string) => {
      try {
        return format(new Date(d), 'yyyy. MM. dd.');
      } catch (e) {
        return d;
      }
    };

    return `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <title>채용계획서</title>
        <style>
          /* 1. 폰트: 구글 Noto Serif KR (명조체 대체) */
          @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;900&display=swap');

          body {
            font-family: 'Noto Serif KR', serif; /* 교육청 문서의 핵심은 명조체 */
            font-size: 11pt;
            line-height: 1.6;
            color: #000;
            padding: 0;
            margin: 0;
          }

          /* 2. 결재란 (우측 상단) */
          .approval-box {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 20px;
          }
          .approval-table {
            border-collapse: collapse;
            text-align: center;
            font-size: 10pt;
          }
          .approval-table th, .approval-table td {
            border: 1px solid #000;
            padding: 0;
          }
          .approval-table th {
            background-color: #f0f0f0;
            width: 30px;
            vertical-align: middle;
            padding: 5px 2px;
          }
          .approval-table td {
            width: 80px;
            height: 60px; /* 도장 찍을 공간 확보 */
            vertical-align: bottom;
            padding-bottom: 5px;
          }
          .role-row td {
            height: 25px;
            vertical-align: middle;
            background-color: #f9f9f9;
            font-weight: bold;
          }

          /* 3. 제목 스타일 */
          .doc-header {
            text-align: center;
            margin-bottom: 30px;
            margin-top: 20px;
          }
          .doc-title {
            font-size: 20pt;
            font-weight: 900; /* Extra Bold */
            text-decoration: underline;
            text-underline-offset: 8px;
            letter-spacing: -1px;
          }

          /* 4. 본문 스타일 */
          .section-title {
            font-size: 12pt;
            font-weight: 600;
            margin-top: 20px;
            margin-bottom: 8px;
          }
          .content-text {
            text-align: justify;
            margin-bottom: 10px;
            text-indent: 10px;
          }

          /* 5. 표 스타일 (교육청 표준) */
          .styled-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 10.5pt;
          }
          .styled-table th, .styled-table td {
            border: 1px solid #333; /* 약간 진한 테두리 */
            padding: 8px 10px;
            text-align: center;
          }
          .styled-table th {
            background-color: #f3f4f6;
            font-weight: 600;
            width: 120px;
          }
          .styled-table td.align-left {
            text-align: left;
            padding-left: 15px;
          }

          /* 직인/도장 효과 */
          .seal-stamp {
            position: absolute;
            width: 50px;
            height: 50px;
            opacity: 0.8;
            mix-blend-mode: multiply; /* 글자 위에 도장이 겹쳐 보이게 */
            z-index: 10;
          }

          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 9pt;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>

        <div class="approval-box">
          <table class="approval-table">
            <tr>
              <th rowspan="2">결<br>재</th>
              <td class="role-cell" style="height: 25px; background: #f9f9f9;">담당</td>
              <td class="role-cell" style="height: 25px; background: #f9f9f9;">교감</td>
              <td class="role-cell" style="height: 25px; background: #f9f9f9;">교장</td>
            </tr>
            <tr>
              <td>
                ${data.authorName || '홍길동'}
              </td>
              <td></td>
              <td style="position: relative;">
                ${data.schoolSealUrl ? `<img src="${data.schoolSealUrl}" class="seal-stamp" style="right: 15px; bottom: 15px;" />` : '<span style="color:#ccc">(인)</span>'}
              </td>
            </tr>
          </table>
        </div>

        <div class="doc-header">
          <div class="doc-title">기간제교원 채용계획(안)</div>
        </div>

        <div class="content-text">
          <b>1. 관련:</b> 초·중등교육법 제21조 및 동법 시행령 제42조
        </div>
        <div class="content-text">
          <b>2. 목적:</b> 2025학년도 교육과정 운영을 위한 기간제교원을 채용하고자 함.
        </div>
        
        <div class="section-title">3. 채용 개요</div>
        <table class="styled-table">
          <tr>
            <th>채용 과목</th>
            <td class="align-left">${data.subject || '영어'}</td>
            <th>채용 인원</th>
            <td>1명</td>
          </tr>
          <tr>
            <th>채용 사유</th>
            <td colspan="3" class="align-left">${data.reason || '육아휴직 대체'}</td>
          </tr>
          <tr>
            <th>계약 기간</th>
            <td colspan="3" class="align-left">
              ${parseDate(data.startDate)} ~ ${parseDate(data.endDate)} (${this.calculateMonths(data.startDate, data.endDate)}개월)
            </td>
          </tr>
          <tr>
            <th>지원 자격</th>
            <td colspan="3" class="align-left">
              - 해당 교과 교원자격증 소지자<br>
              - 교육공무원법상 결격사유가 없는 자
            </td>
          </tr>
        </table>

        <div class="section-title">4. 세부 추진 일정</div>
        <table class="styled-table">
          <thead>
            <tr>
              <th style="width: 30%">구분</th>
              <th style="width: 40%">일정</th>
              <th style="width: 30%">비고</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>채용 공고</td>
              <td>${parseDate(data.noticeStart) || '2025.02.01.'} ~ ${parseDate(data.noticeEnd) || '2025.02.07.'}</td>
              <td>홈페이지 게시</td>
            </tr>
            <tr>
              <td>서류 심사</td>
              <td>${parseDate(data.docReviewDate) || '2025.02.08.'}</td>
              <td>개별 통보</td>
            </tr>
            <tr>
              <td>면접 심사</td>
              <td>${parseDate(data.interviewDate) || '2025.02.10.'}</td>
              <td>2배수 선정</td>
            </tr>
            <tr>
              <td>최종 발표</td>
              <td>${parseDate(data.finalDate) || '2025.02.12.'}</td>
              <td>합격자 개별 연락</td>
            </tr>
          </tbody>
        </table>

        <div class="content-text" style="margin-top: 30px;">
          위와 같이 기간제교원 채용을 진행하고자 합니다.
        </div>

        <div class="footer">
          문서번호: ${docNumber} | 보존기간: 5년 | 작성자: ${data.authorName}
          <br>본 문서는 Schoolit 전자결재 시스템을 통해 생성되었습니다.
        </div>

      </body>
      </html>
    `;
  }

  private calculateMonths(start: string, end: string): number {
    try {
      const result = differenceInMonths(new Date(end), new Date(start));
      return result > 0 ? result : 6;
    } catch (e) {
      return 6;
    }
  }

  /**
   * 기간제 교사/강사 채용 공문 생성 (Gemini 텍스트)
   */
  async generateHiringDocument(data: HiringDocumentData): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API Key가 설정되지 않았습니다.');
    }

    const prompt = `
당신은 대한민국 초/중/고등학교의 공문서 작성 전문가입니다.
아래 정보를 바탕으로 **교육부 및 교육청 지침**에 맞는 '기간제교원/강사 채용 결과 통보' 공문을 작성해주세요.

## 필수 포함 사항:
1. 문서번호, 수신, 경유, 제목
2. 채용 대상자 정보 (성명, 담당 과목, 계약 기간, 주당 수업 시수)
3. 근무 조건 (급여 명시 시 포함)
4. 하단에 학교장 직인 생략 표기 및 담당자 연락처

## 입력 정보:
- 문서번호: ${data.documentNumber}
- 학교명: ${data.schoolName}
- 학교 주소: ${data.schoolAddress}
- 담당자: ${data.adminName} (연락처: ${data.adminPhone})
- 채용 대상: ${data.teacherName}
- 담당 과목: ${data.subject}
- 계약 기간: ${data.contractPeriod}
- 주당 수업 시수: ${data.teachingHours}시간
${data.salary ? `- 월 급여: ${data.salary.toLocaleString()}원` : '- 급여: 학교 내규에 따름'}
- 채용 공고명: ${data.jobTitle}
- 시행일: ${data.enforcementDate}

## 출력 형식:
- 순수 텍스트 (마크다운 없음)
- 실제 한국 공문서 형식 준수
- 줄바꿈으로 구분
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  /**
   * 행사/용역 계약 공문 생성 (Gemini 텍스트)
   */
  async generateContractDocument(data: ContractDocumentData): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API Key가 설정되지 않았습니다.');
    }

    const prompt = `
당신은 대한민국 공공기관/학교의 계약서 작성 전문가입니다.
아래 정보를 바탕으로 **지방계약법** 및 **학교회계 예산편성 지침**에 맞는 '용역 계약서' 또는 '행사 계약서'를 작성해주세요.

## 필수 포함 사항:
1. 계약 당사자 (갑/을) 정보
2. 계약 목적 및 내용
3. 계약 금액 및 지급 조건
4. 계약 기간
5. 하자 보수 책임 (해당 시)
6. 분쟁 해결 조항
7. 계약 일반 조건 (지방계약법 제11조 준용)

## 입력 정보:
- 문서번호: ${data.documentNumber}
- 갑 (발주자): ${data.partyAName}
  - 주소: ${data.partyAAddress}
  - 대표: ${data.partyARepresentative}
- 을 (수급자): ${data.partyBName}
  - 주소: ${data.partyBAddress}
  - 대표: ${data.partyBRepresentative}
  ${data.partyBS2bNumber ? `- S2B 등록번호: ${data.partyBS2bNumber}` : ''}
- 계약 목적: ${data.contractSubject}
- 계약 금액: ${data.contractAmount.toLocaleString()}원 (부가세 포함)
- 계약 기간: ${data.contractPeriod}
- 대금 지급 조건: ${data.paymentTerms}
${data.warrantyPeriod ? `- 하자 보수 기간: ${data.warrantyPeriod}` : ''}
- 시행일: ${data.enforcementDate}

## 출력 형식:
- 순수 텍스트 (마크다운 없음)
- 실제 한국 계약서 형식 준수 (제1조, 제2조... 형식)
- 마지막에 갑/을 서명란 포함
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
