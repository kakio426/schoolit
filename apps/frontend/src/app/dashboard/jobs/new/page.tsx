"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import WarningModal from '@/components/ui/WarningModal';
import { JobTypeSelector } from '@/components/jobs/JobTypeSelector';
import { JobType } from '@/lib/constants';
import { BudgetGuideline } from '@/components/jobs/BudgetGuideline';
import { getChecklistItems, getGuideSteps, GRADE_LEVELS, CERTIFICATION_OPTIONS, EVENT_TYPES } from '@/lib/constants/jobs';
import { JobCreationPayload, InternalChecklist } from '@/types';

export default function NewJobPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [jobType, setJobType] = useState<JobType>(JobType.TEACHER_HIRING);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subjects: '',
        regions: '',
        budget: '',
        // Internal Compliance
        internalChecklist: {
            planningApproved: false,
            budgetConfirmed: false,
            vacancyConfirmed: false,
        },
        // ...
        // Teacher-specific
        contractPeriod: '',
        gradeLevel: [] as string[],
        teachingHours: '',
        // Event-specific
        eventType: '',
        eventDuration: '',
        participantCount: '',
        equipmentProvided: false,
        certifications: [] as string[],
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showBudgetWarning, setShowBudgetWarning] = useState(false);
    const [isStandardSalary, setIsStandardSalary] = useState(true);

    // Compliance Limit: 20 Million KRW
    const [lastWarningValue, setLastWarningValue] = useState(0);

    const checkBudgetLimit = (value: string) => {
        if (jobType !== JobType.EVENT_VENDOR) return;

        const numValue = parseInt(value.replace(/,/g, ''), 10) || 0;
        if (numValue > 20000000) {
            setShowBudgetWarning(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const payload: JobCreationPayload = {
                jobType,
                title: formData.title,
                description: formData.description,
                subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean),
                regions: formData.regions.split(',').map(s => s.trim()).filter(Boolean),
                budget: parseInt(formData.budget.replace(/,/g, ''), 10) || 0,
                internalChecklist: formData.internalChecklist,
            };

            // Add teacher-specific fields
            if (jobType === JobType.TEACHER_HIRING) {
                payload.contractPeriod = formData.contractPeriod;
                payload.gradeLevel = formData.gradeLevel;
                payload.teachingHours = parseInt(formData.teachingHours, 10) || undefined;
            }

            // Add event-specific fields
            if (jobType === JobType.EVENT_VENDOR) {
                payload.eventType = formData.eventType;
                payload.eventDuration = formData.eventDuration;
                payload.participantCount = formData.participantCount;
                payload.equipmentProvided = formData.equipmentProvided;
                payload.certifications = formData.certifications;
            }

            await api.post('/jobs', payload);
            alert('공고가 등록되었습니다!');
            router.push('/dashboard/jobs');
        } catch (err: any) {
            console.error(err);
            alert(err.message || '등록 실패. 학교 프로필을 먼저 작성했는지 확인해주세요.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'budget') {
            checkBudgetLimit(value);
        }
    }

    // Dynamic Checklist Items (from constants)
    const checklistItems = getChecklistItems(jobType);

    // Dynamic Guide Steps (from constants)
    const guideSteps = getGuideSteps(jobType);

    // [RBAC] Only SCHOOL role can create jobs/events
    if (user?.role !== 'SCHOOL') {
        return <DashboardLayout><div className="text-center py-20 text-foreground-muted">접근 권한이 없습니다.<br />공고 등록은 학교/업무 담당 교사만 가능합니다.</div></DashboardLayout>
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col lg:flex-row gap-8">
                {/* Left: Form */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl">📢</span>
                        <h1 className="text-2xl font-bold text-foreground">새 공고 등록</h1>
                    </div>

                    <div className="bg-surface rounded-3xl border border-border shadow-sm p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Internal Approval Check Section */}
                            <div className="p-6 bg-background rounded-2xl border-2 border-dashed border-border">
                                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                                    <span className="text-lg">⚖️</span> 1단계: 내부 채용 계획 확인
                                </h3>
                                <div className="space-y-3">
                                    {checklistItems.map(item => (
                                        <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={(formData.internalChecklist as any)[item.id]}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    internalChecklist: { ...formData.internalChecklist, [item.id]: e.target.checked }
                                                })}
                                                className="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                                                required
                                            />
                                            <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors font-medium">
                                                {item.label} <span className="text-red-500 font-bold">*</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Job Type Selector */}
                            <JobTypeSelector value={jobType} onChange={setJobType} />

                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">공고 제목</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl outline-none focus:border-primary"
                                    placeholder={jobType === JobType.TEACHER_HIRING ? "예: 2024년 1학기 수학 기간제, 늘봄 선생님 등" : "예: 2024 진로체험의 날 행사 업체 모집"}
                                    required
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
                                                    if (e.target.checked) setFormData({ ...formData, budget: '0' });
                                                }}
                                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-xs font-bold text-foreground">공무원 보수 규정 / 교육청 지침에 따름</span>
                                        </label>
                                    )}

                                    <input
                                        name="budget"
                                        type="number"
                                        value={formData.budget}
                                        onChange={handleChange}
                                        disabled={jobType === JobType.TEACHER_HIRING && isStandardSalary}
                                        className="w-full px-4 py-3 rounded-xl outline-none focus:border-primary disabled:opacity-50"
                                        placeholder={jobType === JobType.TEACHER_HIRING ? "예: 2500000 (월 급여 또는 총액)" : "숫자만 입력 (예: 15000000)"}
                                    />
                                </div>

                                {jobType === JobType.EVENT_VENDOR && (
                                    <BudgetGuideline budget={parseInt(formData.budget, 10)} />
                                )}

                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">상세 내용</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-xl outline-none focus:border-primary resize-none"
                                    placeholder="모집 요강, 자격 요건 등을 상세히 적어주세요."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">과목 (콤마로 구분)</label>
                                    <input
                                        name="subjects"
                                        value={formData.subjects}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl outline-none focus:border-primary"
                                        placeholder="수학, 과학"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">지역 (콤마로 구분)</label>
                                    <input
                                        name="regions"
                                        value={formData.regions}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl outline-none focus:border-primary"
                                        placeholder="서울 강남구, 경기 분당"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Teacher/Instructor-specific fields */}
                            {jobType === JobType.TEACHER_HIRING && (
                                <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
                                    <h3 className="font-bold text-foreground">채용 상세 정보</h3>

                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-2">계약 기간</label>
                                        <input
                                            name="contractPeriod"
                                            value={formData.contractPeriod}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl outline-none focus:border-primary"
                                            placeholder="예: 2024.03.01 ~ 2024.08.31"
                                        />
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
                                                            ? formData.gradeLevel.filter(l => l !== level)
                                                            : [...formData.gradeLevel, level];
                                                        setFormData({ ...formData, gradeLevel: newLevels });
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
                                            name="teachingHours"
                                            value={formData.teachingHours}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl outline-none focus:border-primary"
                                            placeholder="예: 20"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Event-specific fields */}
                            {jobType === JobType.EVENT_VENDOR && (
                                <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800">
                                    <h3 className="font-bold text-foreground">행사 상세 정보</h3>

                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-2">행사 종류</label>
                                        <select
                                            name="eventType"
                                            value={formData.eventType}
                                            onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl outline-none focus:border-primary"
                                        >
                                            <option value="">선택하세요</option>
                                            {EVENT_TYPES.map(et => (
                                                <option key={et.value} value={et.value}>{et.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-2">행사 기간</label>
                                        <input
                                            name="eventDuration"
                                            value={formData.eventDuration}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl outline-none focus:border-primary"
                                            placeholder="예: 4교시, 1일, 2일"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-2">참가 인원</label>
                                        <input
                                            name="participantCount"
                                            value={formData.participantCount}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl outline-none focus:border-primary"
                                            placeholder="예: 30-50명, 100명 이상"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="equipmentProvided"
                                            checked={formData.equipmentProvided}
                                            onChange={(e) => setFormData({ ...formData, equipmentProvided: e.target.checked })}
                                            className="w-5 h-5 rounded border-slate-300"
                                        />
                                        <label htmlFor="equipmentProvided" className="text-sm font-semibold text-foreground">
                                            장비/교구 제공 가능
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-2">보유 인증 (선택)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {CERTIFICATION_OPTIONS.map(cert => (
                                                <button
                                                    key={cert}
                                                    type="button"
                                                    onClick={() => {
                                                        const newCerts = formData.certifications.includes(cert)
                                                            ? formData.certifications.filter(c => c !== cert)
                                                            : [...formData.certifications, cert];
                                                        setFormData({ ...formData, certifications: newCerts });
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
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                >
                                    {isSaving ? '등록 중...' : '공고 등록하기'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="w-full mt-3 py-3 text-foreground-muted font-medium hover:text-foreground transition-colors"
                                >
                                    취소
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right: Recruitment Guide */}
                <div className="w-full lg:w-80 shrink-0 space-y-6">
                    <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl sticky top-8">
                        <h3 className="font-extrabold text-primary mb-4 flex items-center gap-2">
                            <span>📚</span> {jobType === JobType.TEACHER_HIRING ? '교원 채용 가이드' : '행사/용역 계약 가이드'}
                        </h3>
                        <div className="space-y-6">
                            {guideSteps.map((g, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0 text-sm">
                                        {g.step}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-foreground">{g.title}</div>
                                        <div className="text-[11px] text-foreground-muted leading-tight mt-1">{g.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-primary/10">
                            <p className="text-[10px] text-foreground-muted italic leading-relaxed">
                                💡 <b>Tip</b>: {jobType === JobType.TEACHER_HIRING ? '기간제 교사의 경우, 호봉 획정용 경력증명서 원본을 미리 요청하시면 계약 과정이 빨라집니다.' : '과업지시서에 구체적인 페널티 조항(지체상금 등)을 포함해야 향후 분쟁을 예방할 수 있습니다.'}
                            </p>
                        </div>
                    </div>

                    <div className="p-6 bg-surface border border-border rounded-3xl">
                        <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-error rounded-full animate-pulse"></span>
                            필수 행정 알림
                        </h4>
                        <ul className="text-[11px] text-foreground-muted space-y-2 list-disc pl-4">
                            <li>성범죄 경력 조회 누락 시 과태료 대상</li>
                            <li>채용 신체검사 결과는 1년 이내 유효</li>
                            <li>공고 기간 3일 이상 권장</li>
                        </ul>
                    </div>
                </div>
            </div>

            <WarningModal
                isOpen={showBudgetWarning}
                onClose={() => setShowBudgetWarning(false)}
                type="danger"
                title="[주의] 수의계약 한도 초과 안내"
                description={`선생님! 입력하신 금액은 「지방계약법」에 따라 1인 견적 수의계약이 불가능할 수 있습니다.\n\n2,000만 원 초과 시 반드시 지정정보처리장치(S2B)를 통해 공고 또는 입찰 절차를 진행해야 합니다.`}
                primaryAction={{
                    label: 'S2B 바로가기',
                    onClick: () => window.open('https://www.s2b.kr', '_blank')
                }}
            />
        </DashboardLayout>
    );
}
