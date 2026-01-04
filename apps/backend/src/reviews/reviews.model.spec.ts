import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';

describe('Review Data Model (TDD)', () => {
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be able to access review table (fail if not exists)', async () => {
    // This test is expected to fail or throw TS error initially
    // @ts-ignore
    expect(prisma.review).toBeDefined();
  });

  it('should be able to access reviewKeyword table (fail if not exists)', async () => {
    // @ts-ignore
    expect(prisma.reviewKeyword).toBeDefined();
  });
});
