"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logout } = useAuth();
    const { unreadCount } = useSocket();
    const router = useRouter();
    const pathname = usePathname();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        // În a real app, you might redirect to login here
        // router.push('/');
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-4">
                <h2 className="text-xl font-bold italic text-foreground-muted">Unauthorized</h2>
                <button
                    onClick={() => router.push('/')}
                    className="text-primary underline"
                >
                    Back to Login
                </button>
            </div>
        );
    }

    const navItems = [
        { label: '대시보드', href: '/dashboard', icon: '🏠' },
        { label: '메시지', href: '/dashboard/messages', icon: '💬' },
    ];

    if (user?.role === 'SCHOOL') {
        navItems.push(
            { label: '학교 프로필', href: '/dashboard/school/profile', icon: '🏫' },
            { label: '채용 공고 관리', href: '/dashboard/jobs', icon: '📋' },
            { label: '인재 찾기', href: '/dashboard/teachers', icon: '🔎' },
        );
    } else {
        // Teacher or others
        navItems.push(
            { label: '채용 공고 찾기', href: '/dashboard/jobs', icon: '📋' },
            { label: '지원 현황', href: '/dashboard/applications', icon: '📨' },
            { label: '프로필 관리', href: '/dashboard/profile', icon: '👤' },
        );
    }

    // Common settings
    navItems.push({ label: '설정', href: '#', icon: '⚙️' });

    if (user?.role === 'ADMIN') {
        navItems.push({ label: '인증 관리', href: '/dashboard/admin', icon: '🛡️' });
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden text-foreground">
            {/* Sidebar */}
            <aside className="w-64 bg-surface border-r border-slate-200/50 dark:border-slate-700 hidden md:flex flex-col shadow-sm">
                <div className="p-6">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🎓</span>
                        <h1 className="text-xl font-bold text-foreground">School It</h1>
                    </div>
                </div>
                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto font-sans">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        return (
                            <a
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'text-foreground-muted hover:bg-surface-hover hover:text-foreground'
                                    }`}
                            >
                                <span className={`text-lg transition-transform duration-200 group-hover:scale-110 ${isActive ? '' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                                    {item.icon}
                                </span>
                                <span className="font-medium">{item.label}</span>
                                {item.label === '메시지' && unreadCount > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-surface">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </a>
                        )
                    })}
                </nav>
                <div className="p-4 border-t border-slate-100/10">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors group"
                    >
                        <span className="text-lg group-hover:rotate-12 transition-transform">🚪</span>
                        로그아웃
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <header className="h-16 bg-surface border-b border-slate-200/50 dark:border-slate-700 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 shadow-sm">
                    <h2 className="text-base md:text-lg font-bold text-foreground">
                        반갑습니다, <span className="text-primary">{user.name}</span>님
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary ring-2 ring-primary/20">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </header>
                <main className="p-4 md:p-8 max-w-[1200px] w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
