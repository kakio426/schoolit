'use client';

import React, { useState } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { User, MessageCircle, FileText, MoreHorizontal, ChevronRight, Phone, Calculator, CheckCircle } from 'lucide-react';
import { ApplicationStatus } from '@/lib/constants';
import EvaluationModal from './EvaluationModal';

// Types
interface Applicant {
    id: number;
    userId: number;
    userName: string;
    userEmail?: string;
    userPhone?: string;
    status: ApplicationStatus;
    message?: string;
    internalNote?: string;
    createdAt: string;
    profileImage?: string;
    experience?: string; // e.g., "10년차"
    subjects?: string[];
}

interface KanbanBoardProps {
    applicants: Applicant[];
    jobType: 'TEACHER_HIRING' | 'EVENT_VENDOR';
    onStatusChange: (applicantId: number, newStatus: ApplicationStatus) => void;
    onViewProfile: (applicantId: number) => void;
    onStartChat: (userId: number) => void;
    onDownloadContract: (applicantId: number) => void;
    onSaveEvaluation?: (applicantId: number, scores: Record<string, number>, total: number, comment: string) => Promise<void>;
}

// Column Configuration
const TEACHER_COLUMNS: { status: ApplicationStatus; label: string; icon: string; color: string }[] = [
    { status: ApplicationStatus.PENDING, label: '접수됨', icon: '📥', color: 'bg-slate-100 dark:bg-slate-800' },
    { status: ApplicationStatus.DOCUMENT_SCREENING, label: '서류전형', icon: '📄', color: 'bg-blue-50 dark:bg-blue-900/20' },
    { status: ApplicationStatus.INTERVIEWING, label: '면접/시연', icon: '💬', color: 'bg-purple-50 dark:bg-purple-900/20' },
    { status: ApplicationStatus.VERIFICATION, label: '결격사유 조회', icon: '🔍', color: 'bg-orange-50 dark:bg-orange-900/20' },
    { status: ApplicationStatus.HIRED, label: '채용완료', icon: '🎉', color: 'bg-emerald-50 dark:bg-emerald-900/20' },
];

const VENDOR_COLUMNS: { status: ApplicationStatus; label: string; icon: string; color: string }[] = [
    { status: ApplicationStatus.PENDING, label: '견적접수', icon: '📥', color: 'bg-slate-100 dark:bg-slate-800' },
    { status: ApplicationStatus.BIDDING, label: '업체선정', icon: '⚖️', color: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { status: ApplicationStatus.CONTRACTING, label: '계약체결', icon: '✍️', color: 'bg-cyan-50 dark:bg-cyan-900/20' },
    { status: ApplicationStatus.EXECUTING, label: '과업수행', icon: '🏃', color: 'bg-teal-50 dark:bg-teal-900/20' },
    { status: ApplicationStatus.PAYMENT_COMPLETED, label: '완료', icon: '💰', color: 'bg-emerald-50 dark:bg-emerald-900/20' },
];

// Draggable Applicant Card
interface ApplicantCardProps {
    applicant: Applicant;
    onViewProfile: () => void;
    onStartChat: () => void;
    onDownloadContract: () => void;
    onEvaluate: () => void;
    showContactInfo: boolean;
    jobType: 'TEACHER_HIRING' | 'EVENT_VENDOR';
}

function ApplicantCard({ applicant, onViewProfile, onStartChat, onDownloadContract, onEvaluate, showContactInfo, jobType }: ApplicantCardProps) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'APPLICANT',
        item: { id: applicant.id, currentStatus: applicant.status },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [applicant.id, applicant.status]);

    // Determine if evaluation is allowed for this state
    const canEvaluate = jobType === 'TEACHER_HIRING' && (
        applicant.status === ApplicationStatus.DOCUMENT_SCREENING ||
        applicant.status === ApplicationStatus.INTERVIEWING
    );

    const evalLabel = applicant.status === ApplicationStatus.DOCUMENT_SCREENING ? '서류평가' : '면접평가';

    return (
        <div
            ref={drag as any}
            className={`bg-white dark:bg-slate-900 rounded-2xl border border-border shadow-sm p-4 cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${isDragging ? 'opacity-50 rotate-2 scale-105' : ''
                }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                        {applicant.profileImage ? (
                            <img src={applicant.profileImage} className="w-full h-full object-cover" alt="" />
                        ) : (
                            applicant.userName?.charAt(0) || <User className="w-5 h-5" />
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-foreground">{applicant.userName}</div>
                        {applicant.experience && (
                            <div className="text-xs text-foreground-muted">{applicant.experience}</div>
                        )}
                    </div>
                </div>
                <button className="p-1 rounded-lg hover:bg-surface-hover">
                    <MoreHorizontal className="w-4 h-4 text-foreground-muted" />
                </button>
            </div>

            {/* Tags */}
            {applicant.subjects && applicant.subjects.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {applicant.subjects.slice(0, 2).map(s => (
                        <span key={s} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded">
                            {s}
                        </span>
                    ))}
                </div>
            )}

            {/* Contact Info (visible after INTERVIEWING) */}
            {showContactInfo && applicant.userPhone && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1.5 rounded-lg mb-3">
                    <Phone className="w-3 h-3" />
                    {applicant.userPhone}
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
                {canEvaluate && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onEvaluate(); }}
                        className="w-full py-1.5 text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                        <Calculator className="w-3 h-3" /> {evalLabel} 시작
                    </button>
                )}

                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onViewProfile(); }}
                        className="flex-1 py-1.5 text-xs font-bold text-foreground-muted hover:text-foreground bg-surface hover:bg-surface-hover rounded-lg transition-colors"
                    >
                        프로필
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onStartChat(); }}
                        className="flex-1 py-1.5 text-xs font-bold text-foreground-muted hover:text-primary bg-surface hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                        <MessageCircle className="w-3 h-3" /> 채팅
                    </button>
                    {(applicant.status === ApplicationStatus.HIRED ||
                        applicant.status === ApplicationStatus.CONTRACTING ||
                        applicant.status === ApplicationStatus.PAYMENT_COMPLETED) && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDownloadContract(); }}
                                className="flex-1 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                                <FileText className="w-3 h-3" /> 계약서
                            </button>
                        )}
                </div>
            </div>
        </div>
    );
}

// Droppable Column
interface KanbanColumnProps {
    column: { status: ApplicationStatus; label: string; icon: string; color: string };
    applicants: Applicant[];
    onDrop: (applicantId: number, newStatus: ApplicationStatus) => void;
    onViewProfile: (applicantId: number) => void;
    onStartChat: (userId: number) => void;
    onDownloadContract: (applicantId: number) => void;
    onEvaluate: (applicant: Applicant) => void;
    jobType: 'TEACHER_HIRING' | 'EVENT_VENDOR';
}

function KanbanColumn({ column, applicants, onDrop, onViewProfile, onStartChat, onDownloadContract, onEvaluate, jobType }: KanbanColumnProps) {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: 'APPLICANT',
        drop: (item: { id: number; currentStatus: ApplicationStatus }) => {
            if (item.currentStatus !== column.status) {
                onDrop(item.id, column.status);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }), [column.status, onDrop]);

    const showContactInfo = [
        ApplicationStatus.INTERVIEWING,
        ApplicationStatus.VERIFICATION,
        ApplicationStatus.HIRED,
        ApplicationStatus.CONTRACTING,
        ApplicationStatus.EXECUTING,
        ApplicationStatus.PAYMENT_COMPLETED,
    ].includes(column.status);

    return (
        <div
            ref={drop as any}
            className={`flex-shrink-0 w-72 rounded-2xl border-2 transition-all ${isOver && canDrop
                ? 'border-primary bg-primary/5 scale-[1.02]'
                : 'border-transparent'
                }`}
        >
            {/* Column Header */}
            <div className={`p-4 rounded-t-2xl ${column.color}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{column.icon}</span>
                        <span className="font-bold text-foreground">{column.label}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-white/50 dark:bg-black/20 rounded-full text-xs font-bold">
                        {applicants.length}
                    </span>
                </div>
            </div>

            {/* Column Content */}
            <div className="p-3 space-y-3 min-h-[200px] bg-surface/50 rounded-b-2xl">
                {applicants.length === 0 ? (
                    <div className="text-center py-10 text-foreground-muted text-sm">
                        <div className="text-2xl mb-2">📭</div>
                        지원자 없음
                    </div>
                ) : (
                    applicants.map(applicant => (
                        <ApplicantCard
                            key={applicant.id}
                            applicant={applicant}
                            onViewProfile={() => onViewProfile(applicant.id)}
                            onStartChat={() => onStartChat(applicant.userId)}
                            onDownloadContract={() => onDownloadContract(applicant.id)}
                            onEvaluate={() => onEvaluate(applicant)}
                            showContactInfo={showContactInfo}
                            jobType={jobType}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

// Main Kanban Board Component
export default function KanbanBoard({
    applicants,
    jobType,
    onStatusChange,
    onViewProfile,
    onStartChat,
    onDownloadContract,
    onSaveEvaluation
}: KanbanBoardProps) {
    const columns = jobType === 'EVENT_VENDOR' ? VENDOR_COLUMNS : TEACHER_COLUMNS;
    const [evalApplicant, setEvalApplicant] = useState<Applicant | null>(null);

    const handleEvaluationSubmit = async (scores: Record<string, number>, total: number, comment: string) => {
        if (!evalApplicant || !onSaveEvaluation) return;
        await onSaveEvaluation(evalApplicant.id, scores, total, comment);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                    {columns.map(column => {
                        const columnApplicants = applicants.filter(a => a.status === column.status);
                        return (
                            <KanbanColumn
                                key={column.status}
                                column={column}
                                applicants={columnApplicants}
                                onDrop={onStatusChange}
                                onViewProfile={onViewProfile}
                                onStartChat={onStartChat}
                                onDownloadContract={onDownloadContract}
                                onEvaluate={setEvalApplicant}
                                jobType={jobType}
                            />
                        );
                    })}

                    {/* Rejected Column */}
                    <div className="flex-shrink-0 w-72 rounded-2xl border border-dashed border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
                        {/* Same as before */}
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🚫</span>
                                    <span className="font-bold text-red-600 dark:text-red-400">
                                        {jobType === 'EVENT_VENDOR' ? '미선정' : '탈락'}
                                    </span>
                                </div>
                                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 rounded-full text-xs font-bold text-red-600 dark:text-red-400">
                                    {applicants.filter(a => a.status === ApplicationStatus.REJECTED).length}
                                </span>
                            </div>
                        </div>
                        <div className="p-3 space-y-3 min-h-[100px]">
                            {applicants.filter(a => a.status === ApplicationStatus.REJECTED).length === 0 ? (
                                <div className="text-center py-6 text-foreground-muted text-xs">없음</div>
                            ) : (
                                <button className="w-full py-2 text-xs font-bold text-red-500 hover:underline flex items-center justify-center gap-1">
                                    {applicants.filter(a => a.status === ApplicationStatus.REJECTED).length}명 보기 <ChevronRight className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Evaluation Modal */}
                {evalApplicant && (
                    <EvaluationModal
                        isOpen={!!evalApplicant}
                        onClose={() => setEvalApplicant(null)}
                        applicantName={evalApplicant.userName}
                        type={evalApplicant.status === ApplicationStatus.DOCUMENT_SCREENING ? 'DOCUMENT' : 'INTERVIEW'} // Logic can be refined
                        onSubmit={handleEvaluationSubmit}
                    />
                )}
            </div>
        </DndProvider>
    );
}
