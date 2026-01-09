'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, FileText, Check, AlertTriangle, Info, Calendar, ClipboardCheck } from 'lucide-react';
import { HIRING_REASONS, calculateContractDuration } from '@/lib/constants/compliance';
import StandardCard, { StandardBadge } from '@/components/ui/StandardCard';

interface HiringWizardData {
    hiringReason: string;
    originalTeacherName: string;
    contractStartDate: string;
    contractEndDate: string;
    subject: string;
    title: string;
    description: string;
    gradeLevel: string[];
    teachingHours: string;
    internalApproved: boolean;
    draftDocumentNumber: string;
}

interface HiringWizardProps {
    onComplete: (data: HiringWizardData) => void;
    onCancel: () => void;
}

const WIZARD_STEPS = [
    { id: 1, title: '채용 계획', description: '사유 및 기간 설정', icon: <Calendar className="w-4 h-4" /> },
    { id: 2, title: '공고 작성', description: '상세 내용 입력', icon: <FileText className="w-4 h-4" /> },
    { id: 3, title: '검토/확인', description: '규정 준수 여부 체크', icon: <ClipboardCheck className="w-4 h-4" /> },
];

const GRADE_OPTIONS = ['초등 저학년', '초등 고학년', '중학교', '고등학교'];

export default function HiringWizard({ onComplete, onCancel }: HiringWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [validationError, setValidationError] = useState<string | null>(null);

    const [formData, setFormData] = useState<HiringWizardData>({
        hiringReason: '',
        originalTeacherName: '',
        contractStartDate: '',
        contractEndDate: '',
        subject: '',
        title: '',
        description: '',
        gradeLevel: [],
        teachingHours: '',
        internalApproved: false,
        draftDocumentNumber: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setValidationError(null);
    };

    const handleGradeLevelToggle = (level: string) => {
        setFormData(prev => ({
            ...prev,
            gradeLevel: prev.gradeLevel.includes(level)
                ? prev.gradeLevel.filter(l => l !== level)
                : [...prev.gradeLevel, level],
        }));
    };

    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(prev => prev + 1);
        else onComplete(formData);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    return (
        <div className="max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in duration-500">
            {/* Step Indicator Header */}
            <div className="flex items-center justify-between px-4 md:px-0">
                {WIZARD_STEPS.map((step, idx) => (
                    <React.Fragment key={step.id}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all shadow-md ${currentStep >= step.id ? 'bg-primary text-white scale-110' : 'bg-surface text-foreground-muted border border-border'}`}>
                                {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                            </div>
                            <div className="hidden md:block">
                                <div className={`text-sm font-bold ${currentStep >= step.id ? 'text-foreground' : 'text-foreground-muted'}`}>{step.title}</div>
                                <div className="text-[10px] text-foreground-muted">{step.description}</div>
                            </div>
                        </div>
                        {idx < WIZARD_STEPS.length - 1 && (
                            <div className={`flex-1 h-[2px] mx-4 transition-colors ${currentStep > step.id ? 'bg-primary' : 'bg-border'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Error Message */}
            {validationError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 animate-bounce">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm font-bold">{validationError}</span>
                </div>
            )}

            {/* Step Content */}
            <StandardCard className="shadow-2xl shadow-primary/5" noPadding>
                <div className="p-8 md:p-12">
                    {currentStep === 1 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-foreground">채용 계획을 설정해 주세요</h2>
                                <p className="text-foreground-muted text-sm font-medium">교육청 지침에 따른 채용 사유와 계약 기간을 입력합니다.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground">채용 사유 <span className="text-primary">*</span></label>
                                    <select
                                        name="hiringReason"
                                        value={formData.hiringReason}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none font-medium"
                                    >
                                        <option value="">사유를 선택하세요</option>
                                        {HIRING_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground">해당 교사명 (휴직자 등)</label>
                                    <input
                                        type="text"
                                        name="originalTeacherName"
                                        value={formData.originalTeacherName}
                                        onChange={handleChange}
                                        placeholder="이름 입력"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground">계약 시작일 <span className="text-primary">*</span></label>
                                    <input
                                        type="date"
                                        name="contractStartDate"
                                        value={formData.contractStartDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground">계약 종료일 <span className="text-primary">*</span></label>
                                    <input
                                        type="date"
                                        name="contractEndDate"
                                        value={formData.contractEndDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-foreground">공고 상세 내용을 작성해 주세요</h2>
                                <p className="text-foreground-muted text-sm font-medium">선생님들이 볼 수 있는 매력적인 공고를 작성합니다.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground">공고 제목 <span className="text-primary">*</span></label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="예: 4학년 담임교사 채용 (출산휴가 대체)"
                                        className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none font-bold text-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground">상세 설명 <span className="text-primary">*</span></label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="공고 상세 내용을 입력하세요."
                                        className="w-full h-48 px-5 py-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none resize-none leading-relaxed"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-foreground block">대상 학년</label>
                                    <div className="flex flex-wrap gap-2">
                                        {GRADE_OPTIONS.map(lvl => (
                                            <button
                                                key={lvl}
                                                onClick={() => handleGradeLevelToggle(lvl)}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${formData.gradeLevel.includes(lvl) ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-background border-border text-foreground-muted hover:border-primary/50'}`}
                                            >
                                                {lvl}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-[32px] flex items-start gap-4">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-2xl">📋</div>
                                <div>
                                    <h3 className="font-black text-foreground mb-1">최종 확인 및 내부 결재</h3>
                                    <p className="text-sm text-foreground-muted font-medium">등록 전 입력한 정보를 마지막으로 확인해 주세요.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 bg-background border border-border rounded-2xl space-y-2">
                                    <div className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest">채용 제목</div>
                                    <div className="font-bold text-foreground truncate">{formData.title}</div>
                                </div>
                                <div className="p-5 bg-background border border-border rounded-2xl space-y-2">
                                    <div className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest">계약 기간</div>
                                    <div className="font-bold text-foreground">{formData.contractStartDate} ~ {formData.contractEndDate}</div>
                                </div>
                            </div>

                            <div className="p-8 border-2 border-dashed border-border rounded-[32px] space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.internalApproved ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'}`}>
                                        {formData.internalApproved && <Check className="w-4 h-4 text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.internalApproved}
                                        onChange={(e) => setFormData(prev => ({ ...prev, internalApproved: e.target.checked }))}
                                    />
                                    <span className="text-sm font-bold text-foreground">내부 결재(기안)가 완료되었음을 확인합니다.</span>
                                </label>
                                <div className="space-y-2 pl-9">
                                    <label className="text-xs font-bold text-foreground-muted uppercase">기안문서 번호 (선택)</label>
                                    <input
                                        type="text"
                                        name="draftDocumentNumber"
                                        value={formData.draftDocumentNumber}
                                        onChange={handleChange}
                                        placeholder="예: 초교-1234 (2025.01.01)"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-6 md:p-8 bg-slate-50/50 dark:bg-slate-800/30 border-t border-border flex justify-between items-center">
                    <button
                        onClick={currentStep === 1 ? onCancel : prevStep}
                        className="px-6 py-3 text-sm font-bold text-foreground-muted hover:text-foreground transition-all flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" /> {currentStep === 1 ? '취소' : '이전 단계'}
                    </button>
                    <button
                        onClick={nextStep}
                        className="px-10 py-4 bg-primary text-white text-base font-black rounded-2xl shadow-xl shadow-primary/30 hover:bg-primary-hover active:scale-95 transition-all flex items-center gap-2"
                    >
                        {currentStep === 3 ? '공고 최종 등록하기' : '다음 단계로'} <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </StandardCard>
        </div>
    );
}
