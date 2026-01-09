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
import InternalMemo from '@/components/applications/InternalMemo';
import PDFDownloadButton from '@/components/documents/PDFDownloadButton';
import Seosik1_HiringPlan from '@/lib/documents/Seosik1_HiringPlan';
import KanbanBoard from '@/components/applications/KanbanBoard';
import EvaluationModal from '@/components/applications/EvaluationModal';
import { api } from '@/lib/api';
import { JobApplication, JobListing } from '@/types';
import { ApplicationStatus, Role, JobType } from '@/lib/constants';
import { Calculator } from 'lucide-react';


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
    const [evalApplicant, setEvalApplicant] = useState<JobApplication | null>(null);


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

            // 자동으로 변경된 단계의 탭으로 이동
            setActiveTab(newStatus);
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

    const handleSaveEvaluation = async (appId: number, scores: Record<string, number>, total: number, comment: string) => {
        try {
            // Note: Ensure Backend API endpoint '/evaluations' exists and accepts this payload
            await api.post('/evaluations', {
                jobListingId: Number(id),
                applicationId: appId,
                type: 'DOCUMENT', // Defaulting to DOCUMENT for now, logic can be refined to detect stage
                totalScore: total,
                criteriaScores: scores,
                comment: comment
            });
            alert('심사 결과가 저장되었습니다.');
        } catch (e: any) {
            console.error(e);
            alert(e.message || '심사 저장 실패');
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
        { id: ApplicationStatus.REJECTED, label: '탈락/반려', icon: '🚫' },
    ];

    const eventStages = [
        { id: ApplicationStatus.PENDING, label: '견적접수', icon: '📥' },
        { id: ApplicationStatus.BIDDING, label: '업체선정', icon: '⚖️' },
        { id: ApplicationStatus.CONTRACTING, label: '계약체결', icon: '✍️' },
        { id: ApplicationStatus.EXECUTING, label: '행사/과업', icon: '🏃' },
        { id: ApplicationStatus.PAYMENT_COMPLETED, label: '대금지급/완료', icon: '💰' },
        { id: ApplicationStatus.REJECTED, label: '미선정', icon: '🚫' },
    ];

    const stages = job?.jobType === JobType.EVENT_VENDOR ? eventStages : teacherStages;

    const [activeTab, setActiveTab] = useState<ApplicationStatus>(ApplicationStatus.PENDING);
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const filteredApplicants = applicants.filter(a => a.status === activeTab || (activeTab === ApplicationStatus.PENDING && !a.status));

    if (user?.role !== Role.SCHOOL && user?.role !== Role.TEACHER) {
        return <DashboardLayout><div>권한이 없습니다.</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className={`mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 ${viewMode === 'kanban' ? 'max-w-full px-4' : 'max-w-5xl'}`}>
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Link href="/dashboard/jobs" className="text-primary hover:underline text-sm font-bold flex items-center gap-1">
                                ⬅️ 공고 목록으로
                            </Link>
                        </div>
                        <h1 className="text-3xl font-black text-foreground mb-2 flex items-center gap-3">
                            <span className="w-2 h-8 bg-primary rounded-full"></span>
                            {job?.title || '지원자 관리'}
                        </h1>
                        <p className="text-foreground-muted text-lg font-medium">지원 현황 및 전형 단계를 관리합니다.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-foreground-muted hover:text-foreground'}`}
                            >
                                📋 리스트
                            </button>
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'kanban' ? 'bg-primary text-white shadow-sm' : 'text-foreground-muted hover:text-foreground'}`}
                            >
                                📊 보드
                            </button>
                        </div>
                        {job && (
                            <div className="flex flex-col items-end gap-3">
                                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <span className={`px-2 py-1 text-[10px] font-black rounded-lg ${(job as any).jobType === 'EVENT_VENDOR'
                                        ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                                        : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                        {(job as any).jobType === 'EVENT_VENDOR' ? '🎪 행사 업체 공고' : '👨‍🏫 강사 채용 공고'}
                                    </span>
                                </div>

                                {/* Hiring Plan Download (Seosik 1) */}
                                {(job as any).jobType === 'TEACHER_HIRING' && (
                                    <PDFDownloadButton
                                        label="채용계획서(서식1) 받기"
                                        fileName={`hiring_plan_${job.id}.pdf`}
                                        document={
                                            <Seosik1_HiringPlan
                                                data={{
                                                    schoolName: job.schoolProfile?.schoolName || '본교',
                                                    draftNumber: (job as any).draftDocumentNumber || '미정',
                                                    draftDate: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '-',
                                                    hiringReason: (job as any).hiringReason || '결원',
                                                    originalTeacherName: (job as any).originalTeacherName || '미입력',
                                                    subject: (job as any).subjects?.[0] || '전과목',
                                                    contractStart: (job as any).contractStartDate || '2025-03-01',
                                                    contractEnd: (job as any).contractEndDate || '2025-08-31',
                                                }}
                                            />
                                        }
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Pipeline Tabs (List View Only) */}
                {viewMode === 'list' && (
                    <div className="flex overflow-x-auto gap-2 mb-8 no-scrollbar pb-2">
                        {stages.map((stage) => {
                            const count = applicants.filter(a => a.status === stage.id).length;
                            return (
                                <button
                                    key={stage.id}
                                    onClick={() => setActiveTab(stage.id)}
                                    className={`flex items-center gap-2 px-6 py-4 rounded-[24px] font-bold border-2 transition-all whitespace-nowrap ${activeTab === stage.id
                                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                        : 'bg-surface border-border text-foreground-muted hover:border-primary/20 dark:border-slate-700'
                                        }`}
                                >
                                    <span className="text-xl">{stage.icon}</span>
                                    <span className="text-foreground">{stage.label}</span>
                                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === stage.id ? 'bg-white/20' : 'bg-background dark:bg-slate-800 text-foreground-muted'}`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* BOARD VIEW */}
                {viewMode === 'kanban' && !isLoading && (
                    <KanbanBoard
                        applicants={applicants.map(a => ({
                            id: a.id,
                            userId: Number(a.user?.id) || 0,
                            userName: a.user?.name || '이름 없음',
                            userEmail: a.user?.email,
                            userPhone: a.user?.phone || undefined,
                            status: a.status as ApplicationStatus,
                            message: a.message,
                            internalNote: a.internalNote,
                            createdAt: a.createdAt || '',
                            profileImage: a.user?.teacherProfile?.profileImage || undefined,
                            experience: a.user?.teacherProfile?.experiences?.[0]?.title || undefined,
                            subjects: a.user?.teacherProfile?.subjects || undefined,
                        }))}
                        jobType={(job?.jobType as 'TEACHER_HIRING' | 'EVENT_VENDOR') || 'TEACHER_HIRING'}
                        onStatusChange={(appId, newStatus) => updateStatus(appId, newStatus)}
                        onViewProfile={(appId) => {
                            const app = applicants.find(a => a.id === appId);
                            if (app?.user?.id) setViewProfileId(Number(app.user.id));
                        }}
                        onStartChat={(userId) => startChat(userId)}
                        onDownloadContract={(appId) => downloadContract(appId, (job?.jobType as JobType) || JobType.TEACHER_HIRING)}
                        onSaveEvaluation={handleSaveEvaluation}
                    />
                )}

                {/* LIST VIEW */}
                {viewMode === 'list' && (isLoading ? (
                    <div className="text-center py-20 text-foreground-muted">로딩 중...</div>
                ) : filteredApplicants.length === 0 ? (
                    <div className="text-center py-24 bg-surface rounded-[40px] border border-border shadow-sm">
                        <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center text-3xl mx-auto mb-6">🏜️</div>
                        <p className="text-foreground-muted text-lg font-medium">이 단계의 지원자가 없습니다.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredApplicants.map(app => (
                            <div key={app.id} className="bg-surface rounded-3xl border border-border shadow-sm hover:shadow-lg transition-all overflow-hidden">
                                {/* Main Content Area */}
                                <div className="p-8 space-y-6">
                                    {/* Header: Identity + Profile Button */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary flex-shrink-0">
                                                {app.user?.teacherProfile?.profileImage ? (
                                                    <img src={app.user.teacherProfile.profileImage} className="w-full h-full object-cover rounded-2xl" />
                                                ) : (
                                                    app.user?.name?.[0]
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-lg font-bold text-foreground">
                                                        {app.user?.role === Role.BUSINESS
                                                            ? (app.user?.businessProfile?.companyName || app.user?.name)
                                                            : `${app.user?.name} 선생님`}
                                                    </h3>
                                                    {app.user?.businessProfile?.s2bNumber && (
                                                        <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded">S2B</span>
                                                    )}
                                                    {app.isSuggestion && (
                                                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded">학교제안</span>
                                                    )}
                                                </div>
                                                <p className="text-foreground-muted text-xs mt-0.5 truncate">{app.user?.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => app.user?.id && setViewProfileId(Number(app.user.id))}
                                            className="px-3 py-1.5 text-xs font-bold text-foreground-muted hover:text-primary border border-border hover:border-primary rounded-lg transition-colors flex-shrink-0"
                                        >
                                            프로필 🔍
                                        </button>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">상태</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(app.status)}`}>
                                            {getStatusText(app.status)}
                                        </span>
                                    </div>

                                    {/* Application Message */}
                                    <div className="p-4 rounded-xl bg-background/50 border border-border">
                                        <p className="text-sm text-foreground-muted italic leading-relaxed">
                                            "{app.message || '인사말이 없습니다.'}"
                                        </p>
                                    </div>

                                    {/* Meta Info Row */}
                                    <div className="flex flex-wrap items-center gap-3 text-xs">
                                        {/* Checklist Progress */}
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-lg border border-border group/checklist relative cursor-help">
                                            <span className="text-[10px] font-bold text-foreground-muted uppercase">서류</span>
                                            <div className="w-16 h-1 bg-background rounded-full overflow-hidden">
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
                                                    const checked = items.filter(v => v === true).length;
                                                    return `${checked}/${items.length}`;
                                                })()}
                                            </span>
                                            <div className="hidden group-hover/checklist:block absolute bottom-full left-0 mb-2 z-20">
                                                <ChecklistPopover checklist={app.user?.teacherProfile?.checklist || app.user?.businessProfile?.checklist} />
                                            </div>
                                        </div>

                                        {/* Contact Info */}
                                        {['INTERVIEWING', 'VERIFICATION', 'HIRED'].includes(app.status) && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary rounded-lg border border-primary/20">
                                                <span>📞</span>
                                                <span className="font-bold">{app.user?.phone || '(정보 없음)'}</span>
                                            </div>
                                        )}
                                        {app.user?.teacherProfile?.bankAccount && ['VERIFICATION', 'HIRED'].includes(app.status) && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary rounded-lg border border-primary/20">
                                                <span>💰</span>
                                                <span className="font-bold">계좌 확인됨</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* School Private Memo */}
                                    {job?.schoolId === user?.id && (
                                        <div className="space-y-3 pt-4 border-t border-border">
                                            <InternalMemo applicationId={app.id} initialMemo={app.internalNote} />
                                        </div>
                                    )}

                                    {/* Primary Action Buttons */}
                                    <div className="space-y-2 pt-4">
                                        {/* PENDING -> NEXT STEP */}
                                        {app.status === ApplicationStatus.PENDING && (
                                            <button
                                                onClick={() => handleStatusClick(app.id, job?.jobType === JobType.EVENT_VENDOR ? ApplicationStatus.BIDDING : ApplicationStatus.DOCUMENT_SCREENING)}
                                                className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                                            >
                                                {job?.jobType === JobType.EVENT_VENDOR ? '견적 심사 진행' : '서류 합격 처리'}
                                            </button>
                                        )}

                                        {/* DOCUMENT_SCREENING -> NEXT STEP */}
                                        {app.status === ApplicationStatus.DOCUMENT_SCREENING && (
                                            <>
                                                <button
                                                    onClick={() => setEvalApplicant(app)}
                                                    className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Calculator className="w-5 h-5" /> 서류 평가표 작성
                                                </button>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleStatusClick(app.id, ApplicationStatus.INTERVIEWING)}
                                                        className="flex-1 py-2.5 border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary/5 transition-all"
                                                    >
                                                        면접 제안
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusClick(app.id, ApplicationStatus.PENDING)}
                                                        className="px-4 py-2.5 border border-border text-foreground-muted rounded-xl hover:bg-surface-hover transition-all"
                                                    >
                                                        ↩️
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        {/* INTERVIEWING -> NEXT STEP */}
                                        {app.status === ApplicationStatus.INTERVIEWING && (
                                            <>
                                                <button
                                                    onClick={() => setEvalApplicant(app)}
                                                    className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                                    data-testid="btn-evaluate"
                                                >
                                                    <Calculator className="w-5 h-5" /> 면접 평가표 작성
                                                </button>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleStatusClick(app.id, ApplicationStatus.VERIFICATION)}
                                                        className="flex-1 py-2.5 border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary/5 transition-all"
                                                    >
                                                        결격사유 확인
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusClick(app.id, ApplicationStatus.DOCUMENT_SCREENING)}
                                                        className="px-4 py-2.5 border border-border text-foreground-muted rounded-xl hover:bg-surface-hover transition-all"
                                                    >
                                                        ↩️
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        {/* VERIFICATION -> HIRED */}
                                        {app.status === ApplicationStatus.VERIFICATION && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusClick(app.id, ApplicationStatus.HIRED)}
                                                    className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                                                >
                                                    최종 채용 확정
                                                </button>
                                                <button
                                                    onClick={() => handleStatusClick(app.id, ApplicationStatus.INTERVIEWING)}
                                                    className="w-full py-2 border border-primary text-primary rounded-xl font-medium hover:bg-primary/5 transition-all text-sm"
                                                >
                                                    ↩️ 이전 단계로
                                                </button>
                                            </>
                                        )}

                                        {/* EVENT FLOW */}
                                        {app.status === ApplicationStatus.BIDDING && (
                                            <button onClick={() => handleStatusClick(app.id, ApplicationStatus.CONTRACTING)} className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]">계약 진행</button>
                                        )}

                                        {/* HIRED / CONTRACTED SPECIAL ACTIONS */}
                                        {(app.status === ApplicationStatus.HIRED || app.status === ApplicationStatus.PAYMENT_COMPLETED || app.status === ApplicationStatus.CONTRACTING || app.status === ApplicationStatus.EXECUTING) && (
                                            <div className="space-y-2 pt-2 border-t border-border">
                                                <button
                                                    onClick={() => downloadContract(app.id, (job?.jobType as JobType) || JobType.TEACHER_HIRING)}
                                                    className="w-full py-2.5 border border-border text-foreground-muted hover:text-foreground rounded-xl font-medium hover:bg-surface-hover transition-all text-sm flex items-center justify-center gap-2"
                                                >
                                                    📄 서류 초안 다운
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedApplicant(app); setIsReviewModalOpen(true); }}
                                                    className="w-full py-2.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all text-sm flex items-center justify-center gap-2"
                                                >
                                                    ⭐ 활동 평가
                                                </button>
                                            </div>
                                        )}

                                        {/* RECOVER / CANCEL */}
                                        {app.status === ApplicationStatus.REJECTED && (
                                            <button
                                                onClick={() => confirm('지원자를 복구하시겠습니까?') && handleStatusClick(app.id, ApplicationStatus.PENDING)}
                                                className="w-full py-2.5 border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary/5 transition-all"
                                            >
                                                ↩️ 검토 복구
                                            </button>
                                        )}

                                        {app.status === ApplicationStatus.HIRED && (
                                            <button
                                                onClick={() => confirm('채용을 취소하시겠습니까?') && handleStatusClick(app.id, ApplicationStatus.REJECTED)}
                                                className="w-full py-2.5 border border-red-200 text-red-500 rounded-xl font-medium hover:bg-red-50 transition-all text-sm"
                                            >
                                                채용 취소
                                            </button>
                                        )}
                                    </div>

                                    {/* Secondary Actions */}
                                    <div className="flex gap-2 pt-2">
                                        {app.status !== ApplicationStatus.REJECTED && (
                                            <button
                                                onClick={() => app.user?.id && startChat(Number(app.user.id))}
                                                className="flex-1 py-2.5 border border-border text-foreground-muted hover:text-primary hover:border-primary rounded-xl font-medium transition-all text-sm"
                                            >
                                                💬 메시지
                                            </button>
                                        )}
                                        {app.status !== ApplicationStatus.REJECTED && app.status !== ApplicationStatus.HIRED && app.status !== ApplicationStatus.PAYMENT_COMPLETED && (
                                            <button
                                                onClick={() => {
                                                    const msg = job?.jobType === JobType.EVENT_VENDOR ? '미선정 처리하시겠습니까?' : '불합격 처리하시겠습니까?';
                                                    if (confirm(msg)) {
                                                        handleStatusClick(app.id, ApplicationStatus.REJECTED);
                                                    }
                                                }}
                                                className="flex-1 py-2.5 border border-red-200 text-red-500 rounded-xl font-medium hover:bg-red-50 transition-all text-sm"
                                            >
                                                {job?.jobType === JobType.EVENT_VENDOR ? '미선정' : '불합격'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

                <div className="mt-12 p-8 rounded-3xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-center">
                    <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
                        🛡️ <b>행정 안내 및 책임 소재</b>: 본 매칭 결과는 참고용이며, 최종 계약(S2B 등) 및 자격 서류 검증은 반드시 <b>학교 내부 결재 및 지침</b>에 따라 진행해 주세요. <br />
                        플랫폼은 베타 연구용(Research Prototype) 서비스로서 어떠한 법적 계약 대행 및 보증 책임도 지지 않습니다.
                    </p>
                    <p className="text-[10px] text-slate-400 mt-3 italic">
                        「개인정보 보호법」에 따라 지원자의 개인정보는 채용 확정 혹은 탈락 후 7일 뒤 자동으로 파기됩니다. 지원 서류의 관리는 학교 보안 규정을 준수해 주세요.
                    </p>
                </div>
            </div>

            {
                selectedApplicant && (
                    <ReviewModal
                        isOpen={isReviewModalOpen}
                        onClose={() => setIsReviewModalOpen(false)}
                        receiverName={selectedApplicant.user?.name || ''}
                        receiverRole={selectedApplicant.user?.role || Role.TEACHER}
                        onSubmit={async (formData) => {
                            try {
                                // Add jobId and receiverId to FormData if they are not already there
                                if (id) formData.append('jobId', id.toString());
                                if (selectedApplicant.user?.id) {
                                    formData.append('receiverId', selectedApplicant.user.id.toString());
                                }

                                await api.upload('/reviews', formData);
                                alert('후기 및 평가가 성공적으로 전달되었습니다! ✨');
                                fetchData();
                            } catch (e: any) {
                                console.error(e);
                                alert(e.message || '저장에 실패했습니다.');
                            }
                        }}
                    />
                )
            }

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

            {evalApplicant && (
                <EvaluationModal
                    isOpen={!!evalApplicant}
                    onClose={() => setEvalApplicant(null)}
                    applicantName={evalApplicant.user?.name || '지원자'}
                    type={evalApplicant.status === ApplicationStatus.DOCUMENT_SCREENING ? 'DOCUMENT' : 'INTERVIEW'}
                    onSubmit={(scores, total, comment) => handleSaveEvaluation(evalApplicant.id, scores, total, comment)}
                />
            )}
        </DashboardLayout >

    );
}
