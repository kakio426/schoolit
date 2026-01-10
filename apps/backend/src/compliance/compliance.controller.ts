import { Controller, Post, Put, Get, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ComplianceService } from './compliance.service';
import { EvaluationType, HiringWorkflowStatus } from '@prisma/client';

class SaveEvaluationDto {
  jobListingId: number;
  applicationId: number;
  evaluatorName: string;
  evaluatorRole?: string;
  type: EvaluationType;
  criteriaScores: Record<string, number>;
  comment?: string;
  meritBonus?: number;
}

class UpdateWorkflowDto {
  status: HiringWorkflowStatus;
}

@Controller('compliance')
@UseGuards(AuthGuard('jwt'))
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  /**
   * 평가 점수 저장
   * POST /compliance/evaluations
   */
  @Post('evaluations')
  async saveEvaluation(@Body() dto: SaveEvaluationDto) {
    return this.complianceService.saveEvaluation(dto);
  }

  /**
   * 지원자별 종합 점수 집계 조회
   * GET /compliance/jobs/:id/scores
   */
  @Get('jobs/:id/scores')
  async getAggregatedScores(@Param('id', ParseIntPipe) jobId: number) {
    return this.complianceService.aggregateScores(jobId);
  }

  /**
   * 워크플로우 상태 업데이트
   * PUT /compliance/jobs/:id/workflow
   */
  @Put('jobs/:id/workflow')
  async updateWorkflow(@Param('id', ParseIntPipe) jobId: number, @Body() dto: UpdateWorkflowDto) {
    return this.complianceService.updateWorkflowStatus(jobId, dto.status);
  }

  /**
   * 호봉 유효성 검사
   * POST /compliance/validate-salary
   */
  @Post('validate-salary')
  validateSalary(@Body() body: { salaryStep: number; isHonoraryRetiree?: boolean }) {
    return this.complianceService.validateSalaryStep(body.salaryStep, body.isHonoraryRetiree);
  }

  /**
   * 계약 기간 유효성 검사
   * POST /compliance/validate-duration
   */
  @Post('validate-duration')
  validateDuration(@Body() body: { hiringReason: string; startDate: string; endDate: string }) {
    return this.complianceService.validateContractDuration(
      body.hiringReason,
      new Date(body.startDate),
      new Date(body.endDate),
    );
  }
}
