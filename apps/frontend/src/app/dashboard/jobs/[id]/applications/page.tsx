"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReviewModal from '@/components/reviews/ReviewModal';
import { api } from '@/lib/api';
import { JobApplication } from '@/types';
import { ApplicationStatus, Role } from '@/lib/constants';

export default function JobApplicantsPage() {
    const { id } = useParams(); // jobId
    const { user } = useAuth();
    const [applicants, setApplicants] = useState<JobApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState<JobApplication | null>(null);

    useEffect(() => {
        if (id) {
            fetchApplicants();
        }
    }, [id]);

    const fetchApplicants = async () => {
        try {
            const data = await api.get<JobApplication[]>(`/applications/jobs/${id}`);
            setApplicants(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (appId: number, newStatus: ApplicationStatus) => {
        try {
            const updated = await api.patch<JobApplication>(`/applications/${appId}/status`, { status: newStatus });
            setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: updated.status, user: updated.user } : a));
            alert(`상태가 변경되었습니다.`);
        } catch (e: any) {
            console.error(e);
            alert(e.message || '오류 발생');
        }
    }

    const getStatusText = (status: ApplicationStatus) => {
        switch (status) {
            case ApplicationStatus.PENDING: return '검토중';
            case ApplicationStatus.ACCEPTED: return '수락됨';
            case ApplicationStatus.INTERVIEWING: return '면접중 💬';
            case ApplicationStatus.HIRED: return '채용확정 🎉';
            case ApplicationStatus.REJECTED: return '거절됨';
            default: return status;
        }
    }

    const getStatusColor = (status: ApplicationStatus) => {
        switch (status) {
            case ApplicationStatus.PENDING: return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
            case ApplicationStatus.ACCEPTED: return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case ApplicationStatus.INTERVIEWING: return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
            case ApplicationStatus.HIRED: return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700';
        }
    }

    if (user?.role !== Role.SCHOOL) {
        return <DashboardLayout><div>권한이 없습니다.</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                        <span className="w-2 h-8 bg-primary rounded-full"></span>
                        👥 지원자 관리
                    </h1>
                    <p className="text-foreground-muted text-lg">우리 학교 공고에 지원한 선생님 목록입니다.</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-20 text-foreground-muted">로딩 중...</div>
                ) : applicants.length === 0 ? (
                    <div className="text-center py-24 bg-surface rounded-[40px] border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-3xl mx-auto mb-6">🏜️</div>
                        <p className="text-foreground-muted text-lg font-medium">아직 지원자가 없습니다.</p>
                        <p className="text-sm text-foreground-muted mt-1">추천 목록에서 인재를 찾아보세요.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {applicants.map(app => (
                            <div key={app.id} className="bg-surface p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-primary shadow-inner">
                                            {app.user?.name?.[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">{app.user?.name} 선생님</h3>
                                            <p className="text-foreground-muted text-sm">{app.user?.email}</p>
                                        </div>
                                        {app.isSuggestion && (
                                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[11px] font-extrabold rounded-lg border border-indigo-100 dark:border-indigo-800">학교제안</span>
                                        )}
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl text-foreground-muted mb-6 border border-slate-100 dark:border-slate-800 shadow-inner">
                                        <span className="text-2xl mr-2">❝</span>
                                        {app.message || '인사말이 없습니다.'}
                                        <span className="text-2xl ml-2">❞</span>
                                    </div>
                                    {/* Contact Info - Visible if status is INTERVIEWING, ACCEPTED or HIRED */}
                                    {(app.status === ApplicationStatus.INTERVIEWING || app.status === ApplicationStatus.ACCEPTED || app.status === ApplicationStatus.HIRED) && (
                                        <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2.5 rounded-xl w-fit border border-emerald-100 dark:border-emerald-800/50">
                                            <span className="text-lg">📞</span>
                                            <span className="text-sm font-bold">연락처: {app.user?.email}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3 min-w-[200px] justify-center">
                                    <div className="text-center mb-4">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                                            {getStatusText(app.status)}
                                        </span>
                                    </div>

                                    {app.status === ApplicationStatus.PENDING && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(app.id, ApplicationStatus.ACCEPTED)}
                                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 text-sm active:scale-95"
                                            >
                                                합격 처리
                                            </button>
                                            <button
                                                onClick={() => updateStatus(app.id, ApplicationStatus.INTERVIEWING)}
                                                className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 text-sm active:scale-95"
                                            >
                                                면접 제안 (채팅)
                                            </button>
                                            <button
                                                onClick={() => updateStatus(app.id, ApplicationStatus.REJECTED)}
                                                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-all text-sm active:scale-95"
                                            >
                                                거절
                                            </button>
                                        </>
                                    )}

                                    {(app.status === ApplicationStatus.ACCEPTED || app.status === ApplicationStatus.INTERVIEWING) && (
                                        <button
                                            onClick={() => updateStatus(app.id, ApplicationStatus.HIRED)}
                                            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 text-sm active:scale-95"
                                        >
                                            🎉 채용 확정
                                        </button>
                                    )}

                                    {app.status === ApplicationStatus.HIRED && (
                                        <button
                                            onClick={() => {
                                                setSelectedApplicant(app);
                                                setIsReviewModalOpen(true);
                                            }}
                                            className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 text-sm active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            ⭐ 활동 평가 작성
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedApplicant && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    receiverName={selectedApplicant.user?.name || ''}
                    receiverRole={selectedApplicant.user?.role || Role.TEACHER}
                    onSubmit={async (data) => {
                        try {
                            await api.post('/reviews', {
                                jobId: parseInt(id as string),
                                receiverId: selectedApplicant.user?.id,
                                ...data
                            });
                            alert('후기 및 평가가 성공적으로 전달되었습니다! ✨');
                            fetchApplicants();
                        } catch (e: any) {
                            console.error(e);
                            alert(e.message || '저장에 실패했습니다.');
                        }
                    }}
                />
            )}
        </DashboardLayout>
    );
}
