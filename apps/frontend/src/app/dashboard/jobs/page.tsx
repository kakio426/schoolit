"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import JobSearchFilter from '@/components/jobs/JobSearchFilter';
import RecommendedJobs from '@/components/jobs/RecommendedJobs';
import { api } from '@/lib/api';
import { JobListing } from '@/types';

export default function JobsPage() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<JobListing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchFilters, setSearchFilters] = useState<{ subject?: string; region?: string; keyword?: string }>({});
    const [jobTypeFilter, setJobTypeFilter] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchJobs();
        }
    }, [user, searchFilters, jobTypeFilter]);

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            let endpoint = '/jobs'; // Default for Schools

            if (user?.role === 'TEACHER') {
                const params = new URLSearchParams();
                if (searchFilters.subject) params.append('subject', searchFilters.subject);
                if (searchFilters.region) params.append('region', searchFilters.region);
                if (searchFilters.keyword) params.append('keyword', searchFilters.keyword);
                if (jobTypeFilter) params.append('jobType', jobTypeFilter);
                endpoint = `/matching/jobs?${params.toString()}`;
            } else if (jobTypeFilter) {
                endpoint = `/jobs?jobType=${jobTypeFilter}`;
            }

            const data = await api.get<JobListing[]>(endpoint);

            if (user?.role === 'SCHOOL') {
                const myJobs = data.filter((job) => job.schoolProfile?.userId === user?.id);
                setJobs(myJobs);
            } else {
                setJobs(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleStatus = async (jobId: number, currentStatus: boolean) => {
        try {
            await api.patch(`/jobs/${jobId}`, { active: !currentStatus });
            fetchJobs();
        } catch (e) {
            console.error(e);
        }
    }

    const handleSearch = (filters: any) => {
        setSearchFilters(filters);
    };

    if (user?.role === 'SCHOOL') {
        return (
            <DashboardLayout>
                <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">📋 채용 공고 관리</h1>
                            <p className="text-foreground-muted text-sm">등록한 공고를 관리하고 지원자를 확인하세요.</p>
                        </div>
                        <Link
                            href="/dashboard/jobs/new"
                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <span>➕</span> 새 공고 등록
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-20 text-foreground-muted">로딩 중...</div>
                    ) : jobs.length === 0 ? (
                        <div className="bg-surface rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center text-foreground-muted">
                            <p className="text-xl mb-4 font-bold">등록된 공고가 없습니다.</p>
                            <p>새로운 선생님을 찾아보세요!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {jobs.map((job) => (
                                <div key={job.id} className="bg-surface p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-foreground">{job.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${job.active ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                {job.active ? '모집중' : '마감됨'}
                                            </span>
                                        </div>
                                        <p className="text-foreground-muted mt-1 line-clamp-1">{job.description}</p>
                                        <div className="mt-3 flex gap-2">
                                            {job.subjects?.map((sub: string) => (
                                                <span key={sub} className="px-2 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded-lg">{sub}</span>
                                            ))}
                                            {job.regions?.map((reg: string) => (
                                                <span key={reg} className="px-2 py-1 bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 text-xs rounded-lg">{reg}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleStatus(job.id, job.active)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${job.active
                                                ? 'border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20'
                                                : 'border-green-200 text-green-500 hover:bg-green-50 dark:border-green-900/50 dark:hover:bg-green-900/20'
                                                }`}
                                        >
                                            {job.active ? '마감하기' : '다시 열기'}
                                        </button>
                                        <Link
                                            href={`/dashboard/jobs/${job.id}/applications`}
                                            className="px-4 py-2 rounded-xl text-sm font-bold border border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-900/20 text-center"
                                        >
                                            지원자 확인
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground">🔎 채용 공고 찾기</h1>
                    <p className="text-foreground-muted text-sm">전국의 학교 채용 공고를 검색해보세요.</p>
                </div>

                {/* Job Type Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setJobTypeFilter(null)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${!jobTypeFilter
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'bg-surface border border-slate-200 dark:border-slate-700 text-foreground hover:bg-surface-hover'
                            }`}
                    >
                        전체
                    </button>
                    <button
                        onClick={() => setJobTypeFilter('TEACHER_HIRING')}
                        className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${jobTypeFilter === 'TEACHER_HIRING'
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'bg-surface border border-slate-200 dark:border-slate-700 text-foreground hover:bg-surface-hover'
                            }`}
                    >
                        <span>👨‍🏫</span> 기간제 교사
                    </button>
                    <button
                        onClick={() => setJobTypeFilter('EVENT_VENDOR')}
                        className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${jobTypeFilter === 'EVENT_VENDOR'
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'bg-surface border border-slate-200 dark:border-slate-700 text-foreground hover:bg-surface-hover'
                            }`}
                    >
                        <span>🎪</span> 행사 업체
                    </button>
                </div>

                <RecommendedJobs />

                <JobSearchFilter onSearch={handleSearch} />

                {isLoading ? (
                    <div className="text-center py-20 text-foreground-muted">검색 중...</div>
                ) : jobs.length === 0 ? (
                    <div className="bg-surface rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center text-foreground-muted">
                        <p className="text-xl mb-4 font-bold">검색 결과가 없습니다.</p>
                        <p>다른 검색어로 찾아보세요.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <Link href={`/dashboard/jobs/${job.id}`} key={job.id} className="block bg-surface p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:bg-surface-hover">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            {/* Job Type Badge */}
                                            <span className={`px-2 py-1 text-xs font-bold rounded-lg ${(job as any).jobType === 'EVENT_VENDOR'
                                                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                                                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                {(job as any).jobType === 'EVENT_VENDOR' ? '🎪 행사 업체' : '👨‍🏫 기간제 교사'}
                                            </span>
                                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700">
                                                {job.schoolProfile?.schoolName}
                                            </span>
                                            <span className="text-foreground-muted text-xs">•</span>
                                            <span className="text-foreground-muted text-xs">{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '-'}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground mb-2">{job.title}</h3>

                                        {/* Type-specific info */}
                                        {(job as any).jobType === 'TEACHER_HIRING' && (
                                            <div className="text-sm text-foreground-muted mb-2">
                                                {(job as any).contractPeriod && <span>📅 {(job as any).contractPeriod}</span>}
                                                {(job as any).gradeLevel?.length > 0 && <span className="ml-3">🎓 {(job as any).gradeLevel.join(', ')}</span>}
                                                {(job as any).teachingHours && <span className="ml-3">⏰ 주 {(job as any).teachingHours}시간</span>}
                                            </div>
                                        )}

                                        {(job as any).jobType === 'EVENT_VENDOR' && (
                                            <div className="text-sm text-foreground-muted mb-2">
                                                {(job as any).eventType && <span>🎯 {(job as any).eventType}</span>}
                                                {(job as any).eventDuration && <span className="ml-3">⏱️ {(job as any).eventDuration}</span>}
                                                {(job as any).participantCount && <span className="ml-3">👥 {(job as any).participantCount}</span>}
                                                {(job as any).equipmentProvided && <span className="ml-3">🎒 장비 제공</span>}
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            {job.subjects?.map((s: string) => <span key={s} className="px-2 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded-lg">{s}</span>)}
                                            {job.regions?.map((r: string) => <span key={r} className="px-2 py-1 bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 text-xs rounded-lg">{r}</span>)}
                                        </div>
                                    </div>
                                    <div className="text-primary font-bold text-sm">
                                        상세보기 →
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
