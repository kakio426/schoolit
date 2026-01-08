import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    UseGuards,
    Request,
    Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
@UseGuards(AuthGuard('jwt'))
export class RecommendationsController {
    constructor(private recommendationsService: RecommendationsService) { }

    /**
     * 채용 공고에 맞는 강사 추천 (학교용)
     * GET /recommendations/teachers?jobId=X
     */
    @Get('teachers')
    async getTeacherRecommendations(
        @Query('jobId', ParseIntPipe) jobId: number,
        @Query('limit') limit?: string,
    ) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.recommendationsService.findMatchingTeachers(jobId, limitNum);
    }

    /**
     * 로그인한 강사에게 맞는 공고 추천
     * GET /recommendations/jobs
     */
    @Get('jobs')
    async getJobRecommendations(@Request() req, @Query('limit') limit?: string) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.recommendationsService.findMatchingJobs(req.user.userId, limitNum);
    }

    /**
     * 행사 요청에 맞는 업체 추천
     * GET /recommendations/businesses?jobId=X
     */
    @Get('businesses')
    async getBusinessRecommendations(
        @Query('jobId', ParseIntPipe) jobId: number,
        @Query('limit') limit?: string,
    ) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.recommendationsService.findMatchingBusinesses(jobId, limitNum);
    }
}
