import { Role, ApplicationStatus, CertStatus, JobType } from '../lib/constants';

export interface TeacherExperience {
    id: number;
    title: string;
    organization: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
}

export interface TeacherEducation {
    id: number;
    schoolName: string;
    degree: string;
    major?: string;
    graduationStatus?: string;
    startDate: string;
    endDate?: string;
}

export interface TeacherLink {
    id: number;
    title: string;
    url: string;
}

export interface TeacherLicense {
    id: number;
    name: string;
    issuer: string;
    date: string;
}

export interface TeacherProfile {
    id: number;
    userId: number;
    bio?: string;
    profileImage?: string;
    subjects: string[];
    regions: string[];
    isVerified: boolean;
    bankAccount?: string;
    checklist?: any;
    experiences?: TeacherExperience[];
    educations?: TeacherEducation[];
    links?: TeacherLink[];
    licenses?: TeacherLicense[];
    createdAt: string;
    updatedAt: string;
}

export interface BusinessPortfolio {
    id: number;
    title: string;
    description?: string;
    images: string[];
}

export interface SchoolProfile {
    id: number;
    userId: number;
    schoolName?: string;
    schoolType?: string; // ELEMENTARY, MIDDLE, HIGH, etc.
    studentCount?: number;
    address?: string;
    detailAddress?: string;
    phoneNumber?: string;
    website?: string;
    homepage?: string;
    description?: string;
    logoImage?: string;
    tags?: string[];
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface BusinessProfile {
    id: number;
    userId: number;
    companyName: string;
    registrationNum?: string;
    s2bNumber?: string;
    registrationFile?: string;
    description?: string;
    website?: string;
    address?: string;
    canIssueTaxInvoice: boolean;
    categories: string[];
    isVerified: boolean;
    bankAccount?: string;
    checklist?: any;
    portfolios?: BusinessPortfolio[];
}

export interface User {
    id: string | number;
    email: string;
    name: string;
    role: Role;
    phone?: string;
    isBanned?: boolean;
    verificationCode?: string;
    teacherProfile?: TeacherProfile;
    businessProfile?: BusinessProfile;
    notificationSettings?: any;
    reviewStats?: {
        totalReviews: number;
        averageRating: number;
        reMatchRate: number;
        isVeteran: boolean;
        topKeywords: { keyword: string; count: number }[];
    };
    schoolProfile?: SchoolProfile;
    createdAt?: string;
    updatedAt?: string;
    // Gamification
    trustTier?: 'NEW' | 'VERIFIED' | 'TRUSTED' | 'TOP_RATED';
    reputationScore?: number;
    profileCompleteness?: {
        percentage: number;
        missingFields: string[];
    };
    badges?: UserBadge[];
}

export type BadgeType =
    | 'FAST_RESPONDER'
    | 'PROFILE_MASTER'
    | 'VETERAN'
    | 'HIGH_RETURN'
    | 'GOOD_PAYER'
    | 'S2B_CERTIFIED';

export interface UserBadge {
    id: number;
    userId: number;
    type: BadgeType;
    earnedAt: string;
}

export interface ChatRoom {
    id: number;
    jobId: number;
    users: User[];
    messages: ChatMessage[];
    jobListing?: JobListing;
    createdAt: string;
}

export interface ChatMessage {
    id: number;
    chatRoomId: number;
    senderId: number;
    content: string;
    read: boolean;
    createdAt: string;
    /** Populated when fetching messages with sender details */
    sender?: Pick<User, 'id' | 'name' | 'role'>;
}

export interface JobListing {
    id: number;
    title: string;
    description: string;
    subjects: string[];
    regions: string[];
    status: 'OPEN' | 'CLOSED';
    active: boolean;
    jobType?: JobType;
    budget?: string | number;
    contractPeriod?: string;
    teachingHours?: number;
    gradeLevel?: string[];
    eventType?: string;
    participantCount?: string;
    equipmentProvided?: boolean;
    certifications?: string[];
    workflowStatus?: string;
    internalChecklist?: any;
    createdAt: string;
    schoolProfile?: SchoolProfile;
    schoolId?: number;
    externalSourceUrl?: string;
    isAggregated?: boolean;
}

export interface Evaluation {
    id: number;
    type: 'DOCUMENT' | 'INTERVIEW' | 'DEMONSTRATION';
    totalScore: number;
    aggregatedData?: any;
    evaluatorName?: string;
    criteriaScores?: any;
    comment?: string;
    meritBonus: number;
    createdAt: string;
}

export interface JobApplication {
    id: number;
    jobId: number;
    userId: number;
    status: ApplicationStatus;
    message?: string;
    isSuggestion: boolean;
    createdAt: string;
    viewedAt?: string;
    internalNote?: string;
    jobListing?: JobListing;
    user?: User;
    cost?: number;
    contactEmail?: string;
    contactPhone?: string;
    attachmentUrl?: string;
    complianceChecklist?: any;
    evaluations?: Evaluation[];
    signatureData?: any;
}

/**
 * Internal checklist for job posting compliance.
 */
export interface InternalChecklist {
    planningApproved: boolean;
    budgetConfirmed: boolean;
    vacancyConfirmed: boolean;
}

/**
 * Payload for creating a new job posting.
 */
export interface JobCreationPayload {
    jobType: string;
    title: string;
    description: string;
    subjects: string[];
    regions: string[];
    budget: number;
    internalChecklist: InternalChecklist;
    // Teacher-specific
    contractPeriod?: string;
    gradeLevel?: string[];
    teachingHours?: number;
    // Event-specific
    eventType?: string;
    eventDuration?: string;
    participantCount?: string;
    equipmentProvided?: boolean;
    certifications?: string[];
}
