"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { JobApplication } from '@/types';
import SignaturePad from '@/components/ui/SignaturePad';
import { FileText, ShieldCheck, Download, CheckCircle2 } from 'lucide-react';

export default function ContractSignPage() {
    const { id } = useParams();
    const router = useRouter();
    const [application, setApplication] = useState<JobApplication | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSigned, setIsSigned] = useState(false);
    const [signatureData, setSignatureData] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchApplication();
    }, [id]);

    const fetchApplication = async () => {
        try {
            // application/me에서 해당 ID 찾기 (또는 상세 조회 API가 있다면 사용)
            const data = await api.get<JobApplication[]>('/applications/me');
            const found = data.find(a => a.id === Number(id));
            if (found) {
                setApplication(found);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignComplete = (dataUrl: string) => {
        setSignatureData(dataUrl);
    };

    const handleSubmit = async () => {
        if (!signatureData) {
            alert('먼저 서명을 해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            // 실제 서비스에서는 서명 이미지를 서버에 저장해야 함.
            // 여기서는 상태를 'CONTRACTED' (또는 HIRED 등)로 업데이트하여 프로세스 진행
            await api.patch(`/applications/${id}/status`, { status: 'HIRED' });
            setIsSigned(true);
            setTimeout(() => {
                router.push('/dashboard/applications');
            }, 2000);
        } catch (e: any) {
            alert(e.message || '계약 서명 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <DashboardLayout><div className="p-20 text-center">로딩 중...</div></DashboardLayout>;
    if (!application) return <DashboardLayout><div className="p-20 text-center">계약 정보를 찾을 수 없습니다.</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                        <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">전자 계약서 서명</h1>
                        <p className="text-foreground-muted text-sm">내용을 확인하신 후 하단에 서명해 주세요.</p>
                    </div>
                </div>

                {isSigned ? (
                    <div className="bg-surface rounded-[40px] border border-emerald-100 dark:border-emerald-900/30 p-12 text-center shadow-2xl shadow-emerald-500/10">
                        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 animate-bounce">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-3">계약 체결 완료!</h2>
                        <p className="text-foreground-muted mb-8 leading-relaxed">
                            전자 서명이 정상적으로 처리되었습니다.<br />
                            잠시 후 지원 현황 페이지로 이동합니다.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Contract Content Card */}
                        <div className="bg-surface rounded-[32px] border border-border overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-border bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                                <span className="font-bold text-foreground">표준 근로 계약서 (간이)</span>
                                <button
                                    onClick={() => api.downloadFile(`/applications/${id}/contract`, `contract_draft_${id}.pdf`)}
                                    className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm flex items-center gap-2 text-xs font-bold"
                                >
                                    <Download className="w-3 h-3" /> PDF로 보기
                                </button>
                            </div>
                            <div className="p-8 space-y-6 text-sm text-foreground leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950">
                                <div className="text-center font-bold text-lg mb-8 underline">표준 근로 계약서</div>
                                <p><strong>1. 계약 당사자</strong></p>
                                <p>갑 (학교명): {application.jobListing?.schoolProfile?.schoolName || '해당 학교'}</p>
                                <p>을 (근로자): {application.user?.name || '지원자'}</p>

                                <p className="mt-6"><strong>2. 근로 기간</strong></p>
                                <p>{application.jobListing?.title} 공고에 명시된 기간 및 수행 기간</p>

                                <p className="mt-6"><strong>3. 근로 장소 및 업무 내용</strong></p>
                                <p>학교 지정 장소 및 해당 과목/프로그램 운영</p>

                                <p className="mt-6"><strong>4. 기타 준수 사항</strong></p>
                                <ul className="list-disc ml-4 space-y-2">
                                    <li>을은 학교의 교육 정상화와 학생 지도를 위해 최선을 다한다.</li>
                                    <li>본 계약은 '스쿨잇(Schoolit)' 플랫폼을 통한 전자 서명으로 효력을 발생한다.</li>
                                    <li>관련 증빙 서류에 결격 사유가 있을 시 계약이 취소될 수 있다.</li>
                                </ul>

                                <div className="pt-12 text-center text-xs text-slate-400">
                                    본 계약은 전자문서 및 전자거래 기본법에 따라 법적 효력을 갖습니다.
                                </div>
                            </div>
                        </div>

                        {/* Signature Pad Section */}
                        <div className="bg-surface rounded-[32px] border border-border p-8 shadow-sm">
                            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                본인 서명
                            </h2>
                            <SignaturePad onSave={handleSignComplete} />

                            <div className="mt-8">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !signatureData}
                                    className="w-full py-5 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? '처리 중...' : '계약서 서명 및 제출하기'}
                                </button>
                                <p className="text-center text-foreground-muted text-xs mt-4">
                                    서명을 제출하면 학교 담당자에게 즉시 통보됩니다.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
