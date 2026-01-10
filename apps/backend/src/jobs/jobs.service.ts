import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateJobDto } from './dtos/create-job.dto';
import { UserService } from '../users/user.service';
import { HiringWorkflowStatus, JobStatus, Prisma } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) { }

  async createJob(userId: number, data: CreateJobDto) {
    // 1. 학교 프로필 조회 (가장 흔한 케이스)
    const schoolProfile = await this.prisma.schoolProfile.findUnique({
      where: { userId },
      select: { id: true }, // ID만 가져오기
    });

    // 내부 결재가 완료된 건이면 바로 'PLAN_APPROVED' 상태로 시작
    const initialStatus =
      data.internalChecklist && data.internalChecklist['planningApproved'] === true
        ? HiringWorkflowStatus.PLAN_APPROVED
        : HiringWorkflowStatus.DRAFT;

    if (schoolProfile) {
      return this.prisma.jobListing.create({
        data: {
          schoolProfileId: schoolProfile.id,
          ...data,
          workflowStatus: initialStatus,
        },
      });
    }

    // 2. 교사 프로필 조회 (강사/교사 개인 공고)
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (teacherProfile) {
      return this.prisma.jobListing.create({
        data: {
          teacherProfileId: teacherProfile.id,
          ...data,
        },
      });
    }

    throw new ForbiddenException('공고를 등록하려면 학교 또는 교사 프로필이 필요합니다.');
  }

  // [Refactor] 성능 최적화: 리스트 조회 시 필요한 필드만 Select (Payload 최소화)
  async findAll(filters?: { jobType?: any; subjects?: string[]; regions?: string[] }) {
    const where: Prisma.JobListingWhereInput = {
      active: true,
      status: JobStatus.OPEN, // 기본적으로 모집 중인 공고만 노출
    };

    if (filters?.jobType) {
      where.jobType = filters.jobType;
    }

    if (filters?.subjects && filters.subjects.length > 0) {
      where.subjects = { hasSome: filters.subjects };
    }

    if (filters?.regions && filters.regions.length > 0) {
      where.regions = { hasSome: filters.regions };
    }

    return this.prisma.jobListing.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true, // 목록에서는 짧게 보여줄 예정이라면 프론트에서 truncate
        jobType: true,
        status: true,
        subjects: true,
        regions: true,
        createdAt: true,
        contractPeriod: true,
        // 연관 관계 최적화: 학교명, 로고 등 UI 표시에 필수적인 것만 조회
        schoolProfile: {
          select: {
            schoolName: true,
            logoImage: true,
            address: true,
          },
        },
        teacherProfile: {
          select: {
            profileImage: true,
            user: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // [Safety] 무제한 조회 방지 (Pagination 권장)
    });
  }

  async findOne(id: number) {
    const job = await this.prisma.jobListing.findUnique({
      where: { id },
      include: {
        schoolProfile: true, // 상세 페이지는 전체 정보 필요
        teacherProfile: {
          include: {
            user: {
              select: { name: true, email: true }, // 민감 정보 제외
            },
          },
        },
      },
    });

    if (!job) throw new NotFoundException('해당 공고를 찾을 수 없습니다.');
    return job;
  }

  async update(id: number, userId: number, data: any) {
    const job = await this.prisma.jobListing.findUnique({
      where: { id },
      include: { schoolProfile: true, teacherProfile: true },
    });

    if (!job) throw new NotFoundException('해당 공고를 찾을 수 없습니다.');

    const isOwner =
      (job.schoolProfile && job.schoolProfile.userId === userId) ||
      (job.teacherProfile && job.teacherProfile.userId === userId);

    if (!isOwner) throw new ForbiddenException('본인의 공고만 수정할 수 있습니다.');

    return this.prisma.jobListing.update({ where: { id }, data });
  }

  async remove(id: number, userId: number) {
    const job = await this.prisma.jobListing.findUnique({
      where: { id },
      include: { schoolProfile: true, teacherProfile: true },
    });

    if (!job) throw new NotFoundException('해당 공고를 찾을 수 없습니다.');

    const isOwner =
      (job.schoolProfile && job.schoolProfile.userId === userId) ||
      (job.teacherProfile && job.teacherProfile.userId === userId);

    if (!isOwner) throw new ForbiddenException('본인의 공고만 삭제할 수 있습니다.');

    return this.prisma.jobListing.delete({ where: { id } });
  }

  async findMyJobs(userId: number, role: string) {
    const where: Prisma.JobListingWhereInput = {};

    if (role === 'SCHOOL') {
      where.schoolProfile = { userId };
    } else if (role === 'TEACHER') {
      where.teacherProfile = { userId };
    } else {
      where.OR = [
        { schoolProfile: { userId } },
        { teacherProfile: { userId } },
      ];
    }

    return this.prisma.jobListing.findMany({
      where,
      include: {
        schoolProfile: true,
        teacherProfile: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchJobs(filters: { subject?: string; region?: string; keyword?: string }) {
    const where: Prisma.JobListingWhereInput = { active: true };

    if (filters.subject) {
      where.subjects = { has: filters.subject };
    }

    if (filters.region) {
      where.regions = { has: filters.region };
    }

    if (filters.keyword) {
      where.OR = [
        { title: { contains: filters.keyword, mode: 'insensitive' } },
        { description: { contains: filters.keyword, mode: 'insensitive' } },
      ];
    }

    return this.prisma.jobListing.findMany({
      where,
      select: {
        id: true,
        title: true,
        jobType: true,
        status: true,
        subjects: true,
        regions: true,
        createdAt: true,
        schoolProfile: {
          select: {
            schoolName: true,
            logoImage: true,
            address: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
