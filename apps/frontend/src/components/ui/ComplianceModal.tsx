"use client";

import React, { useState, useEffect } from 'react';
import { Role } from '@/lib/constants';
import { ShieldCheck, Info, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComplianceModalProps {
    userRole: Role;
    onAccept: () => void;
}

export default function ComplianceModal({ userRole, onAccept }: ComplianceModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
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
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-zinc-900 w-full max-w-[460px] rounded-[32px] shadow-2xl border border-white/[0.08] overflow-hidden"
                    >
                        <div className="p-8 md:p-10">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex flex-col items-center text-center mb-10"
                            >
                                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6 border border-blue-500/20 shadow-inner">
                                    <ShieldCheck size={32} strokeWidth={1.5} />
                                </div>

                                <h2 className="text-2xl md:text-[26px] font-bold text-white tracking-tight leading-loose">
                                    안전한 매칭을 위한 <br />
                                    <span className="text-zinc-400">필수 안내 및 동의</span>
                                </h2>
                            </motion.div>

                            <div className="space-y-4 mb-10">
                                {[
                                    {
                                        icon: <Info size={18} className="text-blue-400" />,
                                        title: "서비스 성격 (Research Prototype)",
                                        text: "본 플랫폼은 교육 정보화 및 인력 매칭 효율화를 위한 연구용 프로토타입입니다. 영리 목적이 없으며, 정식 채용 대행 기관이 아님을 안내드립니다."
                                    },
                                    {
                                        icon: <Shield size={18} className="text-indigo-400" />,
                                        title: "행정 및 법적 계약 준수",
                                        text: "매칭 결과는 참고용이며, 실제 채용 및 거래는 반드시 학교 내부 행정 지침 및 규정에 따라 별도로 진행해야 합니다."
                                    },
                                    {
                                        icon: <AlertCircle size={18} className="text-amber-400" />,
                                        title: "정보 확인 책임",
                                        text: "지원자의 신원 및 자격 증명에 대한 최종 확인 책임은 채용 주체(학교)에 있습니다. 플랫폼은 자격의 진위 여부를 보증하지 않습니다."
                                    }
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                        className="p-5 bg-white/[0.03] rounded-2xl border border-white/[0.05] hover:bg-white/[0.05] transition-colors group"
                                    >
                                        <div className="flex items-center gap-3 mb-2.5">
                                            <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                                                {item.icon}
                                            </div>
                                            <h3 className="text-[15px] font-semibold text-zinc-100">
                                                {item.title}
                                            </h3>
                                        </div>
                                        <p className="text-[13px] leading-[1.6] text-zinc-400">
                                            {item.text}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-col gap-4"
                            >
                                <button
                                    onClick={handleAccept}
                                    className="group relative w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden"
                                >
                                    <span className="relative z-10">모든 내용을 확인했으며 동의합니다</span>
                                    <CheckCircle2 size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                </button>

                                <p className="text-[11px] text-center text-zinc-500 leading-tight">
                                    본 동의는 현재 세션 동안 유효하며 <br />
                                    서비스 이용 시 법적 고지 사항을 준수함에 동의하는 것으로 간주됩니다.
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
