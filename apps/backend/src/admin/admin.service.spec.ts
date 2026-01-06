import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma.service';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              count: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
            jobListing: { count: jest.fn() },
            schoolProfile: {
              count: jest.fn(),
              findMany: jest.fn().mockResolvedValue([
                { id: 1, user: { name: 'Test School', email: 'school@test.com' } }
              ]),
              update: jest.fn().mockResolvedValue({ id: 1, isVerified: true }),
            },
            teacherProfile: { count: jest.fn() },
            certification: {
              update: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSystemStats', () => {
    it('should return system stats', async () => {
      (prisma.user.count as jest.Mock).mockResolvedValue(100);
      (prisma.jobListing.count as jest.Mock).mockResolvedValue(50);
      (prisma.schoolProfile.count as jest.Mock).mockResolvedValue(20);
      (prisma.teacherProfile.count as jest.Mock).mockResolvedValue(80);

      const stats = await service.getSystemStats();
      expect(stats).toEqual({
        totalUsers: 100,
        totalJobs: 50,
        totalSchools: 20,
        totalTeachers: 80,
      });
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const mockUsers = [{ id: 1, email: 'test@example.com' }];
      (prisma.user.count as jest.Mock).mockResolvedValue(1);
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await service.getUsers(1, 10);
      expect(result).toEqual({
        data: mockUsers,
        total: 1,
        page: 1,
        limit: 10,
      });
    });
  });
  describe('getPendingSchoolProfiles', () => {
    it('should return pending school profiles', async () => {
      const result = await service.getPendingSchoolProfiles();
      expect(prisma.schoolProfile.findMany).toHaveBeenCalledWith({
        where: { isVerified: false },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('verifySchoolProfile', () => {
    it('should verify a school profile', async () => {
      const result = await service.verifySchoolProfile(1, true);
      expect(prisma.schoolProfile.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isVerified: true },
      });
      expect(result).toEqual({ id: 1, isVerified: true });
    });
  });
});
