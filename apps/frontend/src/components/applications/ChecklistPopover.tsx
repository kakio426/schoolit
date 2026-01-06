import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ChecklistPopoverProps {
    checklist: any;
}

const CHECKLIST_ITEMS = [
    { id: 'bankAccount', label: '통장 사본' },
    { id: 'degree', label: '최종 학력 증명서' },
    { id: 'license', label: '자격증 사본' },
    { id: 'criminalRecord', label: '성범죄 경력 조회' },
    { id: 'physicalExam', label: '채용 신체검사서' },
    { id: 'drugTest', label: '마약 검사 결과' },
    { id: 'tbCheck', label: '잠복결핵 검진' },
];

export default function ChecklistPopover({ checklist }: ChecklistPopoverProps) {
    const items = checklist || {};

    return (
        <div className="absolute left-0 bottom-full mb-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-50 text-left animate-in fade-in zoom-in-95 origin-bottom-left">
            <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">서류 준비 상세</h4>
            <div className="space-y-2">
                {CHECKLIST_ITEMS.map((item) => {
                    const isChecked = !!items[item.id];
                    return (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className={isChecked ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-400'}>
                                {item.label}
                            </span>
                            {isChecked ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                                <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600" />
                            )}
                        </div>
                    );
                })}
            </div>
            {Object.keys(items).length === 0 && (
                <div className="text-center text-xs text-slate-400 py-2">
                    데이터가 없습니다.
                </div>
            )}

            {/* Arrow */}
            <div className="absolute left-4 top-full w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700 transform rotate-45 -translate-y-1.5"></div>
        </div>
    );
}
