import { Role, ApplicationStatus, CertStatus } from '../lib/constants';

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
}

export interface JobListing {
    id: number;
    title: string;
    description: string;
    subjects: string[];
    regions: string[];
    status: 'OPEN' | 'CLOSED';
    active: boolean;
    jobType?: string;
    internalChecklist?: any;
    createdAt: string;
    schoolProfile?: SchoolProfile;
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
}
