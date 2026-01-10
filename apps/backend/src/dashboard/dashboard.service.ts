import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Role, Prisma } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) { }

  async getStats(userId: number, role: Role) {
    const stats: any = {};

    // 1. Common Stats
    stats.unreadNotifications = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    stats.unreadMessages = await this.prisma.chatMessage.count({
      where: {
        chatRoom: { users: { some: { id: userId } } },
        senderId: { not: userId },
        read: false,
      },
    });

    // 2. Role Specific Stats
    if (role === Role.TEACHER) {
      stats.activeApplications = await this.prisma.jobApplication.count({
        where: {
          userId,
          status: { in: ['PENDING', 'DOCUMENT_SCREENING', 'INTERVIEWING', 'VERIFICATION'] },
        },
      });

      // Get Match Rate for Teacher (from User Statistics if available or calculate)
      // For now, let's keep it simple
      const reviews = await this.prisma.review.findMany({
        where: { receiverId: userId },
      });
      const reMatchCount = reviews.filter((r) => r.reMatchIntent).length;
      stats.reMatchRate = reviews.length > 0 ? (reMatchCount / reviews.length) * 100 : 100;
    } else if (role === Role.BUSINESS) {
      stats.activeApplications = await this.prisma.jobApplication.count({
        where: {
          userId,
          status: { in: ['PENDING', 'BIDDING', 'CONTRACTING', 'EXECUTING'] },
        },
      });
      // Business match rate?
      const reviews = await this.prisma.review.findMany({
        where: { receiverId: userId },
      });
      const reMatchCount = reviews.filter((r) => r.reMatchIntent).length;
      stats.reMatchRate = reviews.length > 0 ? (reMatchCount / reviews.length) * 100 : 100;
    } else if (role === Role.SCHOOL) {
      const user: any = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          schoolProfile: true,
        },
      });

      const profile = user?.schoolProfile;

      if (profile) {
        const profileId = (profile as any).id;
        stats.activeListings = await this.prisma.jobListing.count({
          where: {
            schoolProfileId: profileId,
            status: 'OPEN',
          },
        });

        stats.pendingApplications = await this.prisma.jobApplication.count({
          where: {
            jobListing: {
              schoolProfileId: profileId,
            },
            status: 'PENDING',
          },
        });
      }
    }

    return stats;
  }

  async getRecentActivity(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
  }

  async getSummary(userId: number, role: Role) {
    const [stats, activity] = await Promise.all([
      this.getStats(userId, role),
      this.getRecentActivity(userId),
    ]);

    return { stats, activity };
  }
}
