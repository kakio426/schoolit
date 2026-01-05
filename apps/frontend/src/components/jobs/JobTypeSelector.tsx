"use client";

import React from 'react';

export enum JobType {
    TEACHER_HIRING = 'TEACHER_HIRING',
    EVENT_VENDOR = 'EVENT_VENDOR',
}

interface JobTypeSelectorProps {
    value: JobType;
    onChange: (type: JobType) => void;
}

export function JobTypeSelector({ value, onChange }: JobTypeSelectorProps) {
    return (
        <div className="space-y-3">
            <label className="block text-sm font-bold text-foreground">공고 유형 선택</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => onChange(JobType.TEACHER_HIRING)}
                    className={`p-6 rounded-2xl border-2 transition-all ${value === JobType.TEACHER_HIRING
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                >
                    <div className="text-5xl mb-3">👨‍🏫</div>
                    <div className="font-bold text-lg text-foreground mb-1">교사 · 강사 채용</div>
                    <div className="text-xs text-foreground-muted">
                        기간제, 시간강사, 늘봄 · 돌봄, 방과후 등
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => onChange(JobType.EVENT_VENDOR)}
                    className={`p-6 rounded-2xl border-2 transition-all ${value === JobType.EVENT_VENDOR
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                >
                    <div className="text-5xl mb-3">🎪</div>
                    <div className="font-bold text-lg text-foreground mb-1">행사 업체</div>
                    <div className="text-xs text-foreground-muted">
                        체험학습, 진로체험, 스포츠데이
                    </div>
                </button>
            </div>
        </div>
    );
}
