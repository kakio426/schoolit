"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

import { api } from '@/lib/api';

export default function SettingsPage() {
    const { user, refreshProfile } = useAuth();
    const { theme, setTheme } = useTheme();
    const [notifications, setNotifications] = useState({
        newMatch: true,
        messages: true,
        marketing: false
    });

    // Load initial settings
    useEffect(() => {
        if (user && user.notificationSettings) {
            setNotifications(prev => ({
                ...prev,
                ...(user.notificationSettings as any)
            }));
        }
    }, [user]);

    const toggleNotification = async (key: keyof typeof notifications) => {
        const newState = { ...notifications, [key]: !notifications[key] };
        setNotifications(newState);

        try {
            await api.patch('/users/settings', newState);
            await refreshProfile();
        } catch (e) {
            console.error('Failed to save settings', e);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">설정</h1>
                    <p className="text-foreground-muted">계정 정보 및 서비스 환경을 관리하세요.</p>
                </div>

                <div className="grid gap-6">
                    {/* Account Section */}
                    <section className="bg-surface p-8 rounded-[32px] border border-slate-200/50 dark:border-slate-700 shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="text-2xl">👤</span> 계정 정보
                        </h2>
                        <div className="space-y-6 text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-foreground-muted font-medium ml-1">이메일</label>
                                    <div className="px-4 py-3 bg-background/50 rounded-xl border border-slate-200/30 dark:border-slate-800 text-foreground font-medium">
                                        {user?.email}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-foreground-muted font-medium ml-1">이름</label>
                                    <div className="px-4 py-3 bg-background/50 rounded-xl border border-slate-200/30 dark:border-slate-800 text-foreground font-medium">
                                        {user?.name}
                                    </div>
                                </div>
                            </div>
                            <button className="px-6 py-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-all text-xs">
                                비밀번호 변경하기
                            </button>
                        </div>
                    </section>

                    {/* Theme Section */}
                    <section className="bg-surface p-8 rounded-[32px] border border-slate-200/50 dark:border-slate-700 shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="text-2xl">🎨</span> 테마 설정
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { id: 'light', label: '라이트 모드', icon: '☀️' },
                                { id: 'dark', label: '다크 모드', icon: '🌙' },
                                { id: 'system', label: '시스템 설정', icon: '🖥️' }
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id as any)}
                                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${theme === t.id
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 text-foreground-muted'
                                        }`}
                                >
                                    <span className="text-2xl">{t.icon}</span>
                                    <span className="text-xs font-bold">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Notification Section */}
                    <section className="bg-surface p-8 rounded-[32px] border border-slate-200/50 dark:border-slate-700 shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="text-2xl">🔔</span> 알림 설정
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 hover:bg-surface-hover rounded-2xl transition-all border border-transparent hover:border-slate-100/10">
                                <div>
                                    <h4 className="font-semibold text-foreground">새로운 매칭 알림</h4>
                                    <p className="text-xs text-foreground-muted">채용 공고 지원 및 매칭 상태 변경 시 알려드립니다.</p>
                                </div>
                                <button
                                    onClick={() => toggleNotification('newMatch')}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${notifications.newMatch ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications.newMatch ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 hover:bg-surface-hover rounded-2xl transition-all border border-transparent hover:border-slate-100/10">
                                <div>
                                    <h4 className="font-semibold text-foreground">메시지 알림</h4>
                                    <p className="text-xs text-foreground-muted">새로운 쪽지나 채팅 메시지가 도착하면 알려드립니다.</p>
                                </div>
                                <button
                                    onClick={() => toggleNotification('messages')}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${notifications.messages ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications.messages ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 hover:bg-surface-hover rounded-2xl transition-all border border-transparent hover:border-slate-100/10">
                                <div>
                                    <h4 className="font-semibold text-foreground">마케팅 정보 수신</h4>
                                    <p className="text-xs text-foreground-muted">새로운 소식 및 혜택 정보를 받아보실 수 있습니다.</p>
                                </div>
                                <button
                                    onClick={() => toggleNotification('marketing')}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${notifications.marketing ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications.marketing ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="bg-red-50/50 dark:bg-red-900/10 p-8 rounded-[32px] border border-red-200/50 dark:border-red-900/30">
                        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-6 flex items-center gap-2">
                            <span className="text-2xl">⚠️</span> 위험 구역
                        </h2>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <p className="text-sm text-red-500/80 font-medium">계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.</p>
                            <button className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all text-xs shrink-0">
                                계정 탈퇴하기
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}
