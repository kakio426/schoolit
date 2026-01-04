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
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('business-profiles')
export class BusinessProfileController {
  constructor(private readonly service: BusinessProfileService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createOrUpdate(@Request() req, @Body() body: any) {
    return this.service.createOrUpdate(req.user.userId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMyProfile(@Request() req) {
    return this.service.findByUserId(req.user.userId);
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
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `biz-reg-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
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

    const fileUrl = `/uploads/${file.filename}`;
    await this.service.createOrUpdate(req.user.userId, { registrationFile: fileUrl });

    return { fileUrl };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('portfolios/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `portfolio-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
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
    return { fileUrl: `/uploads/${file.filename}` };
  }
}
