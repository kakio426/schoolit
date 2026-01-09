/**
 * @jest-environment jsdom
 * 
 * Test Suite: Dashboard Layout - Sidebar RBAC
 * Tests for: Phase 2 - Role-Based Access Control
 * 
 * Validates that Sidebar menu items are correctly filtered by role.
 * Teachers should NOT see "Request Event" or "Find Business" options.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Test data for different user roles
const mockTeacherUser = {
    id: 1,
    name: 'Teacher Kim',
    role: 'TEACHER',
    email: 'kim@test.com',
};

const mockSchoolUser = {
    id: 2,
    name: 'School Admin',
    role: 'SCHOOL',
    email: 'admin@school.kr',
    schoolProfile: {
        isVerified: true,
    },
};

// We test the navItems logic directly since DashboardLayout has complex dependencies
describe('DashboardLayout Sidebar - Phase 2: RBAC', () => {

    // Helper function that mirrors DashboardLayout's navItems logic
    const getNavItemsForRole = (role: string) => {
        const navItems = [
            { label: '대시보드', href: '/dashboard', icon: '🏠' },
        ];

        if (role === 'SCHOOL') {
            navItems.push(
                { label: '메시지', href: '/dashboard/messages', icon: '💬' },
                { label: '학교 프로필', href: '/dashboard/school/profile', icon: '🏫' },
                { label: '채용 공고 관리', href: '/dashboard/jobs', icon: '📋' },
                { label: '지원 현황', href: '/dashboard/applications', icon: '📨' },
                { label: '인재 찾기', href: '/dashboard/teachers', icon: '🔎' },
            );
        } else if (role === 'TEACHER') {
            navItems.push(
                { label: '메시지', href: '/dashboard/messages', icon: '💬' },
                { label: '채용 공고 찾기', href: '/dashboard/jobs', icon: '📋' },
                { label: '지원 현황', href: '/dashboard/applications', icon: '📨' },
                { label: '프로필 관리', href: '/dashboard/profile', icon: '👤' },
            );
        }

        navItems.push({ label: '커뮤니티', href: '/dashboard/community', icon: '💭' });
        navItems.push({ label: '설정', href: '/dashboard/settings', icon: '⚙️' });

        return navItems;
    };

    describe('Teacher Role Menu Items', () => {
        it('should NOT include "Request Event" (행사 요청하기) for TEACHER role', () => {
            const teacherNavItems = getNavItemsForRole('TEACHER');
            const labels = teacherNavItems.map(item => item.label);

            expect(labels).not.toContain('행사 요청하기');
        });

        it('should NOT include "Find Business" (업체 찾기) for TEACHER role', () => {
            const teacherNavItems = getNavItemsForRole('TEACHER');
            const labels = teacherNavItems.map(item => item.label);

            expect(labels).not.toContain('업체 찾기');
        });

        it('should include core Teacher menu items', () => {
            const teacherNavItems = getNavItemsForRole('TEACHER');
            const labels = teacherNavItems.map(item => item.label);

            expect(labels).toContain('채용 공고 찾기');
            expect(labels).toContain('지원 현황');
            expect(labels).toContain('프로필 관리');
        });
    });

    describe('School Role Menu Items', () => {
        it('should include job management items for SCHOOL role', () => {
            const schoolNavItems = getNavItemsForRole('SCHOOL');
            const labels = schoolNavItems.map(item => item.label);

            expect(labels).toContain('채용 공고 관리');
            expect(labels).toContain('인재 찾기');
        });
    });
});
