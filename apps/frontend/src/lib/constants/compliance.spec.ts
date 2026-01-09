import {
    calculateContractDuration,
    calculateDocumentReturnDeadline,
    calculateDocumentDestructionDate
} from './compliance';

describe('Compliance Logic (Frontend)', () => {
    describe('calculateContractDuration', () => {
        it('should return isValid: false for sick leave less than 1 month', () => {
            const start = new Date('2025-03-01');
            const end = new Date('2025-03-15');
            const result = calculateContractDuration('SICK_LEAVE', start, end);
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('1개월 미만');
        });

        it('should return isValid: true for sick leave of 1 month or more', () => {
            const start = new Date('2025-03-01');
            const end = new Date('2025-04-01');
            const result = calculateContractDuration('SICK_LEAVE', start, end);
            expect(result.isValid).toBe(true);
        });

        it('should allow short duration for regular vacancy', () => {
            const start = new Date('2025-03-01');
            const end = new Date('2025-03-10');
            const result = calculateContractDuration('VACANCY', start, end);
            expect(result.isValid).toBe(true);
        });
    });

    describe('calculateDocumentReturnDeadline', () => {
        it('should add 14 days to confirmation date', () => {
            const confirmed = new Date('2025-01-01');
            const deadline = calculateDocumentReturnDeadline(confirmed);
            expect(deadline.getDate()).toBe(15);
        });
    });

    describe('calculateDocumentDestructionDate', () => {
        it('should add 7 days to confirmation date', () => {
            const confirmed = new Date('2025-01-01');
            const destruction = calculateDocumentDestructionDate(confirmed);
            expect(destruction.getDate()).toBe(8);
        });
    });
});
