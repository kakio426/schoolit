'use client';

import React, { useState, useRef } from 'react';
import {
    FileUp, CheckCircle, AlertTriangle, Send,
    Award, Building, Phone, DollarSign, FileText, Info
} from 'lucide-react';
import { BudgetGuideline } from '@/components/jobs/BudgetGuideline';

interface BidSubmissionFormProps {
    jobId: number;
    jobTitle: string;
    schoolBudget?: number; // School's max budget for guidance
    onSubmit: (data: BidFormData) => Promise<void>;
    onCancel: () => void;
}

interface BidFormData {
    cost: number;
    message: string;
    contactPhone: string;
    estimateFileUrl?: string;
    businessLicenseUrl?: string;
    s2bNumber?: string;
}

export default function BidSubmissionForm({
    jobId,
    jobTitle,
    schoolBudget,
    onSubmit,
    onCancel,
}: BidSubmissionFormProps) {
    const [cost, setCost] = useState('');
    const [message, setMessage] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [s2bNumber, setS2bNumber] = useState('');
    const [estimateFile, setEstimateFile] = useState<File | null>(null);
    const [businessLicenseFile, setBusinessLicenseFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const estimateInputRef = useRef<HTMLInputElement>(null);
    const licenseInputRef = useRef<HTMLInputElement>(null);

    const parsedCost = parseInt(cost.replace(/[^0-9]/g, ''), 10) || 0;
    const isOverBudget = schoolBudget && parsedCost > schoolBudget;
    const needsS2B = parsedCost > 20000000; // 2천만원 초과 시 S2B 필수

    const handleSubmit = async () => {
        // Validation
        if (!cost || parsedCost <= 0) {
            alert('견적 금액을 입력해주세요.');
            return;
        }
        if (!message.trim()) {
            alert('제안 내용을 입력해주세요.');
            return;
        }
        if (!contactPhone.trim()) {
            alert('담당자 연락처를 입력해주세요.');
            return;
        }
        if (!businessLicenseFile) {
            alert('사업자등록증을 첨부해주세요.');
            return;
        }
        if (needsS2B && !s2bNumber.trim()) {
            alert('2천만원 초과 입찰은 S2B(학교장터) 등록 번호가 필요합니다.');
            return;
        }

        setIsSubmitting(true);
        try {
            // In real app, upload files to S3 first
            await onSubmit({
                cost: parsedCost,
                message,
                contactPhone,
                estimateFileUrl: estimateFile ? `uploads/${estimateFile.name}` : undefined,
                businessLicenseUrl: `uploads/${businessLicenseFile.name}`,
                s2bNumber: s2bNumber || undefined,
            });
        } catch (e) {
            console.error(e);
            alert('제출 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatNumber = (value: string) => {
        const num = value.replace(/[^0-9]/g, '');
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    return (
        <div className="bg-surface rounded-[32px] border border-border shadow-xl p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                        <Send className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-foreground">입찰서 제출</h2>
                        <p className="text-xs text-foreground-muted">{jobTitle}</p>
                    </div>
                </div>
            </div>

            {/* Cost Input with Budget Warning */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" /> 제안 금액 (KRW)
                </label>
                <input
                    type="text"
                    value={cost}
                    onChange={(e) => setCost(formatNumber(e.target.value))}
                    className={`w-full px-5 py-4 bg-background border rounded-xl outline-none focus:ring-2 transition-all font-black text-2xl text-center ${isOverBudget
                            ? 'border-red-500 focus:ring-red-500/20 text-red-600'
                            : 'border-border focus:ring-primary/20 text-primary'
                        }`}
                    placeholder="0"
                />
                {isOverBudget && (
                    <div className="flex items-center gap-2 text-red-600 text-sm font-bold bg-red-50 dark:bg-red-900/10 p-3 rounded-xl">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>학교 예산({schoolBudget?.toLocaleString()}원)을 초과합니다. 선정 가능성이 낮아질 수 있습니다.</span>
                    </div>
                )}

                {/* S2B Compliance Guidance */}
                {parsedCost > 0 && <BudgetGuideline budget={parsedCost} />}
            </div>

            {/* S2B Number (Conditional) */}
            {needsS2B && (
                <div className="space-y-2 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl animate-in slide-in-from-top-2 duration-300">
                    <label className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                        <Award className="w-4 h-4" /> S2B(학교장터) 등록 번호 <span className="text-red-500">*필수</span>
                    </label>
                    <input
                        type="text"
                        value={s2bNumber}
                        onChange={(e) => setS2bNumber(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 font-bold"
                        placeholder="예: S2B1234567890"
                    />
                    <p className="text-xs text-amber-600 dark:text-amber-500">
                        ⚠️ 2천만원 초과 입찰은 지방계약법에 따라 S2B 등록이 필수입니다.
                    </p>
                </div>
            )}

            {/* Contact Info */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-500" /> 담당자 연락처
                </label>
                <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                    placeholder="010-XXXX-XXXX"
                />
            </div>

            {/* Message/Proposal */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" /> 제안 내용
                </label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-32 px-4 py-3 bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 resize-none font-medium leading-relaxed"
                    placeholder="행사 구성, 업체 강점, 특이사항 등을 입력해 주세요."
                />
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Estimate File */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                        <FileUp className="w-4 h-4" /> 견적서 (선택)
                    </label>
                    <input
                        type="file"
                        ref={estimateInputRef}
                        className="hidden"
                        accept=".pdf,.jpg,.png"
                        onChange={(e) => setEstimateFile(e.target.files?.[0] || null)}
                    />
                    <button
                        onClick={() => estimateInputRef.current?.click()}
                        className={`w-full h-20 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${estimateFile
                                ? 'border-emerald-500/50 bg-emerald-500/5'
                                : 'border-border bg-slate-50/50 hover:bg-slate-100 hover:border-primary/50'
                            }`}
                    >
                        {estimateFile ? (
                            <>
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                <span className="text-xs font-bold text-emerald-600 truncate max-w-[150px]">{estimateFile.name}</span>
                            </>
                        ) : (
                            <>
                                <FileUp className="w-5 h-5 text-foreground-muted" />
                                <span className="text-xs font-bold text-foreground-muted">PDF/이미지</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Business License (Required) */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Building className="w-4 h-4" /> 사업자등록증 <span className="text-red-500">*필수</span>
                    </label>
                    <input
                        type="file"
                        ref={licenseInputRef}
                        className="hidden"
                        accept=".pdf,.jpg,.png"
                        onChange={(e) => setBusinessLicenseFile(e.target.files?.[0] || null)}
                    />
                    <button
                        onClick={() => licenseInputRef.current?.click()}
                        className={`w-full h-20 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${businessLicenseFile
                                ? 'border-emerald-500/50 bg-emerald-500/5'
                                : 'border-red-300 bg-red-50/50 hover:bg-red-100 hover:border-red-400'
                            }`}
                    >
                        {businessLicenseFile ? (
                            <>
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                <span className="text-xs font-bold text-emerald-600 truncate max-w-[150px]">{businessLicenseFile.name}</span>
                            </>
                        ) : (
                            <>
                                <Building className="w-5 h-5 text-red-400" />
                                <span className="text-xs font-bold text-red-400">필수 첨부</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Info Note */}
            <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm text-foreground-muted">
                <Info className="w-5 h-5 flex-shrink-0 text-primary" />
                <p>
                    제출된 입찰서는 학교 담당자에게 전달되며, 선정 결과는 앱 알림 및 채팅으로 안내됩니다.
                    S2B/G2B 공식 절차가 필요한 경우 별도 안내를 받으실 수 있습니다.
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-border">
                <button
                    onClick={onCancel}
                    className="flex-1 py-4 bg-surface border border-border rounded-xl font-bold text-foreground-muted hover:bg-surface-hover transition-colors"
                >
                    취소
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                    ) : (
                        <>
                            <Send className="w-5 h-5" /> 입찰서 제출
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
