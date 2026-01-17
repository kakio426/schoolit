import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  UseGuards,
  Request,
  Param,
  ParseIntPipe,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BusinessProfileService } from './business-profile.service';
import { FileInterceptor } from '@nestjs/platform-express';

import { UpdateBusinessProfileDto } from '../users/dtos/update-business-profile.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

import { CloudinaryService } from '../common/storage/cloudinary.service';
import { PrismaService } from '../prisma.service';

@Controller('business-profiles')
export class BusinessProfileController {
  constructor(
    private readonly service: BusinessProfileService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly prisma: PrismaService,
  ) { }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SCHOOL, Role.TEACHER)
  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createOrUpdate(@Request() req, @Body() body: UpdateBusinessProfileDto) {
    return this.service.createOrUpdate(req.user.userId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMyProfile(@Request() req) {
    const profile = await this.service.findByUserId(req.user.userId);
    if (!profile) {
      // Return basic user info if profile hasn't been created yet
      const user = await this.prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, name: true, email: true, phone: true },
      });
      return { user, portfolios: [] };
    }
    return profile;
  }

  @Get(':userId')
  async getPublicProfile(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.findPublicProfile(userId);
  }

  // Portfolio Management
  @UseGuards(AuthGuard('jwt'))
  @Post('portfolios')
  async addPortfolio(@Request() req, @Body() body: any) {
    return this.service.addPortfolio(req.user.userId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('portfolios/:id')
  async updatePortfolio(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.service.updatePortfolio(id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('portfolios/:id')
  async deletePortfolio(@Param('id', ParseIntPipe) id: number) {
    return this.service.deletePortfolio(id);
  }

  // Business Registration Upload
  @UseGuards(AuthGuard('jwt'))
  @Post('registration-upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
          return cb(new BadRequestException('Only images and pdf allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadRegistration(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');

    const publicId = await this.cloudinaryService.uploadFile(file, 'business/registrations');
    const fileUrl = this.cloudinaryService.getFileUrl(publicId);

    await this.service.createOrUpdate(req.user.userId, { registrationFile: fileUrl });

    return { fileUrl };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('portfolios/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Only images allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadPortfolioImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    const publicId = await this.cloudinaryService.uploadFile(file, 'business/portfolios');
    const fileUrl = this.cloudinaryService.getFileUrl(publicId);
    return { fileUrl };
  }
}
