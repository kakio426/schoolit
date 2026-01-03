
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
@UseGuards(AuthGuard('jwt'))
export class ReviewsController {
    constructor(private reviewsService: ReviewsService) { }

    @Post()
    async create(@Request() req, @Body() body: any) {
        return this.reviewsService.createReview(body, req.user.userId);
    }
}
