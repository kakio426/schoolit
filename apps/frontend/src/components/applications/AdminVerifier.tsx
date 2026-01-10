import React, { useState } from 'react';
import { MANDATORY_CHECKLIST_2025 } from '@/lib/compliance-constants';
import { CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';

interface AdminVerifierProps {
    applicationId: number;
    initialChecklist: any;
    onUpdate?: (newChecklist: any) => void;
}

export default function AdminVerifier({ applicationId, initialChecklist, onUpdate }: AdminVerifierProps) {
    const [checklist, setChecklist] = useState<any>(initialChecklist || {});
    const [loading, setLoading] = useState(false);

    const handleToggle = async (key: string) => {
        const newValue = !checklist[key];
        const newChecklist = { ...checklist, [key]: newValue };

        setChecklist(newChecklist);
        setLoading(true);

        try {
            await api.patch(`/applications/${applicationId}/compliance`, { checklist: newChecklist });
            if (onUpdate) onUpdate(newChecklist);
        } catch (error) {
            console.error('Failed to update compliance checklist', error);
            // Revert on error
            setChecklist(checklist);
            alert('업데이트 실패: 서버 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const completedCount = MANDATORY_CHECKLIST_2025.filter(item => checklist[item.key]).length;
    const totalCount = MANDATORY_CHECKLIST_2025.length;
    const isComplete = completedCount === totalCount;

    return (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <ShieldCheck className={`w-5 h-5 ${isComplete ? 'text-green-500' : 'text-amber-500'}`} />
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">
                        필수 채용 서류 검증
                    </h3>
                </div>
                <div className="text-xs font-mono bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">
                    {completedCount} / {totalCount}
                </div>
            </div>

            <div className="space-y-3">
                {MANDATORY_CHECKLIST_2025.map((item) => {
                    const isChecked = !!checklist[item.key];
                    return (
                        <div
                            key={item.key}
                            onClick={() => handleToggle(item.key)}
                            className={`
                                cursor-pointer flex items-center justify-between p-3 rounded-lg border transition-all
                                ${isChecked
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'}
                            `}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`
                                    w-5 h-5 rounded-full flex items-center justify-center border
                                    ${isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-600'}
                                `}>
                                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </div>
                                <span className={`text-sm ${isChecked ? 'text-green-800 dark:text-green-200 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                                    {item.label}
                                </span>
                            </div>
                            {item.required && !isChecked && (
                                <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                                    필수
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {!isComplete && (
                <div className="mt-4 flex items-start space-x-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 p-2 rounded">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>
                        모든 필수 서류가 '검증됨' 상태여야 최종 채용(HIRED) 단계로 진행할 수 있습니다.
                        관리자가 실물을 확인 후 체크해주세요.
                    </p>
                </div>
            )}
        </div>
    );
}
