import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplyJobDto } from './dtos/apply-job.dto';
import { UpdateApplicationStatusDto } from './dtos/update-status.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

import { DataCleanupService } from '../scheduler/data-cleanup.service';

@Controller('applications')
export class ApplicationsController {
  constructor(
    private applicationsService: ApplicationsService,
    private dataCleanupService: DataCleanupService,
  ) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.TEACHER, Role.BUSINESS)
  @Post(':id/apply')
  async apply(@Request() req, @Param('id', ParseIntPipe) jobId: number, @Body() dto: ApplyJobDto) {
    return this.applicationsService.applyToJob(req.user.userId, jobId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMyApplications(@Request() req) {
    return this.applicationsService.getMyApplications(req.user.userId, req.user.role);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SCHOOL, Role.TEACHER)
  @Get('jobs/:id')
  async getJobApplications(@Request() req, @Param('id', ParseIntPipe) jobId: number) {
    return this.applicationsService.getJobApplications(req.user.userId, jobId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SCHOOL, Role.TEACHER)
  @Post(':id/suggest')
  async suggest(
    @Request() req,
    @Param('id', ParseIntPipe) jobId: number,
    @Body('teacherUserId', ParseIntPipe) candidateUserId: number, // Use generic name internally
  ) {
    return this.applicationsService.suggestJob(req.user.userId, jobId, candidateUserId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/status')
  async updateStatus(
    @Request() req,
    @Param('id', ParseIntPipe) appId: number,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(req.user.userId, appId, dto.status);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SCHOOL)
  @Patch(':id/note')
  async updateInternalNote(
    @Request() req,
    @Param('id', ParseIntPipe) appId: number,
    @Body('note') note: string,
  ) {
    return this.applicationsService.updateInternalNote(req.user.userId, appId, note);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SCHOOL)
  @Patch(':id/compliance')
  async updateCompliance(
    @Request() req,
    @Param('id', ParseIntPipe) appId: number,
    @Body('checklist') checklist: any,
  ) {
    return this.applicationsService.updateCompliance(req.user.userId, appId, checklist);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/contract')
  async downloadContract(@Request() req, @Param('id', ParseIntPipe) appId: number, @Res() res) {
    const buffer = await this.applicationsService.generateContract(req.user.userId, appId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="contract_${appId}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/destroy-documents')
  async destroyDocuments(@Request() req, @Param('id', ParseIntPipe) appId: number) {
    return this.dataCleanupService.immediateDocumentDestruction(appId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.TEACHER, Role.BUSINESS)
  @Patch(':id/signature')
  async updateSignature(
    @Request() req,
    @Param('id', ParseIntPipe) appId: number,
    @Body('signature') signatureData: string,
  ) {
    return this.applicationsService.updateSignature(req.user.userId, appId, signatureData);
  }
}
