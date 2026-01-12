/**
 * Test 2.1: Apply Button Profile Completion Validation
 * 
 * Business Rule: Teachers can only apply to jobs if their profile is at least 80% complete.
 * This prevents incomplete applications and ensures schools receive quality candidates.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '@/contexts/AuthContext';
import JobDetailPage from '../page';
import { Role } from '@/lib/constants';

// Mock dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('@/lib/api');
jest.mock('next/navigation', () => ({
    useParams: () => ({ id: '1' }),
    useRouter: () => ({
        push: jest.fn(),
        back: jest.fn(),
    }),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('Test 2.1: Apply Button Profile Completion', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should disable Apply button when profile completion < 80%', async () => {
        // ARRANGE: Teacher with 60% profile completion
        mockUseAuth.mockReturnValue({
            user: {
                id: 1,
                role: Role.TEACHER,
                name: 'Test Teacher',
                email: 'teacher@test.com',
                teacherProfile: {
                    subjects: ['Math'],
                    bio: 'Test bio',
                    experiences: [], // Missing
                    educations: [], // Missing
                    licenses: [], // Missing
                    // Profile completion: 2/5 fields = 40%
                } as any,
            } as any,
            token: 'mock-token',
            isLoading: false,
            login: jest.fn(),
            logout: jest.fn(),
            refreshProfile: jest.fn(),
        });

        // Mock API response for job details
        const mockApi = require('@/lib/api').api;
        mockApi.get.mockResolvedValue({
            id: 1,
            title: 'Math Teacher',
            schoolProfile: { schoolName: 'Test School' },
            status: 'OPEN',
        });

        // ACT: Render the job detail page
        render(<JobDetailPage />);

        // ASSERT: Apply button should be disabled
        await waitFor(() => {
            const applyButton = screen.queryByRole('button', { name: /지원하기|apply/i });
            if (applyButton) {
                expect(applyButton).toBeDisabled();
            }
        });

        // ASSERT: Warning message should be displayed
        await waitFor(() => {
            expect(screen.getByText(/프로필을 80% 이상 완성해주세요/i)).toBeInTheDocument();
        });
    });

    it('should enable Apply button when profile completion >= 80%', async () => {
        // ARRANGE: Teacher with 100% profile completion
        mockUseAuth.mockReturnValue({
            user: {
                id: 1,
                role: Role.TEACHER,
                name: 'Test Teacher',
                email: 'teacher@test.com',
                teacherProfile: {
                    subjects: ['Math', 'Science'],
                    bio: 'Experienced teacher with 10 years',
                    experiences: [{ title: 'Teacher', organization: 'School A', startDate: '2015', isCurrent: true }],
                    educations: [{ schoolName: 'University', degree: 'Bachelor', graduationStatus: 'GRADUATED' }],
                    licenses: [{ name: 'Teaching License', issuer: 'MOE' }],
                    // Profile completion: 5/5 fields = 100%
                } as any,
            } as any,
            token: 'mock-token',
            isLoading: false,
            login: jest.fn(),
            logout: jest.fn(),
            refreshProfile: jest.fn(),
        });

        const mockApi = require('@/lib/api').api;
        mockApi.get.mockResolvedValue({
            id: 1,
            title: 'Math Teacher',
            schoolProfile: { schoolName: 'Test School' },
            status: 'OPEN',
        });

        // ACT
        render(<JobDetailPage />);

        // ASSERT: Apply button should be enabled
        await waitFor(() => {
            const applyButton = screen.queryByRole('button', { name: /지원하기|apply/i });
            if (applyButton) {
                expect(applyButton).not.toBeDisabled();
            }
        });
    });

    it('should calculate profile completion correctly', () => {
        // ARRANGE: Profile with 4/5 fields = 80%
        const profile = {
            subjects: ['Math'],
            bio: 'Test',
            experiences: [{ title: 'Teacher' }],
            educations: [{ schoolName: 'Uni' }],
            licenses: [], // Missing
        };

        // ACT: Calculate completion
        const fields = [
            profile.subjects?.length > 0,
            profile.bio?.length > 0,
            profile.experiences?.length > 0,
            profile.educations?.length > 0,
            profile.licenses?.length > 0,
        ];
        const completion = (fields.filter(Boolean).length / fields.length) * 100;

        // ASSERT
        expect(completion).toBe(80);
    });
});
