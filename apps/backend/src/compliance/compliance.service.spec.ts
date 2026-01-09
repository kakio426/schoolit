import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceService } from './compliance.service';
import { PrismaService } from '../prisma.service';
import { HiringWorkflowStatus, EvaluationType } from '@prisma/client';

describe('ComplianceService', () => {
    let service: ComplianceService;
    let prisma: PrismaService;

    const mockPrismaService = {
        jobListing: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        evaluation: {
            create: jest.fn(),
            findMany: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ComplianceService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<ComplianceService>(ComplianceService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    describe('validateSalaryStep', () => {
        it('should allow up to 40 for normal teachers', () => {
            const result = service.validateSalaryStep(30, false);
            expect(result.isValid).toBe(true);
        });

        it('should restrict to 14 for honorary retirees', () => {
            const result = service.validateSalaryStep(15, true);
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('14호봉');
        });

        it('should allow 14 for honorary retirees', () => {
            const result = service.validateSalaryStep(14, true);
            expect(result.isValid).toBe(true);
        });
    });

    describe('validateContractDuration', () => {
        it('should reject less than 1 month for sick leave', () => {
            const start = new Date('2025-03-01');
            const end = new Date('2025-03-15');
            const result = service.validateContractDuration('SICK_LEAVE', start, end);
            expect(result.isValid).toBe(false);
        });

        it('should allow 6 months for sick leave', () => {
            const start = new Date('2025-03-01');
            const end = new Date('2025-08-31');
            const result = service.validateContractDuration('SICK_LEAVE', start, end);
            expect(result.isValid).toBe(true);
        });

        it('should allow 2 weeks for other reasons', () => {
            const start = new Date('2025-03-01');
            const end = new Date('2025-03-15');
            const result = service.validateContractDuration('VACANCY', start, end);
            expect(result.isValid).toBe(true);
        });
    });

    describe('updateWorkflowStatus', () => {
        it('should transition from DRAFT to PLAN_APPROVED', async () => {
            mockPrismaService.jobListing.findUnique.mockResolvedValue({
                workflowStatus: 'DRAFT',
            });

            const result = await service.updateWorkflowStatus(1, 'PLAN_APPROVED');
            expect(result.success).toBe(true);
            expect(mockPrismaService.jobListing.update).toHaveBeenCalled();
        });

        it('should reject invalid transition', async () => {
            mockPrismaService.jobListing.findUnique.mockResolvedValue({
                workflowStatus: 'DRAFT',
            });

            const result = await service.updateWorkflowStatus(1, 'PUBLISHED');
            expect(result.success).toBe(false);
            expect(result.message).toContain('전환할 수 없습니다');
        });
    });

    describe('aggregateScores', () => {
        it('should calculate total scores and rank applicants', async () => {
            const mockEvaluations = [
                {
                    applicationId: 1,
                    type: 'DOCUMENT',
                    totalScore: 25,
                    meritBonus: 0,
                    application: { user: { name: 'A' } },
                },
                {
                    applicationId: 1,
                    type: 'INTERVIEW',
                    totalScore: 35,
                    meritBonus: 0,
                    application: { user: { name: 'A' } },
                },
                {
                    applicationId: 2,
                    type: 'DOCUMENT',
                    totalScore: 20,
                    meritBonus: 2, // 10% bonus
                    application: { user: { name: 'B' } },
                },
            ];

            mockPrismaService.evaluation.findMany.mockResolvedValue(mockEvaluations);

            const result = await service.aggregateScores(100);

            expect(result).toHaveLength(2);
            expect(result[0].applicantName).toBe('A');
            expect(result[0].totalScore).toBe(60);
            expect(result[0].rank).toBe(1);

            expect(result[1].applicantName).toBe('B');
            expect(result[1].totalScore).toBe(22);
            expect(result[1].rank).toBe(2);
        });
    });
});
