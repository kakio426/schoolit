"use client";

import React, { useState } from 'react';
import { api } from '@/lib/api';

interface DocumentGenerationModalProps {
    type: 'hiring' | 'contract';
    prefillData: {
        // Common
        jobTitle?: string;
        // Hiring specific
        schoolName?: string;
        schoolAddress?: string;
        teacherName?: string;
        subject?: string;
        contractPeriod?: string;
        teachingHours?: number;
        salary?: number;
        // Contract specific
        businessName?: string;
        businessAddress?: string;
        contractAmount?: number;
    };
    onClose: () => void;
}

export default function DocumentGenerationModal({ type, prefillData, onClose }: DocumentGenerationModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form fields
    const [documentNumber, setDocumentNumber] = useState('');
    const [adminName, setAdminName] = useState('');
    const [adminPhone, setAdminPhone] = useState('');
    const [enforcementDate, setEnforcementDate] = useState(new Date().toISOString().split('T')[0]);

    // Contract-specific
    const [partyARepresentative, setPartyARepresentative] = useState('');
    const [partyBRepresentative, setPartyBRepresentative] = useState('');
    const [paymentTerms, setPaymentTerms] = useState('행사 완료 후 7일 이내');
    const [warrantyPeriod, setWarrantyPeriod] = useState('');

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);

        try {
            let response;
            if (type === 'hiring') {
                response = await api.post<{ content: string }>('/documents/hiring', {
                    documentNumber,
                    schoolName: prefillData.schoolName || '',
                    schoolAddress: prefillData.schoolAddress || '',
                    adminName,
                    adminPhone,
                    teacherName: prefillData.teacherName || '',
                    subject: prefillData.subject || '',
                    contractPeriod: prefillData.contractPeriod || '',
                    teachingHours: prefillData.teachingHours || 0,
                    salary: prefillData.salary,
                    jobTitle: prefillData.jobTitle || '',
                    enforcementDate,
                });
            } else {
                response = await api.post<{ content: string }>('/documents/contract', {
                    documentNumber,
                    partyAName: prefillData.schoolName || '',
                    partyAAddress: prefillData.schoolAddress || '',
                    partyARepresentative,
                    partyBName: prefillData.businessName || '',
                    partyBAddress: prefillData.businessAddress || '',
                    partyBRepresentative,
                    contractSubject: prefillData.jobTitle || '',
                    contractAmount: prefillData.contractAmount || 0,
                    contractPeriod: prefillData.contractPeriod || '',
                    paymentTerms,
                    warrantyPeriod: warrantyPeriod || undefined,
                    enforcementDate,
                });
            }

            setGeneratedContent(response.content);
        } catch (err: any) {
            setError(err.message || '공문 생성 실패');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (generatedContent) {
            navigator.clipboard.writeText(generatedContent);
            alert('클립보드에 복사되었습니다.');
        }
    };

    const handleDownload = () => {
        if (generatedContent) {
            const blob = new Blob([generatedContent], { type: 'text/plain;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `공문_${documentNumber || 'draft'}_${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
        }
    };

    const handleDownloadPdf = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const blob = await api.postBlob('/documents/generate/hiring-plan', {
                subject: prefillData.subject || '',
                reason: '교육과정 운영을 위한 전공 인력 채용',
                startDate: prefillData.contractPeriod?.split('~')[0]?.trim() || '',
                endDate: prefillData.contractPeriod?.split('~')[1]?.trim() || '',
                authorName: adminName,
                // ... other data from form
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `채용계획서_${prefillData.subject || '공통'}_${new Date().toISOString().split('T')[0]}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            setError(err.message || 'PDF 생성 실패');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative bg-surface rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">
                            📄 {type === 'hiring' ? '채용 공문 생성' : '계약서 생성'}
                        </h2>
                        <p className="text-sm text-foreground-muted mt-1">
                            AI가 교육부/교육청 지침에 맞는 양식을 생성합니다.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-surface-hover rounded-full transition-colors text-foreground-muted hover:text-foreground"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {!generatedContent ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-800">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    ⚠️ 아래 정보를 입력해주세요. 시스템에서 자동으로 가져올 수 없는 필수 항목입니다.
                                </p>
                            </div>

                            {/* Common Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        문서번호 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={documentNumber}
                                        onChange={(e) => setDocumentNumber(e.target.value)}
                                        placeholder="예: 초등-2026-0001"
                                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        시행일 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={enforcementDate}
                                        onChange={(e) => setEnforcementDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>

                            {type === 'hiring' ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                                담당자 이름 <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={adminName}
                                                onChange={(e) => setAdminName(e.target.value)}
                                                placeholder="예: 홍길동"
                                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                                담당자 연락처 <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={adminPhone}
                                                onChange={(e) => setAdminPhone(e.target.value)}
                                                placeholder="예: 02-1234-5678"
                                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                                갑 대표자 (학교장) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={partyARepresentative}
                                                onChange={(e) => setPartyARepresentative(e.target.value)}
                                                placeholder="예: 김교장"
                                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                                을 대표자 (업체) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={partyBRepresentative}
                                                onChange={(e) => setPartyBRepresentative(e.target.value)}
                                                placeholder="예: 박대표"
                                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                                대금 지급 조건 <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentTerms}
                                                onChange={(e) => setPaymentTerms(e.target.value)}
                                                placeholder="예: 행사 완료 후 7일 이내"
                                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                                하자 보수 기간 (선택)
                                            </label>
                                            <input
                                                type="text"
                                                value={warrantyPeriod}
                                                onChange={(e) => setWarrantyPeriod(e.target.value)}
                                                placeholder="예: 1개월"
                                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleGenerate}
                                    disabled={isLoading || !documentNumber}
                                    className="w-full py-3 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? 'AI 생성 중...' : '🤖 텍스트 공문 생성'}
                                </button>

                                {type === 'hiring' && (
                                    <button
                                        onClick={handleDownloadPdf}
                                        disabled={isLoading || !documentNumber}
                                        className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        📄 고퀄리티 PDF 생성 (Puppeteer)
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                                <p className="text-sm text-green-800 dark:text-green-200">
                                    ✅ 공문이 생성되었습니다. 내용을 확인하고 필요시 수정해주세요.
                                </p>
                            </div>

                            <div className="p-4 bg-background border border-border rounded-2xl max-h-[300px] overflow-y-auto">
                                <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
                                    {generatedContent}
                                </pre>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCopy}
                                    className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                                >
                                    📋 복사
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex-1 py-3 bg-slate-500 text-white rounded-xl font-bold hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
                                >
                                    💾 TXT 저장
                                </button>
                                <button
                                    onClick={handleDownloadPdf}
                                    className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
                                >
                                    📄 PDF 저장
                                </button>
                            </div>

                            <button
                                onClick={() => setGeneratedContent(null)}
                                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-foreground rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                ← 다시 생성하기
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
