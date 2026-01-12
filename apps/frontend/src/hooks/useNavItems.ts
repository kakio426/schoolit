"use client";

import { useMemo } from 'react';
import { DASHBOARD_MENU } from '@/config/dashboard-menu';

interface NavItem {
    label: string;
    href: string;
    icon: string;
    priority?: 'primary' | 'secondary';
}

interface UseNavItemsResult {
    sidebarItems: NavItem[];
    bottomNavItems: NavItem[];
}

export function useNavItems(userRole: string | undefined): UseNavItemsResult {
    const sidebarItems = useMemo<NavItem[]>(() => {
        if (!userRole || userRole === 'PENDING') return [];

        if (userRole === 'ADMIN') {
            return DASHBOARD_MENU.ADMIN;
        }

        const roleItems = DASHBOARD_MENU[userRole as keyof typeof DASHBOARD_MENU] || [];

        const dashboardItem = DASHBOARD_MENU.COMMON.find(i => i.label === '대시보드')!;
        const messageItem = DASHBOARD_MENU.COMMON.find(i => i.label === '메시지')!;
        const communityItem = DASHBOARD_MENU.COMMON.find(i => i.label === '커뮤니티')!;
        const settingsItem = DASHBOARD_MENU.COMMON.find(i => i.label === '설정')!;

        return [
            dashboardItem,
            messageItem,
            ...roleItems,
            communityItem,
            settingsItem
        ] as NavItem[];
    }, [userRole]);

    // Bottom Nav: Primary items only (max 5)
    const bottomNavItems = useMemo<NavItem[]>(() => {
        if (!userRole || userRole === 'PENDING') return [];

        // For mobile bottom nav, we pick key frequently used items
        // Dashboard, Jobs/Main feature, Messages, Community/Search, Settings/Profile
        const dashboard = { label: '홈', href: '/dashboard', icon: '🏠', priority: 'primary' as const };
        const messages = { label: '메시지', href: '/dashboard/messages', icon: '💬', priority: 'primary' as const };
        const settings = { label: '설정', href: '/dashboard/settings', icon: '⚙️', priority: 'primary' as const };

        if (userRole === 'ADMIN') {
            return [
                dashboard,
                { label: '관리', href: '/dashboard/admin', icon: '🛡️', priority: 'primary' },
                { label: '사용자', href: '/dashboard/admin/users', icon: '👥', priority: 'primary' },
                messages,
                settings
            ];
        }

        if (userRole === 'SCHOOL') {
            return [
                dashboard,
                { label: '채용', href: '/dashboard/jobs', icon: '📋', priority: 'primary' },
                { label: '인재', href: '/dashboard/teachers', icon: '🔎', priority: 'primary' },
                messages,
                { label: '학교', href: '/dashboard/school/profile', icon: '🏫', priority: 'primary' },
            ];
        }

        if (userRole === 'TEACHER') {
            return [
                dashboard,
                { label: '일자리', href: '/dashboard/jobs', icon: '📋', priority: 'primary' },
                { label: '지원', href: '/dashboard/applications', icon: '📨', priority: 'primary' },
                messages,
                { label: '프로필', href: '/dashboard/profile', icon: '👤', priority: 'primary' },
            ];
        }

        if (userRole === 'BUSINESS') {
            return [
                dashboard,
                { label: '입찰', href: '/dashboard/jobs', icon: '🏢', priority: 'primary' },
                { label: '계약', href: '/dashboard/applications', icon: '📄', priority: 'primary' },
                messages,
                { label: '업체', href: '/dashboard/profile', icon: '🛠️', priority: 'primary' },
            ];
        }

        return [dashboard, messages, settings];
    }, [userRole]);

    return { sidebarItems, bottomNavItems };
}
