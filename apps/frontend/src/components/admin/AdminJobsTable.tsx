import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Search, Loader2, Trash2, ExternalLink, CheckCircle2, XCircle, AlertCircle, RefreshCw, Filter } from 'lucide-react';
import Link from 'next/link';


interface AdminJob {
    id: number;
    title: string;
    schoolProfile?: { schoolName: string };
    status: 'OPEN' | 'CLOSED' | 'MATCHED';
    workflowStatus: string | null;
    active: boolean;
    jobType: 'TEACHER_HIRING' | 'EVENT_VENDOR';
    createdAt: string;
    isAggregated?: boolean;
    externalSourceUrl?: string;
    externalSource?: string;
}

export function AdminJobsTable() {
    const [jobs, setJobs] = useState<AdminJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
    const [viewFilter, setViewFilter] = useState<'ALL' | 'EXTERNAL' | 'INTERNAL'>('ALL');

    useEffect(() => {
        fetchJobs();
        // Load last sync time from local storage if available (mock)
        const storedSync = localStorage.getItem('last_sync_time');
        if (storedSync) setLastSyncTime(storedSync);
    }, []);

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (keyword) params.append('keyword', keyword);

            const data = await api.get<AdminJob[]>(`/jobs/admin/all?${params.toString()}`);
            setJobs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await api.post<{ message: string, stats?: { totalFound: number, newCreated: number, errors: number } }>('/external-jobs/sync', {});
            const now = new Date().toLocaleString();
            setLastSyncTime(now);
            localStorage.setItem('last_sync_time', now);

            if (res.stats) {
                alert(`수집 완료: ${res.stats.newCreated}건 추가됨 (발견: ${res.stats.totalFound}, 에러: ${res.stats.errors})`);
            } else {
                alert('외부 공고 수집이 완료되었습니다.');
            }
            fetchJobs();
        } catch (error) {
            console.error('Sync failed:', error);
            alert('수집 실패');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('정말로 이 공고를 삭제하시겠습니까? 관리자 권한으로 삭제하면 복구할 수 없습니다.')) return;
        try {
            await api.delete(`/jobs/${id}`);
            alert('공고가 삭제되었습니다.');
            fetchJobs();
        } catch (error) {
            console.error('Failed to delete job:', error);
            alert('삭제 실패');
        }
    };

    const getStatusBadge = (job: AdminJob) => {
        if (job.isAggregated) return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">외부 수집</span>;
        if (!job.active) return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">비활성</span>;

        if (job.status === 'OPEN') {
            return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">모집 중</span>;
        }
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400">마감됨</span>;
    };

    const getWorkflowBadge = (status: string | null) => {
        switch (status) {
            case 'PUBLISHED': return <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">게시됨</span>;
            case 'DRAFT': return <span className="text-xs text-orange-500 font-bold">작성 중 (초안)</span>;
            case 'PLAN_APPROVED': return <span className="text-xs text-purple-500 font-bold">계획 승인됨</span>;
            default: return <span className="text-xs text-slate-400">-</span>;
        }
    };

    const filteredJobs = jobs.filter(job => {
        if (viewFilter === 'EXTERNAL') return job.isAggregated;
        if (viewFilter === 'INTERNAL') return !job.isAggregated;
        return true;
    });

    const externalCount = jobs.filter(j => j.isAggregated).length;

    return (
        <div className="space-y-4">
            {/* Sync Status & Action Bar */}
            <div className="flex flex-col gap-4">
                {/* Sync info line */}
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isSyncing ? 'bg-blue-100 text-blue-600 animate-spin' : 'bg-white text-blue-600 shadow-sm'}`}>
                            <RefreshCw className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                외부 공고 크롤링
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                {lastSyncTime ? `마지막 동기화: ${lastSyncTime}` : '동기화 이력 없음'}
                                {isSyncing && <span className="text-blue-500 font-semibold ml-2">수집 중...</span>}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-70 flex items-center gap-2"
                    >
                        {isSyncing ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                수집 중
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-3.5 h-3.5" />
                                지금 수집
                            </>
                        )}
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* View Filters */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start">
                        {[
                            { id: 'ALL', label: '전체' },
                            { id: 'EXTERNAL', label: `외부 수집 (${externalCount})` },
                            { id: 'INTERNAL', label: '직접 등록' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setViewFilter(f.id as any)}
                                className={`
                                    px-4 py-1.5 text-xs font-bold rounded-md transition-all
                                    ${viewFilter === f.id
                                        ? 'bg-white dark:bg-slate-700 text-foreground shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                                `}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="flex gap-2 flex-1 md:max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="공고 제목, 학교명 검색..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                            />
                        </div>
                        <button
                            onClick={fetchJobs}
                            disabled={isLoading}
                            className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl font-medium text-sm hover:opacity-90 disabled:opacity-70 transition-all shadow-sm"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '검색'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4">공고 정보</th>
                                <th className="px-6 py-4">학교/기관</th>
                                <th className="px-6 py-4 text-center">상태</th>
                                <th className="px-6 py-4 text-center">워크플로우</th>
                                <th className="px-6 py-4">등록일</th>
                                <th className="px-6 py-4 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        로딩 중...
                                    </td>
                                </tr>
                            ) : filteredJobs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        검색 결과가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                filteredJobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground line-clamp-1" title={job.title}>{job.title}</span>
                                                <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">
                                                    ID: {job.id} · {job.jobType === 'EVENT_VENDOR' ? '행사' : '채용'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                            {job.schoolProfile?.schoolName || (job.isAggregated ? <span className="text-[10px] opacity-70">{job.externalSource || '외부 수집'}</span> : '-')}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(job)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getWorkflowBadge(job.workflowStatus)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">
                                            {new Date(job.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={job.isAggregated ? (job.externalSourceUrl || '#') : `/dashboard/jobs/${job.id}`}
                                                    target="_blank"
                                                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-transparent"
                                                    title={job.isAggregated ? '원본 사이트 보기' : '새 탭에서 보기'}
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(job.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="삭제하기"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
