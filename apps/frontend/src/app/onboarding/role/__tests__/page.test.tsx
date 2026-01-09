/**
 * @jest-environment jsdom
 * 
 * Test Suite: Role Selection Page
 * Tests for: Phase 1 - Onboarding & Role Definition
 * 
 * Validates that Role Selection Cards display correct content
 * as specified in the implementation plan.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
        token: 'mock-token',
    }),
}));

// Mock API
jest.mock('@/lib/api', () => ({
    api: {
        put: jest.fn().mockResolvedValue({}),
    },
}));

// Import after mocks
import RoleSelectionPage from '@/app/onboarding/role/page';

describe('RoleSelectionPage - Phase 1: Role Definition', () => {

    describe('Role Card Content', () => {
        beforeEach(() => {
            render(<RoleSelectionPage />);
        });

        it('should display correct title for Freelancer Teacher card', () => {
            expect(screen.getByText('프리랜서 교사 및 강사')).toBeInTheDocument();
        });

        it('should display correct description for Freelancer Teacher card', () => {
            // The description contains specific keywords
            expect(screen.getByText(/방과후 학교, 돌봄 교실, 늘봄 교실, 시간제 강사/)).toBeInTheDocument();
            expect(screen.getByText(/나의 역할이 필요한 곳을 찾습니다/)).toBeInTheDocument();
        });

        it('should display correct title for School/Public Teacher card', () => {
            expect(screen.getByText('학교/업무 담당 교사')).toBeInTheDocument();
        });

        it('should display correct description for School/Public Teacher card', () => {
            expect(screen.getByText(/검증된 교사\(강사\) 및 행사 업체를 찾아/)).toBeInTheDocument();
            expect(screen.getByText(/견적을 받고 계약을 진행합니다/)).toBeInTheDocument();
        });

        it('should display correct title for Business/Vendor card', () => {
            expect(screen.getByText('교육 관련 업체')).toBeInTheDocument();
        });

        it('should display correct description for Business/Vendor card', () => {
            expect(screen.getByText(/진로체험, 스포츠데이, 체험학습/)).toBeInTheDocument();
            expect(screen.getByText(/학교에서 필요한 교육 행사 전문 기업입니다/)).toBeInTheDocument();
        });
    });

    describe('Role Selection Interaction', () => {
        it('should highlight selected card when clicked', () => {
            render(<RoleSelectionPage />);

            const teacherCard = screen.getByText('프리랜서 교사 및 강사').closest('button');

            fireEvent.click(teacherCard!);

            // Check for selected state (checkmark should appear)
            expect(teacherCard).toHaveClass('border-primary');
        });
    });
});
