import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
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
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

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
        provider_snsId: { provider, snsId },
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
    const existingUserBySns = await this.findUserBySnsId(provider, snsId);
    if (existingUserBySns) return existingUserBySns;

    // 2. snsId로 없으면 email로 기존 유저 검색 (계정 연동)
    const existingUserByEmail = await this.findOne(email);
    if (existingUserByEmail) {
      return this.prisma.user.update({
        where: { id: existingUserByEmail.id },
        data: { provider, snsId },
      });
    }

    // 3. 신규 가입
    return this.create({
      email,
      name,
      role: 'PENDING',
      provider,
      snsId,
      phone,
    });
  }

  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { teacherProfile: true },
    });
  }

  async updateProfile(userId: number, data: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isVerified, phone, name, ...teacherData } = data;

    // User 테이블 업데이트
    if (phone || name) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(phone && { phone }),
          ...(name && { name }),
        },
      });
    }

    // TeacherProfile 업데이트
    return this.prisma.teacherProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...teacherData,
        isVerified: false,
      },
      update: { ...teacherData },
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

  // --- [Optimization] DB Aggregation for Stats ---
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
          include: { portfolios: true },
        },
      },
    });

    if (!user) return null;

    // Security Scrubbing
    const isOwner = viewerId === userId;
    if (!isOwner) {
      user.phone = null;
      user.email = null;
      if (user.teacherProfile) user.teacherProfile.bankAccount = null;
      if (user.businessProfile) {
        user.businessProfile.bankAccount = null;
        user.businessProfile.registrationNum = null;
      }
    }

    // [Refactor] 성능 최적화: JS 계산 대신 DB Aggregation 사용
    // 1. 평균 평점 및 전체 리뷰 수
    const aggregations = await this.prisma.review.aggregate({
      where: { receiverId: userId },
      _avg: { rating: true },
      _count: { _all: true },
    });

    const averageRating = aggregations._avg.rating || 0;
    const totalReviews = aggregations._count._all;

    // 2. 재매칭 의사 (True인 개수만 카운트)
    const reMatchCount = await this.prisma.review.count({
      where: { receiverId: userId, reMatchIntent: true },
    });
    const reMatchRate = totalReviews > 0 ? (reMatchCount / totalReviews) * 100 : 100;

    // 3. 키워드 집계
    const reviewKeywords = await this.prisma.review.findMany({
      where: { receiverId: userId },
      select: {
        keywords: {
          select: { keyword: true },
        },
      },
      take: 50, // 최근 50개 리뷰만 분석
    });

    const keywordCounts: Record<string, number> = {};
    reviewKeywords.forEach((r) => {
      r.keywords.forEach((k) => {
        keywordCounts[k.keyword] = (keywordCounts[k.keyword] || 0) + 1;
      });
    });

    const topKeywords = Object.entries(keywordCounts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

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
    const profileData = { userId, isVerified: false };

    if (role === Role.SCHOOL) {
      await this.prisma.schoolProfile.upsert({
        where: { userId },
        create: profileData,
        update: {},
      });
    } else if (role === Role.TEACHER) {
      await this.prisma.teacherProfile.upsert({
        where: { userId },
        create: profileData,
        update: {},
      });
    } else if (role === Role.BUSINESS) {
      await this.prisma.businessProfile.upsert({
        where: { userId },
        create: { ...profileData, companyName: 'New Company', categories: [] },
        update: {},
      });
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  // --- [New] Transactional Signup Completion ---
  async completeSignupTransaction(
    userId: number,
    data: { role: Role; name: string; phone: string; profileData?: any },
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. 기본 정보 업데이트
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { name: data.name, phone: data.phone, role: data.role },
      });

      // 2. 역할별 프로필 생성 및 업데이트
      if (data.role === Role.TEACHER) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isVerified, ...tData } = data.profileData || {};
        await tx.teacherProfile.upsert({
          where: { userId },
          create: { userId, isVerified: false, ...tData },
          update: { ...tData },
        });
      } else if (data.role === Role.SCHOOL) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isVerified, ...sData } = data.profileData || {};
        await tx.schoolProfile.upsert({
          where: { userId },
          create: { userId, isVerified: false, ...sData },
          update: { ...sData },
        });
      } else if (data.role === Role.BUSINESS) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isVerified, ...bData } = data.profileData || {};
        await tx.businessProfile.upsert({
          where: { userId },
          create: {
            userId,
            isVerified: false,
            companyName: bData.companyName || 'New Company',
            categories: [],
          },
          update: { ...bData },
        });
      }

      return updatedUser;
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
    const profile = await this.prisma.teacherProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Teacher profile not found');

    return this.prisma.teacherExperience.create({
      data: {
        teacherProfileId: profile.id,
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate && dto.endDate !== '' ? new Date(dto.endDate) : null,
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
    const profile = await this.prisma.teacherProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Teacher profile not found');

    return this.prisma.teacherEducation.create({
      data: {
        teacherProfileId: profile.id,
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate && dto.endDate !== '' ? new Date(dto.endDate) : null,
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
    const profile = await this.prisma.teacherProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Teacher profile not found');

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
    const profile = await this.prisma.teacherProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Teacher profile not found');

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

  async saveVerificationCode(userId: number, code: string, email?: string) {
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 5);
    const valueToStore = email ? `${code}|${email}` : code;

    return this.prisma.user.update({
      where: { id: userId },
      data: { verificationCode: valueToStore, verificationExpires: expires },
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

    await this.prisma.user.update({
      where: { id: userId },
      data: { verificationCode: null, verificationExpires: null },
    });

    return { valid: true, email: storedEmail };
  }

  async updateSchoolProfile(userId: number, data: any) {
    return this.prisma.schoolProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: { ...data },
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
        schoolProfile: { select: { schoolName: true } },
        businessProfile: { select: { companyName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resetTestUser(userId: number) {
    const protectedEmails = [
      'admin@schoolit.com',
      'school@test.com',
      'teacher@test.com',
      'business@test.com',
    ];
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user && protectedEmails.includes(user.email))
      throw new ForbiddenException('기본 테스트 계정은 초기화할 수 없습니다.');

    await Promise.all([
      this.prisma.teacherProfile.deleteMany({ where: { userId } }),
      this.prisma.schoolProfile.deleteMany({ where: { userId } }),
      this.prisma.businessProfile.deleteMany({ where: { userId } }),
    ]);

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: 'PENDING', phone: null, verificationCode: null, verificationExpires: null },
    });
  }

  async deleteAccount(userId: number): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    if (user.isDeleted) throw new ForbiddenException('이미 탈퇴한 계정입니다.');

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
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

    await Promise.all([
      this.prisma.teacherProfile.updateMany({
        where: { userId },
        data: { isVerified: false, bio: null, bankAccount: null },
      }),
      this.prisma.schoolProfile.updateMany({
        where: { userId },
        data: { isVerified: false, description: null, phoneNumber: null },
      }),
      this.prisma.businessProfile.updateMany({
        where: { userId },
        data: { isVerified: false, description: null, bankAccount: null, registrationNum: null },
      }),
    ]);

    return { success: true, message: '회원 탈퇴가 완료되었습니다.' };
  }

  async findActiveById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return !user || user.isDeleted ? null : user;
  }

  async isDeletedUser(userId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isDeleted: true },
    });
    return user?.isDeleted ?? false;
  }
}
