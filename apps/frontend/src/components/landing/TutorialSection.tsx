
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
        <section className="py-24 px-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
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
                                        layoutId="stepProgress"
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
                            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded"></div>
                        </div>
                    </div>
                    <div className="space-y-3 mb-6">
                        <div className="h-8 w-3/4 bg-slate-800 dark:bg-slate-200 rounded-lg"></div>
                        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                        <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800 rounded"></div>
                    </div>
                    <div className="flex gap-2">
                        <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-500 text-xs font-bold">#방과후</div>
                        <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">#서울</div>
                    </div>
                    <div className="mt-6">
                        <div className="w-full py-3 bg-primary rounded-xl"></div>
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
                        <div className="h-6 w-32 mx-auto bg-slate-800 dark:bg-slate-200 rounded mb-2"></div>
                        <div className="h-4 w-48 mx-auto bg-slate-100 dark:bg-slate-800 rounded mb-6"></div>

                        <div className="flex justify-center gap-4 mb-6">
                            <div className="text-center">
                                <div className="text-xs text-slate-400">경력</div>
                                <div className="font-bold text-slate-800 dark:text-white">5년</div>
                            </div>
                            <div className="w-px bg-slate-100 dark:bg-slate-800"></div>
                            <div className="text-center">
                                <div className="text-xs text-slate-400">평점</div>
                                <div className="font-bold text-amber-500">4.9</div>
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
                        <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white dark:border-slate-900"></div>
                        <div className="w-10 h-10 rounded-full bg-slate-300 border-2 border-white dark:border-slate-900"></div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-green-500"></div>
                    </div>
                </div>
            );
        case 'CERTIFICATION':
            return (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative">
                    <div className="absolute -top-3 -right-3 bg-blue-500 text-white p-2 rounded-xl shadow-lg transform rotate-12">
                        <BadgeCheck size={24} />
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-slate-100 rounded-xl">
                            <FileText size={24} className="text-slate-500" />
                        </div>
                        <div>
                            <div className="h-4 w-24 bg-slate-800 dark:bg-slate-200 rounded mb-1"></div>
                            <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded"></div>
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
                        <div className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                        <div className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                    </div>
                </div>
            );
        case 'PORTFOLIO':
            return (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="aspect-square bg-slate-100 rounded-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded"></div>
                        </div>
                        <div className="space-y-3 mt-8">
                            <div className="aspect-square bg-slate-100 rounded-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
                            </div>
                            <div className="h-3 w-3/4 bg-slate-100 rounded"></div>
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
