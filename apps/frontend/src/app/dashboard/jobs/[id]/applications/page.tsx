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
            case ApplicationStatus.PENDING: return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
            case ApplicationStatus.DOCUMENT_SCREENING: return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
            case ApplicationStatus.INTERVIEWING: return 'bg-violet-500/20 text-violet-400 border border-violet-500/30';
            case ApplicationStatus.VERIFICATION: return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
            case ApplicationStatus.HIRED: return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
            case ApplicationStatus.BIDDING: return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
            case ApplicationStatus.CONTRACTING: return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
            case ApplicationStatus.EXECUTING: return 'bg-teal-500/20 text-teal-400 border border-teal-500/30';
            case ApplicationStatus.PAYMENT_COMPLETED: return 'bg-slate-600 text-white border border-slate-500';
            case ApplicationStatus.REJECTED: return 'bg-red-500/20 text-red-400 border border-red-500/30';
            default: return 'bg-slate-700 text-slate-300 border border-slate-600';
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
            <div className={`mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 ${viewMode === 'kanban' ? 'max-w-full px-4' : 'max-w-6xl px-4'}`}>

                {/* ============================================= */}
                {/* HEADER SECTION - Redesigned per UI/UX spec */}
                {/* ============================================= */}
                <header className="mb-8">
                    {/* Back Link */}
                    <Link href="/dashboard/jobs" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium mb-4 transition-colors">
                        <span>←</span> 공고 목록으로
                    </Link>

                    {/* Title Row */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                                {job?.title || '지원자 관리'}
                            </h1>
                            <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                                지원 현황 및 전형 단계를 관리합니다.
                            </p>
                        </div>

                        {/* Action Buttons Group - Right aligned */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* View Mode Toggle */}
                            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'list'
                                        ? 'bg-slate-700 text-white'
                                        : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                >
                                    리스트
                                </button>
                                <button
                                    onClick={() => setViewMode('kanban')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'kanban'
                                        ? 'bg-slate-700 text-white'
                                        : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                >
                                    보드
                                </button>
                            </div>

                            {/* Download & Preview buttons */}
                            {job && (job as any).jobType === 'TEACHER_HIRING' && (
                                <PDFDownloadButton
                                    type="hiring-plan"
                                    label="채용계획서(서식1) 받기"
                                    fileName={`채용계획서_${job.title}.pdf`}
                                    data={{
                                        documentNumber: (job as any).draftDocumentNumber || '미정',
                                        schoolName: job.schoolProfile?.schoolName || '본교',
                                        schoolAddress: job.schoolProfile?.address || '',
                                        adminName: user?.name || '담당자',
                                        adminPhone: job.schoolProfile?.phoneNumber || '',
                                        teacherName: (job as any).originalTeacherName || '',
                                        subject: (job as any).subjects?.[0] || '전과목',
                                        contractPeriod: `${(job as any).contractStartDate || ''} ~ ${(job as any).contractEndDate || ''}`,
                                        teachingHours: (job as any).teachingHoursPerWeek || 0,
                                        salary: (job as any).salary,
                                        jobTitle: job.title,
                                        enforcementDate: new Date().toISOString().split('T')[0],
                                        reason: (job as any).hiringReason || '결원 대체',
                                    }}
                                />
                            )}

                            <button className="px-4 py-2 text-sm font-medium text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-800 hover:border-slate-500 transition-all">
                                미리보기
                            </button>
                        </div>
                    </div>
                </header>

                {/* ============================================= */}
                {/* PROGRESS STEPPER - Modern replacement for scrollbar */}
                {/* ============================================= */}
                {viewMode === 'list' && (
                    <nav className="mb-8 bg-slate-800/50 border border-slate-700 rounded-xl p-2">
                        <div className="flex items-center justify-between">
                            {stages.map((stage, index) => {
                                const count = applicants.filter(a => a.status === stage.id).length;
                                const isActive = activeTab === stage.id;
                                const isCompleted = stages.findIndex(s => s.id === activeTab) > index;

                                return (
                                    <React.Fragment key={stage.id}>
                                        {/* Step Button */}
                                        <button
                                            onClick={() => setActiveTab(stage.id)}
                                            className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg transition-all relative group ${isActive
                                                ? 'bg-blue-600/20'
                                                : 'hover:bg-slate-700/50'
                                                }`}
                                        >
                                            {/* Icon Circle */}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${isActive
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                                : isCompleted
                                                    ? 'bg-slate-600 text-slate-300'
                                                    : 'bg-slate-700 text-slate-400'
                                                }`}>
                                                {stage.icon}
                                            </div>

                                            {/* Label */}
                                            <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-white' : 'text-slate-400'
                                                }`}>
                                                {stage.label}
                                            </span>

                                            {/* Count Badge */}
                                            {count > 0 && (
                                                <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full ${isActive
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-slate-600 text-slate-300'
                                                    }`}>
                                                    {count}
                                                </span>
                                            )}
                                        </button>

                                        {/* Connector Line */}
                                        {index < stages.length - 1 && (
                                            <div className={`w-8 h-0.5 mx-1 hidden sm:block ${stages.findIndex(s => s.id === activeTab) > index
                                                ? 'bg-blue-600'
                                                : 'bg-slate-700'
                                                }`} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </nav>
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

                {/* ============================================= */}
                {/* LIST VIEW - Responsive Grid Layout */}
                {/* ============================================= */}
                {viewMode === 'list' && (isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500" />
                    </div>
                ) : filteredApplicants.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/30 border border-slate-700 rounded-2xl">
                        <div className="text-4xl mb-4">🏜️</div>
                        <p className="text-slate-400">이 단계의 지원자가 없습니다.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredApplicants.map(app => (
                            <div key={app.id} className="bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 hover:bg-slate-800/70 transition-all overflow-hidden group">
                                {/* Card Header with Status Badge */}
                                <div className="p-4 pb-3">
                                    {/* Top Row: Avatar + Info + Status */}
                                    <div className="flex items-start gap-3">
                                        {/* Avatar */}
                                        <div className="w-11 h-11 rounded-lg bg-slate-700 flex items-center justify-center text-base font-semibold text-slate-300 flex-shrink-0">
                                            {app.user?.teacherProfile?.profileImage ? (
                                                <img src={app.user.teacherProfile.profileImage} className="w-full h-full object-cover rounded-lg" alt="" />
                                            ) : (
                                                app.user?.name?.[0]
                                            )}
                                        </div>

                                        {/* Name + Email */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <h3 className="text-sm font-semibold text-white truncate">
                                                    {app.user?.role === Role.BUSINESS
                                                        ? (app.user?.businessProfile?.companyName || app.user?.name)
                                                        : app.user?.name}
                                                </h3>
                                                {app.user?.businessProfile?.s2bNumber && (
                                                    <span className="px-1.5 py-0.5 bg-blue-600 text-[9px] font-bold text-white rounded">S2B</span>
                                                )}
                                            </div>
                                            <p className="text-slate-500 text-xs mt-0.5 truncate">{app.user?.email}</p>
                                        </div>

                                        {/* Status Badge - TOP RIGHT */}
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-semibold flex-shrink-0 ${getStatusColor(app.status)}`}>
                                            {getStatusText(app.status).replace(/[📄💬🔍🎉⚖️✍️🏃💰]/g, '').trim()}
                                        </span>
                                    </div>

                                    {/* Message Preview */}
                                    <p className="text-slate-400 text-xs mt-3 line-clamp-2 leading-relaxed">
                                        {app.message || '인사말이 없습니다.'}
                                    </p>

                                    {/* Meta Row: Docs + Contact */}
                                    <div className="flex items-center gap-2 mt-3">
                                        {/* Checklist */}
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 group/checklist relative cursor-help">
                                            <span>서류</span>
                                            <div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 transition-all"
                                                    style={{
                                                        width: `${(() => {
                                                            const checklist = app.user?.teacherProfile?.checklist || app.user?.businessProfile?.checklist || {};
                                                            const items = Object.values(checklist);
                                                            if (items.length === 0) return 0;
                                                            const checked = items.filter(v => v === true).length;
                                                            return (checked / items.length) * 100;
                                                        })()}%`
                                                    }}
                                                />
                                            </div>
                                            <span className="text-blue-400 font-medium">
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

                                        {/* Contact (if visible) */}
                                        {['INTERVIEWING', 'VERIFICATION', 'HIRED'].includes(app.status) && app.user?.phone && (
                                            <span className="text-[10px] text-slate-500">📞 {app.user.phone}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Card Actions - Compact */}
                                <div className="px-4 pb-4 pt-2 border-t border-slate-700/50 space-y-2">
                                    {/* Primary Action */}
                                    {app.status === ApplicationStatus.PENDING && (
                                        <button
                                            onClick={() => handleStatusClick(app.id, job?.jobType === JobType.EVENT_VENDOR ? ApplicationStatus.BIDDING : ApplicationStatus.DOCUMENT_SCREENING)}
                                            className="w-full py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-500 transition-all"
                                        >
                                            {job?.jobType === JobType.EVENT_VENDOR ? '견적 심사' : '서류 합격'}
                                        </button>
                                    )}

                                    {app.status === ApplicationStatus.DOCUMENT_SCREENING && (
                                        <>
                                            <button
                                                onClick={() => setEvalApplicant(app)}
                                                className="w-full py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-500 transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <Calculator className="w-3.5 h-3.5" /> 평가표 작성
                                            </button>
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => handleStatusClick(app.id, ApplicationStatus.INTERVIEWING)}
                                                    className="flex-1 py-1.5 text-xs font-medium text-blue-400 border border-slate-600 hover:border-blue-500 rounded-lg transition-all"
                                                >
                                                    면접 제안
                                                </button>
                                                <button
                                                    onClick={() => handleStatusClick(app.id, ApplicationStatus.PENDING)}
                                                    className="px-2.5 py-1.5 text-slate-500 border border-slate-700 hover:border-slate-600 rounded-lg text-xs"
                                                >
                                                    ↩️
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    {app.status === ApplicationStatus.INTERVIEWING && (
                                        <>
                                            <button
                                                onClick={() => setEvalApplicant(app)}
                                                className="w-full py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-500 transition-all flex items-center justify-center gap-1.5"
                                                data-testid="btn-evaluate"
                                            >
                                                <Calculator className="w-3.5 h-3.5" /> 면접 평가표
                                            </button>
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => handleStatusClick(app.id, ApplicationStatus.VERIFICATION)}
                                                    className="flex-1 py-1.5 text-xs font-medium text-blue-400 border border-slate-600 hover:border-blue-500 rounded-lg transition-all"
                                                >
                                                    결격사유 확인
                                                </button>
                                                <button
                                                    onClick={() => handleStatusClick(app.id, ApplicationStatus.DOCUMENT_SCREENING)}
                                                    className="px-2.5 py-1.5 text-slate-500 border border-slate-700 hover:border-slate-600 rounded-lg text-xs"
                                                >
                                                    ↩️
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    {app.status === ApplicationStatus.VERIFICATION && (
                                        <>
                                            <button
                                                onClick={() => handleStatusClick(app.id, ApplicationStatus.HIRED)}
                                                className="w-full py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-500 transition-all"
                                            >
                                                채용 확정
                                            </button>
                                            <button
                                                onClick={() => handleStatusClick(app.id, ApplicationStatus.INTERVIEWING)}
                                                className="w-full py-1.5 text-xs text-slate-400 border border-slate-700 hover:border-slate-600 rounded-lg transition-all"
                                            >
                                                ↩️ 이전 단계로
                                            </button>
                                        </>
                                    )}

                                    {app.status === ApplicationStatus.BIDDING && (
                                        <button
                                            onClick={() => handleStatusClick(app.id, ApplicationStatus.CONTRACTING)}
                                            className="w-full py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-500 transition-all"
                                        >
                                            계약 진행
                                        </button>
                                    )}

                                    {(app.status === ApplicationStatus.HIRED || app.status === ApplicationStatus.PAYMENT_COMPLETED || app.status === ApplicationStatus.CONTRACTING || app.status === ApplicationStatus.EXECUTING) && (
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => downloadContract(app.id, (job?.jobType as JobType) || JobType.TEACHER_HIRING)}
                                                className="flex-1 py-1.5 text-xs text-slate-400 border border-slate-700 hover:border-slate-600 rounded-lg transition-all"
                                            >
                                                📄 서류 다운
                                            </button>
                                            <button
                                                onClick={() => { setSelectedApplicant(app); setIsReviewModalOpen(true); }}
                                                className="flex-1 py-1.5 text-xs text-amber-400 border border-amber-700/50 hover:border-amber-600 rounded-lg transition-all"
                                            >
                                                ⭐ 평가
                                            </button>
                                        </div>
                                    )}

                                    {app.status === ApplicationStatus.REJECTED && (
                                        <button
                                            onClick={() => confirm('지원자를 복구하시겠습니까?') && handleStatusClick(app.id, ApplicationStatus.PENDING)}
                                            className="w-full py-1.5 text-xs text-blue-400 border border-slate-700 hover:border-blue-600 rounded-lg transition-all"
                                        >
                                            ↩️ 검토 복구
                                        </button>
                                    )}

                                    {/* Secondary Actions Row */}
                                    {app.status !== ApplicationStatus.REJECTED && (
                                        <div className="flex gap-1.5 pt-1">
                                            <button
                                                onClick={() => app.user?.id && setViewProfileId(Number(app.user.id))}
                                                className="flex-1 py-1.5 text-[10px] text-slate-500 hover:text-slate-300 border border-slate-700/50 hover:border-slate-600 rounded-lg transition-all"
                                            >
                                                프로필
                                            </button>
                                            <button
                                                onClick={() => app.user?.id && startChat(Number(app.user.id))}
                                                className="flex-1 py-1.5 text-[10px] text-slate-500 hover:text-slate-300 border border-slate-700/50 hover:border-slate-600 rounded-lg transition-all"
                                            >
                                                💬 메시지
                                            </button>
                                            {app.status !== ApplicationStatus.HIRED && app.status !== ApplicationStatus.PAYMENT_COMPLETED && (
                                                <button
                                                    onClick={() => {
                                                        const msg = job?.jobType === JobType.EVENT_VENDOR ? '미선정 처리하시겠습니까?' : '불합격 처리하시겠습니까?';
                                                        if (confirm(msg)) {
                                                            handleStatusClick(app.id, ApplicationStatus.REJECTED);
                                                        }
                                                    }}
                                                    className="flex-1 py-1.5 text-[10px] text-red-400/70 hover:text-red-400 border border-slate-700/50 hover:border-red-700 rounded-lg transition-all"
                                                >
                                                    {job?.jobType === JobType.EVENT_VENDOR ? '미선정' : '불합격'}
                                                </button>
                                            )}
                                        </div>
                                    )}
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
