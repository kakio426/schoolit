'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { JobType } from '@/lib/constants';
import Step1BasicInfo from './Step1BasicInfo';
import Step2Compliance from './Step2Compliance';
import Step3Preview from './Step3Preview';
import { JobCreationPayload } from '@/types';
import { WizardFormData } from './schema';

interface HiringWizardProps {
    initialType?: JobType;
}

export default function HiringWizard({ initialType = JobType.TEACHER_HIRING }: HiringWizardProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [jobType, setJobType] = useState<JobType>(initialType);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<WizardFormData>({
        title: '',
        description: '',
        subjects: '',
        regions: '',
        budget: '',
        internalChecklist: {
            planningApproved: false,
            budgetConfirmed: false,
            vacancyConfirmed: false,
        },
        // Teacher
        hiringReason: '',
        contractPeriod: '',
        gradeLevel: [],
        teachingHours: '',
        // Event
        eventType: '',
        eventDuration: '',
        participantCount: '',
        equipmentProvided: false,
        certifications: [],
    });

    const [isStandardSalary, setIsStandardSalary] = useState(true);
    const [isStep2Valid, setIsStep2Valid] = useState(false); // Validated by Step2 component

    // Submit Handler
    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const payload: JobCreationPayload = {
                jobType,
                title: formData.title,
                description: formData.description,
                subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean),
                regions: formData.regions.split(',').map(s => s.trim()).filter(Boolean),
                budget: parseInt(String(formData.budget).replace(/,/g, ''), 10) || 0,
                internalChecklist: formData.internalChecklist,
            };

            if (jobType === JobType.TEACHER_HIRING) {
                payload.contractPeriod = formData.contractPeriod;
                payload.gradeLevel = formData.gradeLevel;
                payload.teachingHours = parseInt(formData.teachingHours, 10) || undefined;
            }

            if (jobType === JobType.EVENT_VENDOR) {
                payload.eventType = formData.eventType;
                payload.eventDuration = formData.eventDuration;
                payload.participantCount = formData.participantCount;
                payload.equipmentProvided = formData.equipmentProvided;
                payload.certifications = formData.certifications;
            }

            await api.post('/jobs', payload);
            alert('공고가 성공적으로 등록되었습니다! 🎉');
            router.push('/dashboard/jobs');
        } catch (e: any) {
            console.error(e);
            alert(e.message || '등록 실패');
        } finally {
            setIsLoading(false);
        }
    };

    // Navigation Logic
    const nextStep = () => {
        if (step === 1) {
            if (!formData.title) return alert('제목을 입력해주세요.');
            if (!formData.description) return alert('상세 내용을 입력해주세요.');
        }
        if (step === 2) {
            if (!isStep2Valid) return alert('필수 행정 사항 및 필수 항목을 확인해주세요.');
        }
        setStep(p => p + 1);
    };

    const prevStep = () => setStep(p => p - 1);

    return (
        <div className="flex flex-col h-full min-h-[600px]">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8 px-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex flex-col items-center relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${s === step
                            ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30'
                            : s < step
                                ? 'bg-emerald-500 text-white'
                                : 'bg-surface border border-border text-foreground-muted'
                            }`}>
                            {s < step ? '✓' : s}
                        </div>
                        <span className={`text-xs mt-2 font-bold ${s <= step ? 'text-primary' : 'text-foreground-muted'}`}>
                            {s === 1 ? '기본 정보' : s === 2 ? '행정 확인' : '최종 완료'}
                        </span>
                    </div>
                ))}
                {/* Progress Line */}
                <div className="absolute top-5 left-0 w-full h-0.5 bg-border -z-0 hidden"></div>
                {/* Needs proper absolute positioning container if we want the line, skipping for simplicity/cleanliness */}
            </div>

            {/* Content Area */}
            <div className="flex-1">
                {step === 1 && (
                    <Step1BasicInfo
                        formData={formData}
                        setFormData={setFormData}
                        jobType={jobType}
                        setJobType={setJobType}
                        isStandardSalary={isStandardSalary}
                        setIsStandardSalary={setIsStandardSalary}
                    />
                )}
                {step === 2 && (
                    <Step2Compliance
                        formData={formData}
                        setFormData={setFormData}
                        jobType={jobType}
                        setIsValid={setIsStep2Valid}
                    />
                )}
                {step === 3 && (
                    <Step3Preview
                        formData={formData}
                        jobType={jobType}
                    />
                )}
            </div>

            {/* Footer Buttons */}
            <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
                {step > 1 ? (
                    <button
                        onClick={prevStep}
                        className="px-6 py-3 bg-surface hover:bg-surface-hover border border-border rounded-xl font-bold text-foreground-muted transition-colors"
                    >
                        이전 단계
                    </button>
                ) : (
                    <div></div> // Spacer
                )}

                {step < 3 ? (
                    <button
                        onClick={nextStep}
                        className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg active:scale-95"
                    >
                        다음 단계 ➡️
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                    >
                        {isLoading ? '등록 중...' : '공고 등록 완료 🎉'}
                    </button>
                )}
            </div>
        </div>
    );
}
