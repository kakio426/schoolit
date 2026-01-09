'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, FileText, Check, AlertTriangle } from 'lucide-react';
import { HIRING_REASONS, calculateContractDuration } from '@/lib/constants/compliance';

interface HiringWizardData {
    // Step 1: Plan
    hiringReason: string;
    originalTeacherName: string;
    contractStartDate: string;
    contractEndDate: string;
    subject: string;

    // Step 2: Details
    title: string;
    description: string;
    gradeLevel: string[];
    teachingHours: string;

    // Step 3: Approval
    internalApproved: boolean;
    draftDocumentNumber: string;
}

interface HiringWizardProps {
    onComplete: (data: HiringWizardData) => void;
    onCancel: () => void;
}

const WIZARD_STEPS = [
    { id: 1, title: '채용 계획', description: '채용 사유 및 기간 설정' },
    { id: 2, title: '공고 작성', description: '공고 제목 및 상세 내용' },
    { id: 3, title: '내부결재', description: '결재 문서 생성 및 승인' },
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

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                if (!formData.hiringReason) {
                    setValidationError('채용 사유를 선택해주세요.');
                    return false;
                }
                if (!formData.contractStartDate || !formData.contractEndDate) {
                    setValidationError('계약 기간을 입력해주세요.');
                    return false;
                }
                const durationCheck = calculateContractDuration(
                    formData.hiringReason,
                    new Date(formData.contractStartDate),
                    new Date(formData.contractEndDate)
                );
                if (!durationCheck.isValid) {
                    setValidationError(durationCheck.message);
                    return false;
                }
                if (!formData.subject) {
                    setValidationError('임용 분야(과목)를 입력해주세요.');
                    return false;
                }
                return true;
            case 2:
                if (!formData.title) {
                    setValidationError('공고 제목을 입력해주세요.');
                    return false;
                }
                if (!formData.description) {
                    setValidationError('상세 내용을 입력해주세요.');
                    return false;
                }
                return true;
            case 3:
                if (!formData.internalApproved) {
                    setValidationError('내부결재 승인을 확인해주세요.');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep < 3) {
                setCurrentStep(prev => prev + 1);
            } else {
                onComplete(formData);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            setValidationError(null);
        }
    };

    const generateAutoTitle = () => {
        const reason = HIRING_REASONS.find(r => r.value === formData.hiringReason);
        const year = new Date().getFullYear();
        const semester = new Date().getMonth() < 8 ? '1학기' : '2학기';
        return `${year}년 ${semester} ${formData.subject} 기간제교사 (${reason?.label || '결원'})`;
    };

    return (
        <div className="bg-surface rounded-3xl border border-border shadow-lg overflow-hidden">
            {/* Progress Bar */}
            <div className="bg-background/50 p-6 border-b border-border">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                    {WIZARD_STEPS.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${currentStep > step.id
                                        ? 'bg-success text-white'
                                        : currentStep === step.id
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                    }`}>
                                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                                </div>
                                <span className={`text-xs mt-2 font-bold ${currentStep >= step.id ? 'text-foreground' : 'text-foreground-muted'
                                    }`}>
                                    {step.title}
                                </span>
                                <span className="text-[10px] text-foreground-muted hidden sm:block">
                                    {step.description}
                                </span>
                            </div>
                            {index < WIZARD_STEPS.length - 1 && (
                                <div className={`flex-1 h-1 mx-4 rounded ${currentStep > step.id ? 'bg-success' : 'bg-slate-200 dark:bg-slate-700'
                                    }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Validation Error */}
            {validationError && (
                <div className="mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{validationError}</span>
                </div>
            )}

            {/* Step Content */}
            <div className="p-8">
                {/* Step 1: Plan */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h2 className="text-xl font-bold text-foreground mb-2">📋 채용 계획 수립</h2>
                            <p className="text-foreground-muted text-sm">
                                2025 경기도교육청 지침에 따라 채용 사유와 계약 기간을 입력합니다.
                            </p>
                        </div>

                        {/* Hiring Reason */}
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-3">
                                채용 사유 <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {HIRING_REASONS.map(reason => (
                                    <button
                                        key={reason.value}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, hiringReason: reason.value }))}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${formData.hiringReason === reason.value
                                                ? 'border-primary bg-primary/5 shadow-md'
                                                : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="font-bold text-sm">{reason.label}</div>
                                        <div className="text-xs text-foreground-muted mt-1">{reason.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Original Teacher Name (for Leave cases) */}
                        {['LEAVE', 'SICK_LEAVE', 'MATERNITY', 'DISPATCH', 'STUDY'].includes(formData.hiringReason) && (
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">
                                    휴직 교사명 (서식 1 기재용)
                                </label>
                                <input
                                    type="text"
                                    name="originalTeacherName"
                                    value={formData.originalTeacherName}
                                    onChange={handleChange}
                                    placeholder="예: 홍길동"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none"
                                />
                            </div>
                        )}

                        {/* Contract Period */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">
                                    계약 시작일 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="contractStartDate"
                                    value={formData.contractStartDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">
                                    계약 종료일 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="contractEndDate"
                                    value={formData.contractEndDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">
                                임용 분야 (과목) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="예: 수학, 영어, 과학"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none"
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Details */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h2 className="text-xl font-bold text-foreground mb-2">📢 공고 내용 작성</h2>
                            <p className="text-foreground-muted text-sm">
                                공고 제목과 상세 모집 요강을 작성합니다.
                            </p>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">
                                공고 제목 <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="예: 2025년 1학기 수학 기간제교사 채용"
                                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, title: generateAutoTitle() }))}
                                    className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-foreground-muted rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                                >
                                    자동 생성
                                </button>
                            </div>
                        </div>

                        {/* Grade Level */}
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-3">학년 (복수 선택 가능)</label>
                            <div className="flex flex-wrap gap-2">
                                {GRADE_OPTIONS.map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => handleGradeLevelToggle(level)}
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

                        {/* Teaching Hours */}
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">주당 수업 시수</label>
                            <input
                                type="number"
                                name="teachingHours"
                                value={formData.teachingHours}
                                onChange={handleChange}
                                placeholder="예: 20"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">
                                상세 모집 요강 <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={6}
                                placeholder="자격 요건, 우대 사항, 제출 서류 등을 상세히 작성해주세요."
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none resize-none"
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Approval */}
                {currentStep === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h2 className="text-xl font-bold text-foreground mb-2">✅ 내부결재 확인</h2>
                            <p className="text-foreground-muted text-sm">
                                채용계획서(서식 1)를 생성하고 내부결재를 진행합니다.
                            </p>
                        </div>

                        {/* Preview Card */}
                        <div className="p-6 bg-background rounded-2xl border border-border">
                            <div className="flex items-center gap-3 mb-4">
                                <FileText className="w-6 h-6 text-primary" />
                                <span className="font-bold">채용계획서 미리보기</span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-2 border-b border-border">
                                    <span className="text-foreground-muted">채용 사유</span>
                                    <span className="font-bold">{HIRING_REASONS.find(r => r.value === formData.hiringReason)?.label}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border">
                                    <span className="text-foreground-muted">임용 분야</span>
                                    <span className="font-bold">{formData.subject}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border">
                                    <span className="text-foreground-muted">계약 기간</span>
                                    <span className="font-bold">{formData.contractStartDate} ~ {formData.contractEndDate}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-foreground-muted">공고 제목</span>
                                    <span className="font-bold">{formData.title}</span>
                                </div>
                            </div>
                        </div>

                        {/* Document Number */}
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">기안 문서 번호 (선택)</label>
                            <input
                                type="text"
                                name="draftDocumentNumber"
                                value={formData.draftDocumentNumber}
                                onChange={handleChange}
                                placeholder="예: OO초-1234 (2025.01.09)"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none"
                            />
                        </div>

                        {/* Approval Checkbox */}
                        <label className="flex items-start gap-4 p-4 bg-primary/5 rounded-2xl border-2 border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.internalApproved}
                                onChange={(e) => setFormData(prev => ({ ...prev, internalApproved: e.target.checked }))}
                                className="w-6 h-6 mt-1 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <div>
                                <div className="font-bold text-foreground">내부결재 승인 완료</div>
                                <div className="text-sm text-foreground-muted mt-1">
                                    본 채용 건에 대해 학교장 결재를 득하였음을 확인합니다.
                                    (채용계획서 PDF는 공고 등록 후 다운로드 가능)
                                </div>
                            </div>
                        </label>
                    </div>
                )}
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-border bg-background/30 flex justify-between">
                <button
                    type="button"
                    onClick={currentStep === 1 ? onCancel : handleBack}
                    className="px-6 py-3 text-foreground-muted font-bold rounded-xl hover:bg-surface-hover transition-colors flex items-center gap-2"
                >
                    <ChevronLeft className="w-4 h-4" />
                    {currentStep === 1 ? '취소' : '이전'}
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                    {currentStep === 3 ? '공고 등록' : '다음'}
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
