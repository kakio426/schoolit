"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { JobListing, JobApplication } from '@/types';
import { Role } from '@/lib/constants';

export default function JobDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [job, setJob] = useState<JobListing | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        if (id) {
            fetchJob();
            checkExistingApplication();
        }
    }, [id]);

    const fetchJob = async () => {
        try {
            const data = await api.get<JobListing>(`/jobs/${id}`);
            setJob(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const checkExistingApplication = async () => {
        try {
            const data = await api.get<JobApplication[]>('/applications/me');
            const existing = data.find((a) => a.jobId === Number(id));
            if (existing) setHasApplied(true);
        } catch (e) {
            console.error(e);
        }
    };

    const handleApply = async () => {
        if (!message.trim()) {
            alert('지원 메시지를 입력해주세요.');
            return;
        }
        setIsApplying(true);
        try {
            await api.post(`/applications/${id}/apply`, { message });
            alert('지원이 완료되었습니다!');
            setHasApplied(true);
            router.push('/dashboard/applications');
        } catch (e: any) {
            alert(e.message || '지원 중 오류가 발생했습니다.');
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoading) return <DashboardLayout><div className="text-center py-20 text-foreground-muted">로딩 중...</div></DashboardLayout>;
    if (!job) return <DashboardLayout><div className="text-center py-20 text-foreground-muted">공고를 찾을 수 없습니다.</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <button
                    onClick={() => router.back()}
                    className="mb-6 text-foreground-muted hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> 뒤로 가기
                </button>

                <div className="bg-surface rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden border-b-4 border-b-primary/20">
                    <div className="p-8 md:p-12 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                        <div className="flex flex-wrap gap-2 mb-6">
                            {job.subjects?.map((s: string) => (
                                <span key={s} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full border border-blue-200 dark:border-blue-800">
                                    {s}
                                </span>
                            ))}
                            {job.regions?.map((r: string) => (
                                <span key={r} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold rounded-full border border-orange-200 dark:border-orange-800">
                                    {r}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">{job.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-foreground-muted">
                            <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <span className="text-xl">🏫</span>
                                <span className="font-bold text-foreground">{job.schoolProfile?.schoolName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>📅</span>
                                <span>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '-'} 등록</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${job.active ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                                <span className="font-bold">{job.active ? '모집 중' : '모집 마감'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="mb-12">
                            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                공고 상세 내용
                            </h2>
                            <div className="text-foreground-muted leading-relaxed whitespace-pre-wrap text-lg bg-slate-50/30 dark:bg-slate-800/10 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
                                {job.description}
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-foreground mb-6">📍 학교 정보</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                                <div>
                                    <div className="text-foreground-muted mb-2 font-medium">학교 위치</div>
                                    <div className="text-foreground font-bold text-base">{job.schoolProfile?.address || '정보 없음'}</div>
                                </div>
                                <div>
                                    <div className="text-foreground-muted mb-2 font-medium">홈페이지</div>
                                    <div className="text-foreground font-bold text-base">
                                        {job.schoolProfile?.website ? (
                                            <a href={job.schoolProfile.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                                {job.schoolProfile.website} ↗
                                            </a>
                                        ) : '정보 없음'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {user?.role === Role.TEACHER && (
                            <div className="mt-12 border-t border-slate-100 dark:border-slate-800 pt-12">
                                {hasApplied ? (
                                    <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400 p-8 rounded-3xl text-center shadow-inner">
                                        <div className="text-4xl mb-4">✅</div>
                                        <div className="text-xl font-bold mb-2">이미 지원한 공고입니다.</div>
                                        <div className="text-sm">지원 현황에서 진행 상태를 확인하세요.</div>
                                        <Link href="/dashboard/applications" className="mt-6 inline-block px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all">지원 현황 보기</Link>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                                            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                            이 공고에 지원하기
                                        </h2>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="학교 담당자에게 보낼 자기소개나 메시지를 간단히 입력해주세요."
                                            className="w-full h-40 p-6 bg-surface border border-slate-200 dark:border-slate-700 rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all mb-6 text-foreground shadow-sm"
                                        />
                                        <button
                                            onClick={handleApply}
                                            disabled={isApplying || !job.active}
                                            className="w-full py-5 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                                        >
                                            {isApplying ? '지원 중...' : job.active ? '지원서 제출하기' : '마감된 공고입니다'}
                                        </button>
                                        <p className="text-center text-foreground-muted text-xs mt-4 italic">
                                            지원서를 제출하면 학교 담당자에게 알림이 전송됩니다.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
