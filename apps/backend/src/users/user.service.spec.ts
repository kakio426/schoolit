import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma.service';
import { Role } from '@prisma/client';
import { CreateUserDto } from './dtos/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a user', async () => {
      const dto: CreateUserDto = {
        email: 'test@school.com',
        password: 'password123',
        role: Role.SCHOOL,
      };

      const expectedResult = {
        id: 1,
        ...dto,
        createdAt: new Date(),
      };

      jest.spyOn(prisma.user, 'create').mockResolvedValue(expectedResult as any);

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(result.email).toBe(dto.email);

      // Verify that create was called with hashed password
      const createCallArgs = (prisma.user.create as jest.Mock).mock.calls[0][0];
      expect(createCallArgs.data.password).not.toBe(dto.password);
      expect(prisma.user.create).toHaveBeenCalled();
    });
  });


  describe('getProfileWithStats', () => {
    it('should return profile with aggregated review stats (Test 14.3.1)', async () => {
      const userId = 10;
      const mockReviews = [
        { rating: 5, keywords: [{ keyword: 'Punctual' }] },
        { rating: 4, keywords: [{ keyword: 'Punctual' }, { keyword: 'Friendly' }] }
      ];

      // Mock Prisma queries using findUnique to get user and include reviews
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: userId,
        role: 'TEACHER', // Should prefer keywords
        reviewsReceived: mockReviews,
        teacherProfile: {}
      } as any);

      // We expect the service to perform aggregation in memory or simply return raw reviews for now,
      // but the requirement says "Trust Visualization ... Top 3 keywords ... Average Rating"
      // Let's assume we implement a method getProfileWithStats
      const result = await service.getProfileWithStats(userId);

      expect(result.reviewStats).toBeDefined();
      // Since role is TEACHER, rating might be hidden or null in visualization, but backend can return it.
      // Let's assert calculation correctness:
      expect(result.reviewStats.averageRating).toBe(4.5);
      expect(result.reviewStats.topKeywords).toContainEqual(expect.objectContaining({ keyword: 'Punctual', count: 2 }));
    });
  });
});
