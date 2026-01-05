import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getSystemStats() {
    const [totalUsers, totalJobs, totalSchools, totalTeachers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.jobListing.count(),
      this.prisma.schoolProfile.count(),
      this.prisma.teacherProfile.count(),
    ]);

    return {
      totalUsers,
      totalJobs,
      totalSchools,
      totalTeachers,
    };
  }

  async getUsers(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
    };
  }

  async getPendingBusinessProfiles() {
    return this.prisma.businessProfile.findMany({
      where: { isVerified: false },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateBusinessProfileStatus(id: number, isVerified: boolean) {
    return this.prisma.businessProfile.update({
      where: { id },
      data: { isVerified },
    });
  }

  async banUser(userId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: true },
    });
  }

  async unbanUser(userId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: false },
    });
  }

  async changeUserRole(userId: number, newRole: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole as any },
    });
  }

  async getReviews(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { sender: { name: { contains: search, mode: 'insensitive' } } },
        { receiver: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          keywords: {
            select: {
              keyword: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      total,
      page,
      limit,
    };
  }

  async deleteReview(reviewId: number) {
    return this.prisma.review.delete({
      where: { id: reviewId },
    });
  }

  async broadcastNotification(title: string, content: string, targetRoles?: string[]) {
    // Get target users
    const where: any = {};
    if (targetRoles && targetRoles.length > 0) {
      where.role = { in: targetRoles };
    }

    const users = await this.prisma.user.findMany({
      where,
      select: { id: true },
    });

    // Create notifications for all target users
    const notifications = await Promise.all(
      users.map((user) =>
        this.prisma.notification.create({
          data: {
            userId: user.id,
            type: 'SYSTEM',
            title,
            content,
          },
        }),
      ),
    );

    return {
      sent: notifications.length,
      targetUsers: users.length,
    };
  }
}
