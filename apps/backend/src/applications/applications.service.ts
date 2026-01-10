import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ApplyJobDto } from './dtos/apply-job.dto';
import { ChatService } from '../chat/chat.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ApplicationStatus } from '@prisma/client';
import { PdfGeneratorService } from '../common/pdf/pdf-generator.service';
import * as handlebars from 'handlebars'; // Optional: Use generic template replacement if not installed
// We will use simple string replacement for now to avoid dep hell, or check if handlebars is needed.
// Actually, `npm install handlebars` might be good. But for now let's use replace.

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private chatService: ChatService,
    private notificationsService: NotificationsService,
    private pdfGeneratorService: PdfGeneratorService,
  ) { }

  async applyToJob(userId: number, jobId: number, dto: ApplyJobDto) {
    try {
      // 1. 공고 유효성 검사 (필요한 필드만 조회)
      const job = await this.prisma.jobListing.findUnique({
        where: { id: jobId },
        select: {
          id: true,
          title: true,
          status: true,
          active: true,
          schoolProfile: { select: { userId: true } },
          teacherProfile: { select: { userId: true } },
        },
      });

      if (!job) throw new NotFoundException('공고를 찾을 수 없습니다.');
      if (job.status !== 'OPEN' || !job.active) {
        throw new BadRequestException('마감되었거나 비활성화된 공고입니다.');
      }

      // 2. 중복 지원 체크
      const existing = await this.prisma.jobApplication.findUnique({
        where: {
          jobId_userId: { jobId, userId },
        },
      });

      if (existing) throw new BadRequestException('이미 지원하신 공고입니다.');

      // 3. 지원서 생성
      const app = await this.prisma.jobApplication.create({
        data: {
          jobId,
          userId,
          message: dto.message,
          cost: dto.cost,
          contactEmail: dto.contactEmail,
          contactPhone: dto.contactPhone,
          attachmentUrl: dto.attachmentUrl,
          status: 'PENDING',
        },
      });

      // 4. 알림 발송 (비동기 처리로 메인 로직 방해 금지)
      const ownerId = job.schoolProfile?.userId || job.teacherProfile?.userId;
      if (ownerId) {
        this.notificationsService
          .create({
            userId: ownerId,
            type: 'APPLICATION',
            title: '새로운 지원서 도착',
            content: `'${job.title}' 공고에 새로운 지원자가 있습니다.`,
            link: `/dashboard/jobs/${job.id}`,
          })
          .catch((e) => console.error('Notification failed:', e));
      }

      return app;
    } catch (e: any) {
      if (e instanceof BadRequestException || e instanceof NotFoundException) throw e;
      throw new BadRequestException('지원서 제출 중 오류가 발생했습니다.');
    }
  }

  // [Refactor] N+1 문제 해결 및 보안 강화 (select 사용)
  async getMyApplications(userId: number, role?: string) {
    // 1. 학교가 받은 지원서 조회
    if (role === 'SCHOOL') {
      const applications = await this.prisma.jobApplication.findMany({
        where: {
          jobListing: { schoolProfile: { userId } },
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          message: true,
          jobListing: {
            select: { id: true, title: true },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true, // 초기 단계에서는 이메일 정도만 노출
              avatarImageId: true,
              teacherProfile: {
                select: {
                  id: true,
                  subjects: true,
                  regions: true,
                  profileImage: true,
                },
              },
              businessProfile: {
                select: { id: true, companyName: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return applications;
    }

    // 2. 내가 보낸 지원서 조회 (학교 외 유저)
    return this.prisma.jobApplication.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        createdAt: true,
        jobListing: {
          select: {
            id: true,
            title: true,
            status: true,
            schoolProfile: {
              select: { schoolName: true, logoImage: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getJobApplications(userId: number, jobId: number) {
    // 소유권 확인
    const job = await this.prisma.jobListing.findUnique({
      where: { id: jobId },
      select: {
        schoolProfile: { select: { userId: true } },
        teacherProfile: { select: { userId: true } },
      },
    });

    if (!job) throw new NotFoundException('공고를 찾을 수 없습니다.');

    const isOwner =
      job.schoolProfile?.userId === userId || job.teacherProfile?.userId === userId;

    if (!isOwner) throw new ForbiddenException('권한이 없습니다.');

    // 지원자 목록 조회 (최적화됨)
    return this.prisma.jobApplication.findMany({
      where: { jobId },
      select: {
        id: true,
        status: true,
        createdAt: true,
        message: true,
        cost: true, // 견적가
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            teacherProfile: {
              select: {
                id: true,
                subjects: true,
                experiences: { take: 3 }, // 경력은 최근 3개만 미리보기
                isVerified: true,
              },
            },
            businessProfile: {
              select: {
                id: true,
                companyName: true,
                registrationNum: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async suggestJob(senderUserId: number, jobId: number, candidateUserId: number) {
    const job = await this.prisma.jobListing.findUnique({
      where: { id: jobId },
      include: { schoolProfile: true, teacherProfile: true },
    });

    if (!job) throw new NotFoundException('Job not found');

    const isOwner =
      (job.schoolProfile && job.schoolProfile.userId === senderUserId) ||
      (job.teacherProfile && job.teacherProfile.userId === senderUserId);

    if (!isOwner) {
      throw new ForbiddenException('Not your job');
    }

    const candidate = await this.prisma.user.findUnique({
      where: { id: candidateUserId },
    }); // Check role manually

    if (!candidate || (candidate.role !== 'TEACHER' && candidate.role !== 'BUSINESS')) {
      throw new NotFoundException('Candidate not found or invalid role');
    }

    const existing = await this.prisma.jobApplication.findUnique({
      where: { jobId_userId: { jobId, userId: candidateUserId } },
    });
    if (existing) throw new BadRequestException('이미 지원했거나 제안을 받았습니다.');

    const suggestion = await this.prisma.jobApplication.create({
      data: {
        jobId,
        userId: candidateUserId,
        isSuggestion: true,
        status: 'PENDING',
        message: 'Job suggestion received',
      },
    });

    // Notify Candidate
    await this.notificationsService.create({
      userId: candidateUserId,
      type: 'SUGGESTION',
      title: '제안이 도착했습니다 🎁',
      content: `'${job.title}' 공고에 대한 제안이 도착했습니다.`,
      link: `/dashboard/applications`,
    });

    return suggestion;
  }

  async updateStatus(userId: number, applicationId: number, status: ApplicationStatus) {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        jobListing: {
          include: { schoolProfile: true, teacherProfile: true },
        },
      },
    });

    if (!application) throw new NotFoundException('Application not found');

    const isJobOwner =
      (application.jobListing.schoolProfile &&
        application.jobListing.schoolProfile.userId === userId) ||
      (application.jobListing.teacherProfile &&
        application.jobListing.teacherProfile.userId === userId);
    const isCandidate = application.userId === userId;

    if (isJobOwner) {
      // Owner can update
    } else if (isCandidate && application.isSuggestion && application.status === 'PENDING') {
      if (status !== 'INTERVIEWING' && status !== 'REJECTED') {
        throw new ForbiddenException(
          'Candidate can only Accept (INTERVIEWING) or Reject suggestion',
        );
      }
    } else {
      throw new ForbiddenException('You do not have permission to update this application');
    }

    const updated = await this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status },
      include: {
        user: { include: { teacherProfile: true, businessProfile: true } },
        jobListing: { include: { schoolProfile: true, teacherProfile: true } },
      },
    });

    if (status === 'INTERVIEWING') {
      const jobOwnerId =
        updated.jobListing.schoolProfile?.userId || updated.jobListing.teacherProfile?.userId;
      const candidateId = updated.userId;
      if (jobOwnerId) {
        await this.chatService.createRoom(jobOwnerId, candidateId, updated.jobId);
      }
    }

    // Notify Status Change
    if (['INTERVIEWING', 'REJECTED', 'ACCEPTED', 'HIRED'].includes(status)) {
      try {
        const isOwnerAction =
          (updated.jobListing.schoolProfile &&
            updated.jobListing.schoolProfile.userId === userId) ||
          (updated.jobListing.teacherProfile &&
            updated.jobListing.teacherProfile.userId === userId);

        // If Owner updated, notify Candidate. If Candidate updated, notify Owner.
        const recipientId = isOwnerAction
          ? updated.userId
          : updated.jobListing.schoolProfile?.userId || updated.jobListing.teacherProfile?.userId;

        let title = '';
        let content = '';

        if (isOwnerAction) {
          if (status === 'INTERVIEWING') {
            title = '서류 합격 / 면접 제안';
            content = `'${updated.jobListing.title}' 공고의 서류 전형에 합격하셨습니다. 채팅을 확인해주세요.`;
          } else if (status === 'REJECTED') {
            title = '지원 결과 안내';
            content = `'${updated.jobListing.title}' 공고 전형 결과 불합격하셨습니다.`;
          } else if (status === 'HIRED') {
            title = '최종 채용/선정 확정! 🎉';
            content = `'${updated.jobListing.title}' 공고에 최종 합격/선정되셨습니다.`;
          }
        } else {
          title = `제안에 대한 응답 도착`;
          content = `지원자가 제안을 ${status === 'INTERVIEWING' ? '수락' : '거절'}했습니다.`;
        }

        if (title && recipientId) {
          await this.notificationsService.create({
            userId: recipientId,
            type: 'STATUS_UPDATE',
            title,
            content,
            link: isOwnerAction
              ? `/dashboard/applications` // Candidate views My Apps
              : `/dashboard/jobs/${updated.jobListing.id}`, // Owner views Job
          });
        }
      } catch (e) {
        console.error('Failed to send notification', e);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = updated.user;

    const REVEALED_STATUSES = [
      'INTERVIEWING',
      'VERIFICATION',
      'HIRED',
      'CONTRACTING',
      'EXECUTING',
      'PAYMENT_COMPLETED',
    ];

    const isRevealed = REVEALED_STATUSES.includes(updated.status);
    if (!isRevealed) {
      safeUser.phone = null;
      if (safeUser.teacherProfile) safeUser.teacherProfile.bankAccount = null;
      if (safeUser.businessProfile) safeUser.businessProfile.bankAccount = null;
    }

    return { ...updated, user: safeUser };
  }

  async updateInternalNote(userId: number, applicationId: number, note: string) {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        jobListing: {
          include: { schoolProfile: true, teacherProfile: true },
        },
      },
    });

    if (!application) throw new NotFoundException('Application not found');

    const isOwner =
      (application.jobListing.schoolProfile &&
        application.jobListing.schoolProfile.userId === userId) ||
      (application.jobListing.teacherProfile &&
        application.jobListing.teacherProfile.userId === userId);

    if (!isOwner) {
      throw new ForbiddenException('Not your application');
    }

    return this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: { internalNote: note },
    });
  }

  async generateContract(userId: number, applicationId: number): Promise<Buffer> {
    const app = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        user: { include: { teacherProfile: true } },
        jobListing: { include: { schoolProfile: true } },
      },
    });

    if (!app) throw new NotFoundException('Application not found');

    // Authorization: only involved parties
    if (app.userId !== userId && app.jobListing.schoolProfile.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (!['HIRED', 'CONTRACTING', 'EXECUTING', 'PAYMENT_COMPLETED'].includes(app.status)) {
      throw new BadRequestException(
        'Contract is only available for HIRED or CONTRACTING applications',
      );
    }

    // Template Data
    const schoolName = app.jobListing.schoolProfile.schoolName || '___________';
    const teacherName = app.user.name || '___________';
    const jobTitle = app.jobListing.title;
    const date = new Date().toLocaleDateString('ko-KR');

    // Template Data call
    const data = {
      schoolName: app.jobListing.schoolProfile.schoolName || '___________',
      teacherName: app.user.name || '___________',
      jobTitle: app.jobListing.title,
      date: new Date().toLocaleDateString('ko-KR'),
      subjects: app.jobListing.subjects.join(', '),
      regions: app.jobListing.regions.join(', '),
    };

    return this.pdfGeneratorService.generateContract(data, []);
  }
}
