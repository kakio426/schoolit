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
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto } from './dtos/create-job.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  async findAll(@Query('jobType') jobType?: string) {
    return this.jobsService.findAll({ jobType });
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SCHOOL)
  @Post()
  async create(@Request() req, @Body() createJobDto: CreateJobDto) {
    return this.jobsService.createJob(req.user.userId, createJobDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SCHOOL)
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    return this.jobsService.updateJob(req.user.userId, id, updateJobDto);
  }
}
