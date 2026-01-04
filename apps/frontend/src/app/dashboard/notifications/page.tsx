"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { useSocket } from '@/contexts/SocketContext';

interface Notification {
    id: number;
    title: string;
    content: string;
    type: string;
    isRead: boolean;
    link?: string;
    createdAt: string;
}

export default function NotificationsPage() {
    const router = useRouter();
    const { markNotificationAsRead } = useSocket();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await api.get<Notification[]>('/notifications');
            setNotifications(data);
        } catch (e) {
            console.error('Failed to fetch notifications', e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRead = async (id: number, link?: string) => {
        try {
            await markNotificationAsRead(id);
            // Update local state to reflect read status immediately
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

            if (link) {
                router.push(link);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleReadAll = async () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
        if (unreadIds.length === 0) return;

        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

            // Server update (sequential or parallel)
            // Ideally backend should have a 'mark-all-read' endpoint, but we loop for now or relying on socket
            // For now, we just call reading for each visible unread one. 
            // Ideally implementation: await api.patch('/notifications/read-all');

            // Since we don't have read-all API, we just refresh after a moment or let socket handle it individually if feasible.
            // But let's just mark them individually for now to be safe.
            await Promise.all(unreadIds.map(id => markNotificationAsRead(id)));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">알림 센터</h1>
                        <p className="text-foreground-muted text-sm mt-1">받은 모든 알림을 확인하세요.</p>
                    </div>
                    {notifications.some(n => !n.isRead) && (
                        <button
                            onClick={handleReadAll}
                            className="text-sm font-bold text-primary hover:bg-primary/10 px-4 py-2 rounded-xl transition-colors"
                        >
                            ✓ 모두 읽음으로 표시
                        </button>
                    )}
                </div>

                <div className="bg-surface rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[400px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-foreground-muted">
                            <span className="text-4xl mb-4">🔕</span>
                            <p>새로운 알림이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => handleRead(n.id, n.link)}
                                    className={`p-6 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${!n.isRead ? 'bg-primary/5' : ''}`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${!n.isRead ? 'bg-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                        {n.type === 'APPLICATION' ? '📨' : n.type === 'SUGGESTION' ? '🎁' : n.type === 'STATUS_UPDATE' ? '📢' : '🔔'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <h3 className={`text-base mb-1 ${!n.isRead ? 'font-bold text-primary' : 'font-semibold text-foreground'}`}>
                                                {n.title}
                                            </h3>
                                            <span className="text-xs text-foreground-muted whitespace-nowrap">
                                                {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-foreground-muted text-sm leading-relaxed">
                                            {n.content}
                                        </p>
                                    </div>
                                    {!n.isRead && (
                                        <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
