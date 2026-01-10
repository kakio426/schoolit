import { InternalChecklist } from '@/types';

export interface WizardFormData {
    title: string;
    description: string;
    subjects: string;
    regions: string;
    budget: string | number;
    internalChecklist: InternalChecklist;
    // Teacher
    hiringReason: string;
    isEmergency: boolean; // 긴급 채용 여부
    contractPeriod: string;
    gradeLevel: string[];
    teachingHours: string;
    // Event
    eventType: string;
    eventDuration: string;
    participantCount: string;
    equipmentProvided: boolean;
    certifications: string[];
}
