import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
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

  // Type for user with profiles (타입 안전성 강화)
  private resolveProfileConnection(user: {
    role: string;
    schoolProfile: { id: number } | null;
    teacherProfile: { id: number } | null;
    businessProfile: { id: number } | null;
  }) {
    if (user.role === 'SCHOOL' && user.schoolProfile) {
      return { schoolProfile: { connect: { id: user.schoolProfile.id } } };
    }
    if (user.role === 'TEACHER' && user.teacherProfile) {
      return { teacherProfile: { connect: { id: user.teacherProfile.id } } };
    }
    if (user.role === 'BUSINESS' && user.businessProfile) {
      throw new ForbiddenException('기업 회원은 아직 공고를 등록할 수 없습니다.');
    }
    throw new ForbiddenException('공고를 등록하려면 먼저 프로필을 생성해야 합니다.');
  }

  private getInitialWorkflowStatus(data: CreateJobDto): HiringWorkflowStatus {
    return data.internalChecklist && data.internalChecklist['planningApproved'] === true
      ? HiringWorkflowStatus.PLAN_APPROVED
      : HiringWorkflowStatus.DRAFT;
  }

  async createJob(userId: number, data: CreateJobDto) {
    // [Refactor] 단일 쿼리로 유저 + 모든 프로필 조회 (N+1 방지)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        schoolProfile: { select: { id: true } },
        teacherProfile: { select: { id: true } },
        businessProfile: { select: { id: true } },
      },
    });

    if (!user) {
      throw new ForbiddenException('사용자를 찾을 수 없습니다.');
    }

    // 헬퍼 메서드로 프로필 연결 객체 생성
    const profileConnect = this.resolveProfileConnection(user);

    // 🚨 [긴급 헬프콜 로직]
    let initialWorkflowStatus = this.getInitialWorkflowStatus(data);
    if (data.isEmergency) {
      // 긴급 건은 내부 결재 없이 즉시 노출 (1개월 미만임이 보장되었다고 가정)
      initialWorkflowStatus = HiringWorkflowStatus.PLAN_APPROVED;
    }

    try {
      const job = await this.prisma.jobListing.create({
        data: {
          ...data,
          ...profileConnect,
          status: JobStatus.OPEN,
          workflowStatus: initialWorkflowStatus,
          internalChecklist: data.internalChecklist ?? Prisma.JsonNull,
        },
      });

      // 🚨 [긴급 알림 발송] 긴급 건인 경우, 조건에 맞는 교사에게 즉시 알림
      if (data.isEmergency) {
        this.sendEmergencyAlerts(job);
      }

      return job;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Job Creation Error:', error);
      throw new InternalServerErrorException(`공고 등록 실패: ${errorMessage}`);
    }
  }

  // [Refactor] 성능 최적화: 리스트 조회 시 필요한 필드만 Select (Payload 최소화)
  async findAll(filters?: { jobType?: string; subjects?: string[]; regions?: string[] }) {
    const where: Prisma.JobListingWhereInput = {
      active: true,
      status: JobStatus.OPEN, // 기본적으로 모집 중인 공고만 노출
      // [Fix] 워크플로우 상태가 'PUBLISHED' 이거나, 과거 데이터(null)인 경우만 노출
      OR: [
        { workflowStatus: HiringWorkflowStatus.PUBLISHED },
        { workflowStatus: null }
      ]
    };

    if (filters?.jobType) {
      where.jobType = filters.jobType as Prisma.EnumJobTypeFilter<'JobListing'>;
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

  // [Admin] 모든 공고 조회 (삭제된 것 표시는 추후 고려, 현재는 active 상관없이 조회)
  async findAllForAdmin(filters?: { keyword?: string }) {
    const where: Prisma.JobListingWhereInput = {};

    if (filters?.keyword) {
      where.OR = [
        { title: { contains: filters.keyword, mode: 'insensitive' } },
        { description: { contains: filters.keyword, mode: 'insensitive' } },
        { schoolProfile: { schoolName: { contains: filters.keyword, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.jobListing.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        workflowStatus: true,
        createdAt: true,
        active: true,
        jobType: true,
        schoolProfile: {
          select: {
            schoolName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findOne(id: number, userId?: number) {
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

    // 🚫 중복 지원 방지: 로그인한 유저라면 지원 내역 확인
    let hasApplied = false;
    if (userId) {
      const application = await this.prisma.jobApplication.findFirst({
        where: {
          jobId: id,
          userId: userId // JobApplication은 userId를 직접 가지고 있음
        }
      });
      hasApplied = !!application;
    }

    return { ...job, hasApplied };
  }

  // [Fix] 누락되었던 update 메서드 복구 및 권한 체크 추가
  async update(id: number, userId: number, role: string, data: Partial<CreateJobDto>) {
    const job = await this.prisma.jobListing.findUnique({
      where: { id },
      select: {
        schoolProfile: { select: { userId: true } },
        teacherProfile: { select: { userId: true } },
      },
    });

    if (!job) throw new NotFoundException('공고를 찾을 수 없습니다.');

    const isOwner = job.schoolProfile?.userId === userId || job.teacherProfile?.userId === userId;
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
      select: {
        schoolProfile: { select: { userId: true } },
        teacherProfile: { select: { userId: true } },
      },
    });

    if (!job) throw new NotFoundException('공고를 찾을 수 없습니다.');

    const isOwner = job.schoolProfile?.userId === userId || job.teacherProfile?.userId === userId;
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
      where.OR = [{ schoolProfile: { userId } }, { teacherProfile: { userId } }];
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
    const baseConditions: Prisma.JobListingWhereInput[] = [
      { active: true },
      { status: JobStatus.OPEN },
      {
        OR: [
          { workflowStatus: HiringWorkflowStatus.PUBLISHED },
          { workflowStatus: null }
        ]
      }
    ];

    if (filters.subject) {
      baseConditions.push({ subjects: { has: filters.subject } });
    }

    if (filters.region) {
      baseConditions.push({ regions: { has: filters.region } });
    }

    if (filters.keyword) {
      baseConditions.push({
        OR: [
          { title: { contains: filters.keyword, mode: 'insensitive' } },
          { description: { contains: filters.keyword, mode: 'insensitive' } },
        ]
      });
    }

    return this.prisma.jobListing.findMany({
      where: { AND: baseConditions },
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

  // 📡 매칭되는 선생님들에게 알림 발송 (비동기 처리 Mock)
  private async sendEmergencyAlerts(job: any) {
    if (!job.subjects || job.subjects.length === 0) return;

    try {
      // 1. 해당 과목(subjects)과 지역(regions)이 일치하는 '구직 중'인 선생님 찾기
      const matchedTeachers = await this.prisma.teacherProfile.findMany({
        where: {
          AND: [
            { isSearchable: true }, // 구직 중(공개 설정)인 선생님만
            { subjects: { hasSome: job.subjects } }, // 과목 매칭
            // { regions: { hasSome: job.regions } },   // 지역 매칭
          ]
        },
        select: { userId: true, user: { select: { email: true, name: true } } }
      });

      console.log(`[Emergency Alert] Found ${matchedTeachers.length} candidates for job #${job.id} (${job.title})`);

      // 실제 NotificationService 연동은 추후 진행, 현재는 로그로 대체
      matchedTeachers.forEach(t => {
        console.log(`[Notification] Sending Alert to ${t.user.name} (${t.user.email}): 🚨 긴급 대강 요청이 있습니다!`);
      });

    } catch (e) {
      console.error('Failed to send emergency alerts', e);
    }
  }
}
