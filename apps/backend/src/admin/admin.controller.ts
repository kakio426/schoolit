import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
  Get,
  ParseIntPipe,
  Query,
  Delete,
  Post,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, CertStatus } from '@prisma/client';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) { }

  @Get('certifications/pending')
  async getPendingCertifications() {
    return this.adminService.getPendingCertifications();
  }

  @Patch('certifications/:id/status')
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: CertStatus) {
    return this.adminService.updateCertificationStatus(id, status);
  }
  @Get('stats')
  async getStats() {
    return this.adminService.getSystemStats();
  }

  @Get('users')
  async getUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = '',
  ) {
    return this.adminService.getUsers(+page, +limit, search);
  }

  @Get('business/pending')
  async getPendingBusinessProfiles() {
    return this.adminService.getPendingBusinessProfiles();
  }

  @Patch('business/:id/verify')
  async updateBusinessProfileStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('isVerified') isVerified: boolean,
  ) {
    return this.adminService.updateBusinessProfileStatus(id, isVerified);
  }

  @Patch('users/:id/ban')
  async toggleBanUser(
    @Param('id', ParseIntPipe) id: number,
    @Body('isBanned') isBanned: boolean,
  ) {
    return isBanned
      ? this.adminService.banUser(id)
      : this.adminService.unbanUser(id);
  }

  @Patch('users/:id/role')
  async changeUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: string,
  ) {
    return this.adminService.changeUserRole(id, role);
  }

  @Get('reviews')
  async getReviews(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search: string = '',
  ) {
    return this.adminService.getReviews(+page, +limit, search);
  }

  @Delete('reviews/:id')
  async deleteReview(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteReview(id);
  }

  @Post('notifications/broadcast')
  async broadcastNotification(
    @Body('title') title: string,
    @Body('content') content: string,
    @Body('targetRoles') targetRoles?: string[],
  ) {
    return this.adminService.broadcastNotification(title, content, targetRoles);
  }
}
