import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
@UseGuards(AuthGuard('jwt'))
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) { }

  /**
   * 리뷰 작성 (이미지 첨부 가능)
   * POST /reviews
   */
  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @Request() req,
    @Body() body: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.reviewsService.createReview(body, req.user.userId, files);
  }

  /**
   * 받은 리뷰 조회 (내 아카이브)
   * GET /reviews/received
   */
  @Get('received')
  async getMyReceivedReviews(@Request() req) {
    return this.reviewsService.getReviewsByReceiver(req.user.userId);
  }

  /**
   * 특정 사용자가 받은 리뷰 조회
   * GET /reviews/received/:userId
   */
  @Get('received/:userId')
  async getReceivedReviews(@Param('userId', ParseIntPipe) userId: number) {
    return this.reviewsService.getReviewsByReceiver(userId);
  }

  /**
   * 작성한 리뷰 조회
   * GET /reviews/sent
   */
  @Get('sent')
  async getMySentReviews(@Request() req) {
    return this.reviewsService.getReviewsBySender(req.user.userId);
  }

  /**
   * 리뷰 통계 조회
   * GET /reviews/stats/:userId
   */
  @Get('stats/:userId')
  async getReviewStats(@Param('userId', ParseIntPipe) userId: number) {
    return this.reviewsService.getReviewStats(userId);
  }

  /**
   * 내 리뷰 통계 조회
   * GET /reviews/stats
   */
  @Get('stats')
  async getMyReviewStats(@Request() req) {
    return this.reviewsService.getReviewStats(req.user.userId);
  }
}

