"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    대시보드
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    {getWelcomeMessage()}
                </p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
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
    );
}
