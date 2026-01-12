"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

import { TrustBadge } from '@/components/gamification/TrustBadge';

export default function DashboardHeader() {
    const { user } = useAuth();
    const router = useRouter();

    const getWelcomeMessage = () => {
        switch (user?.role) {
            case 'SCHOOL': return '오늘도 좋은 선생님을 찾아볼까요?';
            case 'TEACHER': return '새로운 수업 기회가 기다리고 있어요!';
            case 'BUSINESS': return '성공적인 행사 파트너가 되어주세요.';
            default: return '환영합니다!';
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-xl md:text-3xl font-bold text-foreground">
                            반갑습니다, {user?.name}님
                        </h1>
                        {user?.trustTier && <TrustBadge tier={user.trustTier} showLabel />}
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground">
                        {getWelcomeMessage()}
                    </p>
                </div>

                {/* Quick Actions (Desktop) */}
                <div className="hidden md:flex gap-3">
                    {user?.role === 'SCHOOL' && (
                        <button
                            onClick={() => router.push('/dashboard/jobs/new')}
                            className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20 active:scale-95"
                        >
                            + 공고 등록하기
                        </button>
                    )}
                    {user?.role === 'TEACHER' && (
                        <button
                            onClick={() => router.push('/dashboard/jobs')}
                            className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20 active:scale-95"
                        >
                            🔍 공고 찾기
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Actions (Mobile Horizontal Scroll) */}
            <div className="md:hidden w-full overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
                <div className="flex gap-3 min-w-max">
                    {user?.role === 'SCHOOL' && (
                        <button
                            onClick={() => router.push('/dashboard/jobs/new')}
                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md active:scale-95 whitespace-nowrap"
                        >
                            + 공고 등록
                        </button>
                    )}
                    {user?.role === 'TEACHER' && (
                        <button
                            onClick={() => router.push('/dashboard/jobs')}
                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md active:scale-95 whitespace-nowrap"
                        >
                            🔍 공고 찾기
                        </button>
                    )}
                    {/* Additional Quick Actions can go here */}
                    <button
                        onClick={() => router.push('/dashboard/messages')}
                        className="bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-zinc-700 px-4 py-2 rounded-lg text-sm font-bold active:scale-95 whitespace-nowrap"
                    >
                        💬 메시지
                    </button>
                </div>
            </div>
        </div>
    );
}
