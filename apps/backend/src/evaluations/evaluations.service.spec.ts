import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationsService } from './evaluations.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException } from '@nestjs/common';

const mockPrismaService = {
  evaluation: {
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
  },
};

describe('EvaluationsService', () => {
  let service: EvaluationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvaluationsService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<EvaluationsService>(EvaluationsService);
  });

  describe('submitAggregatedEvaluation', () => {
    it('should calculate correct average score', async () => {
      mockPrismaService.evaluation.create.mockImplementation((args) => ({ ...args.data, id: 1 }));
      mockPrismaService.evaluation.update.mockImplementation((args) => ({ ...args.data, id: 1 }));
      mockPrismaService.evaluation.findFirst.mockResolvedValue(null);

      const payload = {
        type: 'DOCUMENT',
        evaluators: [
          { name: 'A', score: 80 },
          { name: 'B', score: 90 },
          { name: 'C', score: 100 },
        ],
      };

      const result = await service.submitAggregatedEvaluation(1, 10, payload);
      expect(result.totalScore).toBe(90);
    });

    it('should throw error if less than 3 evaluators', async () => {
      const payload = {
        evaluators: [{ name: 'A', score: 80 }],
      };
      await expect(service.submitAggregatedEvaluation(1, 10, payload)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
