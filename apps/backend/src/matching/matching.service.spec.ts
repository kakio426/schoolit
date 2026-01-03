import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from './matching.service';
import { PrismaService } from '../prisma.service';

describe('MatchingService', () => {
  let service: MatchingService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        {
          provide: PrismaService,
          useValue: {
            jobListing: {
              findMany: jest.fn(),
            },
            teacherProfile: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateMatchScore', () => {
    it('should return 100 for perfect match (Test 10.2.1a)', () => {
      const job = {
        subjects: ['수학'],
        regions: ['서울'],
      };

      const teacher = {
        subjects: ['수학'],
        regions: ['서울'],
        verified: true,
      };

      const score = service.calculateMatchScore(job, teacher);
      expect(score).toBe(100);
    });

    it('should return 0 for no subject match (Test 10.2.1b)', () => {
      const job = {
        subjects: ['수학'],
        regions: ['서울'],
      };

      const teacher = {
        subjects: ['영어'],
        regions: ['서울'],
        verified: false,
      };

      const score = service.calculateMatchScore(job, teacher);
      expect(score).toBe(0);
    });

    it('should return 50 for subject match only (Test 10.2.1c)', () => {
      const job = {
        subjects: ['수학'],
        regions: ['서울'],
      };

      const teacher = {
        subjects: ['수학'],
        regions: ['부산'],
        verified: false,
      };

      const score = service.calculateMatchScore(job, teacher);
      expect(score).toBe(50); // Subject match (50%)
    });

    it('should return 80 for subject + region match (Test 10.2.1d)', () => {
      const job = {
        subjects: ['수학'],
        regions: ['서울'],
      };

      const teacher = {
        subjects: ['수학'],
        regions: ['서울'],
        verified: false,
      };

      const score = service.calculateMatchScore(job, teacher);
      expect(score).toBe(80); // Subject (50%) + Region (30%)
    });
  });
});
