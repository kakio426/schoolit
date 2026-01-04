import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ApplyJobDto } from './dtos/apply-job.dto';
import { ChatService } from '../chat/chat.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
    constructor(
        private prisma: PrismaService,
        private chatService: ChatService,
        private notificationsService: NotificationsService
    ) { }

    async applyToJob(userId: number, jobId: number, dto: ApplyJobDto) {
        // Check if job exists and is OPEN
        const job = await this.prisma.jobListing.findUnique({
            where: { id: jobId },
            include: { schoolProfile: true }
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
            link: `/dashboard/jobs/${job.id}`
        });

        return app;
    }

    async getMyApplications(userId: number) {
        return this.prisma.jobApplication.findMany({
            where: { userId },
            include: {
                jobListing: {
                    include: {
                        schoolProfile: true
                    }
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getJobApplications(userId: number, jobId: number) {
        // Check ownership
        const job = await this.prisma.jobListing.findUnique({
            where: { id: jobId },
            include: { schoolProfile: true }
        });

        if (!job) throw new NotFoundException('Job not found');
        if (job.schoolProfile.userId !== userId) {
            throw new ForbiddenException('Not your job');
        }

        // Return applicants
        const applications = await this.prisma.jobApplication.findMany({
            where: { jobId },
            include: {
                user: true, // Includes User profile
                // Ideally include TeacherProfile too
            },
            orderBy: { createdAt: 'desc' },
        });

        // Filter sensitive info (phone) if not ACCEPTED
        return applications.map(app => {
            if (app.status !== 'ACCEPTED') {
                app.user.phone = null; // Hide phone
            }
            // @ts-ignore
            const { password, ...safeUser } = app.user;
            return { ...app, user: safeUser };
        });
    }

    async suggestJob(schoolUserId: number, jobId: number, teacherUserId: number) {
        const job = await this.prisma.jobListing.findUnique({
            where: { id: jobId },
            include: { schoolProfile: true }
        });
        if (!job || job.schoolProfile.userId !== schoolUserId) {
            throw new ForbiddenException('Not your job');
        }

        const teacher = await this.prisma.user.findUnique({
            where: { id: teacherUserId, role: 'TEACHER' }
        });
        if (!teacher) throw new NotFoundException('Teacher not found');

        const existing = await this.prisma.jobApplication.findUnique({
            where: { jobId_userId: { jobId, userId: teacherUserId } }
        });
        if (existing) throw new BadRequestException('Application/Suggestion already exists');

        const suggestion = await this.prisma.jobApplication.create({
            data: {
                jobId,
                userId: teacherUserId,
                isSuggestion: true,
                status: 'PENDING',
                message: 'School sent a suggestion',
            }
        });

        // Notify Teacher
        await this.notificationsService.create({
            userId: teacherUserId,
            type: 'SUGGESTION',
            title: '학교로부터 제안 도착 🎁',
            content: `${job.schoolProfile.schoolName || '학교'}에서 면접 제안을 보냈습니다.`,
            link: `/dashboard/applications`
        });

        return suggestion;
    }

    async updateStatus(userId: number, applicationId: number, status: ApplicationStatus) {
        const application = await this.prisma.jobApplication.findUnique({
            where: { id: applicationId },
            include: {
                jobListing: {
                    include: { schoolProfile: true }
                }
            }
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
                jobListing: { include: { schoolProfile: true } }
            }
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
                const recipientId = isSchoolOwner ? updated.userId : updated.jobListing.schoolProfile.userId;

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
                        link: isSchoolOwner ? `/dashboard/jobs/${updated.jobListing.id}` : `/dashboard/applications`
                    });
                }
            } catch (e) {
                console.error('Failed to send notification', e);
            }
        }

        // @ts-ignore
        const { password, ...safeUser } = updated.user;

        const isRevealed = ['ACCEPTED', 'INTERVIEWING', 'HIRED'].includes(updated.status);
        if (!isRevealed) {
            safeUser.phone = null;
        }

        return { ...updated, user: safeUser };
    }
}
