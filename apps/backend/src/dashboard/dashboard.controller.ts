import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('stats')
  async getStats(@Request() req) {
    return this.dashboardService.getStats(req.user.userId, req.user.role);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('activity')
  async getRecentActivity(@Request() req) {
    return this.dashboardService.getRecentActivity(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('summary')
  async getSummary(@Request() req) {
    return this.dashboardService.getSummary(req.user.userId, req.user.role);
  }
}
