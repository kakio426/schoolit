'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import HiringWizard from '@/components/jobs/HiringWizard';
import { api } from '@/lib/api';
import { JobType } from '@/lib/constants';

export default function NewJobWizardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // RBAC Check
    if (user?.role !== 'SCHOOL' && user?.role !== 'TEACHER') {
        return (
            <DashboardLayout>
                <div className="text-center py-20 text-foreground-muted">
                    접근 권한이 없습니다.<br />공고 등록은 학교만 가능합니다.
                </div>
            </DashboardLayout>
        );
    }

    const handleWizardComplete = async (data: any) => {
        setIsSubmitting(true);
        try {
            // Transform wizard data to API payload
            const payload = {
                jobType: JobType.TEACHER_HIRING,
                title: data.title,
                description: data.description,
                subjects: [data.subject],
                regions: [], // Will be filled from school profile
                contractPeriod: `${data.contractStartDate} ~ ${data.contractEndDate}`,
                gradeLevel: data.gradeLevel,
                teachingHours: parseInt(data.teachingHours, 10) || undefined,
                hiringReason: data.hiringReason,
                originalTeacherName: data.originalTeacherName,
                contractStartDate: data.contractStartDate,
                contractEndDate: data.contractEndDate,
                draftDocumentNumber: data.draftDocumentNumber,
                internalChecklist: {
                    planningApproved: data.internalApproved,
                    budgetConfirmed: true,
                    vacancyConfirmed: true,
                },
            };

            await api.post('/jobs', payload);
            alert('🎉 채용 공고가 성공적으로 등록되었습니다!');
            router.push('/dashboard/jobs');
        } catch (err: any) {
            console.error(err);
            alert(err.message || '등록 실패. 프로필 작성을 먼저 확인해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (confirm('작성 중인 내용을 취소하시겠습니까?')) {
            router.back();
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <button
                            onClick={() => router.back()}
                            className="text-foreground-muted hover:text-foreground transition-colors"
                        >
                            ← 뒤로
                        </button>
                    </div>
                    <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
                        <span className="w-2 h-8 bg-primary rounded-full"></span>
                        기간제교원 채용 등록
                    </h1>
                    <p className="text-foreground-muted mt-2">
                        2025 경기도교육청 지침을 준수하는 채용 절차를 3단계로 안내합니다.
                    </p>
                </div>

                {/* Wizard Component */}
                <HiringWizard
                    onComplete={handleWizardComplete}
                    onCancel={handleCancel}
                />

                {/* Compliance Info */}
                <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">📚 지침 안내</h3>
                    <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc pl-4">
                        <li>채용 공고는 최소 <b>3일</b> 이상 게시해야 합니다.</li>
                        <li>병가 대체 채용 시 계약 기간은 <b>1개월 이상</b>이어야 합니다.</li>
                        <li>명예퇴직자 채용 시 호봉은 <b>14호봉</b>을 초과할 수 없습니다.</li>
                    </ul>
                </div>
            </div>
        </DashboardLayout>
    );
}
