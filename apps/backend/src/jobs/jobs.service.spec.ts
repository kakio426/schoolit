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
      delete: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    schoolProfile: {
      findUnique: jest.fn(),
    },
    teacherProfile: {
      findUnique: jest.fn(),
    },
  };

  const mockUserService = {
    findById: jest.fn().mockResolvedValue({ id: 1 }),
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

    mockPrismaService.schoolProfile.findUnique.mockResolvedValue({ id: 99, userId: 1 });
    mockPrismaService.jobListing.create.mockResolvedValue({ id: 1, ...createDto });

    const result = await service.createJob(1, createDto);

    expect(result).toBeDefined();
    expect(prisma.jobListing.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          budget: 25000000,
        }),
      }),
    );
  });

  it('should delete a job if owner', async () => {
    const userId = 1;
    const jobId = 100;

    // Mock existing job owned by user's school profile
    mockPrismaService.jobListing.findUnique.mockResolvedValue({
      id: jobId,
      schoolProfile: { userId: 1 },
      teacherProfile: null,
    });
    mockPrismaService.jobListing.delete.mockResolvedValue({ id: jobId });

    await service.deleteJob(userId, 'SCHOOL', jobId);

    expect(prisma.jobListing.delete).toHaveBeenCalledWith({ where: { id: jobId } });
  });

  it('should throw forbidden if not owner', async () => {
    const userId = 1;
    const jobId = 100;

    mockPrismaService.jobListing.findUnique.mockResolvedValue({
      id: jobId,
      schoolProfile: { userId: 999 }, // Different owner
      teacherProfile: null,
    });

    await expect(service.deleteJob(userId, 'SCHOOL', jobId)).rejects.toThrow();
  });

  it('should create a job with CLOSED status by default', async () => {
    const createDto = {
      title: 'Hidden Job',
      description: 'Draft',
      subjects: ['Math'],
      regions: ['Seoul'],
      budget: 0,
      jobType: 'TEACHER_HIRING' as any,
    };

    mockPrismaService.schoolProfile.findUnique.mockResolvedValue({ id: 99, userId: 1 });
    mockPrismaService.jobListing.create.mockResolvedValue({ id: 2, ...createDto, status: 'CLOSED' });

    await service.createJob(1, createDto);

    expect(prisma.jobListing.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'CLOSED', // This is what we expect now
        }),
      }),
    );
  });

  // NEW TEST: Ensure search only returns OPEN jobs
  it('should only return OPEN jobs in search', async () => {
    await service.searchJobs({});
    expect(prisma.jobListing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'OPEN', // This is currently NOT happening in code
          active: true,
        })
      })
    );
  });
});
