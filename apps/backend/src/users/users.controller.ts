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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) { }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req) {
    return this.userService.getProfileWithStats(req.user.userId, req.user.userId);
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `school-logo-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadSchoolLogo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    return { fileUrl: `/uploads/${file.filename}` };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('teacher/image/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `teacher-img-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadTeacherImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    return { fileUrl: `/uploads/${file.filename}` };
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
    if (!([Role.TEACHER, Role.SCHOOL] as Role[]).includes(role)) {
      throw new BadRequestException('Invalid role selection');
    }
    return this.userService.updateRole(req.user.userId, role);
  }
  @UseGuards(AuthGuard('jwt'))
  @Patch('settings')
  async updateSettings(@Request() req, @Body() settings: any) {
    return this.userService.updateSettings(req.user.userId, settings);
  }
}
