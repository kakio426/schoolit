
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TUTORIAL_DATA, TutorialRole, TutorialStep } from '@/lib/tutorialData';
import { CheckCircle2, Star, MapPin, BadgeCheck, FileText } from 'lucide-react';

export default function TutorialSection() {
    const [activeRole, setActiveRole] = useState<TutorialRole>(TUTORIAL_DATA[0]);
    const [activeStepIndex, setActiveStepIndex] = useState(0);

    // Auto-advance steps every 5 seconds if not interacted with? 
    // Maybe better to let user control or auto-play. Let's do auto-play for now.
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveStepIndex((prev) => (prev + 1) % activeRole.steps.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [activeRole]);

    const handleRoleChange = (role: TutorialRole) => {
        setActiveRole(role);
        setActiveStepIndex(0);
    };

    return (
        <section className="pt-0 pb-24 px-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-4"
                    >
                        Easy Guide
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-white tracking-tight"
                    >
                        누구나 쉽게 시작할 수 있어요
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg max-w-2xl mx-auto"
                    >
                        학교도, 선생님도, 교육 업체도. School It에서는 복잡한 절차 없이 간편합니다.
                    </motion.p>
                </div>

                {/* Role Tabs */}
                <div className="flex justify-center mb-16">
                    <div className="flex bg-slate-800/50 p-1.5 rounded-full border border-white/10 backdrop-blur-sm overflow-x-auto max-w-full">
                        {TUTORIAL_DATA.map((role) => (
                            <button
                                key={role.id}
                                onClick={() => handleRoleChange(role)}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap relative ${activeRole.id === role.id
                                    ? 'text-white'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {activeRole.id === role.id && (
                                    <motion.div
                                        layoutId="activeRoleTab"
                                        className="absolute inset-0 bg-primary rounded-full shadow-lg shadow-primary/25"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{role.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left: Steps List */}
                    <div className="space-y-6">
                        {activeRole.steps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`relative p-6 rounded-3xl transition-all duration-300 cursor-pointer border ${index === activeStepIndex
                                    ? 'bg-slate-800 border-primary/50 shadow-xl shadow-primary/5 scale-100'
                                    : 'bg-transparent border-transparent hover:bg-slate-800/30 scale-95 opacity-60'
                                    }`}
                                onClick={() => setActiveStepIndex(index)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-2xl ${index === activeStepIndex
                                        ? 'bg-primary text-white'
                                        : 'bg-slate-700 text-slate-400'
                                        }`}>
                                        <step.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-bold mb-2 ${index === activeStepIndex ? 'text-white' : 'text-slate-300'
                                            }`}>
                                            {step.title}
                                        </h3>
                                        <p className="text-slate-400 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Bar for Active Step */}
                                {index === activeStepIndex && (
                                    <motion.div
                                        className="absolute bottom-0 left-0 h-1 bg-primary rounded-b-3xl"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 4, ease: "linear" }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right: Mock UI Display */}
                    <div className="relative h-[500px] w-full bg-slate-800 rounded-[40px] border border-white/5 shadow-2xl overflow-hidden flex items-center justify-center p-8 lg:p-12">
                        {/* Abstract Background Decoration */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-600/10" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full" />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${activeRole.id}-${activeStepIndex}`}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                                className="relative w-full max-w-sm"
                            >
                                <MockUI type={activeRole.steps[activeStepIndex].mockType} />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
}

// ------ Sub-component: Mock UI Implementations ------

function MockUI({ type }: { type: TutorialStep['mockType'] }) {
    switch (type) {
        case 'JOB_POST':
            return (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">🏫</div>
                        <div>
                            <div className="text-sm font-bold text-slate-800 dark:text-white">에듀핀 중학교</div>
                            <div className="text-[10px] text-slate-500">서울 강남구 | 2026.01.04</div>
                        </div>
                    </div>
                    <div className="space-y-2 mb-6">
                        <div className="text-lg font-bold text-slate-800 dark:text-white leading-tight">2026학년도 방과후<br />수학 교사 채용 공고</div>
                        <div className="text-xs text-slate-500 line-clamp-2">주 2회 기초 수학 지도 및 교재 활용 수업 진행 (경력자 우대)</div>
                    </div>
                    <div className="flex gap-2">
                        <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-500 text-[10px] font-bold">#방과후</div>
                        <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">#수학</div>
                    </div>
                    <div className="mt-6">
                        <div className="w-full py-2.5 bg-primary rounded-xl text-center text-white text-xs font-bold shadow-lg shadow-primary/20">공고 상세보기</div>
                    </div>
                </div>
            );
        case 'PROFILE_CARD':
            return (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-400 to-primary opacity-10"></div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 mx-auto rounded-full bg-slate-200 border-4 border-white dark:border-slate-900 shadow-lg mb-4 flex items-center justify-center text-3xl">
                            👩‍🏫
                        </div>
                        <div className="text-lg font-bold text-slate-800 dark:text-white mb-1">홍길동 선생님</div>
                        <div className="text-xs text-slate-500 mb-6">수학 교육 전공 | 중등 정교사 2급</div>

                        <div className="flex justify-center gap-4 mb-6">
                            <div className="text-center">
                                <div className="text-xs text-slate-400">경력</div>
                                <div className="font-bold text-slate-800 dark:text-white">5년</div>
                            </div>
                            <div className="w-px bg-slate-100 dark:bg-slate-800"></div>
                            <div className="text-center">
                                <div className="text-xs text-slate-400">지역</div>
                                <div className="font-bold text-slate-800 dark:text-white">서울</div>
                            </div>
                        </div>
                        <div className="w-full py-2.5 border border-primary text-primary rounded-xl font-bold text-sm">프로필 보기</div>
                    </div>
                </div>
            );
        case 'MATCH_SUCCESS':
            return (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-green-100 text-green-500 flex items-center justify-center mb-6 animate-bounce">
                        <CheckCircle2 size={40} strokeWidth={3} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">매칭 성공!</h3>
                    <p className="text-slate-500 text-sm mb-6">
                        홍길동 선생님과<br />매칭이 완료되었습니다.
                    </p>
                    <div className="flex -space-x-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white dark:border-slate-900 flex items-center justify-center text-sm">🏫</div>
                        <div className="w-10 h-10 rounded-full bg-slate-300 border-2 border-white dark:border-slate-900 flex items-center justify-center text-sm">👩‍🏫</div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-green-500"
                        />
                    </div>
                    <div className="mt-4 text-[10px] text-slate-400 font-mono">2026.01.04 SUCCESS</div>
                </div>
            );
        case 'CERTIFICATION':
            return (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative">
                    <div className="absolute -top-3 -right-3 bg-blue-500 text-white p-2 rounded-xl shadow-lg transform rotate-12">
                        <BadgeCheck size={24} />
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <FileText size={24} className="text-slate-500" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-800 dark:text-white">교원 자격증 (수학)</div>
                            <div className="text-[10px] text-slate-500">제 2026-123456호</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm py-2 border-b border-slate-50 dark:border-slate-800">
                            <span className="text-slate-400">상태</span>
                            <span className="text-green-600 font-bold bg-green-50 px-2 rounded">인증됨</span>
                        </div>
                        <div className="flex justify-between text-sm py-2 border-b border-slate-50 dark:border-slate-800">
                            <span className="text-slate-400">발급기관</span>
                            <span className="text-slate-600 dark:text-slate-300">교육부</span>
                        </div>
                    </div>
                    <div className="mt-6 flex gap-2">
                        <div className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] text-center text-slate-500">상세 정보</div>
                        <div className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] text-center text-slate-500">사본 다운로드</div>
                    </div>
                </div>
            );
        case 'PORTFOLIO':
            return (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl">📸</div>
                            <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400">2026 코딩 캠프</div>
                        </div>
                        <div className="space-y-3 mt-8">
                            <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl">🎥</div>
                            <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400">방과후 학교 홍보</div>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-slate-50 rounded-xl flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-xs">📊</div>
                        <div className="text-xs text-slate-500">지난달 조회수 <span className="font-bold text-primary">1,234</span></div>
                    </div>
                </div>
            );
        default:
            return null;
    }
}
