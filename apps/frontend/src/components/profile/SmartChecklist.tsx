'use client';

import { useState } from 'react';
import { CheckSquare, Square, AlertCircle, Info } from 'lucide-react';

interface ChecklistItem {
    id: string;
    label: string;
    description: string;
    checked: boolean;
}

interface SmartChecklistProps {
    items: ChecklistItem[];
    onChange: (id: string, checked: boolean) => void;
}

export default function SmartChecklist({ items, onChange }: SmartChecklistProps) {
    return (
        <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 p-6 space-y-4">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                    <h3 className="font-bold text-red-700 dark:text-red-400">민감 서류 직접 제출 (Red Zone)</h3>
                    <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
                        아래 서류는 개인정보보호법에 따라 <strong>플랫폼에 업로드할 수 없습니다.</strong><br />
                        학교 행정실에 방문하여 직접 제출했거나, 제출할 준비가 되었음을 확인해주세요.
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl divide-y divide-gray-100 dark:divide-slate-800 border border-gray-100 dark:border-slate-800">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="p-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                        onClick={() => onChange(item.id, !item.checked)}
                    >
                        <div className={`mt-0.5 transition-colors ${item.checked ? 'text-green-500' : 'text-gray-300 group-hover:text-gray-400'}`}>
                            {item.checked ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className={`font-bold transition-colors ${item.checked ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500'}`}>
                                    {item.label}
                                </span>
                                {item.checked && (
                                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">준비 완료</span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <Info className="w-3 h-3" /> {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
