"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReviewModal from '@/components/reviews/ReviewModal';
import WarningModal from '@/components/ui/WarningModal';
import ComplianceCheck from '@/components/ui/ComplianceCheck';
import UserProfileModal from '@/components/profile/UserProfileModal';
import ChecklistPopover from '@/components/applications/ChecklistPopover';
import { api } from '@/lib/api';
import { JobApplication, JobListing } from '@/types';
import { ApplicationStatus, Role, JobType } from '@/lib/constants';

export default function JobApplicantsPage() {
    const { id } = useParams(); // jobId
    const { user } = useAuth();
    const router = useRouter();
    const [applicants, setApplicants] = useState<JobApplication[]>([]);
    const [job, setJob] = useState<JobListing | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState<JobApplication | null>(null);

    // Profile Modal State
    const [viewProfileId, setViewProfileId] = useState<number | null>(null);

    // Compliance States
    const [showTimerWarning, setShowTimerWarning] = useState(false);
    const [showComplianceCheck, setShowComplianceCheck] = useState(false);
    const [pendingApplicantId, setPendingApplicantId] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [appsData, jobData] = await Promise.all([
                api.get<JobApplication[]>(`/applications/jobs/${id}`),
                api.get<JobListing>(`/jobs/${id}`)
            ]);
            setApplicants(appsData);
            setJob(jobData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusClick = (appId: number, status: ApplicationStatus) => {
        if (status === ApplicationStatus.HIRED) {
            setPendingApplicantId(appId);

            // Phase 2: Fair Hiring Timer Check (3 days)
            if (job?.createdAt) {
                const postedDate = new Date(job.createdAt);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - postedDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 3) {
                    setShowTimerWarning(true);
                    return;
                }
            }

            // If timer ok, go to compliance check
            setShowComplianceCheck(true);
        } else {
            updateStatus(appId, status);
        }
    };

    const updateStatus = async (appId: number, newStatus: ApplicationStatus) => {
        try {
            const updated = await api.patch<JobApplication>(`/applications/${appId}/status`, { status: newStatus });
            setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: updated.status, user: updated.user } : a));
        } catch (e: any) {
            console.error(e);
            alert(e.message || '오류 발생');
        }
    }

    const handleComplianceConfirmed = () => {
        if (pendingApplicantId) {
            updateStatus(pendingApplicantId, ApplicationStatus.HIRED);
            setShowComplianceCheck(false);
            setPendingApplicantId(null);
            alert('채용이 확정되었습니다! 🎉');
        }
    };

    // Chat Logic
    const startChat = async (targetUserId: number) => {
        if (!confirm('채팅방을 개설하고 메시지를 보내시겠습니까?')) return;
        try {
            const res = await api.post<{ id: number }>('/chat/rooms', {
                targetUserId,
                jobId: Number(id)
            });
            router.push(`/dashboard/messages?room=${res.id}`);
        } catch (e: any) {
            console.error(e);
            alert(e.message || '채팅방 개설 실패');
        }
    };

    // Contract Download Logic
    const downloadContract = async (appId: number, jobType: JobType) => {
        if (!confirm('🔒 [보안 안내] 본 계약서는 참고용 초안입니다.\n실제 계약은 학교 내부 결재를 통해 진행하세요.\n\n다운로드 하시겠습니까?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/${appId}/contract`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = jobType === JobType.EVENT_VENDOR ? 'completion_report.pdf' : 'teacher_contract_draft.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (e: any) {
            console.error(e);
            alert('다운로드 실패: 계약 단계가 아니거나 오류가 발생했습니다.');
        }
    };

    const getStatusText = (status: ApplicationStatus) => {
        switch (status) {
            case ApplicationStatus.PENDING: return '대기 중';
            case ApplicationStatus.DOCUMENT_SCREENING: return '서류 심사 중 📄';
            case ApplicationStatus.INTERVIEWING: return '면접/시연 진행 중 💬';
            case ApplicationStatus.VERIFICATION: return '결격사유 확인 중 🔍';
            case ApplicationStatus.HIRED: return '채용 확정 🎉';
            case ApplicationStatus.REJECTED: return '탈락';
            case ApplicationStatus.BIDDING: return '업체 선정 중 ⚖️';
            case ApplicationStatus.CONTRACTING: return '계약 진행 중 ✍️';
            case ApplicationStatus.EXECUTING: return '과업 수행 중 🏃';
            case ApplicationStatus.PAYMENT_COMPLETED: return '완료 및 지급 💰';
            default: return status;
        }
    }

    const getStatusColor = (status: ApplicationStatus) => {
        switch (status) {
            case ApplicationStatus.PENDING: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case ApplicationStatus.DOCUMENT_SCREENING: return 'bg-blue-100 text-blue-700 border-blue-200';
            case ApplicationStatus.INTERVIEWING: return 'bg-purple-100 text-purple-700 border-purple-200';
            case ApplicationStatus.VERIFICATION: return 'bg-orange-100 text-orange-700 border-orange-200';
            case ApplicationStatus.HIRED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case ApplicationStatus.BIDDING: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case ApplicationStatus.CONTRACTING: return 'bg-cyan-100 text-cyan-700 border-cyan-200';
            case ApplicationStatus.EXECUTING: return 'bg-teal-100 text-teal-700 border-teal-200';
            case ApplicationStatus.PAYMENT_COMPLETED: return 'bg-slate-800 text-white border-slate-700 shadow-md';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    }

    const teacherStages = [
        { id: ApplicationStatus.PENDING, label: '접수됨', icon: '📥' },
        { id: ApplicationStatus.DOCUMENT_SCREENING, label: '서류전형', icon: '📄' },
        { id: ApplicationStatus.INTERVIEWING, label: '면접/시연', icon: '💬' },
        { id: ApplicationStatus.VERIFICATION, label: '결격사유 조회', icon: '🔍' },
        { id: ApplicationStatus.HIRED, label: '채용완료', icon: '🎉' },
    ];

    const eventStages = [
        { id: ApplicationStatus.PENDING, label: '견적접수', icon: '📥' },
        { id: ApplicationStatus.BIDDING, label: '업체선정', icon: '⚖️' },
        { id: ApplicationStatus.CONTRACTING, label: '계약체결', icon: '✍️' },
        { id: ApplicationStatus.EXECUTING, label: '행사/과업', icon: '🏃' },
        { id: ApplicationStatus.PAYMENT_COMPLETED, label: '대금지급/완료', icon: '💰' },
    ];

    const stages = job?.jobType === JobType.EVENT_VENDOR ? eventStages : teacherStages;

    const [activeTab, setActiveTab] = useState<ApplicationStatus>(ApplicationStatus.PENDING);
    const filteredApplicants = applicants.filter(a => a.status === activeTab || (activeTab === ApplicationStatus.PENDING && !a.status));

    if (user?.role !== Role.SCHOOL) {
        return <DashboardLayout><div>권한이 없습니다.</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                        <span className="w-2 h-8 bg-primary rounded-full"></span>
                        👥 지원자 관리
                    </h1>
                    <p className="text-foreground-muted text-lg">우리 학교 공고에 지원한 선생님 목록입니다.</p>
                </div>

                {/* Pipeline Tabs */}
                <div className="flex overflow-x-auto gap-2 mb-8 no-scrollbar pb-2">
                    {stages.map((stage) => {
                        const count = applicants.filter(a => a.status === stage.id).length;
                        return (
                            <button
                                key={stage.id}
                                onClick={() => setActiveTab(stage.id)}
                                className={`flex items-center gap-2 px-6 py-4 rounded-[24px] font-bold border-2 transition-all whitespace-nowrap ${activeTab === stage.id
                                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-surface border-slate-200 dark:border-slate-700 text-foreground-muted hover:border-slate-300'
                                    }`}
                            >
                                <span className="text-xl">{stage.icon}</span>
                                <span>{stage.label}</span>
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === stage.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {isLoading ? (
                    <div className="text-center py-20 text-foreground-muted">로딩 중...</div>
                ) : filteredApplicants.length === 0 ? (
                    <div className="text-center py-24 bg-surface rounded-[40px] border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-3xl mx-auto mb-6">🏜️</div>
                        <p className="text-foreground-muted text-lg font-medium">이 단계의 지원자가 없습니다.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredApplicants.map(app => (
                            <div key={app.id} className="bg-surface p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-primary shadow-inner">
                                            {app.user?.teacherProfile?.profileImage ? (
                                                <img src={app.user.teacherProfile.profileImage} className="w-full h-full object-cover rounded-2xl" />
                                            ) : (
                                                app.user?.name?.[0]
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-bold text-foreground">
                                                    {app.user?.role === Role.BUSINESS
                                                        ? (app.user?.businessProfile?.companyName || app.user?.name)
                                                        : `${app.user?.name} 선생님`}
                                                </h3>
                                                {app.user?.businessProfile?.s2bNumber && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded shadow-sm">
                                                        S2B 등록업체
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => app.user?.id && setViewProfileId(Number(app.user.id))}
                                                    className="ml-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
                                                >
                                                    프로필 보기 🔍
                                                </button>
                                            </div>
                                            <p className="text-foreground-muted text-sm">{app.user?.email}</p>
                                        </div>
                                        {app.isSuggestion && (
                                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[11px] font-extrabold rounded-lg border border-indigo-100 dark:border-indigo-800">학교제안</span>
                                        )}
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl text-foreground-muted mb-6 border border-slate-100 dark:border-slate-800 shadow-inner">
                                        <span className="text-2xl mr-2">❝</span>
                                        {app.message || '인사말이 없습니다.'}
                                        <span className="text-2xl ml-2">❞</span>
                                    </div>
                                    {/* Contact Info - Visible if status is INTERVIEWING or later */}
                                    {['INTERVIEWING', 'VERIFICATION', 'HIRED'].includes(app.status) && (
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2.5 rounded-xl w-fit border border-emerald-100 dark:border-emerald-800/50">
                                                <span className="text-lg">📞</span>
                                                <span className="text-sm font-bold">연락처: {app.user?.phone || app.user?.teacherProfile?.bankAccount ? '(확인됨)' : '(연락처 없음)'}</span>
                                            </div>
                                            {app.user?.teacherProfile?.bankAccount && (
                                                <div className="flex items-center gap-3 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2.5 rounded-xl w-fit border border-blue-100 dark:border-blue-800/50">
                                                    <span className="text-lg">💰</span>
                                                    <span className="text-sm font-bold">계좌: {app.user.teacherProfile.bankAccount}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Admin Document Readiness (Visual Indicator) */}
                                    <div className="mt-4 flex items-center gap-4 group/checklist relative cursor-help">
                                        <div className="text-xs font-bold text-foreground-muted">행정 서류 준비도</div>
                                        <div className="flex-1 max-w-[200px] h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all"
                                                style={{
                                                    width: `${(() => {
                                                        const checklist = app.user?.teacherProfile?.checklist || app.user?.businessProfile?.checklist || {};
                                                        const items = Object.values(checklist);
                                                        if (items.length === 0) return 0;
                                                        const checked = items.filter(v => v === true).length;
                                                        return (checked / items.length) * 100;
                                                    })()}%`
                                                }}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-primary">
                                            {(() => {
                                                const checklist = app.user?.teacherProfile?.checklist || app.user?.businessProfile?.checklist || {};
                                                const items = Object.values(checklist);
                                                if (items.length === 0) return '미준비';
                                                const checked = items.filter(v => v === true).length;
                                                return `${checked}/${items.length}`;
                                            })()}
                                        </span>

                                        {/* Popover on Hover */}
                                        <div className="hidden group-hover/checklist:block transition-all">
                                            <ChecklistPopover checklist={app.user?.teacherProfile?.checklist || app.user?.businessProfile?.checklist} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 min-w-[200px] justify-center">
                                    <div className="text-center mb-4">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                                            {getStatusText(app.status)}
                                        </span>
                                    </div>

                                    {/* STATUS TRANSITIONS */}

                                    {/* PENDING -> NEXT STEP */}
                                    {app.status === ApplicationStatus.PENDING && (
                                        <>
                                            <button
                                                onClick={() => handleStatusClick(app.id, job?.jobType === JobType.EVENT_VENDOR ? ApplicationStatus.BIDDING : ApplicationStatus.DOCUMENT_SCREENING)}
                                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 text-sm active:scale-95"
                                            >
                                                {job?.jobType === JobType.EVENT_VENDOR ? '견적 심사 진행 (업체선정)' : '서류 전형 합격'}
                                            </button>
                                            <button
                                                onClick={() => handleStatusClick(app.id, ApplicationStatus.REJECTED)}
                                                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-red-50 hover:text-red-500 transition-all text-sm active:scale-95"
                                            >
                                                {job?.jobType === JobType.EVENT_VENDOR ? '미선정 (반려)' : '불합격'}
                                            </button>
                                        </>
                                    )}

                                    {/* Always show Chat Button if not Pending/Rejected? Or even then? User asked for generally available. */}
                                    {app.status !== ApplicationStatus.REJECTED && (
                                        <button
                                            onClick={() => app.user?.id && startChat(Number(app.user.id))}
                                            className="w-full py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            💬 메시지 보내기
                                        </button>
                                    )}

                                    {/* TEACHER WORKFLOW */}
                                    {app.status === ApplicationStatus.DOCUMENT_SCREENING && (
                                        <button
                                            onClick={() => handleStatusClick(app.id, ApplicationStatus.INTERVIEWING)}
                                            className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 text-sm active:scale-95"
                                        >
                                            면접 · 시연 제안
                                        </button>
                                    )}

                                    {app.status === ApplicationStatus.INTERVIEWING && (
                                        <div className="flex flex-col gap-2 w-full">
                                            <button
                                                onClick={() => handleStatusClick(app.id, ApplicationStatus.VERIFICATION)}
                                                className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 text-sm active:scale-95"
                                            >
                                                결격사유 확인 진행
                                            </button>
                                            <button
                                                onClick={() => handleStatusClick(app.id, ApplicationStatus.DOCUMENT_SCREENING)}
                                                className="w-full py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-medium hover:bg-slate-50 transition-all text-sm active:scale-95"
                                            >
                                                ↩️ 서류 심사로 복귀
                                            </button>
                                        </div>
                                    )}

                                    {app.status === ApplicationStatus.VERIFICATION && (
                                        <div className="flex flex-col gap-2 w-full">
                                            <button
                                                onClick={() => handleStatusClick(app.id, ApplicationStatus.HIRED)}
                                                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 text-sm active:scale-95"
                                            >
                                                🎉 최종 채용 확정
                                            </button>
                                            <button
                                                onClick={() => handleStatusClick(app.id, ApplicationStatus.INTERVIEWING)}
                                                className="w-full py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-medium hover:bg-slate-50 transition-all text-sm active:scale-95"
                                            >
                                                ↩️ 면접 단계로 복귀
                                            </button>
                                        </div>
                                    )}

                                    {/* EVENT WORKFLOW */}
                                    {app.status === ApplicationStatus.BIDDING && (
                                        <button
                                            onClick={() => handleStatusClick(app.id, ApplicationStatus.CONTRACTING)}
                                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 text-sm active:scale-95"
                                        >
                                            업체 선정 및 계약 진행
                                        </button>
                                    )}

                                    {app.status === ApplicationStatus.CONTRACTING && (
                                        <div className="flex flex-col gap-2 w-full">
                                            <button
                                                onClick={() => handleStatusClick(app.id, ApplicationStatus.EXECUTING)}
                                                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 text-sm active:scale-95"
                                            >
                                                계약 체결 완료 (행사 준비)
                                            </button>
                                            <button
                                                onClick={() => handleStatusClick(app.id, ApplicationStatus.BIDDING)}
                                                className="w-full py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-medium hover:bg-slate-50 transition-all text-sm active:scale-95"
                                            >
                                                ↩️ 업체 선정 단계로 복귀
                                            </button>
                                        </div>
                                    )}

                                    {app.status === ApplicationStatus.EXECUTING && (
                                        <div className="flex flex-col gap-2 w-full">
                                            <button
                                                onClick={() => handleStatusClick(app.id, ApplicationStatus.PAYMENT_COMPLETED)}
                                                className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-500/20 text-sm active:scale-95"
                                            >
                                                행사/용역 완료 (대금 지급)
                                            </button>
                                            <button
                                                onClick={() => handleStatusClick(app.id, ApplicationStatus.CONTRACTING)}
                                                className="w-full py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-medium hover:bg-slate-50 transition-all text-sm active:scale-95"
                                            >
                                                ↩️ 계약 단계로 복귀
                                            </button>
                                        </div>
                                    )}


                                    {(app.status === ApplicationStatus.HIRED || app.status === ApplicationStatus.PAYMENT_COMPLETED || app.status === ApplicationStatus.CONTRACTING || app.status === ApplicationStatus.EXECUTING) && (
                                        <div className="flex flex-col gap-2 w-full">
                                            <button
                                                onClick={() => downloadContract(app.id, (job?.jobType as JobType) || JobType.TEACHER_HIRING)}
                                                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                📄 {job?.jobType === JobType.EVENT_VENDOR ? '완료보고서 / 검수조서' : '계약서 초안 (PDF)'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedApplicant(app);
                                                    setIsReviewModalOpen(true);
                                                }}
                                                className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 text-sm active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                ⭐ 활동 평가 작성
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-12 p-8 rounded-3xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-center">
                    <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
                        🛡️ <b>행정 안내 및 책임 소재</b>: 본 매칭 결과는 참고용이며, 최종 계약(S2B 등) 및 자격 서류 검증은 반드시 <b>학교 내부 결재 및 지침</b>에 따라 진행해 주세요. <br />
                        플랫폼은 베타 연구용(Research Prototype) 서비스로서 어떠한 법적 계약 대행 및 보증 책임도 지지 않습니다.
                    </p>
                    <p className="text-[10px] text-slate-400 mt-3 italic">
                        「개인정보 보호법」에 따라 지원자의 개인정보는 90일 후 자동으로 파기됩니다. 지원 서류의 관리는 학교 보안 규정을 준수해 주세요.
                    </p>
                </div>
            </div>

            {selectedApplicant && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    receiverName={selectedApplicant.user?.name || ''}
                    receiverRole={selectedApplicant.user?.role || Role.TEACHER}
                    onSubmit={async (data) => {
                        try {
                            await api.post('/reviews', {
                                jobId: parseInt(id as string),
                                receiverId: selectedApplicant.user?.id,
                                ...data
                            });
                            alert('후기 및 평가가 성공적으로 전달되었습니다! ✨');
                            fetchData();
                        } catch (e: any) {
                            console.error(e);
                            alert(e.message || '저장에 실패했습니다.');
                        }
                    }}
                />
            )}

            <UserProfileModal
                isOpen={!!viewProfileId}
                onClose={() => setViewProfileId(null)}
                userId={viewProfileId || 0}
            />

            <WarningModal
                isOpen={showTimerWarning}
                onClose={() => setShowTimerWarning(false)}
                type="warning"
                title="[권고] 공정 채용 기간 안내과"
                description={`선생님, 공고 등록 후 3일이 지나지 않았습니다.\n\n교육청에서는 공정한 채용 기회 부여를 위해 충분한 공고 게시 기간(통상 3일 이상)을 준수할 것을 권장하고 있습니다.`}
                primaryAction={{
                    label: '이해했습니다 (계속 진행)',
                    onClick: () => {
                        setShowTimerWarning(false);
                        setShowComplianceCheck(true);
                    }
                }}
            />

            <ComplianceCheck
                isOpen={showComplianceCheck}
                onClose={() => setShowComplianceCheck(false)}
                onConfirm={handleComplianceConfirmed}
                candidateName={applicants.find(a => a.id === pendingApplicantId)?.user?.name || '지원자'}
            />
        </DashboardLayout>
    );
}
