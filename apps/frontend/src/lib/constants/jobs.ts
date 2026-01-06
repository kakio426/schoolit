import { JobType } from '../constants';

/**
 * Internal approval checklist items for job postings.
 * Used in NewJobPage to verify required checks before posting.
 */
export const TEACHER_HIRING_CHECKLIST = [
    { id: 'planningApproved', label: '채용 계획서에 대한 내부 결재(기안)를 완료했습니까?' },
    { id: 'budgetConfirmed', label: '인건비 예산 과목 및 지원 한도가 확정되었습니까?' },
    { id: 'vacancyConfirmed', label: '결원 사유 및 대상 학급/과목이 명확히 확인되었습니까?' },
] as const;

export const EVENT_VENDOR_CHECKLIST = [
    { id: 'planningApproved', label: '행사 기본 계획서 내부 기안(결재)을 완료했습니까?' },
    { id: 'budgetConfirmed', label: '학교운영위원회 심의(필요 시) 및 예산 확정을 확인했습니까?' },
    { id: 'vacancyConfirmed', label: '과업지시서(Task Description) 및 규격서 작성을 완료했습니까?' },
] as const;

/**
 * Step-by-step guide for the recruitment/procurement process.
 */
export const TEACHER_HIRING_GUIDE_STEPS = [
    { step: '1', title: '계획 수립', desc: '내부 결재 및 예산 편성 여부 재확인' },
    { step: '2', title: '공고 게시', desc: '에듀핀 및 교육청 게시판에 동시 게시' },
    { step: '3', title: '서류 심사', desc: '이력서 검토 및 2~3배수 면접 대상 선정' },
    { step: '4', title: '면접 및 시연', desc: '수업 능력 및 학생 생활지도 역량 검정' },
    { step: '5', title: '결격 조회', desc: '성범죄/아동학대 전력 조회 필수 (가장 중요)' },
] as const;

export const EVENT_VENDOR_GUIDE_STEPS = [
    { step: '1', title: '계획 수립', desc: '내부 기안, 학운위 심의, 일상감사 확인' },
    { step: '2', title: '계약 요청', desc: '과업지시서 및 산출내역서 행정실 제출' },
    { step: '3', title: '공고/선정', desc: 'S2B/G2B 공고 또는 수의계약 업체 선정' },
    { step: '4', title: '계약 체결', desc: '계약서 작성 및 청렴이행각서 징구' },
    { step: '5', title: '행사 진행', desc: '과업 수행 관리 및 증빙 사진 촬영' },
    { step: '6', title: '검수/지급', desc: '검수조서 작성 및 대금 지급 요청' },
] as const;

/**
 * Returns the appropriate checklist based on job type.
 */
export function getChecklistItems(jobType: JobType) {
    return jobType === JobType.TEACHER_HIRING
        ? TEACHER_HIRING_CHECKLIST
        : EVENT_VENDOR_CHECKLIST;
}

/**
 * Returns the appropriate guide steps based on job type.
 */
export function getGuideSteps(jobType: JobType) {
    return jobType === JobType.TEACHER_HIRING
        ? TEACHER_HIRING_GUIDE_STEPS
        : EVENT_VENDOR_GUIDE_STEPS;
}

/**
 * Event types for EVENT_VENDOR jobs.
 */
export const EVENT_TYPES = [
    { value: '진로체험', label: '진로체험' },
    { value: '스포츠데이', label: '스포츠데이' },
    { value: '찾아오는 체험학습', label: '찾아오는 체험학습' },
    { value: '문화예술 공연', label: '문화예술 공연' },
    { value: '과학 체험', label: '과학 체험' },
    { value: '기타', label: '기타' },
] as const;

/**
 * Grade levels for TEACHER_HIRING jobs.
 */
export const GRADE_LEVELS = ['초등', '중등', '고등'] as const;

/**
 * Certification options for EVENT_VENDOR jobs.
 */
export const CERTIFICATION_OPTIONS = ['교육부 인증', '청소년수련활동 인증'] as const;
