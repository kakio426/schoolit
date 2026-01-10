import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MatchingService {
  constructor(private prisma: PrismaService) {}

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

  async searchTeachers(filters: { subject?: string; region?: string; keyword?: string }) {
    const where: any = { isSearchable: true };

    if (filters.subject) {
      where.subjects = { has: filters.subject };
    }

    if (filters.region) {
      where.regions = { has: filters.region };
    }

    const teachers = await this.prisma.teacherProfile.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (filters.keyword) {
      const lowerKeyword = filters.keyword.toLowerCase();
      return teachers.filter(
        (t) =>
          t.user.name?.toLowerCase().includes(lowerKeyword) ||
          t.bio?.toLowerCase().includes(lowerKeyword),
      );
    }

    return teachers;
  }

  /**
   * Calculate match score between a job and a teacher
   * Scoring weights:
   * - Subject Match: 50%
   * - Region Match: 30%
   * - Verified Status: 20%
   */
  calculateMatchScore(
    job: { subjects: string[]; regions: string[] },
    teacher: { subjects: string[]; regions: string[]; verified: boolean },
  ): number {
    let score = 0;

    // Subject Match (50 points)
    const hasSubjectMatch = job.subjects.some((subject) => teacher.subjects.includes(subject));
    if (!hasSubjectMatch) {
      return 0; // No match if subjects don't overlap
    }
    score += 50;

    // Region Match (30 points)
    const hasRegionMatch = job.regions.some((region) => teacher.regions.includes(region));
    if (hasRegionMatch) {
      score += 30;
    }

    // Verified Status (20 points)
    if (teacher.verified) {
      score += 20;
    }

    return score;
  }

  /**
   * Get recommended jobs for a teacher based on their profile
   * Returns jobs sorted by match score (highest first)
   */
  async getRecommendedJobs(teacherProfile: {
    subjects: string[];
    regions: string[];
    verified: boolean;
  }) {
    // Fetch all active jobs
    const jobs = await this.prisma.jobListing.findMany({
      where: { active: true },
      include: {
        schoolProfile: {
          select: {
            schoolName: true,
            address: true,
          },
        },
      },
    });

    // Calculate match score for each job and filter out zero scores
    const jobsWithScores = jobs
      .map((job) => ({
        ...job,
        matchScore: this.calculateMatchScore(job, teacherProfile),
      }))
      .filter((job) => job.matchScore > 0) // Exclude jobs with no match
      .sort((a, b) => b.matchScore - a.matchScore); // Sort by score descending

    return jobsWithScores;
  }
}
