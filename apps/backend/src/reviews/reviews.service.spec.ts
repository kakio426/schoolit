import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma.service';
import { STORAGE_SERVICE } from '../common/storage/interfaces/storage.interface';

const mockPrisma = {
  jobApplication: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  review: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockStorageService = {
  uploadFile: jest.fn().mockResolvedValue('mock-image-id'),
  deleteFile: jest.fn().mockResolvedValue(undefined),
  getFileUrl: jest.fn().mockImplementation((id: string) => `https://mock.url/${id}`),
};

describe('ReviewsService', () => {
  let service: ReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: STORAGE_SERVICE, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    jest.clearAllMocks();
  });

  it('should force rating to null if receiver is TEACHER', async () => {
    // Arrange
    const userId = 1;
    const dto = {
      jobId: 100,
      receiverId: 2,
      content: 'Great teacher',
      rating: 5, // Sending rating
      keywords: ['Punctual'],
    };

    // Mock Application (Hired)
    mockPrisma.jobApplication.findUnique.mockResolvedValue({
      id: 1,
      status: 'HIRED',
      jobListing: { schoolProfile: { userId: 1 } },
    });

    // Mock Receiver (Teacher)
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 2,
      role: 'TEACHER',
    });

    mockPrisma.review.create.mockResolvedValue({
      id: 1,
      imageIds: [],
      keywords: [],
      sender: { id: 1, name: 'Test', role: 'SCHOOL' },
    });

    // Act
    await service.createReview(dto, userId);

    // Assert
    expect(mockPrisma.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          rating: null, // Must be null
          imageIds: [],
        }),
      }),
    );
  });

  it('should keep rating if receiver is business or school', async () => {
    // Arrange
    const userId = 1;
    const dto = {
      jobId: 100,
      receiverId: 3,
      content: 'Great business',
      rating: 5,
    };

    // Mock Application (Hired)
    mockPrisma.jobApplication.findUnique.mockResolvedValue({
      id: 2,
      status: 'HIRED',
      jobListing: { schoolProfile: { userId: 1 } },
    });

    // Mock Receiver (Business)
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 3,
      role: 'BUSINESS',
    });

    mockPrisma.review.create.mockResolvedValue({
      id: 2,
      imageIds: [],
      keywords: [],
      sender: { id: 1, name: 'Test', role: 'SCHOOL' },
    });

    // Act
    await service.createReview(dto, userId);

    // Assert
    expect(mockPrisma.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          rating: 5, // Must be preserved
          imageIds: [],
        }),
      }),
    );
  });

  it('should upload images and include imageIds in review', async () => {
    // Arrange
    const userId = 1;
    const dto = {
      jobId: 100,
      receiverId: 2,
      content: 'Great work with photos',
      rating: null,
    };

    const mockFiles = [
      { buffer: Buffer.from('img1'), mimetype: 'image/jpeg' },
      { buffer: Buffer.from('img2'), mimetype: 'image/png' },
    ] as Express.Multer.File[];

    mockPrisma.jobApplication.findUnique.mockResolvedValue({
      id: 1,
      status: 'HIRED',
      jobListing: { schoolProfile: { userId: 1 } },
    });

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 2,
      role: 'TEACHER',
    });

    mockPrisma.review.create.mockResolvedValue({
      id: 1,
      imageIds: ['mock-image-id', 'mock-image-id'],
      keywords: [],
      sender: { id: 1, name: 'Test', role: 'SCHOOL' },
    });

    // Act
    const result = await service.createReview(dto, userId, mockFiles);

    // Assert
    expect(mockStorageService.uploadFile).toHaveBeenCalledTimes(2);
    expect(result.imageUrls).toHaveLength(2);
  });
});

