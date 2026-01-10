import React, { useState, useEffect } from 'react';
import AdminVerifier from '@/components/applications/AdminVerifier';
import { MANDATORY_CHECKLIST_2025 } from '@/lib/compliance-constants';

interface ComplianceCheckProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    candidateName: string;
    applicationId: number;
    initialChecklist?: any;
    onUpdateChecklist?: (newChecklist: any) => void;
}

export default function ComplianceCheck({
    isOpen,
    onClose,
    onConfirm,
    candidateName,
    applicationId,
    initialChecklist,
    onUpdateChecklist
}: ComplianceCheckProps) {
    const [checklist, setChecklist] = useState(initialChecklist || {});

    // Sync checklist when reopening
    useEffect(() => {
        if (isOpen && initialChecklist) {
            setChecklist(initialChecklist);
        }
    }, [isOpen, initialChecklist]);

    if (!isOpen) return null;

    // Check if all MANDATORY keys are present and true
    const isReady = MANDATORY_CHECKLIST_2025.every(item => item.required ? checklist[item.key] : true);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-white/10 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col space-y-6">
                    <div className="text-center">
                        <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-4">
                            <span className="text-2xl">⚖️</span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground">채용 확정 전 필수 확인</h3>
                        <p className="text-sm text-foreground-muted mt-2">
                            <span className="font-bold text-primary">{candidateName}</span> 선생님과 계약하기 전, 필수 서류를 검증해주세요.
                        </p>
                    </div>

                    <AdminVerifier
                        applicationId={applicationId}
                        initialChecklist={checklist}
                        onUpdate={(newChecklist) => {
                            setChecklist(newChecklist);
                            if (onUpdateChecklist) onUpdateChecklist(newChecklist);
                        }}
                    />

                    <div className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                        🔒 에듀핀은 조회 대행 서비스를 제공하지 않으며, 관련 정보를 서버에 저장하지 않습니다. 학교 관리자가 실물을 직접 확인해야 합니다.
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="py-3.5 rounded-xl font-medium text-foreground-muted hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={!isReady}
                            className={`py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${isReady
                                ? 'bg-primary hover:bg-primary/90 shadow-primary/25 cursor-pointer'
                                : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500 shadow-none'
                                }`}
                        >
                            채용 확정하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
