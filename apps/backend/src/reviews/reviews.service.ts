import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(dto: any, userId: number) {
    const { jobId, receiverId, content, rating, keywords, reMatchIntent } = dto;

    // 1. Verify Application Status
    const application = await this.prisma.jobApplication.findUnique({
      where: {
        jobId_userId: { jobId, userId: receiverId },
      },
      include: {
        jobListing: { include: { schoolProfile: true } },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const jobOwnerId = application.jobListing.schoolProfile.userId;
    if (jobOwnerId !== userId) {
      throw new ForbiddenException('Only the job owner can leave a review');
    }

    if (application.status !== 'HIRED') {
      throw new ForbiddenException('Reviews can only be written for HIRED jobs');
    }

    // 2. Determine Receiver Type
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) throw new NotFoundException('Receiver not found');

    // 3. Logic based on role
    let finalRating = rating;
    if (receiver.role === 'TEACHER') {
      finalRating = null;
    }

    // 4. Create Review
    const review = await this.prisma.review.create({
      data: {
        senderId: userId,
        receiverId,
        jobId,
        content,
        rating: finalRating,
        reMatchIntent: reMatchIntent ?? true,
        keywords: keywords
          ? {
              connectOrCreate: keywords.map((k: string) => ({
                where: { keyword: k },
                create: { keyword: k },
              })),
            }
          : undefined,
      },
    });

    // 5. Auto-complete logic removed - HIRED is the final active stage

    return review;
  }
}
