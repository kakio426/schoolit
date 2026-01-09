import React, { useEffect, useState } from 'react';
import { WizardFormData } from './schema';
import { JobType } from '@/lib/constants';
import { getChecklistItems, GRADE_LEVELS, EVENT_TYPES, CERTIFICATION_OPTIONS } from '@/lib/constants/jobs';

interface Step2Props {
    formData: WizardFormData;
    setFormData: (data: WizardFormData) => void;
    jobType: JobType;
    setIsValid: (valid: boolean) => void;
}

export default function Step2Compliance({ formData, setFormData, jobType, setIsValid }: Step2Props) {
    const checklistItems = getChecklistItems(jobType);
    const [complianceWarnings, setComplianceWarnings] = useState<string[]>([]);

    const handleChange = (name: keyof WizardFormData, value: any) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleChecklistChange = (id: string, checked: boolean) => {
        setFormData({
            ...formData,
            internalChecklist: { ...formData.internalChecklist, [id]: checked } as any
            // Note: Keeping specific keys in InternalChecklist but using spread for updates.
        });
    };

    // Validation Effect
    useEffect(() => {
        const warnings: string[] = [];
        let valid = true;

        // 1. Checklist Validation
        const getChecklistCount = () => {
            const keys = Object.keys(formData.internalChecklist);
            return keys.filter(k => (formData.internalChecklist as any)[k]).length;
        };
        if (getChecklistCount() < checklistItems.length) {
            valid = false;
        }

        // 2. Specific Field Validation
        if (jobType === JobType.TEACHER_HIRING) {
            if (formData.hiringReason === 'SICK_LEAVE') {
                // Simple logic to check 30 days. Assuming contractPeriod is string range, we might just warn visually.
                // For wizard demo, we will check if string is short (mock logic) or if user hasn't filled it.
                // Let's assume input is YYYY-MM-DD ~ YYYY-MM-DD.
                // We will skip complex date parsing for this iteration and just check presence.
            }
            if (!formData.contractPeriod) valid = false;
        } else {
            if (!formData.eventType) valid = false;
        }

        setComplianceWarnings(warnings);
        setIsValid(valid);
    }, [formData, jobType]);


    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">2. 행정 및 규정 확인</h3>
                <p className="text-foreground-muted text-sm">교육청 지침 준수를 위한 필수 행정 사항을 확인합니다.</p>
            </div>

            {/* Checklist Section */}
            <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border-2 border-dashed border-amber-200 dark:border-amber-800">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-xl">✅</span> 내부 승인 및 사전 점검
                </h3>
                <div className="space-y-3">
                    {checklistItems.map(item => (
                        <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={(formData.internalChecklist as any)[item.id]}
                                onChange={(e) => handleChecklistChange(item.id, e.target.checked)}
                                className="mt-1 w-5 h-5 rounded border-amber-400 text-amber-600 focus:ring-amber-600 cursor-pointer"
                            />
                            <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors font-medium">
                                {item.label} <span className="text-red-500 font-bold">*</span>
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Job Type Specific Fields */}
            {jobType === JobType.TEACHER_HIRING ? (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">채용 사유 (교육청 보고용)</label>
                        <select
                            value={formData.hiringReason || ''}
                            onChange={(e) => handleChange('hiringReason', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl outline-none border border-border focus:border-primary bg-background"
                        >
                            <option value="">선택하세요</option>
                            <option value="VACANCY">정원 내 결원 (퇴직/휴직 등)</option>
                            <option value="SICK_LEAVE">병가 대체 (1개월 이상)</option>
                            <option value="MATERNITY">육아/출산 휴직 대체</option>
                            <option value="TEMPORARY">한시적 정원 외 (기간제)</option>
                            <option value="PART_TIME">시간강사</option>
                        </select>
                        {formData.hiringReason === 'SICK_LEAVE' && (
                            <p className="text-xs text-amber-600 mt-2 font-bold">⚠️ 병가 대체 교사는 진단서 확인 및 최소 30일 이상의 계약 기간이 필요합니다.</p>
                        )}
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800 space-y-4">
                        <h4 className="font-bold text-foreground">근무 조건 상세</h4>

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">계약 기간</label>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="date"
                                        value={formData.contractPeriod?.split(' ~ ')[0] || ''}
                                        onChange={(e) => {
                                            const start = e.target.value;
                                            const end = formData.contractPeriod?.split(' ~ ')[1] || '';
                                            handleChange('contractPeriod', `${start} ~ ${end}`);
                                        }}
                                        className="w-full pl-4 pr-10 py-3 rounded-xl outline-none border border-border focus:border-primary bg-background uppercase"
                                    />
                                </div>
                                <span className="text-foreground-muted font-bold">~</span>
                                <div className="relative flex-1">
                                    <input
                                        type="date"
                                        value={formData.contractPeriod?.split(' ~ ')[1] || ''}
                                        onChange={(e) => {
                                            const start = formData.contractPeriod?.split(' ~ ')[0] || '';
                                            const end = e.target.value;
                                            handleChange('contractPeriod', `${start} ~ ${end}`);
                                        }}
                                        min={formData.contractPeriod?.split(' ~ ')[0]}
                                        className="w-full pl-4 pr-10 py-3 rounded-xl outline-none border border-border focus:border-primary bg-background uppercase"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">학년 (복수 선택 가능)</label>
                            <div className="flex gap-2">
                                {GRADE_LEVELS.map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => {
                                            const newLevels = formData.gradeLevel.includes(level)
                                                ? formData.gradeLevel.filter((l: string) => l !== level)
                                                : [...formData.gradeLevel, level];
                                            handleChange('gradeLevel', newLevels);
                                        }}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${formData.gradeLevel.includes(level)
                                            ? 'bg-primary text-white'
                                            : 'bg-surface border border-border text-foreground hover:bg-surface-hover'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">주당 수업 시수</label>
                            <input
                                type="number"
                                value={formData.teachingHours}
                                onChange={(e) => handleChange('teachingHours', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl outline-none border border-border focus:border-primary bg-background"
                                placeholder="예: 20"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800 space-y-4">
                        <h4 className="font-bold text-foreground">행사/용역 규격 상세</h4>

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">행사 종류</label>
                            <select
                                value={formData.eventType}
                                onChange={(e) => handleChange('eventType', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl outline-none border border-border focus:border-primary bg-background"
                            >
                                <option value="">선택하세요</option>
                                {EVENT_TYPES.map(et => (
                                    <option key={et.value} value={et.value}>{et.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">행사 기간/일시</label>
                                <input
                                    value={formData.eventDuration}
                                    onChange={(e) => handleChange('eventDuration', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl outline-none border border-border focus:border-primary bg-background"
                                    placeholder="예: 1일, 4교시"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">참가 인원</label>
                                <input
                                    value={formData.participantCount}
                                    onChange={(e) => handleChange('participantCount', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl outline-none border border-border focus:border-primary bg-background"
                                    placeholder="예: 50명, 전교생"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="equipmentProvided"
                                checked={formData.equipmentProvided}
                                onChange={(e) => handleChange('equipmentProvided', e.target.checked)}
                                className="w-5 h-5 rounded border-slate-300"
                            />
                            <label htmlFor="equipmentProvided" className="text-sm font-semibold text-foreground">
                                장비/교구 제공 가능 여부
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">필요 인증 (선택)</label>
                            <div className="flex flex-wrap gap-2">
                                {CERTIFICATION_OPTIONS.map(cert => (
                                    <button
                                        key={cert}
                                        type="button"
                                        onClick={() => {
                                            const newCerts = formData.certifications.includes(cert)
                                                ? formData.certifications.filter((c: string) => c !== cert)
                                                : [...formData.certifications, cert];
                                            handleChange('certifications', newCerts);
                                        }}
                                        className={`px-3 py-2 rounded-lg font-bold text-xs transition-all ${formData.certifications.includes(cert)
                                            ? 'bg-primary text-white'
                                            : 'bg-surface border border-border text-foreground hover:bg-surface-hover'
                                            }`}
                                    >
                                        {cert}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}
