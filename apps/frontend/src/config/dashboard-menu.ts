export const DASHBOARD_MENU = {
    ADMIN: [
        { label: '대시보드', href: '/dashboard', icon: '🏠' },
        { label: '인증 관리', href: '/dashboard/admin', icon: '🛡️' },
        { label: '사용자 관리', href: '/dashboard/admin/users', icon: '👥' },
        { label: '리뷰 관리', href: '/dashboard/admin/reviews', icon: '⭐' },
        { label: '공지 발송', href: '/dashboard/admin/notifications', icon: '📣' },
        { label: '피드백 센터', href: '/dashboard/admin/feedback', icon: '📢' },
        { label: '설정', href: '/dashboard/settings', icon: '⚙️' }
    ],
    SCHOOL: [
        { label: '학교 프로필', href: '/dashboard/school/profile', icon: '🏫' },
        { label: '채용 공고 관리', href: '/dashboard/jobs', icon: '📋' },
        { label: '지원 현황', href: '/dashboard/applications', icon: '📨' },
        { label: '인재 찾기', href: '/dashboard/teachers', icon: '🔎' },
    ],
    TEACHER: [
        { label: '채용 공고 찾기', href: '/dashboard/jobs', icon: '📋' },
        { label: '지원 현황', href: '/dashboard/applications', icon: '📨' },
        { label: '프로필 관리', href: '/dashboard/profile', icon: '👤' },
    ],
    BUSINESS: [
        { label: '행사 공고/입찰', href: '/dashboard/jobs', icon: '🏢' },
        { label: '견적/계약 관리', href: '/dashboard/applications', icon: '📄' },
        { label: '업체 정보 수정', href: '/dashboard/profile', icon: '🛠️' },
    ],
    COMMON: [
        { label: '대시보드', href: '/dashboard', icon: '🏠' },
        { label: '메시지', href: '/dashboard/messages', icon: '💬' },
        { label: '커뮤니티', href: '/dashboard/community', icon: '💭' },
        { label: '설정', href: '/dashboard/settings', icon: '⚙️' },
    ]
};
