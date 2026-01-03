import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Provider } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateUserDto) {
    const { password, ...rest } = data;

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    return this.prisma.user.create({
      data: {
        ...rest,
        password: hashedPassword,
      },
    });
  }

  async findOne(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findUserBySnsId(provider: Provider, snsId: string) {
    return this.prisma.user.findUnique({
      where: {
        provider_snsId: {
          provider,
          snsId,
        },
      },
    });
  }

  async findOrCreateSocialUser(email: string, name: string, provider: Provider, snsId: string) {
    let user = await this.findUserBySnsId(provider, snsId);

    if (!user) {
      user = await this.create({
        email,
        name,
        role: 'TEACHER', // Default role
        provider,
        snsId,
      } as any);
    }

    return user;
  }

  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { teacherProfile: true },
    });
  }

  async updateProfile(userId: number, data: any) {
    // Only update fields allowed in TeacherProfile
    // Upsert: Create if not exists, Update if exists
    // Explicitly filter out sensitive fields just in case DTO validation fails or isn't strict enough
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isVerified, ...safeData } = data;

    return this.prisma.teacherProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...safeData,
        isVerified: false, // Force default on create
      },
      update: {
        ...safeData,
        // isVerified is NOT updated here
      },
      // Ensure we see the isVerified status in response
      select: {
        id: true,
        userId: true,
        bio: true,
        profileImage: true,
        subjects: true,
        regions: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  }

  async getTeacherProfile(userId: number) {
    return this.prisma.teacherProfile.findUnique({
      where: { userId },
    });
  }

  async getSchoolProfile(userId: number) {
    return this.prisma.schoolProfile.findUnique({
      where: { userId },
    });
  }

  async updateSchoolProfile(userId: number, data: any) {
    return this.prisma.schoolProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: {
        ...data,
      },
    });
  }
  async getProfileWithStats(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: true,
        schoolProfile: true,
        reviewsReceived: {
          include: {
            keywords: true
          }
        }
      },
    });

    if (!user) return null;

    const reviews = user.reviewsReceived || [];
    const totalReviews = reviews.length;

    // Calculate Average Rating (excluding null ratings)
    const validRatings = reviews.filter(r => r.rating !== null).map(r => r.rating as number);
    const averageRating = validRatings.length > 0
      ? validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length
      : 0;

    // Aggregate Keywords
    const keywordCounts: Record<string, number> = {};
    reviews.forEach(review => {
      review.keywords.forEach(kw => {
        keywordCounts[kw.keyword] = (keywordCounts[kw.keyword] || 0) + 1;
      });
    });

    const topKeywords = Object.entries(keywordCounts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Take top 5

    // Calculate Re-match Rate
    const reMatchCount = reviews.filter(r => r.reMatchIntent === true).length;
    const reMatchRate = totalReviews > 0 ? (reMatchCount / totalReviews) * 100 : 100;

    return {
      ...user,
      reviewStats: {
        totalReviews,
        averageRating,
        topKeywords,
        reMatchRate,
        isVeteran: totalReviews >= 10,
      }
    };
  }
}
