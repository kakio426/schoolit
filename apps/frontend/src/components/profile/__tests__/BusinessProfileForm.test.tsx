import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BusinessProfileForm from '../BusinessProfileForm';

// Mock dependencies
jest.mock('@/lib/api', () => ({
    api: {
        post: jest.fn(),
    },
}));
jest.mock('../AdminManager', () => () => <div data-testid="admin-manager">AdminManager</div>);

describe('BusinessProfileForm', () => {
    const mockUser = {
        businessProfile: {
            companyName: 'Test Corp',
            categories: [],
            // registrationFile missing initially
        }
    };
    const mockToken = 'test-token';
    const mockRefresh = jest.fn();

    beforeAll(() => {
        // Mock window.alert
        window.alert = jest.fn();
    });

    it('Test 1.1: renders file upload input for business registration', () => {
        render(<BusinessProfileForm user={mockUser} token={mockToken} onRefresh={mockRefresh} />);

        const fileInput = screen.getByTestId('registration-file-input');
        expect(fileInput).toBeInTheDocument();
        expect(fileInput).toHaveAttribute('type', 'file');
    });

    it('Test 1.2: updates state when file is selected', async () => {
        render(<BusinessProfileForm user={mockUser} token={mockToken} onRefresh={mockRefresh} />);

        const fileInput = screen.getByTestId('registration-file-input');
        const file = new File(['dummy content'], 'license.pdf', { type: 'application/pdf' });

        // Simulate file selection
        fireEvent.change(fileInput, { target: { files: [file] } });

        // Check if filename appears using findByText (async)
        // Note: The component logic updates state and then renders the filename
        const filenameElement = await screen.findByText('license.pdf');
        expect(filenameElement).toBeInTheDocument();

        // Check if alert was called (optional, based on current implementation)
        expect(window.alert).toHaveBeenCalled();
    });
});
