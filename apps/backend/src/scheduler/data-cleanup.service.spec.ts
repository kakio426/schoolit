import { Test, TestingModule } from '@nestjs/testing';
import { DataCleanupService } from './data-cleanup.service';
import { PrismaService } from '../prisma.service';

describe('DataCleanupService', () => {
    let service: DataCleanupService;
    let prisma: PrismaService;

    const mockPrismaService = {
        user: {
            findMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        jobApplication: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
        teacherProfile: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        evaluation: {
            updateMany: jest.fn(),
        },
        notification: { deleteMany: jest.fn() },
        chatMessage: { deleteMany: jest.fn() },
        postLike: { deleteMany: jest.fn() },
        comment: { deleteMany: jest.fn() },
        post: { deleteMany: jest.fn() },
        feedback: { deleteMany: jest.fn() },
        teacherExperience: { deleteMany: jest.fn() },
        teacherEducation: { deleteMany: jest.fn() },
        teacherLink: { deleteMany: jest.fn() },
        teacherLicense: { deleteMany: jest.fn() },
        schoolProfile: { deleteMany: jest.fn() },
        businessPortfolio: { deleteMany: jest.fn() },
        businessProfile: { findUnique: jest.fn(), delete: jest.fn() },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DataCleanupService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<DataCleanupService>(DataCleanupService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    describe('cleanupRecruitmentDocuments', () => {
        it('should clean transient documents and evaluations for rejected applicants after 7 days', async () => {
            const mockApps = [
                {
                    id: 1,
                    userId: 10,
                    user: {
                        teacherProfile: { id: 100, transientDocuments: { some: 'json' } },
                    },
                },
            ];

            mockPrismaService.jobApplication.findMany.mockResolvedValue(mockApps);

            const result = await service.cleanupRecruitmentDocuments();

            expect(result.cleaned).toBe(1);
            expect(mockPrismaService.teacherProfile.update).toHaveBeenCalledWith({
                where: { id: 100 },
                data: { transientDocuments: null },
            });
            expect(mockPrismaService.evaluation.updateMany).toHaveBeenCalledWith({
                where: { applicationId: 1 },
                data: { comment: null },
            });
        });

        it('should return 0 if no applications to clean', async () => {
            mockPrismaService.jobApplication.findMany.mockResolvedValue([]);
            const result = await service.cleanupRecruitmentDocuments();
            expect(result.cleaned).toBe(0);
        });
    });

    describe('immediateDocumentDestruction', () => {
        it('should destroy documents if application is REJECTED', async () => {
            mockPrismaService.jobApplication.findUnique.mockResolvedValue({
                id: 1,
                status: 'REJECTED',
                user: {
                    teacherProfile: { id: 100 },
                },
            });

            const result = await service.immediateDocumentDestruction(1);

            expect(result.success).toBe(true);
            expect(mockPrismaService.teacherProfile.update).toHaveBeenCalled();
        });

        it('should fail if application is not REJECTED', async () => {
            mockPrismaService.jobApplication.findUnique.mockResolvedValue({
                id: 1,
                status: 'HIRED',
            });

            const result = await service.immediateDocumentDestruction(1);

            expect(result.success).toBe(false);
            expect(result.message).toContain('탈락 상태의 지원서만');
        });
    });
});
