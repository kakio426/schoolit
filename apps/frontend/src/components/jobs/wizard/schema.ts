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
