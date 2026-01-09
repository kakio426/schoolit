import React from 'react';
import { JobType } from '@/lib/constants';
import { JobTypeSelector } from '@/components/jobs/JobTypeSelector';
import { BudgetGuideline } from '@/components/jobs/BudgetGuideline';
import { WizardFormData } from './schema';

interface Step1Props {
    formData: WizardFormData;
    setFormData: (data: WizardFormData) => void;
    jobType: JobType;
    setJobType: (type: JobType) => void;
    isStandardSalary: boolean;
    setIsStandardSalary: (val: boolean) => void;
}

export default function Step1BasicInfo({
    formData,
    setFormData,
    jobType,
    setJobType,
    isStandardSalary,
    setIsStandardSalary
}: Step1Props) {

    const handleChange = (name: keyof WizardFormData, value: any) => {
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">1. 기본 정보 입력</h3>
                <p className="text-foreground-muted text-sm">채용 공고의 기본적인 내용을 입력해주세요.</p>
            </div>

            {/* Job Type Selector */}
            <JobTypeSelector value={jobType} onChange={setJobType} />

            <div>
                <label className="block text-sm font-semibold text-foreground mb-2">공고 제목</label>
                <input
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none border border-border focus:border-primary bg-background"
                    placeholder={jobType === JobType.TEACHER_HIRING ? "예: 2024년 1학기 수학 기간제, 늘봄 선생님 등" : "예: 2024 진로체험의 날 행사 업체 모집"}
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                    {jobType === JobType.TEACHER_HIRING ? '보수 / 수당 정보' : '예상 예산 (원)'}
                </label>

                <div className="space-y-3">
                    {jobType === JobType.TEACHER_HIRING && (
                        <label className="flex items-center gap-2 cursor-pointer p-3 bg-background rounded-xl border border-border">
                            <input
                                type="checkbox"
                                checked={isStandardSalary}
                                onChange={(e) => {
                                    setIsStandardSalary(e.target.checked);
                                    if (e.target.checked) handleChange('budget', '0');
                                }}
                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <span className="text-xs font-bold text-foreground">공무원 보수 규정 / 교육청 지침에 따름</span>
                        </label>
                    )}

                    <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => handleChange('budget', e.target.value)}
                        disabled={jobType === JobType.TEACHER_HIRING && isStandardSalary}
                        className="w-full px-4 py-3 rounded-xl outline-none border border-border focus:border-primary bg-background disabled:opacity-50"
                        placeholder={jobType === JobType.TEACHER_HIRING ? "예: 2500000 (월 급여 또는 총액)" : "숫자만 입력 (예: 15000000)"}
                    />
                </div>

                {jobType === JobType.EVENT_VENDOR && (
                    <BudgetGuideline budget={parseInt(String(formData.budget), 10)} />
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">과목 / 분야</label>
                    <input
                        value={formData.subjects}
                        onChange={(e) => handleChange('subjects', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl outline-none border border-border focus:border-primary bg-background"
                        placeholder="예: 수학, 과학"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">지역</label>
                    <input
                        value={formData.regions}
                        onChange={(e) => handleChange('regions', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl outline-none border border-border focus:border-primary bg-background"
                        placeholder="예: 서울 강남구"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-foreground mb-2">상세 내용</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl outline-none border border-border focus:border-primary bg-background resize-none"
                    placeholder="모집 요강, 자격 요건 등을 상세히 적어주세요."
                />
            </div>
        </div>
    );
}
