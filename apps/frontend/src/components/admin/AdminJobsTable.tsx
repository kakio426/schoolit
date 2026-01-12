import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Search, Loader2, Trash2, ExternalLink, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
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
}

export function AdminJobsTable() {
    const [jobs, setJobs] = useState<AdminJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        fetchJobs();
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
        if (!job.active) return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">비활성 (삭제됨)</span>;

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

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="공고 제목, 학교명 검색..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                </div>
                <button
                    onClick={fetchJobs}
                    disabled={isLoading}
                    className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl font-medium text-sm hover:opacity-90 disabled:opacity-70"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '검색'}
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4">공고 정보</th>
                                <th className="px-6 py-4">학교/기관</th>
                                <th className="px-6 py-4">상태</th>
                                <th className="px-6 py-4">워크플로우</th>
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
                            ) : jobs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        검색 결과가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                jobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground line-clamp-1" title={job.title}>{job.title}</span>
                                                <span className="text-xs text-slate-400">ID: {job.id} · {job.jobType === 'EVENT_VENDOR' ? '행사' : '채용'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                            {job.schoolProfile?.schoolName || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(job)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getWorkflowBadge(job.workflowStatus)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(job.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/dashboard/jobs/${job.id}`}
                                                    target="_blank"
                                                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="새 탭에서 보기"
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
