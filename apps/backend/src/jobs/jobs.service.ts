import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateJobDto, UpdateJobDto } from './dtos/create-job.dto';
import { UserService } from '../users/user.service';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async createJob(userId: number, data: CreateJobDto) {
    const schoolProfile = await this.userService.getSchoolProfile(userId);
    if (!schoolProfile) {
      // Should effectively not happen if guard checks role, but extra safety
      throw new ForbiddenException('Only schools with a profile can post jobs');
    }

    return this.prisma.jobListing.create({
      data: {
        schoolProfileId: schoolProfile.id,
        ...data,
      },
    });
  }

  async findAll() {
    return this.prisma.jobListing.findMany({
      where: { active: true },
      include: {
        schoolProfile: true, // Include school info
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateJob(userId: number, jobId: number, data: UpdateJobDto) {
    const job = await this.prisma.jobListing.findUnique({
      where: { id: jobId },
      include: { schoolProfile: true },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.schoolProfile.userId !== userId) {
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
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
