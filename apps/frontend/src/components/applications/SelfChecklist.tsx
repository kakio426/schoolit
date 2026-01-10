import React from 'react';
import { MANDATORY_CHECKLIST_2025 } from '@/lib/compliance-constants';
import { CheckCircle2, Circle } from 'lucide-react';

interface SelfChecklistProps {
    checklist?: any;
}

export default function SelfChecklist({ checklist = {} }: SelfChecklistProps) {
    const completedCount = MANDATORY_CHECKLIST_2025.filter(item => checklist[item.key]).length;
    const totalCount = MANDATORY_CHECKLIST_2025.length;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-between">
                <span>채용 서류 준비 현황</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${completedCount === totalCount ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {completedCount}/{totalCount} 완료
                </span>
            </h4>

            <div className="grid gap-2">
                {MANDATORY_CHECKLIST_2025.map((item) => {
                    const isChecked = !!checklist[item.key];
                    return (
                        <div key={item.key} className="flex items-center justify-between text-sm py-1">
                            <span className="text-slate-600 dark:text-slate-400">
                                {item.label}
                            </span>
                            {isChecked ? (
                                <div className="flex items-center text-green-600 space-x-1">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-xs font-medium">검증됨</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-slate-400 space-x-1">
                                    <Circle className="w-4 h-4" />
                                    <span className="text-xs">미확인</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <p className="mt-4 text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 p-3 rounded leading-relaxed">
                💡 위 서류는 최종 합격 시 학교 행정실에 제출해야 합니다.
                학교 관리자가 실물을 확인하면 '검증됨' 상태로 변경됩니다.
            </p>
        </div>
    );
}
