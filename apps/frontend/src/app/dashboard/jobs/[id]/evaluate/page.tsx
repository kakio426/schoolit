'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DigitalScorecard from '@/components/evaluation/DigitalScorecard';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Users, CheckCircle2, Loader2 } from 'lucide-react';

interface Applicant {
    id: number;
    userId: number;
    userName: string;
    status: string;
    createdAt: string;
}

type EvaluationType = 'DOCUMENT' | 'INTERVIEW' | 'DEMONSTRATION';

export default function EvaluatePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const jobId = params?.id as string;

    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
    const [evaluationType, setEvaluationType] = useState<EvaluationType>('DOCUMENT');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [evaluatedIds, setEvaluatedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (jobId) {
            fetchApplicants();
        }
    }, [jobId]);

    const fetchApplicants = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/applications/job/${jobId}`) as { data: any[] };
            // Filter to only show applicants in review stages
            const reviewableApplicants = response.data.filter(
                (app: any) => ['PENDING', 'IN_REVIEW', 'SCREENING', 'INTERVIEW'].includes(app.status)
            );
            setApplicants(reviewableApplicants.map((app: any) => ({
                id: app.id,
                userId: app.userId,
                userName: app.user?.name || '이름 없음',
                status: app.status,
                createdAt: app.createdAt,
            })));
        } catch (error) {
            console.error('Failed to fetch applicants:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveEvaluation = async (
        scores: Record<string, number>,
        totalScore: number,
        meritBonus: number,
        comment: string
    ) => {
        if (!selectedApplicant) return;

        setIsSaving(true);
        try {
            await api.post('/compliance/evaluations', {
                jobListingId: parseInt(jobId),
                applicationId: selectedApplicant.id,
                evaluatorName: user?.name || '심사위원',
                type: evaluationType,
                criteriaScores: scores,
                meritBonus,
                comment,
            });

            setEvaluatedIds(prev => new Set(prev).add(selectedApplicant.id));
            alert('평가가 저장되었습니다.');
            setSelectedApplicant(null);
        } catch (error) {
            console.error('Failed to save evaluation:', error);
            alert('평가 저장에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    const EVALUATION_TYPES: { value: EvaluationType; label: string; icon: string }[] = [
        { value: 'DOCUMENT', label: '1차 서류심사', icon: '📋' },
        { value: 'INTERVIEW', label: '2차 면접심사', icon: '🎤' },
        { value: 'DEMONSTRATION', label: '3차 수업실연', icon: '🎓' },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-xl hover:bg-surface-hover transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-foreground">📝 디지털 평가표</h1>
                        <p className="text-foreground-muted text-sm">2025 경기도교육청 지침 준수 평가 시스템</p>
                    </div>
                </div>

                {/* Evaluation Type Selector */}
                <div className="mb-8">
                    <label className="block text-sm font-bold text-foreground mb-3">평가 단계 선택</label>
                    <div className="flex gap-3">
                        {EVALUATION_TYPES.map(type => (
                            <button
                                key={type.value}
                                onClick={() => setEvaluationType(type.value)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${evaluationType === type.value
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'bg-surface border border-border text-foreground hover:bg-surface-hover'
                                    }`}
                            >
                                <span>{type.icon}</span>
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                {selectedApplicant ? (
                    <DigitalScorecard
                        type={evaluationType}
                        applicantName={selectedApplicant.userName}
                        evaluatorName={user?.name || '심사위원'}
                        onSave={handleSaveEvaluation}
                        onCancel={() => setSelectedApplicant(null)}
                    />
                ) : (
                    <div className="bg-surface rounded-3xl border border-border p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Users className="w-6 h-6 text-primary" />
                            <h2 className="text-lg font-bold">지원자 목록</h2>
                            <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded-full">
                                {applicants.length}명
                            </span>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : applicants.length === 0 ? (
                            <div className="text-center py-20 text-foreground-muted">
                                <p>평가 대상 지원자가 없습니다.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {applicants.map(applicant => (
                                    <div
                                        key={applicant.id}
                                        onClick={() => setSelectedApplicant(applicant)}
                                        className={`p-5 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${evaluatedIds.has(applicant.id)
                                            ? 'border-success/50 bg-success/5'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${evaluatedIds.has(applicant.id)
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-primary/10 text-primary'
                                                    }`}>
                                                    {evaluatedIds.has(applicant.id) ? (
                                                        <CheckCircle2 className="w-6 h-6" />
                                                    ) : (
                                                        applicant.userName.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-foreground">{applicant.userName}</div>
                                                    <div className="text-sm text-foreground-muted">
                                                        지원일: {new Date(applicant.createdAt).toLocaleDateString('ko-KR')}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {evaluatedIds.has(applicant.id) && (
                                                    <span className="text-sm font-bold text-success">평가 완료</span>
                                                )}
                                                <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-foreground-muted text-xs font-bold rounded-lg">
                                                    {applicant.status === 'PENDING' ? '대기' :
                                                        applicant.status === 'IN_REVIEW' ? '심사중' :
                                                            applicant.status === 'SCREENING' ? '서류심사' :
                                                                applicant.status === 'INTERVIEW' ? '면접' : applicant.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
