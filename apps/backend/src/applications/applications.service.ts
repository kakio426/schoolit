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
  ) {}

  async applyToJob(userId: number, jobId: number, dto: ApplyJobDto) {
    // Check if job exists and is OPEN
    const job = await this.prisma.jobListing.findUnique({
      where: { id: jobId },
      include: { schoolProfile: true },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== 'OPEN' || !job.active) {
      throw new BadRequestException('Job is closed');
    }

    // Check duplicate
    const existing = await this.prisma.jobApplication.findUnique({
      where: {
        jobId_userId: {
          jobId,
          userId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('You have already applied to this job');
    }

    // Create application
    const app = await this.prisma.jobApplication.create({
      data: {
        jobId,
        userId,
        message: dto.message,
        status: 'PENDING',
      },
    });

    // Notify School
    await this.notificationsService.create({
      userId: job.schoolProfile.userId,
      type: 'APPLICATION',
      title: '새로운 지원서 도착',
      content: `'${job.title}' 공고에 새로운 지원자가 있습니다.`,
      link: `/dashboard/jobs/${job.id}`,
    });

    return app;
  }

  async getMyApplications(userId: number, role?: string) {
    if (role === 'SCHOOL') {
      const applications = await this.prisma.jobApplication.findMany({
        where: {
          jobListing: {
            schoolProfile: {
              userId: userId,
            },
          },
        },
        include: {
          jobListing: true,
          user: {
            include: {
              teacherProfile: true,
              businessProfile: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Mark as viewed (Background task-ish or just run it)
      await this.prisma.jobApplication.updateMany({
        where: {
          jobListing: { schoolProfile: { userId } },
          viewedAt: null,
        },
        data: { viewedAt: new Date() },
      });

      const REVEALED_STATUSES = [
        'INTERVIEWING',
        'VERIFICATION',
        'HIRED',
        'CONTRACTING',
        'EXECUTING',
        'PAYMENT_COMPLETED',
      ];

      return applications.map((app) => {
        const isRevealed = REVEALED_STATUSES.includes(app.status);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...safeUser } = app.user;

        if (!isRevealed) {
          safeUser.phone = null;
          if (safeUser.teacherProfile) safeUser.teacherProfile.bankAccount = null;
          if (safeUser.businessProfile) safeUser.businessProfile.bankAccount = null;
        }

        return { ...app, user: safeUser };
      });
    }

    const sentApps = await this.prisma.jobApplication.findMany({
      where: { userId },
      include: {
        jobListing: {
          include: {
            schoolProfile: true,
            teacherProfile: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const receivedApps = await this.prisma.jobApplication.findMany({
      where: {
        jobListing: {
          teacherProfile: { userId },
        },
      },
      include: {
        jobListing: {
          include: {
            schoolProfile: true,
            teacherProfile: true,
          },
        },
        user: {
          include: {
            teacherProfile: true,
            businessProfile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const allApps = [...sentApps, ...receivedApps].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    // Remove internalNote for teachers/businesses (only for sent apps? or both?)
    // If I am the owner (received), I should see my internalNote?
    // Schema has `internalNote`.
    // Logic: If I am owner, keep it. If not, remove it.

    return allApps.map((app) => {
      const isOwner =
        (app.jobListing.schoolProfile && app.jobListing.schoolProfile.userId === userId) ||
        (app.jobListing.teacherProfile && app.jobListing.teacherProfile.userId === userId);

      if (!isOwner) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { internalNote, ...rest } = app;
        return rest;
      }
      return app;
    });
  }

  async getJobApplications(userId: number, jobId: number) {
    // Check ownership
    const job = await this.prisma.jobListing.findUnique({
      where: { id: jobId },
      include: { schoolProfile: true, teacherProfile: true },
    });

    if (!job) throw new NotFoundException('Job not found');

    const isOwner =
      (job.schoolProfile && job.schoolProfile.userId === userId) ||
      (job.teacherProfile && job.teacherProfile.userId === userId);

    if (!isOwner) {
      throw new ForbiddenException('Not your job');
    }

    // Mark as viewed
    await this.prisma.jobApplication.updateMany({
      where: { jobId, viewedAt: null },
      data: { viewedAt: new Date() },
    });

    // Return applicants
    const applications = await this.prisma.jobApplication.findMany({
      where: { jobId },
      include: {
        user: {
          include: {
            teacherProfile: true,
            businessProfile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const REVEALED_STATUSES = [
      'INTERVIEWING',
      'VERIFICATION',
      'HIRED',
      'CONTRACTING',
      'EXECUTING',
      'PAYMENT_COMPLETED',
    ];

    // Filter sensitive info (phone) if not in active stages
    return applications.map((app) => {
      const isRevealed = REVEALED_STATUSES.includes(app.status);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safeUser } = app.user;

      if (!isRevealed) {
        safeUser.phone = null; // Hide phone
        if (safeUser.teacherProfile) safeUser.teacherProfile.bankAccount = null;
        if (safeUser.businessProfile) safeUser.businessProfile.bankAccount = null;
      }

      return { ...app, user: safeUser };
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
