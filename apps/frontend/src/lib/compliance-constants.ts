export const MANDATORY_CHECKLIST_2025 = [
    { key: 'sex_offender_check', label: '성범죄 경력 조회 동의서', required: true },
    { key: 'child_abuse_check', label: '아동학대관련범죄 전력 조회 동의서', required: true },
    { key: 'narcotics_check', label: '마약류 투약 검사 결과(또는 진단서)', required: true }, // 2025 New
    { key: 'family_hiring_restriction', label: '친인척 채용 제한 여부 확인', required: true }, // 2025 New
    { key: 'admin_security_pledge', label: '행정정보 공동이용 사전동의서', required: false },
];

export interface ComplianceChecklist {
    sex_offender_check: boolean;
    child_abuse_check: boolean;
    narcotics_check: boolean;
    family_hiring_restriction: boolean;
    [key: string]: boolean;
}
