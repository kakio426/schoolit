export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://schoolit.shop';
export const API_URL = `${API_BASE_URL}/api`;

export enum Role {
    SCHOOL = 'SCHOOL',
    TEACHER = 'TEACHER',
    BUSINESS = 'BUSINESS',
    ADMIN = 'ADMIN',
    PENDING = 'PENDING'
}

export enum JobType {
    TEACHER_HIRING = 'TEACHER_HIRING',
    EVENT_VENDOR = 'EVENT_VENDOR',
}

export enum ApplicationStatus {
    PENDING = 'PENDING',
    DOCUMENT_SCREENING = 'DOCUMENT_SCREENING',
    INTERVIEWING = 'INTERVIEWING',
    VERIFICATION = 'VERIFICATION',
    HIRED = 'HIRED',
    REJECTED = 'REJECTED',
    // Event specific
    BIDDING = 'BIDDING',
    CONTRACTING = 'CONTRACTING',
    EXECUTING = 'EXECUTING',
    PAYMENT_COMPLETED = 'PAYMENT_COMPLETED'
}

export enum CertStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export const LEGAL_TEXT = {
    DISCLAIMER_TITLE: "법적 고지 및 책임 제한",
    DISCLAIMER_BODY: "본 서비스는 교육 정보화 연구를 위한 베타 서비스 (Research Prototype)입니다. 영리 목적이 없으며, 인력 매칭 및 계약에 대한 어떠한 법적 책임도 지지 않습니다. 모든 자격 검증과 신원 확인의 책임은 채용 주체인 학교에 있습니다.",
    COPYRIGHT: "© 2026 Edupin (School It). All rights reserved.",
    REPRESENTATIVE_EMAIL: "kakio@korea.kr"
};
