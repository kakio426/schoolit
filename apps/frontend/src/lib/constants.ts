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
