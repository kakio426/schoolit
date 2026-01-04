import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
  Get,
  ParseIntPipe,
  Query,
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
  constructor(private adminService: AdminService) {}

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
}
