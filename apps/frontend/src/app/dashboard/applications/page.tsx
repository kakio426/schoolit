"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';

export default function MyApplicationsPage() {
    const { token, user } = useAuth();
    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchApplications();
        }
    }, [token]);

    const fetchApplications = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/applications/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setApplications(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (appId: number, newStatus: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/applications/${appId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchApplications();
                alert(newStatus === 'INTERVIEWING' ? '제안을 수락했습니다. 메시지 메뉴에서 대화를 시작하세요!' : '제안을 거절했습니다.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusBadge = (app: any) => {
        const { status, isSuggestion } = app;
        if (isSuggestion && status === 'PENDING') {
            return (
                <div className="flex flex-col gap-2 scale-90 origin-right">
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold text-center">학교 제안 도착 🎁</span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => updateStatus(app.id, 'INTERVIEWING')}
                            className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all"
                        >
                            수락
                        </button>
                        <button
                            onClick={() => updateStatus(app.id, 'REJECTED')}
                            className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all"
                        >
                            거절
                        </button>
                    </div>
                </div>
            );
        }

        switch (status) {
            case 'PENDING': return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">검토중</span>;
            case 'ACCEPTED': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">합격 🎉</span>;
            case 'INTERVIEWING': return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">면접중 💬</span>;
            case 'HIRED': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">채용확정 🎊</span>;
            case 'REJECTED': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">불합격</span>;
            default: return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
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
                    <div className="text-center py-20 bg-surface rounded-3xl border border-slate-200 dark:border-slate-700">
                        <p className="text-foreground-muted mb-2">아직 지원한 내역이 없습니다.</p>
                        <p className="text-sm text-foreground-muted">마음에 드는 공고를 찾아보세요!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <div key={app.id} className={`p-6 rounded-2xl border transition-all flex items-start justify-between ${app.isSuggestion && app.status === 'PENDING' ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30' : 'bg-surface border-slate-200 dark:border-slate-700 shadow-sm'}`}>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">{app.jobListing.title}</h3>
                                    <p className="text-foreground-muted text-sm mt-1 mb-3">
                                        {app.jobListing.schoolProfile?.schoolName || '학교 정보 없음'}
                                    </p>
                                    <div className="text-sm text-foreground-muted bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                        {app.isSuggestion ? (
                                            <>📩 학교에서 선생님의 프로필을 보고 제안을 보냈습니다.</>
                                        ) : (
                                            <>📝 보낸 메시지: "{app.message || '없음'}"</>
                                        )}
                                    </div>
                                    <div className="mt-2 text-xs text-foreground-muted">
                                        {app.isSuggestion ? '제안일' : '지원일'}: {new Date(app.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {getStatusBadge(app)}
                                    {(app.status === 'INTERVIEWING' || app.status === 'ACCEPTED' || app.status === 'HIRED') && (
                                        <Link
                                            href="/dashboard/messages"
                                            className="mt-2 px-4 py-2 bg-surface text-primary text-xs font-bold rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm shadow-primary/10"
                                        >
                                            채팅창 바로가기
                                        </Link>
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

