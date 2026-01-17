import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, EvaluationType } from '@prisma/client';

@Injectable()
export class EvaluationsService {
  constructor(private prisma: PrismaService) {}

  async submitAggregatedEvaluation(jobListingId: number, applicationId: number, payload: any) {
    if (!payload.evaluators || payload.evaluators.length < 3) {
      throw new BadRequestException('최소 3명 이상의 심사위원 평가가 필요합니다.');
    }

    const totalSum = payload.evaluators.reduce((acc: number, curr: any) => acc + curr.score, 0);
    const average = totalSum / payload.evaluators.length;
    const typeStr = payload.type || 'DOCUMENT';
    const evalType = typeStr as EvaluationType;

    const existing = await this.prisma.evaluation.findFirst({
      where: { applicationId, type: evalType },
    });

    if (existing) {
      return this.prisma.evaluation.update({
        where: { id: existing.id },
        data: {
          totalScore: average,
          aggregatedData: payload as Prisma.InputJsonValue,
        },
      });
    }

    return this.prisma.evaluation.create({
      data: {
        jobListing: { connect: { id: jobListingId } },
        application: { connect: { id: applicationId } },
        type: evalType,
        totalScore: average,
        aggregatedData: payload as Prisma.InputJsonValue,
        evaluatorName: 'AGGREGATED_ADMIN',
      },
    });
  }
}
