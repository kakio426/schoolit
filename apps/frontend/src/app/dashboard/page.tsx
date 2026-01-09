"use client";

import React from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/hooks/useDashboard';
import { Bell, Mail, Briefcase, FileText, TrendingUp, Clock, ChevronRight } from 'lucide-react';

// Stat card configuration with icons and links
const statConfig: Record<string, { icon: React.ElementType; link: string; color: string }> = {
    unreadNotifications: { icon: Bell, link: '/dashboard/notifications', color: 'text-amber-400 bg-amber-500/20' },
    unreadMessages: { icon: Mail, link: '/dashboard/messages', color: 'text-blue-400 bg-blue-500/20' },
    activeListings: { icon: Briefcase, link: '/dashboard/jobs', color: 'text-violet-400 bg-violet-500/20' },
    pendingApplications: { icon: FileText, link: '/dashboard/applications', color: 'text-emerald-400 bg-emerald-500/20' },
    activeApplications: { icon: FileText, link: '/dashboard/applications', color: 'text-cyan-400 bg-cyan-500/20' },
    reMatchRate: { icon: TrendingUp, link: '/dashboard/profile', color: 'text-pink-400 bg-pink-500/20' },
};

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
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* ========================================== */}
                {/* BENTO GRID - Statistics Cards */}
                {/* ========================================== */}
                <section>
                    <h2 className="text-lg font-semibold text-white mb-4">📊 Overview</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats && Object.entries(stats).map(([key, val]) => {
                            const config = statConfig[key] || { icon: Bell, link: '/dashboard', color: 'text-slate-400 bg-slate-500/20' };
                            const IconComponent = config.icon;

                            return (
                                <Link
                                    key={key}
                                    href={config.link}
                                    className="group relative h-32 bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-800 hover:border-slate-600 hover:scale-[1.02] cursor-pointer transition-all duration-200 overflow-hidden"
                                >
                                    {/* Icon in top-right corner */}
                                    <div className={`absolute top-3 right-3 w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                                        <IconComponent className="w-5 h-5" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col justify-end h-full">
                                        <p className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                            {getStatValue(key, val)}
                                        </p>
                                        <p className="text-sm text-slate-400 mt-1">
                                            {getStatLabel(key)}
                                        </p>
                                    </div>

                                    {/* Hover indicator */}
                                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight className="w-4 h-4 text-slate-500" />
                                    </div>
                                </Link>
                            );
                        })}
                        {!stats && (
                            <div className="col-span-full text-center text-slate-400 py-8">
                                데이터를 불러올 수 없습니다.
                            </div>
                        )}
                    </div>
                </section>

                {/* ========================================== */}
                {/* RECENT ACTIVITY - Clean List Style */}
                {/* ========================================== */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-slate-400" />
                            최근 활동
                        </h2>
                        {activity.length > 0 && (
                            <Link
                                href="/dashboard/notifications"
                                className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                            >
                                전체 보기 <ChevronRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>

                    {activity.length === 0 ? (
                        <div className="py-16 text-center bg-slate-800/30 border border-slate-700/50 rounded-xl">
                            <div className="text-4xl mb-3">📭</div>
                            <p className="text-slate-400">활동 내역이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {activity.map((item, index) => (
                                <div
                                    key={item.id}
                                    onClick={() => item.link && router.push(item.link)}
                                    className="group flex items-center gap-4 p-4 bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 rounded-lg cursor-pointer transition-all"
                                >
                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === 'APPLICATION' ? 'bg-emerald-500/20 text-emerald-400' :
                                            item.type === 'MESSAGE' ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-amber-500/20 text-amber-400'
                                        }`}>
                                        {item.type === 'APPLICATION' ? (
                                            <FileText className="w-5 h-5" />
                                        ) : item.type === 'MESSAGE' ? (
                                            <Mail className="w-5 h-5" />
                                        ) : (
                                            <Bell className="w-5 h-5" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-white text-sm truncate group-hover:text-blue-400 transition-colors">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                                            {item.content}
                                        </p>
                                    </div>

                                    {/* Time */}
                                    <div className="flex-shrink-0 text-right">
                                        <p className="text-[10px] text-slate-500">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-[10px] text-slate-600">
                                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    {/* Arrow */}
                                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
}
