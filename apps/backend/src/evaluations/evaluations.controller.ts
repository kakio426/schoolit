import { Controller, Post, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('evaluations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Roles(Role.SCHOOL)
  @Post(':jobId/applications/:appId')
  async submitEvaluation(
    @Param('jobId', ParseIntPipe) jobId: number,
    @Param('appId', ParseIntPipe) appId: number,
    @Body() payload: any,
  ) {
    return this.evaluationsService.submitAggregatedEvaluation(jobId, appId, payload);
  }
}
