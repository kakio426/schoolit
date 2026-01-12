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
import SelfChecklist from '@/components/applications/SelfChecklist';
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
            const applicationsArray = Array.isArray(data) ? data : [];
            setApplications(applicationsArray);
            setFilteredApps(applicationsArray);
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
                <div className="bg-gray-950/80 border border-white/[0.05] rounded-3xl p-1.5 flex flex-col md:flex-row gap-2 shadow-2xl backdrop-blur-md">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="공고명 또는 지원자/학교 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-transparent font-semibold text-[13px] text-zinc-200 outline-none placeholder:text-zinc-600"
                        />
                    </div>
                    <div className="flex gap-2 p-1 bg-white/[0.03] rounded-[20px] border border-white/[0.05]">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent text-[12px] font-black text-zinc-400 px-5 py-2 outline-none cursor-pointer hover:text-white transition-colors"
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
                                    <div className="flex-1 p-8 md:p-10 space-y-6">
                                        <div className="flex flex-wrap items-center gap-3">
                                            {getAppStatusBadge(app)}
                                            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest pl-3 border-l border-white/[0.08] flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 opacity-60" />
                                                {new Date(app.createdAt).toLocaleDateString()} {app.isSuggestion ? 'SUGGESTION' : 'APPLICATION'}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <Link href={`/dashboard/jobs/${app.jobId}`} className="text-2xl md:text-3xl font-black text-white hover:text-blue-500 transition-all block leading-tight tracking-tight">
                                                {app.jobListing?.title}
                                            </Link>
                                            <div className="flex items-center gap-2 text-[13px] font-bold text-zinc-400">
                                                {user.role === 'SCHOOL' || app.userId !== user.id ? (
                                                    <><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> {app.user?.name} 전문가</>
                                                ) : (
                                                    <><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> {app.jobListing?.schoolProfile?.schoolName || '정보 없음'}</>
                                                )}
                                            </div>
                                        </div>

                                        {/* Cost / Message Snippet */}
                                        <div className="bg-zinc-900/40 rounded-2xl p-6 border border-white/[0.03] space-y-4">
                                            {app.cost && (
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded uppercase">Bidding Cost</span>
                                                        <span className="text-2xl font-black text-white">{app.cost.toLocaleString()}원</span>
                                                    </div>
                                                    {app.contactPhone && <div className="text-[11px] font-bold text-zinc-500">Contact: {app.contactPhone}</div>}
                                                </div>
                                            )}
                                            <blockquote className="border-l-2 border-zinc-700 pl-4 py-1 italic relative group/quote">
                                                <p className="text-[14px] leading-relaxed text-zinc-300 font-medium">
                                                    "{app.message || '작성된 메시지가 없습니다.'}"
                                                </p>
                                                <div className="absolute -left-2 top-0 opacity-0 group-hover/quote:opacity-100 transition-opacity">
                                                    <FileText className="w-4 h-4 text-blue-500/50" />
                                                </div>
                                            </blockquote>
                                        </div>

                                        {/* Recruitment Progress Dots */}
                                        <div className="pt-2">
                                            <RecruitmentPipeline status={app.status} isSuggestion={app.isSuggestion} />
                                        </div>

                                        {user.role === 'SCHOOL' && (
                                            <div className="pt-4">
                                                <InternalMemo applicationId={app.id} initialMemo={app.internalNote} />
                                            </div>
                                        )}

                                        {/* Candidate View: Checklist Status */}
                                        {user.role === 'TEACHER' && ['DOCUMENT_SCREENING', 'INTERVIEWING', 'VERIFICATION', 'HIRED'].includes(app.status) && (
                                            <div className="pt-4">
                                                <SelfChecklist checklist={app.complianceChecklist} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Column */}
                                    <div className="lg:w-80 bg-zinc-950/20 lg:border-l border-white/[0.05] p-8 flex flex-col justify-center items-center gap-4">
                                        {/* Suggestion Response (Candidate Side) */}
                                        {app.isSuggestion && app.status === ApplicationStatus.PENDING && user.role !== 'SCHOOL' ? (
                                            <div className="w-full space-y-3">
                                                <div className="text-center mb-6">
                                                    <div className="text-[11px] font-black tracking-widest text-blue-500 uppercase mb-2">New Suggestion</div>
                                                    <p className="text-[12px] text-zinc-500 font-bold leading-snug tracking-tight">학교의 제안을 수락하시겠습니까?</p>
                                                </div>
                                                <button
                                                    onClick={() => updateStatus(app.id, ApplicationStatus.INTERVIEWING)}
                                                    className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl text-[13px] shadow-xl shadow-blue-600/20 hover:bg-blue-500 active:scale-[0.98] transition-all"
                                                >
                                                    수락 및 대화하기
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(app.id, ApplicationStatus.REJECTED)}
                                                    className="w-full py-4 bg-zinc-900 border border-white/5 text-zinc-500 font-bold rounded-2xl text-[12px] hover:text-red-400 hover:border-red-400/20 transition-all"
                                                >
                                                    거절하기
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-full space-y-4">
                                                {/* Chat always active for non-rejected/pending */}
                                                {!['PENDING', 'REJECTED'].includes(app.status) && (
                                                    <Link
                                                        href="/dashboard/messages"
                                                        className="w-full py-4 bg-zinc-900 border border-white/[0.05] text-zinc-300 rounded-2xl font-black text-[13px] text-center flex items-center justify-center gap-2.5 shadow-sm hover:bg-white hover:text-black transition-all group"
                                                    >
                                                        <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" /> 대화하기
                                                    </Link>
                                                )}

                                                {/* Contract Signing (Hired status) */}
                                                {app.status === ApplicationStatus.HIRED && (
                                                    <div className="space-y-2 w-full">
                                                        <Link
                                                            href={`/dashboard/contracts/${app.id}`}
                                                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[13px] text-center flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/20 hover:bg-blue-500 active:scale-95 transition-all"
                                                        >
                                                            <PenTool className="w-4 h-4" /> 계약서 날인
                                                        </Link>
                                                        <button
                                                            onClick={() => api.downloadFile(`/applications/${app.id}/contract`, `contract_${app.id}.pdf`)}
                                                            className="w-full py-2.5 bg-zinc-900 text-zinc-500 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 hover:text-green-400 transition-all border border-white/[0.03]"
                                                        >
                                                            <Download className="w-3.5 h-3.5" /> 최종 계약서 (PDF)
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="pt-6 flex flex-col items-center border-t border-white/[0.03] w-full">
                                                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[3px] mb-2 scale-90">Status</p>
                                                    <div className="flex items-center gap-2 bg-white/[0.03] px-5 py-2.5 rounded-full border border-white/[0.05]">
                                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${app.status === 'HIRED' ? 'bg-green-500' :
                                                            app.status === 'REJECTED' ? 'bg-red-500' :
                                                                app.status === 'PENDING' ? 'bg-amber-500' : 'bg-blue-500'
                                                            }`}></div>
                                                        <span className="text-[13px] font-black text-zinc-300">{getStatusBadgeText(app.status)}</span>
                                                    </div>
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
