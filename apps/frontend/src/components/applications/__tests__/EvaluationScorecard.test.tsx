import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EvaluationScorecard from '../EvaluationScorecard';
import { DOCUMENT_CRITERIA } from '@/lib/constants/compliance';

// Mock StandardCard to avoid complexities with nested components
jest.mock('@/components/ui/StandardCard', () => ({ children, noPadding, className }: any) => (
    <div data-testid="standard-card" className={className}>
        {children}
    </div>
));

describe('EvaluationScorecard', () => {
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    const defaultProps = {
        type: 'DOCUMENT' as const,
        criteria: DOCUMENT_CRITERIA,
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
        applicantName: '홍길동',
    };

    it('Test 2.1: calculates total score correctly', () => {
        render(<EvaluationScorecard {...defaultProps} />);

        // Find inputs
        const inputs = screen.getAllByRole('spinbutton');

        // Input scores
        // DOCUMENT_CRITERIA assumption: At least 2 items exists
        fireEvent.change(inputs[0], { target: { value: '5' } });
        fireEvent.change(inputs[1], { target: { value: '4' } });

        // Check if total score updates
        // Since "9" is just a number, we look for the element containing it specifically in footer
        // Or find by the specific value displayed
        expect(screen.getByText('9')).toBeInTheDocument();
    });

    it('Test 2.2: enforces max score validation', () => {
        render(<EvaluationScorecard {...defaultProps} />);

        const input = screen.getAllByRole('spinbutton')[0];
        const maxScore = DOCUMENT_CRITERIA[0].maxScore; // Access logic source of truth

        // Try to input value greater than max
        fireEvent.change(input, { target: { value: (maxScore + 5).toString() } });

        // Validation message should appear
        expect(screen.getByText(new RegExp(`최대 ${maxScore}점까지`))).toBeInTheDocument();
    });
});
