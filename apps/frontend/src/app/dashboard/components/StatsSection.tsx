import React from 'react';
import { cookies } from 'next/headers';

async function getStats() {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    if (!token) return {};

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store',
        });
        if (!res.ok) return {};
        return res.json();
    } catch (e) {
        return {};
    }
}

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: string, color: string }) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
        </div>
    );
}

export default async function StatsSection() {
    const stats = await getStats();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                label="진행 중인 공고"
                value={stats.activeListings || stats.activeJobs || 0}
                icon="📋"
                color="blue"
            />
            <StatCard
                label="받은 지원서"
                value={stats.pendingApplications || 0}
                icon="📨"
                color="green"
            />
            <StatCard
                label="읽지 않은 메시지"
                value={stats.unreadMessages || 0}
                icon="💬"
                color="yellow"
            />
            <StatCard
                label="알림"
                value={stats.unreadNotifications || 0}
                icon="🔔"
                color="purple"
            />
        </div>
    );
}
