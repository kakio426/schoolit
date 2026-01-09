"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import JobSearchFilter from '@/components/jobs/JobSearchFilter';
import RecommendedJobs from '@/components/jobs/RecommendedJobs';
import { api } from '@/lib/api';
import { JobListing } from '@/types';
import StandardCard, { StandardBadge } from '@/components/ui/StandardCard';
import { Plus, Search, Filter, Trash2, Edit3, UserCheck, Calendar, MapPin, Eye, Clock } from 'lucide-react';

export default function JobsPage() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<JobListing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchFilters, setSearchFilters] = useState<{ subject?: string; region?: string; keyword?: string }>({});
    const [jobTypeFilter, setJobTypeFilter] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'SEARCH' | 'MY'>('SEARCH');

    useEffect(() => {
        if (user?.role === 'TEACHER') {
            setJobTypeFilter('TEACHER_HIRING');
        } else if (user?.role === 'BUSINESS') {
            setJobTypeFilter('EVENT_VENDOR');
        }
    }, [user?.role]);

    useEffect(() => {
        if (user) {
            fetchJobs();
        }
    }, [user, searchFilters, jobTypeFilter, viewMode]);

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            let endpoint = '/jobs';
            if (user?.role === 'SCHOOL') {
                endpoint = '/jobs/my';
            } else if (user?.role === 'TEACHER' || user?.role === 'BUSINESS') {
                if (viewMode === 'MY') {
                    endpoint = '/jobs/my';
                } else {
                    const params = new URLSearchParams();
                    if (searchFilters.subject) params.append('subject', searchFilters.subject);
                    if (searchFilters.region) params.append('region', searchFilters.region);
                    if (searchFilters.keyword) params.append('keyword', searchFilters.keyword);
                    if (jobTypeFilter) params.append('jobType', jobTypeFilter);
                    endpoint = `/matching/jobs?${params.toString()}`;
                }
            }
            const data = await api.get<JobListing[]>(endpoint);
            setJobs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (jobId: number) => {
        if (!confirm('정말로 이 공고를 삭제하시겠습니까? 관련 내역도 함께 상실됩니다.')) return;
        try {
            await api.delete(`/jobs/${jobId}`);
            fetchJobs();
        } catch (e: any) {
            alert(e.message || '삭제 실패');
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

    if (!user) return <DashboardLayout><div className="text-center py-20">로딩 중...</div></DashboardLayout>;

    const isSchool = user.role === 'SCHOOL';

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                        <h1 className="text-3xl font-black text-foreground">
                            {isSchool ? '📋 채용 공고 관리' : viewMode === 'MY' ? '📂 신청한 공고' : (user.role === 'BUSINESS' ? '🔎 행사 공고 찾기' : '🔎 채용 공고 찾기')}
                        </h1>
                        <p className="text-foreground-muted text-sm mt-1 font-medium">
                            {isSchool
                                ? '등록한 공고의 상태를 관리하고 지원자를 실시간으로 확인하세요.'
                                : '내 전공과 지역에 딱 맞는 새로운 기회를 매칭해 드립니다.'}
                        </p>
                    </div>
                    {isSchool && (
                        <Link
                            href="/dashboard/jobs/new"
                            className="bg-primary text-white px-6 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-primary/30 hover:bg-primary-hover active:scale-95 transition-all text-sm"
                        >
                            <Plus className="w-5 h-5" /> 새 공고 작성하기
                        </Link>
                    )}
                </div>

                {/* Main Content Area */}
                {!isSchool && <RecommendedJobs />}

                {/* Filtering Section (Only for Search Mode) */}
                {!isSchool && viewMode === 'SEARCH' && (
                    <div className="bg-surface border border-border rounded-3xl p-2 flex flex-col md:flex-row gap-2 shadow-sm">
                        <JobSearchFilter onSearch={(filters) => setSearchFilters(filters)} />
                    </div>
                )}

                {/* List Section */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-foreground-muted">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mb-4"></div>
                        <p className="text-sm font-bold">전국의 공고를 불러오는 중...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-32 bg-surface rounded-[40px] border border-dashed border-border">
                        <div className="text-5xl mb-6 opacity-30">🏜️</div>
                        <h3 className="text-xl font-bold text-foreground mb-2">항목이 없습니다.</h3>
                        <p className="text-foreground-muted text-sm">조건에 맞는 공고가 아직 등록되지 않았습니다.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {jobs.map((job) => (
                            <StandardCard
                                key={job.id}
                                noPadding
                                className="group relative"
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Left: Content Info */}
                                    <div className="flex-1 p-6 md:p-8 space-y-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <StandardBadge variant={(job as any).jobType === 'EVENT_VENDOR' ? 'indigo' : 'primary'}>
                                                {(job as any).jobType === 'EVENT_VENDOR' ? '🏢 행사/업체' : '🎓 교사 채용'}
                                            </StandardBadge>
                                            <span className="text-foreground-muted text-xs font-bold border-l border-border pl-2">
                                                {job.schoolProfile?.schoolName || (job as any).teacherProfile?.user?.name || '정보 없음'}
                                            </span>
                                            {!isSchool && (
                                                <span className="text-foreground-muted text-[10px] flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {new Date(job.createdAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <Link href={`/dashboard/jobs/${job.id}`} className="text-xl md:text-2xl font-black text-foreground hover:text-primary transition-colors block mb-2 leading-tight">
                                                {job.title}
                                            </Link>
                                            <div className="flex flex-wrap gap-4 text-sm text-foreground-muted font-medium">
                                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-rose-500" /> {job.regions?.[0] || '전국'}</span>
                                                <span className="flex items-center gap-1.5"><Search className="w-4 h-4 text-blue-500" /> {job.subjects?.join(', ')}</span>
                                                {(job as any).contractPeriod && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-500" /> {(job as any).contractPeriod}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Actions / Quick Stats */}
                                    <div className="md:w-64 bg-slate-50/50 dark:bg-slate-800/30 border-t md:border-t-0 md:border-l border-border p-6 flex flex-col justify-center items-center gap-3">
                                        {isSchool ? (
                                            <>
                                                <Link
                                                    href={`/dashboard/jobs/${job.id}/applications`}
                                                    className="w-full py-3 bg-primary text-white rounded-xl font-black text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                                >
                                                    <UserCheck className="w-4 h-4" /> 지원자 확인
                                                </Link>
                                                <div className="flex gap-2 w-full">
                                                    <button
                                                        onClick={() => toggleStatus(job.id, job.active)}
                                                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${job.active ? 'bg-white border-red-200 text-red-500 hover:bg-red-50' : 'bg-white border-emerald-200 text-emerald-500 hover:bg-emerald-50'}`}
                                                    >
                                                        {job.active ? '마감하기' : '열기'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(job.id)}
                                                        className="p-2 bg-white border border-border text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    href={`/dashboard/jobs/${job.id}`}
                                                    className="w-full py-3.5 bg-white dark:bg-slate-800 border border-border text-foreground rounded-xl font-black text-sm text-center flex items-center justify-center gap-2 shadow-sm hover:border-primary hover:text-primary transition-all"
                                                >
                                                    <Eye className="w-4 h-4" /> 상세 정보 보기
                                                </Link>
                                                <div className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest mt-2">
                                                    {job.active ? '🔥 마감 임박' : '🚫 모집 종료'}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </StandardCard>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
