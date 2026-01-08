import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IStorageService, STORAGE_SERVICE } from '../common/storage/interfaces/storage.interface';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private storageService: IStorageService,
  ) { }

  async createReview(dto: any, userId: number, files?: Express.Multer.File[]) {
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

    // [Legal Defense] Closed-Loop Review System
    // Only 'HIRED' (Matched) users can write reviews to prevent false/competitor attacks.
    // This supports the 'Transaction-Verified' trust model.
    if (application.status !== 'HIRED' && application.status !== 'PAYMENT_COMPLETED') {
      // Validating both for backward/forward compatibility
      throw new ForbiddenException('Reviews are restricted to matched (verified) transactions only.');
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

    // 4. Upload images (max 5)
    const imageIds: string[] = [];
    if (files && files.length > 0) {
      for (const file of files.slice(0, 5)) {
        const imageId = await this.storageService.uploadFile(file, 'reviews');
        imageIds.push(imageId);
      }
    }

    // 5. Create Review
    const review = await this.prisma.review.create({
      data: {
        senderId: userId,
        receiverId,
        jobId,
        content,
        rating: finalRating,
        reMatchIntent: reMatchIntent ?? true,
        imageIds,
        keywords: keywords
          ? {
            connectOrCreate: keywords.map((k: string) => ({
              where: { keyword: k },
              create: { keyword: k },
            })),
          }
          : undefined,
      },
      include: {
        keywords: true,
        sender: { select: { id: true, name: true, role: true } },
      },
    });

    return {
      ...review,
      imageUrls: review.imageIds.map((id) => this.storageService.getFileUrl(id)),
    };
  }

  // ============================================
  // Review Archive - 받은 리뷰 조회
  // ============================================

  async getReviewsByReceiver(userId: number) {
    const reviews = await this.prisma.review.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            isDeleted: true,
            schoolProfile: { select: { schoolName: true } },
          },
        },
        keywords: true,
      },
    });

    return reviews.map((review) => ({
      ...review,
      imageUrls: review.imageIds.map((id) => this.storageService.getFileUrl(id)),
      sender: review.sender.isDeleted
        ? { ...review.sender, name: '탈퇴한 사용자', schoolProfile: null }
        : review.sender,
    }));
  }

  // ============================================
  // Review Archive - 작성한 리뷰 조회
  // ============================================

  async getReviewsBySender(userId: number) {
    const reviews = await this.prisma.review.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            role: true,
            isDeleted: true,
          },
        },
        keywords: true,
      },
    });

    return reviews.map((review) => ({
      ...review,
      imageUrls: review.imageIds.map((id) => this.storageService.getFileUrl(id)),
      receiver: review.receiver.isDeleted
        ? { ...review.receiver, name: '탈퇴한 사용자' }
        : review.receiver,
    }));
  }

  // ============================================
  // Review Statistics
  // ============================================

  async getReviewStats(userId: number) {
    const reviews = await this.prisma.review.findMany({
      where: { receiverId: userId },
      include: { keywords: true },
    });

    const totalReviews = reviews.length;

    // Average Rating (for businesses only)
    const validRatings = reviews.filter((r) => r.rating !== null).map((r) => r.rating as number);
    const averageRating =
      validRatings.length > 0
        ? validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length
        : 0;

    // Top Keywords
    const keywordCounts: Record<string, number> = {};
    reviews.forEach((review) => {
      review.keywords.forEach((kw) => {
        keywordCounts[kw.keyword] = (keywordCounts[kw.keyword] || 0) + 1;
      });
    });

    const topKeywords = Object.entries(keywordCounts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Re-match Rate
    const reMatchCount = reviews.filter((r) => r.reMatchIntent === true).length;
    const reMatchRate = totalReviews > 0 ? (reMatchCount / totalReviews) * 100 : 100;

    // Total Images
    const totalImages = reviews.reduce((sum, r) => sum + r.imageIds.length, 0);

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      topKeywords,
      reMatchRate: Math.round(reMatchRate),
      totalImages,
      isVeteran: totalReviews >= 10,
    };
  }
}
