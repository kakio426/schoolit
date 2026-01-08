import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateJobDto, UpdateJobDto } from './dtos/create-job.dto';
import { UserService } from '../users/user.service';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) { }

  async createJob(userId: number, data: CreateJobDto) {
    // Try finding School Profile
    const schoolProfile = await this.prisma.schoolProfile.findUnique({ where: { userId } });
    if (schoolProfile) {
      return this.prisma.jobListing.create({
        data: {
          schoolProfileId: schoolProfile.id,
          ...data,
        },
      });
    }

    // Try finding Teacher Profile
    const teacherProfile = await this.prisma.teacherProfile.findUnique({ where: { userId } });
    if (teacherProfile) {
      // Validate that jobType is EVENT_VENDOR? Or allow any?
      // The UI sets EVENT_VENDOR. Backend can enforce if needed.
      return this.prisma.jobListing.create({
        data: {
          teacherProfileId: teacherProfile.id,
          ...data,
        },
      });
    }

    throw new ForbiddenException('Only schools or teachers with a profile can post jobs');
  }

  async findAll(filters?: { jobType?: string; subjects?: string[]; regions?: string[] }) {
    const where: any = { active: true };

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
      include: {
        schoolProfile: true,
        teacherProfile: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const job = await this.prisma.jobListing.findUnique({
      where: { id },
      include: {
        schoolProfile: true,
        teacherProfile: { include: { user: { select: { name: true } } } },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async updateJob(userId: number, jobId: number, data: UpdateJobDto) {
    const job = await this.prisma.jobListing.findUnique({
      where: { id: jobId },
      include: { schoolProfile: true, teacherProfile: true },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check ownership
    const isOwner =
      (job.schoolProfile && job.schoolProfile.userId === userId) ||
      (job.teacherProfile && job.teacherProfile.userId === userId);

    if (!isOwner) {
      throw new ForbiddenException('You can only update your own jobs');
    }

    return this.prisma.jobListing.update({
      where: { id: jobId },
      data,
    });
  }

  async searchJobs(filters: { subject?: string; region?: string; keyword?: string }) {
    const where: any = { active: true };

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
      include: {
        schoolProfile: {
          select: {
            schoolName: true,
            address: true,
          },
        },
        teacherProfile: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async findMyJobs(userId: number, role: string) {
    const where: any = {};

    if (role === 'SCHOOL') {
      where.schoolProfile = { userId };
    } else if (role === 'TEACHER') {
      where.teacherProfile = { userId };
    } else {
      // For other roles, search both or return empty
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

  async deleteJob(userId: number, jobId: number) {
    const job = await this.prisma.jobListing.findUnique({
      where: { id: jobId },
      include: { schoolProfile: true, teacherProfile: true },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const isOwner =
      (job.schoolProfile && job.schoolProfile.userId === userId) ||
      (job.teacherProfile && job.teacherProfile.userId === userId);

    if (!isOwner) {
      throw new ForbiddenException('You can only delete your own jobs');
    }

    return this.prisma.jobListing.delete({
      where: { id: jobId },
    });
  }
}
