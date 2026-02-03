"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import JobSearchFilter from '@/components/jobs/JobSearchFilter';
import RecommendedJobs from '@/components/jobs/RecommendedJobs';
import { api } from '@/lib/api';
import { JobListing } from '@/types';
import { Plus, Trash2, UserCheck, Calendar, MapPin, Eye, Clock, AlertCircle, CheckCircle2, ChevronRight, Briefcase, Filter } from 'lucide-react';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import MobileCard from '@/components/ui/MobileCard';
import MobileJobFilter from '@/components/jobs/MobileJobFilter';

interface JobsListClientProps {
    initialJobs?: JobListing[];
}

export default function JobsListClient({ initialJobs = [] }: JobsListClientProps) {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<JobListing[]>(initialJobs);
    // If initialJobs provided, not loading. If empty, maybe loading depending on role logic, but safe to say false initially if SSR worked.
    // However, if we need to refetch for SCHOOL, we might set loading true again.
    const [isLoading, setIsLoading] = useState(initialJobs.length === 0);
    const [searchFilters, setSearchFilters] = useState<{ subject?: string; region?: string; keyword?: string }>({});
    const [jobTypeFilter, setJobTypeFilter] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'SEARCH' | 'MY'>('SEARCH');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    useEffect(() => {
        if (user?.role === 'TEACHER' && !jobTypeFilter) {
            setJobTypeFilter('TEACHER_HIRING');
        } else if (user?.role === 'BUSINESS' && !jobTypeFilter) {
            setJobTypeFilter('EVENT_VENDOR');
        }
    }, [user?.role]);

    useEffect(() => {
        // Init logic: Only refetch if parameters change OR if user is school (need /my jobs)
        // If we have initialJobs (Public) but user is SCHOOL, we SHOULD fetchMyJobs immediately.
        if (!user) return;

        const isSchool = user.role === 'SCHOOL';
        const isMyMode = viewMode === 'MY';

        if (isSchool || isMyMode) {
            fetchJobs();
        } else if (initialJobs.length > 0 && Object.keys(searchFilters).length === 0 && !jobTypeFilter) {
            // Do nothing, use SSR data
        } else {
            // Filter changed, refetch
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

    if (!user) return <DashboardLayout><div className="text-center py-20">로딩 중...</div></DashboardLayout>;

    const isSchool = user.role === 'SCHOOL';

    // Check if deadline is approaching (within 7 days)
    const isDeadlineApproaching = (createdAt: string) => {
        const created = new Date(createdAt);
        const now = new Date();
        const diffDays = Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 7; // If posted 7+ days ago, consider deadline approaching
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6 pb-20">
                {/* Header Section */}
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                            {isSchool ? '채용 공고 관리' : viewMode === 'MY' ? '신청한 공고' : (user.role === 'BUSINESS' ? '행사 공고 찾기' : '채용 공고 찾기')}
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            {isSchool
                                ? '등록한 공고의 상태를 관리하고 지원자를 확인하세요.'
                                : '내 전공과 지역에 맞는 새로운 기회를 발견하세요.'}
                        </p>
                    </div>
                    {isSchool && (
                        <Link
                            href="/dashboard/jobs/new"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-all"
                        >
                            <Plus className="w-4 h-4" /> 새 공고 작성
                        </Link>
                    )}
                </header>

                {/* Recommended Jobs (for non-school users) */}
                {!isSchool && <RecommendedJobs />}

                {/* Search Filter Section */}
                {!isSchool && viewMode === 'SEARCH' && (
                    <>
                        {/* Desktop Filter */}
                        <div className="hidden lg:block">
                            <JobSearchFilter onSearch={(filters) => setSearchFilters(filters)} />
                        </div>

                        {/* Mobile Filter Trigger */}
                        <div className="lg:hidden">
                            <button
                                onClick={() => setIsMobileFilterOpen(true)}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl font-bold text-slate-600 dark:text-slate-200 shadow-sm active:scale-[0.98] transition-all"
                            >
                                <Filter className="w-4 h-4" />
                                <span>검색 필터 열기</span>
                                {(searchFilters.subject || searchFilters.region || searchFilters.keyword) && (
                                    <span className="w-2 h-2 rounded-full bg-primary" />
                                )}
                            </button>
                            <MobileJobFilter
                                isOpen={isMobileFilterOpen}
                                onClose={() => setIsMobileFilterOpen(false)}
                                onSearch={(filters) => setSearchFilters(filters)}
                                initialFilters={searchFilters}
                            />
                        </div>
                    </>
                )}

                {/* Job List */}
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <JobCardSkeleton key={i} />
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/30 border border-slate-700 rounded-xl">
                        <div className="text-4xl mb-4">🏜️</div>
                        <h3 className="text-foreground font-medium mb-1">공고가 없습니다</h3>
                        <p className="text-slate-400 text-sm">조건에 맞는 공고가 아직 등록되지 않았습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {jobs.map((job) => (
                            <div key={job.id}>
                                {/* Mobile View */}
                                <div className="md:hidden">
                                    <Link href={job.isAggregated && job.externalSourceUrl ? job.externalSourceUrl : `/dashboard/jobs/${job.id}`} target={job.isAggregated ? "_blank" : "_self"}>
                                        <MobileCard
                                            title={job.title}
                                            subtitle={job.isAggregated ? (job.externalSource || '외부 수집') : (job.schoolProfile?.schoolName || '정보 없음')}
                                            description={`${job.regions?.[0] || '전국'} · ${job.subjects?.join(', ') || '전과목'} · 마감일: ${new Date(job.createdAt).toLocaleDateString()}`}
                                            badge={job.isAggregated ? '외부공고' : ((job as any).jobType === 'EVENT_VENDOR' ? '행사/업체' : '교사 채용')}
                                            badgeColor={job.isAggregated ? 'gray' : ((job as any).jobType === 'EVENT_VENDOR' ? 'yellow' : 'blue')}
                                            onClick={() => { }}
                                        />
                                    </Link>
                                </div>

                                {/* Desktop View */}
                                <Link
                                    href={job.isAggregated && job.externalSourceUrl ? job.externalSourceUrl : `/dashboard/jobs/${job.id}`}
                                    target={job.isAggregated ? "_blank" : "_self"}
                                    className="hidden md:block group bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-600/50 hover:shadow-md rounded-xl transition-all overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row">
                                        {/* Left Section (70%) - Content */}
                                        <div className="flex-1 p-5">
                                            {/* Tags Row */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${job.isAggregated
                                                    ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                                                    : ((job as any).jobType === 'EVENT_VENDOR'
                                                        ? 'bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/30'
                                                        : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30')
                                                    }`}>
                                                    {job.isAggregated ? '외부공고' : ((job as any).jobType === 'EVENT_VENDOR' ? '행사/업체' : '교사 채용')}
                                                </span>
                                                <span className="text-slate-500 text-xs">
                                                    {job.isAggregated ? (job.externalSource || '외부 수집') : (job.schoolProfile?.schoolName || '정보 없음')}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-lg font-semibold text-foreground group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mb-2 line-clamp-1">
                                                {job.title}
                                            </h3>

                                            {/* Meta Data */}
                                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                                    {job.regions?.[0] || '전국'}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                                                    {job.subjects?.join(', ') || '전과목'}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                                    {new Date(job.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right Section (30%) - Status & Actions */}
                                        <div className="md:w-48 p-5 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700/50 flex flex-row md:flex-col items-center justify-between md:justify-center gap-3 bg-slate-50 dark:bg-slate-800/20">
                                            {/* Status Badge */}
                                            {job.active ? (
                                                isDeadlineApproaching(job.createdAt) ? (
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 rounded-full text-[10px] font-semibold">
                                                        <AlertCircle className="w-3 h-3" />
                                                        마감 임박
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-semibold">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        모집 중
                                                    </span>
                                                )
                                            ) : (
                                                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-200 dark:bg-slate-600/50 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-full text-[10px] font-semibold">
                                                    모집 종료
                                                </span>
                                            )}

                                            {/* Action Button or Arrow */}
                                            {isSchool ? (
                                                <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
                                                    <Link
                                                        href={`/dashboard/jobs/${job.id}/applications`}
                                                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-500 transition-all flex items-center gap-1.5"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <UserCheck className="w-3.5 h-3.5" />
                                                        지원자
                                                    </Link>
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(job.id); }}
                                                        className="p-1.5 text-slate-500 hover:text-red-500 border border-slate-200 dark:border-slate-700 hover:border-red-500 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-slate-500 group-hover:text-blue-500 transition-colors">
                                                    <span className="text-xs font-medium hidden md:block">상세보기</span>
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
