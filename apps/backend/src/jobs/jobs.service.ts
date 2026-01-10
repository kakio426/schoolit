import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
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
    // 1. 작성자 프로필 찾기 (순서 중요: 학교 -> 교사 -> 기업)
    const schoolProfile = await this.prisma.schoolProfile.findUnique({ where: { userId } });
    const teacherProfile = await this.prisma.teacherProfile.findUnique({ where: { userId } });
    const businessProfile = await this.prisma.businessProfile.findUnique({ where: { userId } });

    // 2. 프로필 ID 매핑 (없으면 에러)
    let profileConnectData = {};

    if (schoolProfile) {
      profileConnectData = { schoolProfile: { connect: { id: schoolProfile.id } } };
    } else if (teacherProfile) {
      profileConnectData = { teacherProfile: { connect: { id: teacherProfile.id } } };
    } else if (businessProfile) {
      // 기업회원이 공고를 올리는 경우 (행사 공고 등)
      // JobListing 모델에 businessProfileId가 없다면 이 부분은 스킵하거나 스키마 추가 필요
      throw new ForbiddenException('기업 회원은 아직 공고를 등록할 수 없습니다.');
    } else {
      throw new ForbiddenException('공고를 등록하려면 먼저 프로필을 생성해야 합니다.');
    }

    // 3. 내부 결재 상태 기본값 설정
    // 내부 결재가 완료된 건이면 바로 'PLAN_APPROVED' 상태로 시작 (User Logic Preservation)
    const initialStatus =
      data.internalChecklist && data.internalChecklist['planningApproved'] === true
        ? HiringWorkflowStatus.PLAN_APPROVED
        : HiringWorkflowStatus.DRAFT;

    try {
      return await this.prisma.jobListing.create({
        data: {
          ...data,
          ...profileConnectData,
          status: JobStatus.OPEN, // 기본 모집 상태
          workflowStatus: initialStatus,
          // checklist 필드가 JSON이라면 Prisma가 알아서 변환하지만, undefined가 들어가지 않게 주의
          internalChecklist: data.internalChecklist ?? Prisma.JsonNull,
        },
      });
    } catch (error) {
      console.error("Job Creation Error:", error);
      // 프론트엔드에 정확한 이유를 알려주기 위해 에러 메시지 가공
      throw new InternalServerErrorException(`공고 등록 실패: ${error.message}`);
    }
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

  // [Fix] 누락되었던 update 메서드 복구 및 권한 체크 추가
  async update(id: number, userId: number, role: string, data: any) {
    const job = await this.prisma.jobListing.findUnique({
      where: { id },
      select: { schoolProfile: { select: { userId: true } }, teacherProfile: { select: { userId: true } } },
    });

    if (!job) throw new NotFoundException('공고를 찾을 수 없습니다.');

    const isOwner =
      job.schoolProfile?.userId === userId || job.teacherProfile?.userId === userId;
    const isAdmin = role === 'ADMIN';

    if (!isOwner && !isAdmin) throw new ForbiddenException('수정 권한이 없습니다.');

    return this.prisma.jobListing.update({
      where: { id },
      data,
    });
  }

  // [Fix] 빌드 에러 원인: deleteJob 메서드 복구
  async deleteJob(userId: number, role: string, jobId: number) {
    const job = await this.prisma.jobListing.findUnique({
      where: { id: jobId },
      select: { schoolProfile: { select: { userId: true } }, teacherProfile: { select: { userId: true } } },
    });

    if (!job) throw new NotFoundException('공고를 찾을 수 없습니다.');

    const isOwner =
      job.schoolProfile?.userId === userId || job.teacherProfile?.userId === userId;
    const isAdmin = role === 'ADMIN';

    if (!isOwner && !isAdmin) throw new ForbiddenException('삭제 권한이 없습니다.');

    return this.prisma.jobListing.delete({
      where: { id: jobId },
    });
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
    const where: Prisma.JobListingWhereInput = {
      active: true,
      status: JobStatus.OPEN,
    };

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
