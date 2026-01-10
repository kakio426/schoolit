import {
  Controller,
  Get,
  Patch,
  Body,
  Post,
  Put,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UpdateSchoolProfileDto } from './dtos/update-school-profile.dto';

import {
  CreateTeacherExperienceDto,
  CreateTeacherEducationDto,
  CreateTeacherLinkDto,
  CreateTeacherLicenseDto,
} from './dtos/teacher-details.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GamificationService } from './gamification.service';

import { CloudinaryService } from '../common/storage/cloudinary.service';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private gamificationService: GamificationService,
    private cloudinaryService: CloudinaryService,
  ) { }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req) {
    // 1. Get Profile with Stats
    const user = await this.userService.getProfileWithStats(req.user.userId, req.user.userId);

    if (!user) return null;

    // 2. Calculate Gamification Data
    const completeness = await this.gamificationService.calculateProfileCompleteness(
      req.user.userId,
    );
    const tier = await this.gamificationService.updateTrustTier(req.user.userId); // Auto-update tier

    // 3. Merge
    return {
      ...user,
      profileCompleteness: completeness,
      trustTier: tier,
    };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SCHOOL)
  @Get('school/profile')
  async getSchoolProfile(@Request() req) {
    const profile = await this.userService.getSchoolProfile(req.user.userId);
    return profile || {}; // Return empty object if not found, or let client handle null
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SCHOOL)
  @Patch('school/profile')
  async updateSchoolProfile(@Request() req, @Body() dto: UpdateSchoolProfileDto) {
    const profile = await this.userService.updateSchoolProfile(req.user.userId, dto);
    return { schoolProfile: profile }; // Return wrapped to match test expectation
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.TEACHER)
  @Get('teacher-profile/me')
  async getTeacherProfile(@Request() req) {
    const profile = await this.userService.getTeacherProfile(req.user.userId);
    return profile || {}; // Return empty object if not found
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/profile')
  async getPublicProfile(@Param('id', ParseIntPipe) userId: number, @Request() req) {
    return this.userService.getProfileWithStats(userId, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.userId, updateProfileDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('teacher/experience')
  async addExperience(@Request() req, @Body() dto: CreateTeacherExperienceDto) {
    return this.userService.addExperience(req.user.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('teacher/experience/:id')
  async removeExperience(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.userService.removeExperience(req.user.userId, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('teacher/education')
  async addEducation(@Request() req, @Body() dto: CreateTeacherEducationDto) {
    return this.userService.addEducation(req.user.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('teacher/education/:id')
  async removeEducation(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.userService.removeEducation(req.user.userId, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('teacher/link')
  async addLink(@Request() req, @Body() dto: CreateTeacherLinkDto) {
    return this.userService.addLink(req.user.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('teacher/link/:id')
  async removeLink(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.userService.removeLink(req.user.userId, id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SCHOOL)
  @Post('school/logo/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSchoolLogo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    const publicId = await this.cloudinaryService.uploadFile(file, 'schools/logos');
    const fileUrl = this.cloudinaryService.getFileUrl(publicId);
    return { fileUrl };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('teacher/image/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTeacherImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    const publicId = await this.cloudinaryService.uploadFile(file, 'teachers/images');
    const fileUrl = this.cloudinaryService.getFileUrl(publicId);
    return { fileUrl };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('teacher/license')
  async addLicense(@Request() req, @Body() dto: CreateTeacherLicenseDto) {
    return this.userService.addLicense(req.user.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('teacher/license/:id')
  async removeLicense(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.userService.removeLicense(req.user.userId, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('role')
  async updateRole(@Request() req, @Body('role') role: Role) {
    if (!([Role.TEACHER, Role.SCHOOL, Role.BUSINESS] as Role[]).includes(role)) {
      throw new BadRequestException('Invalid role selection');
    }
    return this.userService.updateRole(req.user.userId, role);
  }
  @UseGuards(AuthGuard('jwt'))
  @Patch('settings')
  async updateSettings(@Request() req, @Body() settings: any) {
    return this.userService.updateSettings(req.user.userId, settings);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('reset-test-user')
  async resetTestUser(@Request() req) {
    return this.userService.resetTestUser(req.user.userId);
  }

  // Admin-only: List all users
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/all-users')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  // Admin-only: Reset any user by ID
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/reset-user/:id')
  async resetUserById(@Param('id', ParseIntPipe) userId: number) {
    return this.userService.resetTestUser(userId);
  }

  // ============================================
  // Account Deletion - 회원 탈퇴
  // ============================================

  /**
   * 회원 탈퇴 (Soft Delete)
   * DELETE /users/me
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete('me')
  async deleteAccount(@Request() req) {
    return this.userService.deleteAccount(req.user.userId);
  }
}
