import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JobApplicantsPage from '../page';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { ApplicationStatus, Role, JobType } from '@/lib/constants';

// Mocking dependencies
jest.mock('next/navigation', () => ({
    useParams: jest.fn(),
    useRouter: jest.fn(),
}));
jest.mock('@/contexts/AuthContext');
jest.mock('@/lib/api');

describe('JobApplicantsPage - List View Evaluation Button Audit', () => {
    const mockJob = {
        id: 1,
        title: '2025년 3학년 1학기 영어',
        jobType: JobType.TEACHER_HIRING,
        schoolId: 1,
        active: true,
    };

    const mockApplicants = [
        {
            id: 101,
            jobId: 1,
            status: ApplicationStatus.INTERVIEWING,
            user: { id: 2, name: '김코딩', role: Role.TEACHER },
            message: '열심히 하겠습니다.',
            createdAt: new Date().toISOString(),
        }
    ];

    beforeEach(() => {
        (useParams as jest.Mock).mockReturnValue({ id: '1' });
        (useAuth as jest.Mock).mockReturnValue({ user: { id: 1, role: Role.SCHOOL } });
        (api.get as jest.Mock).mockImplementation((url: string) => {
            if (url.includes('/jobs/1')) return Promise.resolve(mockJob);
            if (url.includes('/applications/jobs/1')) return Promise.resolve(mockApplicants);
            return Promise.resolve([]);
        });
    });

    it('RED: Should show "면접 평가표 작성" button when clicking INTERVIEWING tab', async () => {
        render(<JobApplicantsPage />);

        // Wait for data
        await screen.findByText(/2025년 3학년 1학기 영어/);

        // Click on "면접/시연" tab
        const interviewTab = screen.getByText(/면접\/시연/);
        fireEvent.click(interviewTab);

        // Check for applicant
        const applicantName = await screen.findByText(/김코딩/);
        expect(applicantName).toBeInTheDocument();

        // [AUDIT] See what's actually rendered
        screen.debug();

        // Check for evaluation button
        const evalButton = screen.queryByText(/면접 평가표 작성/);
        expect(evalButton).toBeInTheDocument();
    });
});
