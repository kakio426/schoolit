import React, { Suspense } from 'react';
import { Metadata } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StandardCard from '@/components/ui/StandardCard';
import StatsSection from './components/StatsSection';
import RecentActivitySection from './components/RecentActivitySection';
import DashboardHeader from './components/DashboardHeader';

export const metadata: Metadata = {
    title: 'Dashboard | Schoolit',
    description: '스쿨잇 대시보드 - 채용 및 매칭 관리',
};

// [Skeletons for Streaming]
function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700/50 rounded-2xl"></div>
            ))}
        </div>
    );
}

function ListSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700/50 rounded mb-4"></div>
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700/50 rounded-xl"></div>
            ))}
        </div>
    );
}

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* 1. Header (Client Component for User Interaction) */}
                <DashboardHeader />

                {/* 2. Stats Section (Async Server Component with Streaming) */}
                <Suspense fallback={<StatsSkeleton />}>
                    <StatsSection />
                </Suspense>

                {/* 3. Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity (Async Server Component) */}
                    <div className="lg:col-span-2">
                        <Suspense fallback={<ListSkeleton />}>
                            <RecentActivitySection />
                        </Suspense>
                    </div>

                    {/* Side Widgets (Static/Cached Content) */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            알림 & 공지
                        </h2>
                        <StandardCard className="p-5 space-y-4">
                            <div className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
                                <span className="text-primary font-bold">New</span>
                                <p className="text-sm text-slate-600 dark:text-slate-300">스쿨잇 서비스 이용 약관이 개정되었습니다.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-slate-400 font-bold">Tip</span>
                                <p className="text-sm text-slate-600 dark:text-slate-300">프로필 완성도를 100%로 채우면 매칭 확률이 올라갑니다!</p>
                            </div>
                        </StandardCard>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
