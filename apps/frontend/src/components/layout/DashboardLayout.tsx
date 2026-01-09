"use client";

import React, { useState, useEffect } from 'react';
import UnauthorizedView from '../auth/UnauthorizedView';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter, usePathname } from 'next/navigation';
import FooterDisclaimer from './FooterDisclaimer';
import FeedbackButton from '../ui/FeedbackButton';
import ComplianceModal from '../ui/ComplianceModal';
import VerificationPendingView from '../auth/VerificationPendingView';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logout } = useAuth();
    const { unreadMessageCount, unreadNotificationCount, notifications, markNotificationAsRead } = useSocket();
    const { theme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setShowNotifications(false);
    }, [pathname]);

    // ... (keep existing render logic) ... 

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return <UnauthorizedView />;
    }

    // Redirect PENDING users to onboarding
    if (user.role === 'PENDING' && !pathname.startsWith('/onboarding')) {
        router.push('/onboarding/role');
        return null;
    }

    const navItems = [
        { label: '대시보드', href: '/dashboard', icon: '🏠' },
    ];

    if (user?.role === 'ADMIN') {
        // Admin-specific menu
        navItems.push(
            { label: '인증 관리', href: '/dashboard/admin', icon: '🛡️' },
            { label: '사용자 관리', href: '/dashboard/admin/users', icon: '👥' },
            { label: '리뷰 관리', href: '/dashboard/admin/reviews', icon: '⭐' },
            { label: '공지 발송', href: '/dashboard/admin/notifications', icon: '📣' },
            { label: '피드백 센터', href: '/dashboard/admin/feedback', icon: '📢' },
            { label: '설정', href: '/dashboard/settings', icon: '⚙️' }
        );
    } else {
        // Regular user menu
        navItems.push({ label: '메시지', href: '/dashboard/messages', icon: '💬' });

        if (user?.role === 'SCHOOL') {
            navItems.push(
                { label: '학교 프로필', href: '/dashboard/school/profile', icon: '🏫' },
                { label: '채용 공고 관리', href: '/dashboard/jobs', icon: '📋' },
                { label: '지원 현황', href: '/dashboard/applications', icon: '📨' },
                { label: '인재 찾기', href: '/dashboard/teachers', icon: '🔎' },
            );
        } else if (user?.role === 'TEACHER') {
            navItems.push(
                { label: '채용 공고 찾기', href: '/dashboard/jobs', icon: '📋' },
                { label: '지원 현황', href: '/dashboard/applications', icon: '📨' },
                { label: '프로필 관리', href: '/dashboard/profile', icon: '👤' },
            );
        } else {
            navItems.push(
                { label: '채용 공고 찾기', href: '/dashboard/jobs', icon: '📋' },
                { label: '지원 현황', href: '/dashboard/applications', icon: '📨' },
                { label: '프로필 관리', href: '/dashboard/profile', icon: '👤' },
            );
        }

        // 커뮤니티 - 모든 역할에서 접근 가능
        navItems.push({ label: '커뮤니티', href: '/dashboard/community', icon: '💭' });
        navItems.push({ label: '설정', href: '/dashboard/settings', icon: '⚙️' });
    }

    const SidebarContent = () => (
        <>
            <div className="p-8">
                <a
                    href="/dashboard"
                    className="flex items-center justify-center transition-transform hover:scale-105 active:scale-95 group"
                >
                    <div className="relative h-16 w-full flex items-center justify-center bg-white rounded-2xl p-2 shadow-sm border border-slate-100 group-hover:border-primary/20 transition-colors">
                        <img
                            src="/logo.png"
                            alt="School It"
                            className="h-full w-auto object-contain"
                        />
                    </div>
                </a>
            </div>
            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto font-sans">
                {navItems.map((item) => {
                    let isActive = false;
                    if (item.href === '/dashboard/jobs') {
                        // /dashboard/jobs/new는 제외하고, 정확히 /dashboard/jobs이거나 상세페이지(/dashboard/jobs/123)인 경우만
                        isActive = pathname === '/dashboard/jobs' || (pathname.startsWith('/dashboard/jobs/') && pathname !== '/dashboard/jobs/new');
                    } else if (item.href === '/dashboard/admin') {
                        // [Fix] Admin root (Verification) should only be active on exact match
                        isActive = pathname === '/dashboard/admin';
                    } else {
                        isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    }

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
                            {item.label === '메시지' && unreadMessageCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-surface">
                                    {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
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
        </>
    );

    return (
        <div className="flex h-screen bg-background overflow-hidden text-foreground">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-surface border-r border-slate-200/50 dark:border-slate-700 hidden md:flex flex-col shadow-sm">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar (Drawer) */}
            <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {/* Overlay */}
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                {/* Drawer */}
                <aside className={`absolute top-0 left-0 bottom-0 w-72 bg-surface shadow-2xl transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <SidebarContent />
                </aside>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <header className="h-16 bg-surface border-b border-slate-200/50 dark:border-slate-700 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-3">
                        {/* Mobile Toggle Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 -ml-2 hover:bg-surface-hover rounded-lg md:hidden text-2xl"
                        >
                            ≡
                        </button>
                        <h2 className="text-sm md:text-lg font-bold text-foreground truncate max-w-[200px] md:max-w-none">
                            반갑습니다, <span className="text-primary hidden sm:inline">{user.name}</span>님
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 rounded-full hover:bg-surface-hover transition-colors relative"
                            >
                                <span className="text-xl">🔔</span>
                                {unreadNotificationCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-bold text-white">
                                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                                    <div className="absolute right-0 top-full mt-2 w-80 bg-surface rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-surface">
                                            <h3 className="font-bold text-foreground">알림</h3>
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto bg-surface">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-foreground-muted text-sm">알림이 없습니다.</div>
                                            ) : (
                                                notifications.map((n: any) => (
                                                    <div
                                                        key={n.id}
                                                        className={`p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-surface-hover transition-colors cursor-pointer ${!n.isRead ? 'bg-primary/5' : ''}`}
                                                        onClick={() => {
                                                            if (!n.isRead) markNotificationAsRead(n.id);
                                                            if (n.link) router.push(n.link);
                                                            setShowNotifications(false);
                                                        }}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className="text-xl pt-1">
                                                                {n.type === 'APPLICATION' ? '📨' : n.type === 'SUGGESTION' ? '🎁' : n.type === 'STATUS_UPDATE' ? '📢' : '🔔'}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-sm mb-0.5 text-foreground">{n.title}</div>
                                                                <div className="text-xs text-foreground-muted line-clamp-2">{n.content}</div>
                                                                <div className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <div className="p-3 bg-surface border-t border-slate-100 dark:border-slate-700 text-center">
                                            <button
                                                onClick={() => {
                                                    router.push('/dashboard/notifications');
                                                    setShowNotifications(false);
                                                }}
                                                className="text-sm font-bold text-primary hover:underline"
                                            >
                                                모든 알림 보기 →
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary ring-2 ring-primary/20 shrink-0">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </header>
                <main className="p-4 md:p-8 max-w-[1200px] w-full mx-auto">
                    {user?.role === 'SCHOOL' && user?.schoolProfile && !user.schoolProfile.isVerified ? (
                        <VerificationPendingView />
                    ) : (
                        children
                    )}
                </main>
                <FooterDisclaimer />
                <FeedbackButton />
                <ComplianceModal userRole={user.role} onAccept={() => { }} />
            </div >
        </div >
    );
}
