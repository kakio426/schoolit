/**
 * Test 3.2: S2B Number Validation for Bids Over 20M KRW
 * 
 * Legal Requirement: Per Korean Public Procurement Act,
 * businesses bidding over 20,000,000 KRW MUST have a valid S2B registration number.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BidSubmissionForm from '@/components/business/BidSubmissionForm';

describe('Test 3.2: S2B Number Validation', () => {
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should NOT require S2B number for bids under 20M KRW', async () => {
        // ARRANGE
        render(
            <BidSubmissionForm
                jobId={1}
                jobTitle="School Event"
                schoolBudget={30000000}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />
        );

        // ACT: Enter bid amount under 20M
        const costInput = screen.getByLabelText(/금액|cost/i);
        fireEvent.change(costInput, { target: { value: '15000000' } });

        const messageInput = screen.getByLabelText(/메시지|message/i);
        fireEvent.change(messageInput, { target: { value: 'Test message' } });

        const phoneInput = screen.getByLabelText(/연락처|phone/i);
        fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } });

        const submitButton = screen.getByRole('button', { name: /제출|submit/i });
        fireEvent.click(submitButton);

        // ASSERT: Should submit without S2B number
        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalled();
        });
    });

    it('should REQUIRE S2B number for bids over 20M KRW', async () => {
        // ARRANGE
        render(
            <BidSubmissionForm
                jobId={1}
                jobTitle="School Event"
                schoolBudget={50000000}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />
        );

        // ACT: Enter bid amount over 20M
        const costInput = screen.getByLabelText(/금액|cost/i);
        fireEvent.change(costInput, { target: { value: '25000000' } });

        // ASSERT: S2B input field should appear
        await waitFor(() => {
            expect(screen.getByText(/S2B 번호/i)).toBeInTheDocument();
            expect(screen.getByText(/2천만원 초과.*필수/i)).toBeInTheDocument();
        });

        // ACT: Try to submit without S2B number
        const submitButton = screen.getByRole('button', { name: /제출|submit/i });
        fireEvent.click(submitButton);

        // ASSERT: Should show error and NOT submit
        await waitFor(() => {
            expect(screen.getByText(/S2B 번호.*입력.*필수/i)).toBeInTheDocument();
            expect(mockOnSubmit).not.toHaveBeenCalled();
        });
    });

    it('should accept valid S2B number format', async () => {
        // ARRANGE
        render(
            <BidSubmissionForm
                jobId={1}
                jobTitle="School Event"
                schoolBudget={50000000}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />
        );

        // ACT: Enter bid over 20M with valid S2B number
        const costInput = screen.getByLabelText(/금액|cost/i);
        fireEvent.change(costInput, { target: { value: '30000000' } });

        await waitFor(() => {
            const s2bInput = screen.getByLabelText(/S2B 번호/i);
            fireEvent.change(s2bInput, { target: { value: 'S2B-2024-12345' } });
        });

        const messageInput = screen.getByLabelText(/메시지|message/i);
        fireEvent.change(messageInput, { target: { value: 'Test message' } });

        const phoneInput = screen.getByLabelText(/연락처|phone/i);
        fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } });

        const submitButton = screen.getByRole('button', { name: /제출|submit/i });
        fireEvent.click(submitButton);

        // ASSERT: Should submit successfully
        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    cost: 30000000,
                    s2bNumber: 'S2B-2024-12345',
                })
            );
        });
    });

    it('should show warning when bid exceeds school budget', async () => {
        // ARRANGE
        const schoolBudget = 20000000;
        render(
            <BidSubmissionForm
                jobId={1}
                jobTitle="School Event"
                schoolBudget={schoolBudget}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />
        );

        // ACT: Enter bid exceeding budget
        const costInput = screen.getByLabelText(/금액|cost/i);
        fireEvent.change(costInput, { target: { value: '25000000' } });

        // ASSERT: Should show budget warning
        await waitFor(() => {
            expect(screen.getByText(/예산.*초과/i)).toBeInTheDocument();
        });
    });
});
