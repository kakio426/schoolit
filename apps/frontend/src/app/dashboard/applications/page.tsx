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
import StandardCard, { StandardBadge } from '@/components/ui/StandardCard';
import { Search, Filter, MessageSquare, PenTool, Download, Inbox, ChevronRight, Briefcase, FileText, Calendar } from 'lucide-react';

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

    const getAppStatusBadge = (app: JobApplication) => {
        const { status, isSuggestion } = app;

        if (isSuggestion && status === ApplicationStatus.PENDING) {
            if (user?.role === 'SCHOOL') return <StandardBadge variant="indigo">제안 보냄</StandardBadge>;
            return <StandardBadge variant="indigo" className="animate-bounce">제안 도착 🎁</StandardBadge>;
        }

        switch (status) {
            case ApplicationStatus.PENDING: return <StandardBadge variant="warning">승인 대기 중</StandardBadge>;
            case ApplicationStatus.DOCUMENT_SCREENING: return <StandardBadge variant="primary">서류 심사 중</StandardBadge>;
            case ApplicationStatus.INTERVIEWING: return <StandardBadge variant="indigo">면접/시연 진행</StandardBadge>;
            case ApplicationStatus.VERIFICATION: return <StandardBadge variant="warning">결격 사유 조회</StandardBadge>;
            case ApplicationStatus.HIRED: return <StandardBadge variant="success">채용/계약 완료</StandardBadge>;
            case ApplicationStatus.REJECTED: return <StandardBadge variant="error">탈락/거절</StandardBadge>;
            default: return <StandardBadge>{status}</StandardBadge>;
        }
    }

    if (!user) return <DashboardLayout><div className="text-center py-20">사용자 확인 중...</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8 pb-20">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                        <h1 className="text-3xl font-black text-foreground">
                            {user.role === 'SCHOOL' ? '📨 지원자 현황' : user.role === 'BUSINESS' ? '📄 입찰/계약 관리' : '📨 나의 지원 현황'}
                        </h1>
                        <p className="text-foreground-muted text-sm mt-1 font-medium">
                            {user.role === 'SCHOOL' ? '학교 공고에 지원한 전문가들을 관리하고 단계별로 매칭하세요.' : '지원한 공고의 진행 상태를 실시간으로 확인하고 계약을 진행하세요.'}
                        </p>
                    </div>
                </div>

                {/* Filter Sidebar & Search Integration */}
                <StandardCard className="p-2" noPadding>
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                            <input
                                type="text"
                                placeholder="공고명 또는 지원자/학교 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-transparent font-medium text-sm outline-none"
                            />
                        </div>
                        <div className="flex gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-border/50">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent text-sm font-bold px-4 py-1 outline-none cursor-pointer"
                            >
                                <option value="ALL">전체 상태</option>
                                <option value={ApplicationStatus.PENDING}>대기 중</option>
                                <option value={ApplicationStatus.DOCUMENT_SCREENING}>서류 심사</option>
                                <option value={ApplicationStatus.INTERVIEWING}>면접/시연</option>
                                <option value={ApplicationStatus.HIRED}>채용 완료</option>
                                <option value={ApplicationStatus.REJECTED}>불합격/거절</option>
                            </select>
                        </div>
                    </div>
                </StandardCard>

                {/* Content List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>
                ) : filteredApps.length === 0 ? (
                    <div className="text-center py-32 bg-surface rounded-[40px] border border-dashed border-border group overflow-hidden relative">
                        <div className="text-5xl mb-6 opacity-30 group-hover:scale-110 transition-transform duration-500">📥</div>
                        <h3 className="text-xl font-bold text-foreground mb-2">항목이 없습니다.</h3>
                        <p className="text-foreground-muted text-sm px-4">선택하신 조건에 맞는 지원 또는 제안 내역이 보이지 않습니다.</p>
                        <div className="absolute top-0 right-0 p-4 opacity-5"><Inbox className="w-32 h-32" /></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredApps.map((app) => (
                            <StandardCard
                                key={app.id}
                                noPadding
                                className={`group overflow-visible ${app.isSuggestion && app.status === ApplicationStatus.PENDING && user.role !== 'SCHOOL' ? 'border-indigo-400 ring-4 ring-indigo-400/5' : ''}`}
                            >
                                <div className="flex flex-col lg:flex-row">
                                    {/* Main Content Info */}
                                    <div className="flex-1 p-6 md:p-8 space-y-5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {getAppStatusBadge(app)}
                                            <span className="text-foreground-muted text-xs font-bold border-l border-border pl-2 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {new Date(app.createdAt).toLocaleDateString()} {app.isSuggestion ? '제안' : '지원'}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <Link href={`/dashboard/jobs/${app.jobId}`} className="text-xl md:text-2xl font-black text-foreground hover:text-primary transition-colors block leading-tight">
                                                {app.jobListing?.title}
                                            </Link>
                                            <div className="flex items-center gap-1.5 text-sm text-foreground-muted font-bold">
                                                {user.role === 'SCHOOL' || app.userId !== user.id ? (
                                                    <><div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-[10px] text-primary">👤</div> {app.user?.name} 전문가</>
                                                ) : (
                                                    <><div className="w-5 h-5 bg-indigo-500/10 rounded-full flex items-center justify-center text-[10px] text-indigo-500">🏫</div> {app.jobListing?.schoolProfile?.schoolName || '정보 없음'}</>
                                                )}
                                            </div>
                                        </div>

                                        {/* Cost / Message Snippet */}
                                        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-[28px] p-6 border border-border/50 relative overflow-hidden">
                                            {app.cost && (
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-border/50 pb-4">
                                                    <div className="flex items-center gap-2 text-primary">
                                                        <StandardBadge variant="primary" className="text-[10px]">계약 단가</StandardBadge>
                                                        <span className="text-xl font-black">{app.cost.toLocaleString()}원</span>
                                                    </div>
                                                    {app.contactPhone && <div className="text-xs font-bold text-foreground-muted">연락처: {app.contactPhone}</div>}
                                                </div>
                                            )}
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm"><FileText className="w-4 h-4 text-foreground-muted" /></div>
                                                <div className="text-sm font-medium leading-relaxed italic text-foreground/80">
                                                    "{app.message || '작성된 메시지가 없습니다.'}"
                                                </div>
                                            </div>
                                            {/* Watermark icon */}
                                            <Briefcase className="absolute -right-6 -bottom-6 w-24 h-24 opacity-[0.03] rotate-12" />
                                        </div>

                                        {/* Recruitment Progress Dots */}
                                        <div className="pt-2">
                                            <RecruitmentPipeline status={app.status} isSuggestion={app.isSuggestion} />
                                        </div>

                                        {user.role === 'SCHOOL' && (
                                            <div className="pt-2">
                                                <InternalMemo applicationId={app.id} initialMemo={app.internalNote} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Column */}
                                    <div className="lg:w-72 bg-slate-50/50 dark:bg-slate-800/20 border-t lg:border-t-0 lg:border-l border-border p-6 flex flex-col justify-center gap-3">
                                        {/* Suggestion Response (Candidate Side) */}
                                        {app.isSuggestion && app.status === ApplicationStatus.PENDING && user.role !== 'SCHOOL' ? (
                                            <div className="space-y-3">
                                                <div className="text-center mb-4">
                                                    <div className="text-xs font-black text-indigo-600 dark:text-indigo-400 mb-1">제안이 도착했습니다!</div>
                                                    <p className="text-[10px] text-foreground-muted">학교의 제안을 수락하시겠습니까?</p>
                                                </div>
                                                <button
                                                    onClick={() => updateStatus(app.id, ApplicationStatus.INTERVIEWING)}
                                                    className="w-full py-3 bg-primary text-white font-black rounded-xl text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                                >
                                                    수락 및 대화하기
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(app.id, ApplicationStatus.REJECTED)}
                                                    className="w-full py-3 bg-white border border-red-200 text-red-500 font-bold rounded-xl text-xs hover:bg-red-50 transition-all"
                                                >
                                                    거절하기
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {/* Chat always active for non-rejected/pending */}
                                                {!['PENDING', 'REJECTED'].includes(app.status) && (
                                                    <Link
                                                        href="/dashboard/messages"
                                                        className="w-full py-3.5 bg-white dark:bg-slate-800 border border-primary/20 text-primary rounded-xl font-black text-sm text-center flex items-center justify-center gap-2 shadow-sm hover:bg-primary hover:text-white transition-all group"
                                                    >
                                                        <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" /> 대화하기
                                                    </Link>
                                                )}

                                                {/* Contract Signing (Hired status) */}
                                                {app.status === ApplicationStatus.HIRED && (
                                                    <>
                                                        <Link
                                                            href={`/dashboard/contracts/${app.id}`}
                                                            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black text-sm text-center flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all"
                                                        >
                                                            <PenTool className="w-4 h-4" /> 계약서 날인하기
                                                        </Link>
                                                        <button
                                                            onClick={() => api.downloadFile(`/applications/${app.id}/contract`, `contract_${app.id}.pdf`)}
                                                            className="w-full py-2 bg-emerald-500/10 text-emerald-600 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1.5 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                                                        >
                                                            <Download className="w-3 h-3" /> 최종 계약서 (PDF)
                                                        </button>
                                                    </>
                                                )}

                                                <div className="pt-4 flex flex-col items-center">
                                                    <p className="text-[10px] text-foreground-muted font-black uppercase tracking-widest leading-none mb-1">상태</p>
                                                    <div className="text-sm font-bold text-foreground">{getStatusBadgeText(app.status)}</div>
                                                </div>
                                            </div>
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

function getStatusBadgeText(status: string) {
    switch (status) {
        case 'PENDING': return '확인 대기';
        case 'REJECTED': return '매칭 실패';
        case 'HIRED': return '계약 완료';
        default: return '진행 중';
    }
}
