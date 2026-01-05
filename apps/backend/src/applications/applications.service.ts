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

      return applications.map((app) => {
        const isRevealed = ['DOCUMENT_SCREENING', 'INTERVIEWING', 'VERIFICATION', 'HIRED'].includes(
          app.status,
        );
        if (!isRevealed) {
          app.user.phone = null;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...safeUser } = app.user;
        return { ...app, user: safeUser };
      });
    }

    const apps = await this.prisma.jobApplication.findMany({
      where: { userId },
      include: {
        jobListing: {
          include: {
            schoolProfile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Remove internalNote for teachers/businesses
    return apps.map((app) => {
      const { internalNote, ...rest } = app;
      return rest;
    });
  }

  async getJobApplications(userId: number, jobId: number) {
    // Check ownership
    const job = await this.prisma.jobListing.findUnique({
      where: { id: jobId },
      include: { schoolProfile: true },
    });

    if (!job) throw new NotFoundException('Job not found');
    if (job.schoolProfile.userId !== userId) {
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

    // Filter sensitive info (phone) if not in active stages
    return applications.map((app) => {
      const isRevealed = ['DOCUMENT_SCREENING', 'INTERVIEWING', 'VERIFICATION', 'HIRED'].includes(
        app.status,
      );
      if (!isRevealed) {
        app.user.phone = null; // Hide phone
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safeUser } = app.user;
      return { ...app, user: safeUser };
    });
  }

  async suggestJob(schoolUserId: number, jobId: number, teacherUserId: number) {
    const job = await this.prisma.jobListing.findUnique({
      where: { id: jobId },
      include: { schoolProfile: true },
    });
    if (!job || job.schoolProfile.userId !== schoolUserId) {
      throw new ForbiddenException('Not your job');
    }

    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherUserId, role: 'TEACHER' },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');

    const existing = await this.prisma.jobApplication.findUnique({
      where: { jobId_userId: { jobId, userId: teacherUserId } },
    });
    if (existing) throw new BadRequestException('Application/Suggestion already exists');

    const suggestion = await this.prisma.jobApplication.create({
      data: {
        jobId,
        userId: teacherUserId,
        isSuggestion: true,
        status: 'PENDING',
        message: 'School sent a suggestion',
      },
    });

    // Notify Teacher
    await this.notificationsService.create({
      userId: teacherUserId,
      type: 'SUGGESTION',
      title: '학교로부터 제안 도착 🎁',
      content: `${job.schoolProfile.schoolName || '학교'}에서 면접 제안을 보냈습니다.`,
      link: `/dashboard/applications`,
    });

    return suggestion;
  }

  async updateStatus(userId: number, applicationId: number, status: ApplicationStatus) {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        jobListing: {
          include: { schoolProfile: true },
        },
      },
    });

    if (!application) throw new NotFoundException('Application not found');

    const isSchool = application.jobListing.schoolProfile.userId === userId;
    const isTeacher = application.userId === userId;

    if (isSchool) {
      // School can update
    } else if (isTeacher && application.isSuggestion && application.status === 'PENDING') {
      if (status !== 'INTERVIEWING' && status !== 'REJECTED') {
        throw new ForbiddenException('Teacher can only Accept (INTERVIEWING) or Reject suggestion');
      }
    } else {
      throw new ForbiddenException('You do not have permission to update this application');
    }

    const updated = await this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status },
      include: {
        user: true,
        jobListing: { include: { schoolProfile: true } },
      },
    });

    if (status === 'INTERVIEWING') {
      const schoolUserId = updated.jobListing.schoolProfile.userId;
      const teacherUserId = updated.userId;
      await this.chatService.createRoom(schoolUserId, teacherUserId, updated.jobId);
    }

    // Notify Status Change
    if (['INTERVIEWING', 'REJECTED', 'ACCEPTED', 'HIRED'].includes(status)) {
      try {
        const isSchoolOwner = updated.jobListing.schoolProfile.userId === userId;
        // If School updated, notify Teacher. If Teacher updated, notify School.
        const recipientId = isSchoolOwner
          ? updated.userId
          : updated.jobListing.schoolProfile.userId;

        let title = '';
        let content = '';

        if (isSchoolOwner) {
          if (status === 'INTERVIEWING') {
            title = '서류 합격 / 면접 제안';
            content = `'${updated.jobListing.title}' 공고의 서류 전형에 합격하셨습니다. 채팅을 확인해주세요.`;
          } else if (status === 'REJECTED') {
            title = '지원 결과 안내';
            content = `'${updated.jobListing.title}' 공고 전형 결과 불합격하셨습니다.`;
          } else if (status === 'HIRED') {
            title = '최종 합격 축하드립니다! 🎉';
            content = `'${updated.jobListing.title}' 공고에 최종 합격하셨습니다.`;
          }
        } else {
          title = `제안에 대한 응답 도착`;
          content = `선생님이 제안을 ${status === 'INTERVIEWING' ? '수락' : '거절'}했습니다.`;
        }

        if (title) {
          await this.notificationsService.create({
            userId: recipientId,
            type: 'STATUS_UPDATE',
            title,
            content,
            link: isSchoolOwner
              ? `/dashboard/jobs/${updated.jobListing.id}`
              : `/dashboard/applications`,
          });
        }
      } catch (e) {
        console.error('Failed to send notification', e);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = updated.user;

    const isRevealed = ['ACCEPTED', 'INTERVIEWING', 'HIRED'].includes(updated.status);
    if (!isRevealed) {
      safeUser.phone = null;
    }

    return { ...updated, user: safeUser };
  }

  async updateInternalNote(userId: number, applicationId: number, note: string) {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        jobListing: {
          include: { schoolProfile: true },
        },
      },
    });

    if (!application) throw new NotFoundException('Application not found');
    if (application.jobListing.schoolProfile.userId !== userId) {
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

    if (app.status !== 'HIRED') {
      throw new BadRequestException('Contract is only available for HIRED applications');
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
