"use client";

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardPage() {
    const router = useRouter();
    const { stats, activity, isLoading } = useDashboard();

    const getStatLabel = (key: string) => {
        switch (key) {
            case 'activeApplications': return '지원 현황';
            case 'unreadMessages': return '새 메시지';
            case 'reMatchRate': return '다시 일하고 싶어요';
            case 'activeListings': return '운영 중인 공고';
            case 'pendingApplications': return '새로운 지원서';
            case 'unreadNotifications': return '읽지 않은 알림';
            default: return key;
        }
    };

    const getStatValue = (key: string, val: any) => {
        if (key === 'reMatchRate') return `${Math.round(val)}%`;
        return val;
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats && Object.entries(stats).map(([key, val]) => (
                        <div key={key} className="bg-surface p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                            <h3 className="text-foreground-muted text-sm font-medium">{getStatLabel(key)}</h3>
                            <p className="text-3xl font-bold mt-2 text-primary">{getStatValue(key, val)}</p>
                        </div>
                    ))}
                    {!stats && <div className="col-span-full text-center text-foreground-muted">데이터를 불러올 수 없습니다.</div>}
                </div>

                <div className="bg-surface p-8 rounded-3xl border border-slate-200/50 dark:border-slate-700 shadow-sm min-h-[400px]">
                    <h2 className="text-xl font-bold mb-6 text-foreground">최근 활동</h2>
                    <div className="space-y-4">
                        {activity.length === 0 ? (
                            <div className="py-20 text-center text-foreground-muted">활동 내역이 없습니다.</div>
                        ) : (
                            activity.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 p-4 hover:bg-surface-hover rounded-2xl transition-colors border border-transparent hover:border-slate-100/50 cursor-pointer"
                                    onClick={() => item.link && router.push(item.link)}
                                >
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-xl">
                                        {item.type === 'APPLICATION' ? '📨' : item.type === 'MESSAGE' ? '💬' : '🔔'}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-foreground">{item.title}</h4>
                                        <p className="text-xs text-foreground-muted mt-0.5 line-clamp-1">{item.content}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
