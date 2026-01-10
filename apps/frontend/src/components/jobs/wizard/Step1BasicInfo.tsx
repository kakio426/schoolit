import React, { useState, useEffect } from 'react';
import { JobType } from '@/lib/constants';
import { JobTypeSelector } from '@/components/jobs/JobTypeSelector';
import { BudgetGuideline } from '@/components/jobs/BudgetGuideline';
import { WizardFormData } from './schema';
import { SUBJECT_GROUPS, KOREA_REGIONS, MAJOR_CITIES } from '@/lib/data';
import { BookOpen, MapPin } from 'lucide-react';

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
    const [selectedSido, setSelectedSido] = useState("");
    const [selectedSigungu, setSelectedSigungu] = useState("");

    const handleChange = (name: keyof WizardFormData, value: any) => {
        setFormData({ ...formData, [name]: value });
    };

    // Initialize Region state from formData if exists
    useEffect(() => {
        if (formData.regions) {
            const parts = formData.regions.split(' ');
            if (parts.length >= 1) setSelectedSido(parts[0]);
            if (parts.length >= 2) setSelectedSigungu(parts[1]);
        }
    }, []);

    const handleRegionChange = (sido: string, sigungu: string) => {
        setSelectedSido(sido);
        setSelectedSigungu(sigungu);
        const regionString = sigungu ? `${sido} ${sigungu}` : sido;
        handleChange('regions', regionString);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">1. 기본 정보 입력</h3>
                <p className="text-foreground-muted text-sm">채용 공고의 기본적인 내용을 입력해주세요.</p>
            </div>

            {/* Job Type Selector */}
            <JobTypeSelector value={jobType} onChange={setJobType} />

            <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">공고 제목</label>
                <input
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full px-4 py-3.5 bg-zinc-900 border border-white/[0.08] rounded-xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-zinc-100 placeholder:text-zinc-600 font-medium"
                    placeholder={jobType === JobType.TEACHER_HIRING ? "예: 2024년 1학기 수학 기간제, 늘봄 선생님 등" : "예: 2024 진로체험의 날 행사 업체 모집"}
                />
            </div>

            <div className="space-y-3">
                <label className="block text-sm font-semibold text-foreground">
                    {jobType === JobType.TEACHER_HIRING ? '보수 / 수당 정보' : '예상 예산 (원)'}
                </label>

                <div className="space-y-3">
                    {jobType === JobType.TEACHER_HIRING && (
                        <label className="flex items-center gap-3 cursor-pointer p-4 bg-zinc-900/50 rounded-xl border border-white/[0.05] hover:bg-zinc-900 transition-colors">
                            <input
                                type="checkbox"
                                checked={isStandardSalary}
                                onChange={(e) => {
                                    setIsStandardSalary(e.target.checked);
                                    if (e.target.checked) handleChange('budget', '0');
                                }}
                                className="w-5 h-5 rounded-lg border-white/[0.1] bg-zinc-950 text-blue-600 focus:ring-blue-500/20"
                            />
                            <span className="text-sm font-bold text-zinc-300">공무원 보수 규정 / 교육청 지침에 따름</span>
                        </label>
                    )}

                    <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => handleChange('budget', e.target.value)}
                        disabled={jobType === JobType.TEACHER_HIRING && isStandardSalary}
                        className="w-full px-4 py-3.5 bg-zinc-900 border border-white/[0.08] rounded-xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-zinc-100 placeholder:text-zinc-600 font-medium disabled:opacity-30"
                        placeholder={jobType === JobType.TEACHER_HIRING ? "예: 2500000 (월 급여 또는 총액)" : "숫자만 입력 (예: 15000000)"}
                    />
                </div>

                {jobType === JobType.EVENT_VENDOR && (
                    <BudgetGuideline budget={parseInt(String(formData.budget), 10)} />
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject Dropdown */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground">과목 / 분야</label>
                    <div className="relative group">
                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                        <select
                            value={formData.subjects}
                            onChange={(e) => handleChange('subjects', e.target.value)}
                            className="w-full pl-12 pr-10 py-3.5 bg-zinc-900 border border-white/[0.08] rounded-xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-zinc-100 appearance-none cursor-pointer font-medium"
                        >
                            <option value="">과목 선택</option>
                            {SUBJECT_GROUPS.map((group) => (
                                <optgroup key={group.name} label={group.name}>
                                    {group.subjects.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Region Two-Step Dropdown */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground">지역</label>
                    <div className="flex gap-2">
                        <div className="flex-1 relative group">
                            <select
                                value={selectedSido}
                                onChange={(e) => handleRegionChange(e.target.value, "")}
                                className="w-full px-4 py-3.5 bg-zinc-900 border border-white/[0.08] rounded-xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-zinc-100 appearance-none cursor-pointer font-medium text-sm"
                            >
                                <option value="">시/도</option>
                                {MAJOR_CITIES.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 relative group">
                            <select
                                value={selectedSigungu}
                                onChange={(e) => handleRegionChange(selectedSido, e.target.value)}
                                disabled={!selectedSido}
                                className="w-full px-4 py-3.5 bg-zinc-900 border border-white/[0.08] rounded-xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-zinc-100 appearance-none cursor-pointer font-medium text-sm disabled:opacity-30"
                            >
                                <option value="">시/군/구</option>
                                {selectedSido && KOREA_REGIONS[selectedSido]?.map((gu) => (
                                    <option key={gu} value={gu}>{gu}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">상세 내용</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={6}
                    className="w-full px-4 py-4 bg-zinc-900 border border-white/[0.08] rounded-2xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-zinc-100 placeholder:text-zinc-600 font-medium resize-none"
                    placeholder="모집 요강, 자격 요건 등을 상세히 적어주세요."
                />
            </div>
        </div>
    );
}

