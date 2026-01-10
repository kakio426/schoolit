'use client';

import React, { useState } from 'react';
import StandardCard from '@/components/ui/StandardCard';
import SignaturePad from './SignaturePad';
import { X, FileText, Pen, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface ContractViewerProps {
    isOpen: boolean;
    onClose: () => void;
    applicationId: number;
    contractType: 'TEACHER' | 'VENDOR';
    contractData: {
        schoolName: string;
        jobTitle: string;
        applicantName: string;
        contractPeriod?: string;
        salary?: string;
        isSigned?: boolean;
    };
    canSign?: boolean; // true if current user is the applicant
    onSignatureComplete?: () => void;
}

export default function ContractViewer({
    isOpen,
    onClose,
    applicationId,
    contractType,
    contractData,
    canSign = false,
    onSignatureComplete
}: ContractViewerProps) {
    const [isSignaturePadOpen, setIsSignaturePadOpen] = useState(false);
    const [isSigning, setIsSigning] = useState(false);
    const [isSigned, setIsSigned] = useState(contractData.isSigned || false);

    if (!isOpen) return null;

    const handleSignature = async (signatureData: string) => {
        setIsSigning(true);
        try {
            await api.patch(`/applications/${applicationId}/signature`, {
                signature: signatureData
            });
            setIsSigned(true);
            setIsSignaturePadOpen(false);
            if (onSignatureComplete) onSignatureComplete();
            alert('서명이 완료되었습니다! 📝');
        } catch (error) {
            console.error('Signature failed:', error);
            throw error;
        } finally {
            setIsSigning(false);
        }
    };

    const handleDownload = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}/contract`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `계약서_${contractData.jobTitle}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            alert('다운로드에 실패했습니다.');
        }
    };

    const isTeacher = contractType === 'TEACHER';

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
                <div className="relative w-full max-w-2xl my-8">
                    <StandardCard className="shadow-2xl" noPadding>
                        {/* Header */}
                        <div className="bg-slate-900 text-white p-6 flex justify-between items-start rounded-t-2xl">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-5 h-5 text-blue-400" />
                                    <span className="text-xs font-bold tracking-widest uppercase opacity-70">
                                        {isTeacher ? 'EMPLOYMENT CONTRACT' : 'SERVICE AGREEMENT'}
                                    </span>
                                </div>
                                <h2 className="text-xl font-black">
                                    {isTeacher ? '표준 근로 계약서' : '표준 용역 계약서'}
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">{contractData.jobTitle}</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Contract Preview */}
                        <div className="p-6 bg-white dark:bg-slate-900">
                            {/* Contract Header */}
                            <div className="text-center mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                                    {isTeacher ? '기간제교원 근로계약서' : '행사 용역 계약서'}
                                </h3>
                                <p className="text-xs text-slate-500 mt-2">
                                    {isTeacher
                                        ? '「교육공무원법」 및 「근로기준법」에 따른 기간제교원 근로계약'
                                        : '「지방계약법」에 따른 용역 계약'}
                                </p>
                            </div>

                            {/* Contract Details */}
                            <div className="space-y-4 mb-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                                        <div className="text-xs text-slate-500 mb-1">계약 기관</div>
                                        <div className="font-bold text-slate-800 dark:text-white">
                                            {contractData.schoolName}
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                                        <div className="text-xs text-slate-500 mb-1">
                                            {isTeacher ? '교사명' : '업체명'}
                                        </div>
                                        <div className="font-bold text-slate-800 dark:text-white">
                                            {contractData.applicantName}
                                        </div>
                                    </div>
                                </div>

                                {contractData.contractPeriod && (
                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                                        <div className="text-xs text-slate-500 mb-1">계약 기간</div>
                                        <div className="font-bold text-slate-800 dark:text-white">
                                            {contractData.contractPeriod}
                                        </div>
                                    </div>
                                )}

                                {contractData.salary && (
                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                                        <div className="text-xs text-slate-500 mb-1">
                                            {isTeacher ? '월 급여' : '계약 금액'}
                                        </div>
                                        <div className="font-bold text-slate-800 dark:text-white">
                                            {contractData.salary}원
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Terms Summary */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
                                <h4 className="font-bold text-sm text-blue-800 dark:text-blue-300 mb-3">
                                    주요 계약 조건
                                </h4>
                                <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-2">
                                    {isTeacher ? (
                                        <>
                                            <li>• 근무 시간: 학교장이 정하는 바에 따름</li>
                                            <li>• 4대 보험 가입 대상</li>
                                            <li>• 계약 해지 시 1개월 전 사전 통보</li>
                                            <li>• 복무 규정: 「교육공무원법」 준용</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>• 「지방계약법」 및 관련 규정 적용</li>
                                            <li>• 과업 수행 완료 후 검수 진행</li>
                                            <li>• 하자 보증 기간: 1년</li>
                                            <li>• 계약 불이행 시 계약 보증금 귀속</li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            {/* Signature Status */}
                            <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${isSigned
                                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                    : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                                }`}>
                                {isSigned ? (
                                    <>
                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        <div>
                                            <div className="font-bold text-green-800 dark:text-green-300 text-sm">서명 완료</div>
                                            <div className="text-xs text-green-600 dark:text-green-400">전자서명이 등록되었습니다.</div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                        <div>
                                            <div className="font-bold text-amber-800 dark:text-amber-300 text-sm">서명 대기</div>
                                            <div className="text-xs text-amber-600 dark:text-amber-400">계약 당사자의 서명이 필요합니다.</div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Legal Notice */}
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] text-slate-500 leading-relaxed">
                                <strong>⚠️ 법적 안내:</strong> 본 전자계약서는 참고용 초안입니다.
                                실제 계약은 학교 행정실을 통해 공식 문서로 진행해 주세요.
                                전자서명은 「전자문서 및 전자거래 기본법」에 따른 공인전자서명이 아닙니다.
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-between rounded-b-2xl">
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                            >
                                <Download className="w-4 h-4" /> PDF 다운로드
                            </button>

                            {canSign && !isSigned && (
                                <button
                                    onClick={() => setIsSignaturePadOpen(true)}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    <Pen className="w-4 h-4" /> 전자서명 하기
                                </button>
                            )}
                        </div>
                    </StandardCard>
                </div>
            </div>

            <SignaturePad
                isOpen={isSignaturePadOpen}
                onClose={() => setIsSignaturePadOpen(false)}
                onSubmit={handleSignature}
                contractInfo={{
                    jobTitle: contractData.jobTitle,
                    schoolName: contractData.schoolName
                }}
            />
        </>
    );
}
