import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
  Delete,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto } from './dtos/create-job.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) { }

  @Get()
  async findAll(@Query('jobType') jobType?: string) {
    return this.jobsService.findAll({ jobType });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  async findMyJobs(@Request() req) {
    return this.jobsService.findMyJobs(req.user.userId, req.user.role);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SCHOOL, Role.TEACHER, Role.ADMIN)
  @Delete(':id')
  async delete(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.jobsService.deleteJob(req.user.userId, req.user.role, id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req?) {
    const userId = req?.user?.userId; // 로그인하지 않은 경우 undefined
    return this.jobsService.findOne(id, userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SCHOOL, Role.TEACHER, Role.ADMIN)
  @Post()
  async create(@Request() req, @Body() createJobDto: CreateJobDto) {
    return this.jobsService.createJob(req.user.userId, createJobDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SCHOOL, Role.TEACHER, Role.ADMIN)
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    return this.jobsService.update(id, req.user.userId, req.user.role, updateJobDto);
  }
}
