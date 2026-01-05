import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { PrismaService } from '../prisma.service';
import { UserService } from '../users/user.service';

describe('JobsService', () => {
    let service: JobsService;
    let prisma: PrismaService;

    const mockPrismaService = {
        jobListing: {
            create: jest.fn(),
        },
    };

    const mockUserService = {
        getSchoolProfile: jest.fn().mockResolvedValue({ id: 99, userId: 1 }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JobsService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: UserService, useValue: mockUserService },
            ],
        }).compile();

        service = module.get<JobsService>(JobsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should create a job with budget', async () => {
        const createDto = {
            title: 'Expensive Job',
            description: 'Test',
            subjects: ['Math'],
            regions: ['Seoul'],
            budget: 25000000,
            jobType: 'TEACHER_HIRING' as any,
        };

        mockPrismaService.jobListing.create.mockResolvedValue({ id: 1, ...createDto });

        const result = await service.createJob(1, createDto);

        expect(result).toBeDefined();
        expect(prisma.jobListing.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                budget: 25000000,
            }),
        }));
    });
});
