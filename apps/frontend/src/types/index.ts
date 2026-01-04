import { Role, ApplicationStatus, CertStatus } from '../lib/constants';

export interface TeacherProfile {
    id: number;
    userId: number;
    bio?: string;
    profileImage?: string;
    subjects: string[];
    regions: string[];
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface BusinessPortfolio {
    id: number;
    title: string;
    description?: string;
    images: string[];
}

export interface BusinessProfile {
    id: number;
    userId: number;
    companyName: string;
    registrationNum?: string;
    registrationFile?: string;
    description?: string;
    website?: string;
    address?: string;
    canIssueTaxInvoice: boolean;
    categories: string[];
    isVerified: boolean;
    portfolios?: BusinessPortfolio[];
}

export interface User {
    id: string | number;
    email: string;
    name: string;
    role: Role;
    teacherProfile?: TeacherProfile;
    businessProfile?: BusinessProfile;
    notificationSettings?: any;
    reviewStats?: {
        totalReviews: number;
        averageRating: number;
        topKeywords: Array<{ keyword: string; count: number }>;
        reMatchRate: number;
        isVeteran: boolean;
    };
}

export interface JobListing {
    id: number;
    title: string;
    description: string;
    subjects: string[];
    regions: string[];
    status: 'OPEN' | 'CLOSED';
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
    jobListing?: JobListing;
    user?: User;
}
