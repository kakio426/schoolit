export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const API_URL = `${API_BASE_URL}/api`;

export enum Role {
    SCHOOL = 'SCHOOL',
    TEACHER = 'TEACHER',
    BUSINESS = 'BUSINESS',
    ADMIN = 'ADMIN',
    PENDING = 'PENDING'
}

export enum ApplicationStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    INTERVIEWING = 'INTERVIEWING',
    HIRED = 'HIRED',
    COMPLETED = 'COMPLETED'
}

export enum CertStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export const LEGAL_TEXT = {
    DISCLAIMER_TITLE: "법적 고지 및 책임 제한",
    DISCLAIMER_BODY: "에듀핀은 교육 인력 정보의 탐색과 매칭을 돕는 정보 제공 플랫폼입니다. 에듀핀은 인력 채용 및 용역 계약의 당사자가 아니며, 모든 계약과 검증(성범죄 경력 조회 포함)의 법적 책임은 채용 주체인 학교에 있습니다.",
    COPYRIGHT: "© 2026 Edupin (School It). All rights reserved."
};
