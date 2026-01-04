"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { api } from '@/lib/api';
import { JobApplication } from '@/types';
import { ApplicationStatus } from '@/lib/constants';

export default function MyApplicationsPage() {
    const { user } = useAuth();
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const data = await api.get<JobApplication[]>('/applications/me');
            setApplications(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (appId: number, newStatus: ApplicationStatus) => {
        try {
            await api.patch(`/applications/${appId}/status`, { status: newStatus });
            fetchApplications();
            alert(newStatus === ApplicationStatus.INTERVIEWING ? '제안을 수락했습니다. 메시지 메뉴에서 대화를 시작하세요!' : '제안을 거절했습니다.');
        } catch (err: any) {
            console.error(err);
            alert(err.message || '오류가 발생했습니다.');
        }
    };

    const getStatusBadge = (app: JobApplication) => {
        const { status, isSuggestion } = app;
        if (isSuggestion && status === ApplicationStatus.PENDING) {
            return (
                <div className="flex flex-col gap-2 scale-90 origin-right">
                    <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold text-center border border-indigo-200 dark:border-indigo-800">학교 제안 도착 🎁</span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => updateStatus(app.id, ApplicationStatus.INTERVIEWING)}
                            className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            수락
                        </button>
                        <button
                            onClick={() => updateStatus(app.id, ApplicationStatus.REJECTED)}
                            className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                            거절
                        </button>
                    </div>
                </div>
            );
        }

        switch (status) {
            case ApplicationStatus.PENDING: return <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 dark:border-yellow-800">검토중</span>;
            case ApplicationStatus.ACCEPTED: return <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-200 dark:border-green-800">합격 🎉</span>;
            case ApplicationStatus.INTERVIEWING: return <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 dark:border-purple-800">면접중 💬</span>;
            case ApplicationStatus.HIRED: return <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">채용확정 🎊</span>;
            case ApplicationStatus.REJECTED: return <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-200 dark:border-red-800">불합격</span>;
            default: return <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700">{status}</span>;
        }
    }

    if (user?.role !== 'TEACHER') {
        return <DashboardLayout><div>선생님 전용 페이지입니다.</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground">📨 나의 지원 현황</h1>
                    <p className="text-foreground-muted text-sm mt-1">지원한 공고와 받은 제안을 확인하세요.</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-20 text-foreground-muted">로딩 중...</div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-20 bg-surface rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl mx-auto mb-4">📄</div>
                        <p className="text-foreground-muted mb-2 font-medium">아직 지원한 내역이 없습니다.</p>
                        <p className="text-sm text-foreground-muted">마음에 드는 공고를 찾아보세요!</p>
                        <Link href="/dashboard/jobs" className="mt-6 inline-block px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">공고 보러가기</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <div key={app.id} className={`p-6 rounded-3xl border transition-all flex items-start justify-between shadow-sm hover:shadow-md ${app.isSuggestion && app.status === ApplicationStatus.PENDING ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30' : 'bg-surface border-slate-200 dark:border-slate-700'}`}>
                                <div className="flex-1 mr-4">
                                    <h3 className="text-lg font-bold text-foreground">{app.jobListing?.title}</h3>
                                    <p className="text-foreground-muted text-sm mt-1 mb-3">
                                        {app.jobListing?.schoolProfile?.schoolName || '학교 정보 없음'}
                                    </p>
                                    <div className="text-sm text-foreground-muted bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                        {app.isSuggestion ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">📩</span>
                                                <span>학교에서 선생님의 프로필을 보고 제안을 보냈습니다.</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-start gap-2">
                                                <span className="text-lg">📝</span>
                                                <span className="italic">"{app.message || '인사말이 없습니다.'}"</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-3 text-xs text-foreground-muted/60 flex items-center gap-1">
                                        <span>📅</span>
                                        <span>{app.isSuggestion ? '제안일' : '지원일'}: {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-'}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3 min-w-[120px]">
                                    {getStatusBadge(app)}
                                    {(app.status === ApplicationStatus.INTERVIEWING || app.status === ApplicationStatus.ACCEPTED || app.status === ApplicationStatus.HIRED) && (
                                        <div className="flex flex-col gap-2 items-end">
                                            <Link
                                                href="/dashboard/messages"
                                                className="px-4 py-2 bg-surface dark:bg-slate-800 text-primary dark:text-primary/90 text-xs font-bold rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm shadow-primary/10 active:scale-95"
                                            >
                                                채팅창 바로가기 →
                                            </Link>
                                            {app.status === ApplicationStatus.HIRED && (
                                                <button
                                                    onClick={() => api.downloadFile(`/applications/${app.id}/contract`, `contract_${app.id}.pdf`)}
                                                    className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-sm active:scale-95 flex items-center gap-1"
                                                >
                                                    <span>📜</span> 계약서 다운로드
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
