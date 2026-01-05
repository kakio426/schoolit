"use client";

import React, { useState, useEffect } from 'react';
import { Role } from '@/lib/constants';

interface ComplianceModalProps {
    userRole: Role;
    onAccept: () => void;
}

export default function ComplianceModal({ userRole, onAccept }: ComplianceModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Only show once per session or use localStorage for persistent dismissal
        const hasAccepted = sessionStorage.getItem('complianceAccepted');
        if (!hasAccepted) {
            setIsOpen(true);
        }
    }, []);

    const handleAccept = () => {
        sessionStorage.setItem('complianceAccepted', 'true');
        setIsOpen(false);
        onAccept();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-surface w-full max-w-lg rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                <div className="p-8 md:p-12">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-4xl mb-8 mx-auto shadow-inner">
                        🛡️
                    </div>

                    <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-6 text-center leading-tight">
                        안전한 매칭을 위한 <br />필수 안내 및 동의
                    </h2>

                    <div className="space-y-6 text-foreground-muted leading-relaxed mb-10">
                        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                서비스 성격 (Research Prototype)
                            </p>
                            <p className="text-xs">
                                본 서비스는 교육 정보화 및 인력 매칭 효율화를 위한 **연구용 프로토타입**입니다. 영리 목적이 없으며, 정식 채용 대행 기관이 아닙니다.
                            </p>
                        </div>

                        <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                            <p className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                                행정 및 법적 계약 준수
                            </p>
                            <p className="text-xs">
                                본 매칭 결과와 제공되는 정보는 **단순 참고용**입니다. 실제 채용 계약 및 용역 거래(S2B 등)는 반드시 **학교 내부 행정 지침 및 교육청 규정**에 따라 별도로 진행해야 합니다.
                            </p>
                        </div>

                        <div className="p-5 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                            <p className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                                정보 확인 책임
                            </p>
                            <p className="text-xs">
                                지원자의 자격 증명 및 신원 확인에 대한 최종 책임은 **학교(채용 주체)**에 있습니다. 플랫폼은 자격의 진위 여부를 보증하지 않습니다.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleAccept}
                        className="w-full py-5 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.98] text-lg"
                    >
                        모든 내용을 확인했으며 동의합니다
                    </button>

                    <p className="text-[10px] text-center text-slate-400 mt-6">
                        본 동의는 세션 동안 유효하며, 서비스 이용 시 법적 고지 사항을 준수할 것에 동의하는 것으로 간주됩니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
