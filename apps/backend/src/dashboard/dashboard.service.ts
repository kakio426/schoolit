import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

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
          status: { in: ['PENDING', 'INTERVIEWING', 'ACCEPTED'] },
        },
      });

      // Get Match Rate for Teacher (from User Statistics if available or calculate)
      // For now, let's keep it simple
      const reviews = await this.prisma.review.findMany({
        where: { receiverId: userId },
      });
      const reMatchCount = reviews.filter((r) => r.reMatchIntent).length;
      stats.reMatchRate = reviews.length > 0 ? (reMatchCount / reviews.length) * 100 : 100;
    } else if (role === Role.SCHOOL || role === Role.BUSINESS) {
      const user: any = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          schoolProfile: true,
          businessProfile: true,
        },
      });

      const profile = role === Role.SCHOOL ? user?.schoolProfile : user?.businessProfile;

      if (profile) {
        const profileId = (profile as any).id;
        stats.activeListings = await this.prisma.jobListing.count({
          where: {
            schoolProfileId: role === Role.SCHOOL ? profileId : undefined,
            status: 'OPEN',
          },
        });

        stats.pendingApplications = await this.prisma.jobApplication.count({
          where: {
            jobListing: {
              schoolProfileId: role === Role.SCHOOL ? profileId : undefined,
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
}
