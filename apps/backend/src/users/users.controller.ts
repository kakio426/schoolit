import { Controller, Get, Patch, Body, Post, Put, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException, Param, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CertificationService } from './certification.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UpdateSchoolProfileDto } from './dtos/update-school-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private certService: CertificationService,
  ) { }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req) {
    return this.userService.getProfileWithStats(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/profile')
  async getPublicProfile(@Param('id', ParseIntPipe) userId: number) {
    return this.userService.getProfileWithStats(userId);
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
  @Post('certifications/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
          return cb(null, false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadCertification(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required or invalid file type');
    }

    // Create record in DB
    const certification = await this.certService.createCertification(req.user.userId, {
      name: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
    });

    return certification;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('certifications')
  async getCertifications(@Request() req) {
    return this.certService.getCertifications(req.user.userId);
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
