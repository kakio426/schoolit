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

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: userId,
        role: 'TEACHER',
        reviewsReceived: mockReviews,
        teacherProfile: {}
      } as any);

      const result = await service.getProfileWithStats(userId);

      expect(result.reviewStats).toBeDefined();
      expect(result.reviewStats.averageRating).toBe(4.5);
      expect(result.reviewStats.topKeywords).toContainEqual(expect.objectContaining({ keyword: 'Punctual', count: 2 }));
    });
  });

  describe('findOrCreateSocialUser', () => {
    it('should create a new user with PENDING role (Test 1.1)', async () => {
      const email = 'newsocial@test.com';
      const name = 'New User';
      const provider = 'KAKAO' as any;
      const snsId = '12345';

      // 1. snsId로 유저가 없는 경우 (null 반환)
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      // 2. create 호출 시 PENDING 역할로 생성되는지 확인
      const createSpy = jest.spyOn(service, 'create').mockResolvedValue({
        id: 1,
        email,
        name,
        role: 'PENDING',
        provider,
        snsId,
      } as any);

      const result = await service.findOrCreateSocialUser(email, name, provider, snsId);

      expect(result.role).toBe('PENDING');
      expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
        role: 'PENDING',
        provider,
        snsId,
      }));
    });

    it('should link to existing user if email matches but snsId is new (Test 1.2)', async () => {
      // 이 시나리오는 UserService.findOrCreateSocialUser의 현재 로직에는 없으므로 
      // 추가 구현이 필요함을 나타내는 RED 테스트가 될 것입니다.
      const email = 'existing@test.com';
      const name = 'Existing User';
      const provider = 'NAVER' as any;
      const snsId = '67890';

      // 1. snsId로는 유저가 없음
      jest.spyOn(prisma.user, 'findUnique')
        .mockResolvedValueOnce(null) // findUserBySnsId
        .mockResolvedValueOnce({ id: 2, email, role: 'TEACHER' } as any); // findOne (email)

      // 3. 기존 유저에 snsId와 provider를 업데이트하는 로직이 필요함
      const updateSpy = jest.fn().mockResolvedValue({
        id: 2,
        email,
        role: 'TEACHER',
        provider,
        snsId
      });
      (prisma.user as any).update = updateSpy;

      const result = await service.findOrCreateSocialUser(email, name, provider, snsId);

      expect(result.id).toBe(2);
      expect(updateSpy).toHaveBeenCalled();
    });
  });
});
