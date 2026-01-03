import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../users/user.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('matching')
export class MatchingController {
    constructor(
        private matchingService: MatchingService,
        private userService: UserService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('jobs')
    async searchJobs(@Query() query: { subject?: string; region?: string; keyword?: string }) {
        return this.matchingService.searchJobs(query);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.SCHOOL)
    @Get('teachers')
    async searchTeachers(@Query() query: { subject?: string; region?: string; keyword?: string }) {
        return this.matchingService.searchTeachers(query);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('recommended-jobs')
    async getRecommendedJobs(@Request() req) {
        const teacherProfile = await this.userService.getTeacherProfile(req.user.userId);

        if (!teacherProfile) {
            return [];
        }

        return this.matchingService.getRecommendedJobs({
            subjects: teacherProfile.subjects,
            regions: teacherProfile.regions,
            verified: teacherProfile.isVerified,
        });
    }
}
