// 2025 경기도교육청 계약제교원 운영 지침 기반 상수

// 채용 사유 (HiringReason)
export const HIRING_REASONS = [
    { value: 'LEAVE', label: '일반 휴직', description: '일신상의 사유로 인한 휴직' },
    { value: 'SICK_LEAVE', label: '병가', description: '질병 또는 부상으로 인한 병가' },
    { value: 'MATERNITY', label: '출산휴가/육아휴직', description: '출산 및 육아를 위한 휴직' },
    { value: 'DISPATCH', label: '파견', description: '타 기관 파견 근무' },
    { value: 'STUDY', label: '연수', description: '국내외 연수 참가' },
    { value: 'VACANCY', label: '결원', description: '교원 퇴직 또는 전보로 인한 결원' },
    { value: 'SEASONAL', label: '계절학기/방과후', description: '방학 중 특별 프로그램 운영' },
    { value: 'OTHER', label: '기타', description: '기타 사유' },
] as const;

// 채용 워크플로우 상태
export const WORKFLOW_STATUS = [
    { value: 'DRAFT', label: '초안 작성', step: 1, icon: '📝' },
    { value: 'PLAN_APPROVED', label: '내부결재 완료', step: 2, icon: '✅' },
    { value: 'PUBLISHED', label: '공고 게시', step: 3, icon: '📢' },
    { value: 'RECEIVING', label: '접수 중', step: 4, icon: '📥' },
    { value: 'SCREENING', label: '1차 서류심사', step: 5, icon: '📋' },
    { value: 'INTERVIEW', label: '2차 면접심사', step: 6, icon: '🎤' },
    { value: 'DEMONSTRATION', label: '3차 수업실연', step: 7, icon: '🎓' },
    { value: 'FINALIZING', label: '최종 심사', step: 8, icon: '⚖️' },
    { value: 'CONTRACTED', label: '계약 완료', step: 9, icon: '🤝' },
    { value: 'CANCELLED', label: '채용 취소', step: 0, icon: '❌' },
] as const;

// 서류전형 평가 항목 (서식 12 기반, 총 30점)
export const DOCUMENT_CRITERIA = [
    { id: 'major', label: '전공', maxScore: 6, description: '임용 분야 관련 전공 여부' },
    { id: 'degree', label: '학위', maxScore: 6, description: '최종 학력 (학사/석사/박사)' },
    { id: 'experience', label: '경력', maxScore: 6, description: '관련 분야 경력 연수' },
    { id: 'training', label: '연수', maxScore: 6, description: '관련 연수 이수 실적' },
    { id: 'introduction', label: '자기소개서', maxScore: 6, description: '자기소개서 내용의 적정성' },
] as const;

// 면접시험 평가 항목 (서식 13 기반, 총 40점)
export const INTERVIEW_CRITERIA = [
    { id: 'personality', label: '인성', maxScore: 8, description: '교직 적합 인성' },
    { id: 'philosophy', label: '교직관', maxScore: 8, description: '교육관 및 교직관' },
    { id: 'aptitude', label: '자질', maxScore: 8, description: '교원으로서의 자질' },
    { id: 'knowledge', label: '소양', maxScore: 8, description: '교직 소양 및 전문성' },
    { id: 'etc', label: '기타', maxScore: 8, description: '의사소통 능력 등' },
] as const;

// 수업실연 평가 항목 (서식 14 기반, 총 30점)
export const DEMONSTRATION_CRITERIA = [
    { id: 'plan', label: '수업계획', maxScore: 5, description: '수업 계획의 적절성' },
    { id: 'design', label: '수업설계', maxScore: 5, description: '수업 설계의 우수성' },
    { id: 'teaching', label: '교수활동', maxScore: 5, description: '교수 활동의 효과성' },
    { id: 'speech', label: '발음/발성', maxScore: 5, description: '발음과 발성의 명료성' },
    { id: 'materials', label: '자료활용', maxScore: 5, description: '교수자료 활용 능력' },
    { id: 'summary', label: '정리/마무리', maxScore: 5, description: '수업 정리의 적절성' },
] as const;

// 호봉 제한 규정 (2025 지침)
export const SALARY_STEP_RULES = {
    NORMAL: { maxStep: 40, description: '일반 기간제교원' },
    HONORARY_RETIREE: { maxStep: 14, description: '명예퇴직자' },
    PENSION_RECIPIENT: { maxStep: 14, description: '연금 수급자' },
} as const;

// 연령 제한 규정 (2025 지침 - 한시적 완화)
export const AGE_LIMIT_RULES = {
    FIRST_NOTICE: { maxAge: 65, description: '1차 공고 시' },
    SECOND_NOTICE: { maxAge: 70, description: '2차 재공고 시 (한시적 완화)' },
} as const;

// 국가유공자 가산점 규정
export const MERIT_BONUS_RULES = {
    VETERAN_10: { bonus: 0.10, label: '10% 가산', eligibility: '국가유공자 본인' },
    VETERAN_5: { bonus: 0.05, label: '5% 가산', eligibility: '국가유공자 가족' },
} as const;

// 계약 기간 계산 규칙 (병가 + 출산휴가 합산)
export function calculateContractDuration(
    hiringReason: string,
    startDate: Date,
    endDate: Date
): { isValid: boolean; message: string } {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = diffDays / 30;

    // 병가 + 출산휴가 합산 1개월 미만 시 채용 불가 규정
    if ((hiringReason === 'SICK_LEAVE' || hiringReason === 'MATERNITY') && diffMonths < 1) {
        return {
            isValid: false,
            message: '병가 및 출산휴가의 합산 기간이 1개월 미만인 경우 기간제교원 채용이 제한됩니다.',
        };
    }

    return { isValid: true, message: '' };
}

// 서류 반환 기한 계산 (채용 확정일 + 14일)
export function calculateDocumentReturnDeadline(confirmationDate: Date): Date {
    const deadline = new Date(confirmationDate);
    deadline.setDate(deadline.getDate() + 14);
    return deadline;
}

// 서류 파기 기한 계산 (반환 청구 기한 + 7일 또는 채용 확정 후 7일)
export function calculateDocumentDestructionDate(confirmationDate: Date): Date {
    const destructionDate = new Date(confirmationDate);
    destructionDate.setDate(destructionDate.getDate() + 7);
    return destructionDate;
}
