"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { api } from '@/lib/api';
import { JobApplication } from '@/types';
import { ApplicationStatus } from '@/lib/constants';
import RecruitmentPipeline from '@/components/applications/RecruitmentPipeline';
import InternalMemo from '@/components/applications/InternalMemo';

export default function MyApplicationsPage() {
    const { user } = useAuth();
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [filteredApps, setFilteredApps] = useState<JobApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const data = await api.get<JobApplication[]>('/applications/me');
            setApplications(data);
            setFilteredApps(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const filtered = applications.filter(app => {
            const matchesSearch =
                (app.jobListing?.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (app.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (app.jobListing?.schoolProfile?.schoolName?.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
        setFilteredApps(filtered);
    }, [searchTerm, statusFilter, applications]);

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
            if (user?.role === 'SCHOOL') {
                return <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200 dark:border-indigo-800 text-center">제안 보냄 🎁</span>;
            }
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

        if (status === ApplicationStatus.PENDING && user?.role === 'SCHOOL') {
            return (
                <div className="flex gap-1 scale-90 origin-right">
                    <button
                        onClick={() => updateStatus(app.id, ApplicationStatus.DOCUMENT_SCREENING)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10"
                    >
                        서류 합격
                    </button>
                    <button
                        onClick={() => updateStatus(app.id, ApplicationStatus.REJECTED)}
                        className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                        불합격
                    </button>
                </div>
            )
        }

        switch (status) {
            case ApplicationStatus.PENDING: return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 text-center">대기 중</span>;
            case ApplicationStatus.DOCUMENT_SCREENING: return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 text-center">서류 심사 중</span>;
            case ApplicationStatus.INTERVIEWING: return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 text-center">면접/시연 중 💬</span>;
            case ApplicationStatus.VERIFICATION: return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 text-center">결격사유 확인 중</span>;
            case ApplicationStatus.HIRED: return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 text-center">채용 확정 🎊</span>;
            case ApplicationStatus.REJECTED: return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200 text-center">탈락/거절</span>;
            default: return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 text-center">{status}</span>;
        }
    }

    if (user?.role !== 'TEACHER' && user?.role !== 'BUSINESS' && user?.role !== 'SCHOOL') {
        return <DashboardLayout><div>권한이 없는 페이지입니다.</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground">
                        📨 {user.role === 'SCHOOL' ? '받은 지원 현황' : user.role === 'BUSINESS' ? '나의 지원/제안 현황' : '나의 지원 현황'}
                    </h1>
                    <p className="text-foreground-muted text-sm mt-1">
                        {user.role === 'SCHOOL' ? '우리 학교 공고에 지원한 내역을 확인하세요.' : '지원한 공고와 받은 제안을 확인하세요.'}
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                        <input
                            type="text"
                            placeholder="공고명 또는 지원자/학교 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-surface border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-surface border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none cursor-pointer"
                    >
                        <option value="ALL">모든 상태</option>
                        <option value={ApplicationStatus.PENDING}>대기 중</option>
                        <option value={ApplicationStatus.DOCUMENT_SCREENING}>서류 심사</option>
                        <option value={ApplicationStatus.INTERVIEWING}>면접/시연</option>
                        <option value={ApplicationStatus.VERIFICATION}>결격조회/확정 중</option>
                        <option value={ApplicationStatus.HIRED}>채용 완료</option>
                        <option value={ApplicationStatus.REJECTED}>불합격/거절</option>
                    </select>
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
                ) : filteredApps.length === 0 ? (
                    <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-foreground-muted">검색 조건에 맞는 내역이 없습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredApps.map((app) => (
                            <div key={app.id} className={`p-6 md:p-8 rounded-[32px] border transition-all shadow-sm hover:shadow-md ${app.isSuggestion && app.status === ApplicationStatus.PENDING ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30' : 'bg-surface border-slate-200 dark:border-slate-700'}`}>
                                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                                    <div className="flex-1 w-full">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Link href={user.role === 'SCHOOL' ? `/dashboard/jobs/${app.jobId}/applications` : `/dashboard/jobs/${app.jobId}`} className="hover:underline">
                                                <h3 className="text-xl font-bold text-foreground">{app.jobListing?.title}</h3>
                                            </Link>
                                            {(user.role === 'TEACHER' || user.role === 'BUSINESS') && app.viewedAt && (
                                                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-lg font-bold">학교가 읽음 ✅</span>
                                            )}
                                        </div>
                                        {user.role === 'SCHOOL' ? (
                                            <p className="text-foreground-muted text-sm mt-1 mb-3">
                                                지원자: <span className="font-bold text-primary">{app.user?.role === 'BUSINESS' ? (app.user?.businessProfile?.companyName || app.user?.name) : `${app.user?.name} 선생님`}</span>
                                            </p>
                                        ) : (
                                            <p className="text-foreground-muted text-sm mt-1 mb-3">
                                                {app.jobListing?.schoolProfile?.schoolName || '학교 정보 없음'}
                                            </p>
                                        )}
                                        <div className="text-sm text-foreground-muted bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                            {app.isSuggestion ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">📩</span>
                                                    <span>{user.role === 'SCHOOL' ? '학교에서 제안을 보냈습니다.' : (user.role === 'BUSINESS' ? '학교에서 귀사의 프로필을 보고 제안을 보냈습니다.' : '학교에서 선생님의 프로필을 보고 제안을 보냈습니다.')}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-start gap-2">
                                                    <span className="text-lg">📝</span>
                                                    <span className="italic">"{app.message || '인사말이 없습니다.'}"</span>
                                                </div>
                                            )}
                                        </div>

                                        <RecruitmentPipeline status={app.status} isSuggestion={app.isSuggestion} />

                                        {user.role === 'SCHOOL' && (
                                            <InternalMemo applicationId={app.id} initialMemo={app.internalNote} />
                                        )}
                                        <div className="mt-3 text-xs text-foreground-muted/60 flex items-center gap-1">
                                            <span>📅</span>
                                            <span>{app.isSuggestion ? '제안일' : '지원일'}: {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 min-w-[120px]">
                                        {getStatusBadge(app)}
                                        {['DOCUMENT_SCREENING', 'INTERVIEWING', 'VERIFICATION', 'HIRED'].includes(app.status) && (
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
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
