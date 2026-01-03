import { Controller, Patch, Param, Body, UseGuards, Get, ParseIntPipe } from '@nestjs/common';
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
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('status') status: CertStatus,
    ) {
        return this.adminService.updateCertificationStatus(id, status);
    }
}
