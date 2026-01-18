
import { LucideIcon, School, UserCheck, Briefcase, FileText, Search, UserPlus, Star, Building2, TrendingUp } from 'lucide-react';

export type TutorialStep = {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    mockType: 'JOB_POST' | 'PROFILE_CARD' | 'MATCH_SUCCESS' | 'CERTIFICATION' | 'PORTFOLIO' | 'BID_NOTICE' | 'PARTNERSHIP';
};

export type TutorialRole = {
    id: 'SCHOOL' | 'TEACHER' | 'BUSINESS';
    label: string;
    description: string;
    steps: TutorialStep[];
};

export const TUTORIAL_DATA: TutorialRole[] = [
    {
        id: 'SCHOOL',
        label: '학교',
        description: '복잡한 채용 행정은 그만. 공고 등록부터 인재 매칭까지 원스톱으로 해결하세요.',
        steps: [
            {
                id: 's1',
                title: '공고 간편 등록',
                description: '필요한 과목, 시간, 조건을 입력하여 3분 만에 공고를 등록합니다.',
                icon: FileText,
                mockType: 'JOB_POST'
            },
            {
                id: 's2',
                title: '검증된 인재 검색',
                description: '자격증과 신원 인증이 완료된 선생님 프로필을 직접 확인하세요.',
                icon: Search,
                mockType: 'PROFILE_CARD'
            },
            {
                id: 's3',
                title: '맞춤형 채용 완료',
                description: '지원자를 검토하고, AI가 추천하는 최적의 선생님을 선택하세요.',
                icon: UserPlus,
                mockType: 'MATCH_SUCCESS'
            }
        ]
    },
    {
        id: 'TEACHER',
        label: '선생님',
        description: '전문성을 인정받고, 원하는 조건의 학교를 쉽고 빠르게 찾으세요.',
        steps: [
            {
                id: 't1',
                title: '프로필 및 인증',
                description: '자격증과 경력을 등록하고 신뢰도 높은 프로필을 완성하세요.',
                icon: UserCheck,
                mockType: 'CERTIFICATION'
            },
            {
                id: 't2',
                title: '맞춤 공고 지원',
                description: '내 조건에 딱 맞는 공고를 추천받고 클릭 한 번으로 지원하세요.',
                icon: Briefcase,
                mockType: 'JOB_POST'
            },
            {
                id: 't3',
                title: '경력 성장',
                description: '활동 후 쌓이는 실제 학교의 후기로 퍼스널 브랜딩을 강화하세요.',
                icon: Star,
                mockType: 'PROFILE_CARD'
            }
        ]
    },
    {
        id: 'BUSINESS',
        label: '교육 행사 업체',
        description: '진로체험, 스포츠데이 등 우수한 콘텐츠와 포트폴리오를 전국의 학교에 알리세요.',
        steps: [
            {
                id: 'b1',
                title: '포트폴리오 관리',
                description: '진행했던 행사, 방과후 프로그램의 성과를 매력적으로 보여주세요.',
                icon: Building2,
                mockType: 'PORTFOLIO'
            },
            {
                id: 'b2',
                title: '학교 연결 제안',
                description: '학교의 입찰 공고를 확인하고 제안서를 보내 파트너십을 맺으세요.',
                icon: Search,
                mockType: 'BID_NOTICE'
            },
            {
                id: 'b3',
                title: '비즈니스 확장',
                description: '성공적인 레퍼런스를 통해 더 많은 학교와 연결될 기회를 잡으세요.',
                icon: TrendingUp,
                mockType: 'PARTNERSHIP'
            }
        ]
    }
];
