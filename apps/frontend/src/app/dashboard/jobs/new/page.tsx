'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import HiringWizard from '@/components/jobs/wizard/HiringWizard';

export default function NewJobPage() {
    const { user } = useAuth();
    // Default guide steps - wizard state manages actual job type, here we just show Teacher guide by default or make it dynamic if we lift state up.
    // Ideally Wizard should tell us the type, but for simplicity we can just show general tips or keep it static for now.
    // Or we can just let Wizard handle everything spread out.
    // Let's keep the sidebar but make it static or "General Guide".
    // Actually, Wizard manages jobType state internally.
    // To update sidebar dynamically, we'd need to lift state. 
    // Given the complexity, let's just show "Hiring Guide" generically or hide it for the wizard mode to focus attention.
    // The Plan says "Compliance Guard" is inside the wizard.
    // I will remove the sidebar to give full focus to the wizard (better UX for multi-step).
    // Or keep it simple.

    if (user?.role !== 'SCHOOL') {
        return <DashboardLayout><div className="text-center py-20 text-foreground-muted">접근 권한이 없습니다.<br />공고 등록은 학교/업무 담당 교사만 가능합니다.</div></DashboardLayout>
    }

    // 🚨 프로필 유무 체크 (학교 프로필이 없으면 공고 등록 불가)
    if (!user?.schoolProfile) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-6xl mb-2">🏫</div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">잠깐! 학교 프로필이 필요해요</h2>
                        <p className="text-zinc-400 max-w-md mx-auto leading-relaxed">
                            공고를 등록하려면 먼저 <strong>학교 정보(학교명, 주소 등)</strong>가 등록되어 있어야 합니다.<br />
                            신뢰할 수 있는 매칭을 위해 프로필을 먼저 완성해주세요.
                        </p>
                    </div>
                    <a
                        href="/dashboard/profile/edit"
                        className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                        학교 프로필 등록하러 가기 →
                    </a>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">🧙‍♂️</span>
                        <h1 className="text-2xl font-bold text-foreground">채용/공고 등록 마법사</h1>
                    </div>
                    <p className="text-foreground-muted">복잡한 규정과 절차, 마법사가 안내하는 대로 따라오시면 Compliance 걱정 없이 안전하게 등록할 수 있습니다.</p>
                </div>

                <div className="bg-surface rounded-[40px] border border-border shadow-xl p-8 md:p-12 relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>

                    <HiringWizard />
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-foreground-muted">
                        * 등록된 공고는 교육청 지침 및 S2B(학교장터) 연계 규정을 준수해야 합니다.<br />
                        * 문의사항: 행정실 또는 정보부 (내선 123)
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
