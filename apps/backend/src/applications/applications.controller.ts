import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplyJobDto } from './dtos/apply-job.dto';
import { UpdateApplicationStatusDto } from './dtos/update-status.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('applications')
export class ApplicationsController {
    constructor(private applicationsService: ApplicationsService) { }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.TEACHER)
    @Post(':id/apply')
    async apply(@Request() req, @Param('id', ParseIntPipe) jobId: number, @Body() dto: ApplyJobDto) {
        return this.applicationsService.applyToJob(req.user.userId, jobId, dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    async getMyApplications(@Request() req) {
        return this.applicationsService.getMyApplications(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.SCHOOL)
    @Get('jobs/:id')
    async getJobApplications(@Request() req, @Param('id', ParseIntPipe) jobId: number) {
        return this.applicationsService.getJobApplications(req.user.userId, jobId);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.SCHOOL)
    @Post(':id/suggest')
    async suggest(
        @Request() req,
        @Param('id', ParseIntPipe) jobId: number,
        @Body('teacherUserId', ParseIntPipe) teacherUserId: number
    ) {
        return this.applicationsService.suggestJob(req.user.userId, jobId, teacherUserId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/status')
    async updateStatus(@Request() req, @Param('id', ParseIntPipe) appId: number, @Body() dto: UpdateApplicationStatusDto) {
        return this.applicationsService.updateStatus(req.user.userId, appId, dto.status);
    }
}
