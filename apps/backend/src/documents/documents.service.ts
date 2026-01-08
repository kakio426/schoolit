import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Types for document generation
export interface HiringDocumentData {
    documentNumber: string;      // 문서번호 (ex: 초등-2026-0001)
    schoolName: string;          // 학교명
    schoolAddress: string;       // 학교 주소
    adminName: string;           // 담당자 이름
    adminPhone: string;          // 담당자 연락처
    teacherName: string;         // 채용 대상 강사명
    subject: string;             // 담당 과목
    contractPeriod: string;      // 계약 기간 (ex: 2026.03.01 ~ 2026.08.31)
    teachingHours: number;       // 주당 수업 시수
    salary?: number;             // 급여 (선택)
    jobTitle: string;            // 채용 공고 제목
    enforcementDate: string;     // 시행일 (ex: 2026.01.15)
}

export interface ContractDocumentData {
    documentNumber: string;      // 문서번호
    partyAName: string;          // 갑 (학교/기관명)
    partyAAddress: string;       // 갑 주소
    partyARepresentative: string;// 갑 대표자
    partyBName: string;          // 을 (업체명)
    partyBAddress: string;       // 을 주소
    partyBRepresentative: string;// 을 대표자
    partyBS2bNumber?: string;    // 을 S2B 등록번호
    contractSubject: string;     // 계약 목적/내용
    contractAmount: number;      // 계약 금액
    contractPeriod: string;      // 계약 기간
    paymentTerms: string;        // 대금 지급 조건 (ex: 행사 완료 후 7일 이내)
    warrantyPeriod?: string;     // 하자 보수 기간 (선택)
    enforcementDate: string;     // 시행일
}

@Injectable()
export class DocumentsService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        }
    }

    /**
     * 기간제 교사/강사 채용 공문 생성
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
     * 행사/용역 계약 공문 생성
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
