'use client';

import React, { useState, useRef } from 'react';
import { FileText, Check, X, Download, PenTool, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

interface ContractSignViewProps {
    contractId: string;
    pdfUrl: string;
    contractTitle: string;
    partiesInfo: {
        partyA: string; // School name
        partyB: string; // Teacher/Business name
    };
    onSign: (signatureData: string, agreedAt: Date) => Promise<void>;
    onClose: () => void;
}

export default function ContractSignView({
    contractId,
    pdfUrl,
    contractTitle,
    partiesInfo,
    onSign,
    onClose,
}: ContractSignViewProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages] = useState(3); // Mock - In real app, get from PDF
    const [isAgreed, setIsAgreed] = useState(false);
    const [signatureName, setSignatureName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSignatureModal, setShowSignatureModal] = useState(false);

    const handleSubmitSignature = async () => {
        if (!isAgreed) {
            alert('계약 내용에 동의해주세요.');
            return;
        }
        if (!signatureName.trim()) {
            alert('서명자 성명을 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            // In a real app, you might use a canvas signature
            // For mobile simplicity, we use a typed signature + checkbox
            await onSign(`TYPED_SIGNATURE:${signatureName}`, new Date());
            alert('계약서 서명이 완료되었습니다!');
            onClose();
        } catch (e) {
            console.error(e);
            alert('서명 처리 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-200">
            {/* Mobile-Optimized Header */}
            <header className="flex items-center justify-between p-4 border-b border-border bg-surface safe-area-top">
                <button onClick={onClose} className="p-2 -ml-2 rounded-xl hover:bg-surface-hover transition-colors">
                    <X className="w-6 h-6 text-foreground" />
                </button>
                <div className="text-center flex-1">
                    <h1 className="font-bold text-foreground text-sm truncate max-w-[200px] mx-auto">{contractTitle}</h1>
                    <p className="text-xs text-foreground-muted">계약서 검토 및 서명</p>
                </div>
                <a
                    href={pdfUrl}
                    download
                    className="p-2 -mr-2 rounded-xl hover:bg-surface-hover transition-colors"
                >
                    <Download className="w-5 h-5 text-foreground-muted" />
                </a>
            </header>

            {/* PDF Viewer Area (Simplified for Mobile) */}
            <div className="flex-1 overflow-hidden bg-slate-100 dark:bg-slate-900">
                <div className="h-full flex flex-col">
                    {/* PDF Preview (In real app, use react-pdf or iframe) */}
                    <div className="flex-1 p-4 overflow-auto">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 min-h-[400px] border border-border">
                            {/* Mock Contract Preview */}
                            <div className="text-center mb-6">
                                <FileText className="w-12 h-12 text-primary mx-auto mb-3" />
                                <h2 className="text-xl font-black text-foreground">{contractTitle}</h2>
                                <p className="text-sm text-foreground-muted mt-1">계약서 ID: {contractId}</p>
                            </div>

                            <div className="space-y-4 text-sm text-foreground leading-relaxed">
                                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                    <p className="font-bold text-foreground-muted mb-2">계약 당사자</p>
                                    <p><strong>갑 (위탁자):</strong> {partiesInfo.partyA}</p>
                                    <p><strong>을 (수탁자):</strong> {partiesInfo.partyB}</p>
                                </div>

                                <p className="text-foreground-muted">
                                    * 본 계약서의 전체 내용은 PDF 문서를 다운로드하여 확인하시기 바랍니다.
                                    <br />
                                    * 서명 전 계약 조건을 충분히 검토해주세요.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Page Navigation (If multi-page) */}
                    <div className="flex items-center justify-center gap-4 py-3 border-t border-border bg-surface">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg bg-background border border-border disabled:opacity-30"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-bold text-foreground">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg bg-background border border-border disabled:opacity-30"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Signing Section - Sticky Bottom */}
            <div className="border-t border-border bg-surface p-4 space-y-4 safe-area-bottom">
                {/* Agreement Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <input
                        type="checkbox"
                        checked={isAgreed}
                        onChange={(e) => setIsAgreed(e.target.checked)}
                        className="mt-0.5 w-5 h-5 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                        본인은 위 계약서의 내용을 충분히 이해하였으며, 계약 조건에 동의합니다.
                        <span className="text-red-500 font-bold">*</span>
                    </span>
                </label>

                {/* Signature Input */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground-muted uppercase">서명자 성명 (직접 입력)</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={signatureName}
                            onChange={(e) => setSignatureName(e.target.value)}
                            placeholder="본인 이름을 정확히 입력해주세요"
                            className="w-full px-4 py-4 bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-lg text-center"
                        />
                        <PenTool className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                    </div>
                    <p className="text-xs text-foreground-muted text-center">
                        전자서명법에 따라 타이핑 서명도 법적 효력이 있습니다.
                    </p>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmitSignature}
                    disabled={isSubmitting || !isAgreed || !signatureName.trim()}
                    className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                    ) : (
                        <>
                            <Check className="w-5 h-5" /> 계약서 서명 완료
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
