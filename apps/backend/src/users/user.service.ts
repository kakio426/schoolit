import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import {
  CreateTeacherExperienceDto,
  CreateTeacherEducationDto,
  CreateTeacherLinkDto,
  CreateTeacherLicenseDto,
} from './dtos/teacher-details.dto';
import * as bcrypt from 'bcrypt';
import { Provider, Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
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

  async findOrCreateSocialUser(
    email: string,
    name: string,
    provider: Provider,
    snsId: string,
    phone?: string,
  ) {
    // 1. snsId와 provider로 기존 유저 검색
    let user = await this.findUserBySnsId(provider, snsId);

    if (user) {
      return user;
    }

    // 2. snsId로 없으면 email로 기존 유저 검색 (연동 처리)
    user = await this.findOne(email);
    if (user) {
      // 기존 계정에 소셜 정보 업데이트
      return this.prisma.user.update({
        where: { id: user.id },
        data: {
          provider,
          snsId,
        },
      });
    }

    // 3. 둘 다 없으면 신규 가입 (PENDING 역할 부여)
    return this.create({
      email,
      name,
      role: 'PENDING',
      provider,
      snsId,
      phone,
    } as any);
  }

  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { teacherProfile: true },
    });
  }

  async updateProfile(userId: number, data: any) {
    // Separate User fields (name, phone) from TeacherProfile fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isVerified, phone, name, ...teacherData } = data;

    // Update User table fields if provided
    const userUpdates: any = {};
    if (phone !== undefined) userUpdates.phone = phone;
    if (name !== undefined) userUpdates.name = name;

    if (Object.keys(userUpdates).length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: userUpdates,
      });
    }

    return this.prisma.teacherProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...teacherData,
        isVerified: false, // Force default on create
      },
      update: {
        ...teacherData,
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
        bankAccount: true,
        checklist: true,
        targetGrades: true,
        createdAt: true,
        updatedAt: true,
      },
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

  async getProfileWithStats(userId: number, viewerId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: {
          include: {
            experiences: true,
            educations: true,
            links: true,
            licenses: true,
          },
        },
        schoolProfile: true,
        businessProfile: {
          include: {
            portfolios: true,
          },
        },
        reviewsReceived: {
          include: {
            keywords: true,
          },
        },
      },
    });

    if (!user) return null;

    // Security Scrubbing
    const isOwner = viewerId === userId;
    if (!isOwner) {
      user.phone = null;
      user.email = null; // Hide email from public
      if (user.teacherProfile) {
        user.teacherProfile.bankAccount = null;
      }
      if (user.businessProfile) {
        user.businessProfile.bankAccount = null;
        user.businessProfile.registrationNum = null; // Hide reg number
      }
    }

    const reviews = user.reviewsReceived || [];
    const totalReviews = reviews.length;

    // Calculate Average Rating (excluding null ratings)
    const validRatings = reviews.filter((r) => r.rating !== null).map((r) => r.rating as number);
    const averageRating =
      validRatings.length > 0
        ? validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length
        : 0;

    // Aggregate Keywords
    const keywordCounts: Record<string, number> = {};
    reviews.forEach((review) => {
      review.keywords.forEach((kw) => {
        keywordCounts[kw.keyword] = (keywordCounts[kw.keyword] || 0) + 1;
      });
    });

    const topKeywords = Object.entries(keywordCounts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Take top 5

    // Calculate Re-match Rate
    const reMatchCount = reviews.filter((r) => r.reMatchIntent === true).length;
    const reMatchRate = totalReviews > 0 ? (reMatchCount / totalReviews) * 100 : 100;

    return {
      ...user,
      reviewStats: {
        totalReviews,
        averageRating,
        topKeywords,
        reMatchRate,
        isVeteran: totalReviews >= 10,
      },
    };
  }

  async updateRole(userId: number, role: Role) {
    // Upsert the corresponding profile
    if (role === Role.SCHOOL) {
      await this.prisma.schoolProfile.upsert({
        where: { userId },
        create: { userId, isVerified: false },
        update: {},
      });
    } else if (role === Role.TEACHER) {
      await this.prisma.teacherProfile.upsert({
        where: { userId },
        create: { userId, isVerified: false },
        update: {},
      });
    } else if (role === Role.BUSINESS) {
      await this.prisma.businessProfile.upsert({
        where: { userId },
        create: { userId, companyName: 'New Company', isVerified: false, categories: [] },
        update: {},
      });
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      // Note: We don't include profile here because frontend will fetch it separately via /profile
    });
  }

  async updateSettings(userId: number, settings: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { notificationSettings: settings },
      select: { notificationSettings: true },
    });
  }

  async addExperience(userId: number, dto: CreateTeacherExperienceDto) {
    const profile = await this.prisma.teacherProfile.upsert({
      where: { userId },
      create: { userId, isVerified: false },
      update: {},
    });

    // Robust Date Parsing
    const startDate = new Date(dto.startDate);
    const endDate = dto.endDate && dto.endDate !== '' ? new Date(dto.endDate) : null;

    return this.prisma.teacherExperience.create({
      data: {
        teacherProfileId: profile.id,
        ...dto,
        startDate,
        endDate,
      },
    });
  }

  async removeExperience(userId: number, id: number) {
    const item = await this.prisma.teacherExperience.findUnique({
      where: { id },
      include: { teacherProfile: true },
    });
    if (!item) throw new NotFoundException('Experience not found');
    if (item.teacherProfile.userId !== userId) throw new ForbiddenException('Not authorized');
    return this.prisma.teacherExperience.delete({ where: { id } });
  }

  async addEducation(userId: number, dto: CreateTeacherEducationDto) {
    const profile = await this.prisma.teacherProfile.upsert({
      where: { userId },
      create: { userId, isVerified: false },
      update: {},
    });

    // Robust Date Parsing
    const startDate = new Date(dto.startDate);
    const endDate = dto.endDate && dto.endDate !== '' ? new Date(dto.endDate) : null;

    return this.prisma.teacherEducation.create({
      data: {
        teacherProfileId: profile.id,
        ...dto,
        startDate,
        endDate,
      },
    });
  }

  async removeEducation(userId: number, id: number) {
    const item = await this.prisma.teacherEducation.findUnique({
      where: { id },
      include: { teacherProfile: true },
    });
    if (!item) throw new NotFoundException('Education not found');
    if (item.teacherProfile.userId !== userId) throw new ForbiddenException('Not authorized');
    return this.prisma.teacherEducation.delete({ where: { id } });
  }

  async addLink(userId: number, dto: CreateTeacherLinkDto) {
    const profile = await this.prisma.teacherProfile.upsert({
      where: { userId },
      create: { userId, isVerified: false },
      update: {},
    });
    return this.prisma.teacherLink.create({
      data: { teacherProfileId: profile.id, ...dto },
    });
  }

  async removeLink(userId: number, id: number) {
    const item = await this.prisma.teacherLink.findUnique({
      where: { id },
      include: { teacherProfile: true },
    });
    if (!item) throw new NotFoundException('Link not found');
    if (item.teacherProfile.userId !== userId) throw new ForbiddenException('Not authorized');
    return this.prisma.teacherLink.delete({ where: { id } });
  }

  async addLicense(userId: number, dto: CreateTeacherLicenseDto) {
    const profile = await this.prisma.teacherProfile.upsert({
      where: { userId },
      create: { userId, isVerified: false },
      update: {},
    });
    return this.prisma.teacherLicense.create({
      data: { teacherProfileId: profile.id, ...dto },
    });
  }

  async removeLicense(userId: number, id: number) {
    const item = await this.prisma.teacherLicense.findUnique({
      where: { id },
      include: { teacherProfile: true },
    });
    if (!item) throw new NotFoundException('License not found');
    if (item.teacherProfile.userId !== userId) throw new ForbiddenException('Not authorized');
    return this.prisma.teacherLicense.delete({ where: { id } });
  }

  // --- Email Verification Code Management ---
  async saveVerificationCode(userId: number, code: string, email?: string) {
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 5); // 5 minutes validity

    // Store as "123456|email@addr.com" if email provided, else just code
    const valueToStore = email ? `${code}|${email}` : code;

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationCode: valueToStore,
        verificationExpires: expires,
      },
    });
  }

  async validateVerificationCode(
    userId: number,
    code: string,
  ): Promise<{ valid: boolean; email?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { verificationCode: true, verificationExpires: true },
    });

    if (!user || !user.verificationCode) return { valid: false };

    const [storedCode, storedEmail] = user.verificationCode.split('|');

    if (storedCode !== code) return { valid: false };
    if (!user.verificationExpires || new Date() > user.verificationExpires) return { valid: false };

    // Clear code after successful validation
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationCode: null,
        verificationExpires: null,
      },
    });

    return { valid: true, email: storedEmail };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        provider: true,
        phone: true,
        createdAt: true,
        schoolProfile: {
          select: { schoolName: true },
        },
        businessProfile: {
          select: { companyName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resetTestUser(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // Protect core test accounts from being reset
    const protectedEmails = [
      'admin@schoolit.com',
      'school@test.com',
      'teacher@test.com',
      'business@test.com',
    ];

    if (user && protectedEmails.includes(user.email)) {
      throw new ForbiddenException('기본 테스트 계정은 초기화할 수 없습니다.');
    }

    // Delete all linked profiles
    await this.prisma.teacherProfile.deleteMany({ where: { userId } });
    await this.prisma.schoolProfile.deleteMany({ where: { userId } });
    await this.prisma.businessProfile.deleteMany({ where: { userId } });

    // Reset User metadata
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        role: 'PENDING',
        phone: null,
        verificationCode: null,
        verificationExpires: null,
      },
    });
  }

  // ============================================
  // Account Deletion (Soft Delete) - 개인정보보호법 준수
  // ============================================

  /**
   * 회원 탈퇴 (Soft Delete)
   * - isDeleted = true로 설정하고 개인정보를 마스킹합니다
   * - 6개월 뒤 스케줄러에 의해 완전 삭제됩니다
   */
  async deleteAccount(userId: number): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (user.isDeleted) {
      throw new ForbiddenException('이미 탈퇴한 계정입니다.');
    }

    // Soft delete with personal data masking
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        // 개인정보 마스킹 (복구 가능하도록 ID 유지)
        email: `deleted_${userId}_${Date.now()}@deleted.edupin.com`,
        phone: null,
        name: '탈퇴한 사용자',
        password: null,
        snsId: null,
        verificationCode: null,
        verificationExpires: null,
        notificationSettings: null,
      },
    });

    // 프로필 비공개 처리
    await this.prisma.teacherProfile.updateMany({
      where: { userId },
      data: { isVerified: false, bio: null, bankAccount: null },
    });

    await this.prisma.schoolProfile.updateMany({
      where: { userId },
      data: { isVerified: false, description: null, phoneNumber: null },
    });

    await this.prisma.businessProfile.updateMany({
      where: { userId },
      data: {
        isVerified: false,
        description: null,
        bankAccount: null,
        registrationNum: null,
      },
    });

    return {
      success: true,
      message: '회원 탈퇴가 완료되었습니다. 개인정보는 6개월 후 완전히 삭제됩니다.',
    };
  }

  /**
   * 활성 사용자만 조회 (탈퇴하지 않은 사용자)
   */
  async findActiveById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user || user.isDeleted) {
      return null;
    }

    return user;
  }

  /**
   * 탈퇴한 사용자인지 확인
   */
  async isDeletedUser(userId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isDeleted: true },
    });

    return user?.isDeleted ?? false;
  }
}
