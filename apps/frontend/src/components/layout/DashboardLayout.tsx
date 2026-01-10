"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
    const { unreadNotificationCount, notifications, markNotificationAsRead, unreadMessageCount } = useSocket();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // 경로 변경 시 모바일 메뉴 닫기
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setShowNotifications(false);
    }, [pathname]);

    // [Optimization] 메뉴 아이템 계산 비용 줄이기 (useMemo)
    const navItems = useMemo(() => {
        if (!user) return [];

        const commonItems = [];
        // PENDING 상태 처리
        if (user.role === 'PENDING') return [];

        if (user.role === 'ADMIN') {
            return [
                { label: '대시보드', href: '/dashboard', icon: '🏠' },
                { label: '인증 관리', href: '/dashboard/admin', icon: '🛡️' },
                { label: '사용자 관리', href: '/dashboard/admin/users', icon: '👥' },
                { label: '리뷰 관리', href: '/dashboard/admin/reviews', icon: '⭐' },
                { label: '공지 발송', href: '/dashboard/admin/notifications', icon: '📣' },
                { label: '피드백 센터', href: '/dashboard/admin/feedback', icon: '📢' },
                { label: '설정', href: '/dashboard/settings', icon: '⚙️' }
            ];
        }

        commonItems.push({ label: '메시지', href: '/dashboard/messages', icon: '💬' });

        let roleItems: { label: string; href: string; icon: string }[] = [];

        if (user.role === 'SCHOOL') {
            roleItems = [
                { label: '학교 프로필', href: '/dashboard/school/profile', icon: '🏫' },
                { label: '채용 공고 관리', href: '/dashboard/jobs', icon: '📋' },
                { label: '지원 현황', href: '/dashboard/applications', icon: '📨' },
                { label: '인재 찾기', href: '/dashboard/teachers', icon: '🔎' },
            ];
        } else if (user.role === 'TEACHER') {
            roleItems = [
                { label: '채용 공고 찾기', href: '/dashboard/jobs', icon: '📋' },
                { label: '지원 현황', href: '/dashboard/applications', icon: '📨' },
                { label: '프로필 관리', href: '/dashboard/profile', icon: '👤' },
            ];
        } else if (user.role === 'BUSINESS') {
            roleItems = [
                { label: '행사 공고/입찰', href: '/dashboard/jobs', icon: '🏢' },
                { label: '견적/계약 관리', href: '/dashboard/applications', icon: '📄' },
                { label: '업체 정보 수정', href: '/dashboard/profile', icon: '🛠️' },
            ];
        }

        return [
            ...(user.role !== 'SCHOOL' && user.role !== 'TEACHER' && user.role !== 'BUSINESS'
                ? [{ label: '대시보드', href: '/dashboard', icon: '🏠' }]
                : []),
            ...commonItems,
            ...roleItems,
            { label: '커뮤니티', href: '/dashboard/community', icon: '💭' },
            { label: '설정', href: '/dashboard/settings', icon: '⚙️' },
        ];
    }, [user]);

    // Loading State
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return <UnauthorizedView />;
    }

    // Redirect PENDING users
    if (user.role === 'PENDING' && !pathname.startsWith('/onboarding')) {
        router.push('/onboarding/role');
        return null;
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
            <div className="p-8">
                <a href="/dashboard" className="block transition-transform hover:scale-105 active:scale-95">
                    <div className="relative h-16 w-full flex items-center justify-center bg-white rounded-2xl p-2 shadow-sm border border-slate-100 dark:border-white/[0.05]">
                        <img src="/logo.png" alt="School It" className="h-full w-auto object-contain" />
                    </div>
                </a>
            </div>
            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto font-sans custom-scrollbar">
                {navItems.map((item) => {
                    const isActive = item.href === '/dashboard/jobs'
                        ? pathname === '/dashboard/jobs' || (pathname.startsWith('/dashboard/jobs/') && pathname !== '/dashboard/jobs/new')
                        : pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                    return (
                        <a
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-primary text-white shadow-md shadow-primary/20 font-semibold'
                                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900/50 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <span className={`text-xl ${isActive ? '' : 'opacity-70 group-hover:opacity-100 grayscale group-hover:grayscale-0'}`}>
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                            {item.label === '메시지' && unreadMessageCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                                </span>
                            )}
                        </a>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-slate-200 dark:border-white/[0.05]">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors group mb-4"
                >
                    <span className="text-xl">🚪</span>
                    로그아웃
                </button>
                <div className="text-[10px] text-center text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-medium">
                    © 2025 Schoolit Corp.
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex font-sans text-slate-900 dark:text-white">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col border-r border-slate-200 dark:border-white/[0.05] fixed h-full z-30">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay & Menu */}
            <div className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                <aside className={`absolute top-0 left-0 w-72 h-full bg-white dark:bg-zinc-950 shadow-2xl transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <SidebarContent />
                </aside>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
                {/* Header */}
                <header className="h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.05] flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg lg:hidden text-2xl">
                            ≡
                        </button>
                        <h2 className="text-sm md:text-lg font-bold truncate">
                            반갑습니다, <span className="text-primary">{user.name}</span>님
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900 relative transition-colors"
                            >
                                <span className="text-xl">🔔</span>
                                {unreadNotificationCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[0.1] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                        <div className="p-4 border-b border-slate-100 dark:border-white/[0.05] flex justify-between items-center bg-white dark:bg-zinc-900">
                                            <h3 className="font-bold">알림</h3>
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-slate-400 text-sm">알림이 없습니다.</div>
                                            ) : (
                                                notifications.map((n: any) => (
                                                    <div
                                                        key={n.id}
                                                        className={`p-4 border-b border-slate-50 dark:border-white/[0.05] hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${!n.isRead ? 'bg-primary/5' : ''}`}
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
                                                                <div className="font-bold text-sm mb-0.5">{n.title}</div>
                                                                <div className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2">{n.content}</div>
                                                                <div className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="p-3 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-white/[0.05] text-center">
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

                <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Bypass verification for test accounts */}
                    {(user.role === 'SCHOOL' && !user.schoolProfile?.isVerified && user.email !== 'school@test.com') ? (
                        !user.verificationCode ? (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                                <div className="text-6xl mb-4 grayscale opacity-80">🏫</div>
                                <h2 className="text-2xl font-bold">학교 인증이 필요합니다</h2>
                                <p className="text-slate-500 dark:text-zinc-400 max-w-md">
                                    신뢰할 수 있는 매칭을 위해 학교 이메일 인증을 완료해주세요.
                                </p>
                                <button
                                    onClick={() => router.push('/onboarding/email-verify')}
                                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                                >
                                    이메일 인증하러 가기
                                </button>
                            </div>
                        ) : (
                            <VerificationPendingView />
                        )
                    ) : (
                        children
                    )}
                </main>

                <FooterDisclaimer />
                <FeedbackButton />
                <ComplianceModal userRole={user.role} />
            </div>
        </div>
    );
}
