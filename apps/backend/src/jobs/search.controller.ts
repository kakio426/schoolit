import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('search')
export class SearchController {
  constructor(private jobsService: JobsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('jobs')
  async searchJobs(@Query() query: { subject?: string; region?: string; keyword?: string }) {
    return this.jobsService.searchJobs(query);
  }
}
