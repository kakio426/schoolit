import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BusinessProfileService {
  constructor(private prisma: PrismaService) { }

  async createOrUpdate(userId: number, data: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { portfolios, ...profileData } = data;

    return this.prisma.businessProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...profileData,
      },
      update: {
        ...profileData,
      },
      include: { portfolios: true },
    });
  }

  async findByUserId(userId: number) {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId },
      include: {
        portfolios: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });
    return profile;
  }

  async findPublicProfile(userId: number) {
    return this.prisma.businessProfile.findUnique({
      where: { userId },
      include: {
        portfolios: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.businessProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        portfolios: { take: 1 }, // Preview image?
      },
      orderBy: { isVerified: 'desc' }, // Verified first
    });
  }

  // Portfolio Management
  async addPortfolio(userId: number, data: any) {
    const profile = await this.findByUserId(userId);
    if (!profile) throw new NotFoundException('Business profile not found');
    return this.prisma.businessPortfolio.create({
      data: {
        businessProfileId: profile.id,
        ...data,
      },
    });
  }

  async updatePortfolio(portfolioId: number, data: any) {
    return this.prisma.businessPortfolio.update({
      where: { id: portfolioId },
      data,
    });
  }

  async deletePortfolio(portfolioId: number) {
    return this.prisma.businessPortfolio.delete({
      where: { id: portfolioId },
    });
  }

  // Admin: Verify business
  async verifyBusiness(userId: number, isVerified: boolean) {
    return this.prisma.businessProfile.update({
      where: { userId },
      data: { isVerified },
    });
  }
}
