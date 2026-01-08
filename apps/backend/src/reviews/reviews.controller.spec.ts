import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma.service';
import { ForbiddenException } from '@nestjs/common';
import { STORAGE_SERVICE } from '../common/storage/interfaces/storage.interface';

// Mock PrismaService
const mockPrisma = {
  jobApplication: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  review: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  reviewKeyword: {
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

const mockStorageService = {
  uploadFile: jest.fn().mockResolvedValue('mock-image-id'),
  deleteFile: jest.fn().mockResolvedValue(undefined),
  getFileUrl: jest.fn().mockImplementation((id: string) => `https://mock.url/${id}`),
};

describe('ReviewsController (TDD)', () => {
  let controller: ReviewsController;
  let service: ReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: STORAGE_SERVICE, useValue: mockStorageService },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
    service = module.get<ReviewsService>(ReviewsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test 14.2.1: 403 if not HIRED
  it('should throw ForbiddenException if user is not hired for the job (Test 14.2.1)', async () => {
    // Mock application that is PENDING
    mockPrisma.jobApplication.findUnique.mockResolvedValue({
      status: 'PENDING',
      userId: 2, // Applicant
      jobListing: { schoolProfile: { userId: 1 } }, // Job Owner
    });

    const dto = {
      jobId: 100,
      receiverId: 2,
      content: 'Great work',
      rating: 5,
    };

    const req = { user: { userId: 1 } };

    await expect(controller.create(req, dto)).rejects.toThrow(ForbiddenException);
  });

  // Test 14.2.2: Star ratings ignored/error policy check
  it('should create review if status is HIRED', async () => {
    mockPrisma.jobApplication.findUnique.mockResolvedValue({
      status: 'HIRED',
      userId: 2,
      jobListing: { schoolProfile: { userId: 1 } },
    });

    mockPrisma.user.findUnique.mockResolvedValue({ id: 2, role: 'TEACHER' });
    mockPrisma.review.create.mockResolvedValue({
      id: 1,
      imageIds: [],
      keywords: [],
      sender: { id: 1, name: 'Test', role: 'SCHOOL' },
    });

    const dto = { jobId: 100, receiverId: 2, content: 'Good' };
    const req = { user: { userId: 1 } };

    await expect(controller.create(req, dto)).resolves.toBeDefined();
  });
});
