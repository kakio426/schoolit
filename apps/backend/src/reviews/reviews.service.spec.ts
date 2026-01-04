
import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

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
    },
};

describe('ReviewsService', () => {
    let service: ReviewsService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReviewsService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        service = module.get<ReviewsService>(ReviewsService);
        prisma = module.get<PrismaService>(PrismaService);
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
            keywords: ['Punctual']
        };

        // Mock Application (Hired)
        mockPrisma.jobApplication.findUnique.mockResolvedValue({
            id: 1,
            status: 'HIRED',
            jobListing: { schoolProfile: { userId: 1 } }
        });

        // Mock Receiver (Teacher)
        mockPrisma.user.findUnique.mockResolvedValue({
            id: 2,
            role: 'TEACHER'
        });

        mockPrisma.review.create.mockResolvedValue({ id: 1 });

        // Act
        await service.createReview(dto, userId);

        // Assert
        expect(mockPrisma.review.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                rating: null // Must be null
            })
        }));
    });

    it('should keep rating if receiver is business or school', async () => {
        // Arrange
        const userId = 1;
        const dto = {
            jobId: 100,
            receiverId: 3,
            content: 'Great business',
            rating: 5
        };

        // Mock Application (Hired)
        mockPrisma.jobApplication.findUnique.mockResolvedValue({
            id: 2,
            status: 'HIRED',
            jobListing: { schoolProfile: { userId: 1 } }
        });

        // Mock Receiver (Business)
        mockPrisma.user.findUnique.mockResolvedValue({
            id: 3,
            role: 'BUSINESS'
        });

        mockPrisma.review.create.mockResolvedValue({ id: 2 });

        // Act
        await service.createReview(dto, userId);

        // Assert
        expect(mockPrisma.review.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                rating: 5 // Must be preserved
            })
        }));
    });
});
