import React from 'react';
import { cookies } from 'next/headers';
import StandardCard from '@/components/ui/StandardCard';

// 타입 정의
interface Activity {
    id?: number;
    title?: string;
    description?: string;
    createdAt: string;
}

async function getRecentActivities(): Promise<Activity[]> {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    if (!token) return [];

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://schoolit.shop';
        const res = await fetch(`${apiUrl}/dashboard/activity`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store',
        });
        if (!res.ok) return [];
        return res.json();
    } catch (e) {
        console.error(e);
        return [];
    }
}

export default async function RecentActivitySection() {
    const activities = await getRecentActivities();

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                최근 활동
            </h2>
            {activities && activities.length > 0 ? (
                <div className="space-y-4">
                    {activities.map((activity, idx) => (
                        <StandardCard key={activity.id ?? idx} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl">
                                📌
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">{activity.title || '활동 내역'}</p>
                                <p className="text-sm text-slate-500">{activity.description || '상세 내용이 없습니다.'}</p>
                            </div>
                            <div className="ml-auto text-xs text-slate-400">
                                {new Date(activity.createdAt).toLocaleDateString()}
                            </div>
                        </StandardCard>
                    ))}
                </div>
            ) : (
                <div className="h-48 flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400">
                    아직 최근 활동 내역이 없습니다.
                </div>
            )}
        </div>
    );
}

