import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserProfileModal from '../UserProfileModal';
import { Role } from '@/lib/constants';
import { api } from '@/lib/api';

// Mock API
jest.mock('@/lib/api', () => ({
    api: {
        get: jest.fn(),
    },
}));

const mockTeacherUser = {
    id: 1,
    name: 'Teacher Kim',
    role: 'TEACHER',
    email: 'kim@test.com',
    teacherProfile: {
        id: 1,
        userId: 1,
        bio: 'Hello, I am a teacher.',
        subjects: ['Math'],
        regions: ['Seoul'],
        isVerified: true,
        experiences: [
            { id: 1, title: 'Teacher', organization: 'School A', startDate: '2020-01-01', isCurrent: true }
        ],
        educations: [],
        licenses: [],
        links: [],
        username: 'kimteacher'
    }
};

const mockBusinessUser = {
    id: 2,
    name: 'Business Lee',
    role: 'BUSINESS',
    email: 'lee@biz.com',
    businessProfile: {
        id: 1,
        userId: 2,
        companyName: 'Best Edu Corp',
        description: 'We provide education.',
        portfolios: [],
        s2bNumber: '12345',
        isVerified: true,
    }
};

describe('UserProfileModal', () => {
    beforeEach(() => {
        (api.get as jest.Mock).mockReset();
    });

    it('renders nothing when isOpen is false', () => {
        render(<UserProfileModal isOpen={false} onClose={() => { }} userId={1} />);
        expect(screen.queryByText('Teacher Kim')).not.toBeInTheDocument();
    });

    it('fetches and displays teacher profile when open', async () => {
        (api.get as jest.Mock).mockResolvedValue(mockTeacherUser);

        render(<UserProfileModal isOpen={true} onClose={() => { }} userId={1} />);

        // Should show loading initially or immediately content if fast
        // await waitFor(() => expect(screen.getByText('Teacher Kim')).toBeInTheDocument());

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/users/1/profile');
            expect(screen.getByText('Teacher Kim')).toBeInTheDocument();
            expect(screen.getByText('Hello, I am a teacher.')).toBeInTheDocument();
            expect(screen.getByText('School A')).toBeInTheDocument();
        });
    });

    it('fetches and displays business profile when open', async () => {
        (api.get as jest.Mock).mockResolvedValue(mockBusinessUser);

        render(<UserProfileModal isOpen={true} onClose={() => { }} userId={2} />);

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/users/2/profile');
            expect(screen.getByText('Best Edu Corp')).toBeInTheDocument();
            expect(screen.getByText('S2B 등록업체')).toBeInTheDocument();
        });
    });

    it('calls onClose when close button clicked', async () => {
        (api.get as jest.Mock).mockResolvedValue(mockTeacherUser);
        const onClose = jest.fn();

        render(<UserProfileModal isOpen={true} onClose={onClose} userId={1} />);

        await waitFor(() => expect(screen.getByText('Teacher Kim')).toBeInTheDocument());

        const closeBtn = screen.getByRole('button', { name: /close/i }); // Adjust accessible name as needed
        fireEvent.click(closeBtn);

        expect(onClose).toHaveBeenCalled();
    });
});
