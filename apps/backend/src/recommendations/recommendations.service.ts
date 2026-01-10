import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 특정 채용 공고에 맞는 강사 추천 (학교용)
   * 조건: 지역 일치, 과목 일치, 학교급 일치 (선택)
   */
  async findMatchingTeachers(jobId: number, limit = 10) {
    const job = await this.prisma.jobListing.findUnique({
      where: { id: jobId },
      select: { regions: true, subjects: true, gradeLevel: true },
    });

    if (!job) return [];

    const teachers = await this.prisma.teacherProfile.findMany({
      where: {
        isSearchable: true,
        AND: [
          // Region overlap
          job.regions.length > 0 ? { regions: { hasSome: job.regions } } : {},
          // Subject overlap
          job.subjects.length > 0 ? { subjects: { hasSome: job.subjects } } : {},
        ],
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      take: limit,
    });

    // Score and sort by relevance
    const scored = teachers.map((t) => {
      let score = 0;
      // +2 for each overlapping region
      score += t.regions.filter((r) => job.regions.includes(r)).length * 2;
      // +3 for each overlapping subject (more important)
      score += t.subjects.filter((s) => job.subjects.includes(s)).length * 3;
      // +1 for grade level match
      if (job.gradeLevel.length > 0 && t.targetGrades) {
        score += t.targetGrades.filter((g) => job.gradeLevel.includes(g)).length;
      }
      return { ...t, matchScore: score };
    });

    // Sort by match score descending
    scored.sort((a, b) => b.matchScore - a.matchScore);

    return scored;
  }

  /**
   * 로그인한 강사에게 맞는 채용 공고 추천 (강사용)
   * 조건: 지역 일치, 과목 일치
   */
  async findMatchingJobs(userId: number, limit = 10) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { userId },
      select: { regions: true, subjects: true, targetGrades: true },
    });

    if (!teacher) return [];

    const jobs = await this.prisma.jobListing.findMany({
      where: {
        active: true,
        status: 'OPEN',
        jobType: 'TEACHER_HIRING',
        AND: [
          // Region overlap
          teacher.regions.length > 0 ? { regions: { hasSome: teacher.regions } } : {},
          // Subject overlap
          teacher.subjects.length > 0 ? { subjects: { hasSome: teacher.subjects } } : {},
        ],
      },
      include: {
        schoolProfile: { select: { schoolName: true, address: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Score by relevance
    const scored = jobs.map((j) => {
      let score = 0;
      score += j.regions.filter((r) => teacher.regions.includes(r)).length * 2;
      score += j.subjects.filter((s) => teacher.subjects.includes(s)).length * 3;
      return { ...j, matchScore: score };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);

    return scored;
  }

  /**
   * 특정 행사 요청에 맞는 업체 추천 (학교/강사용)
   * 조건: 카테고리 일치 (eventType 또는 subjects 기반)
   */
  async findMatchingBusinesses(jobId: number, limit = 10) {
    const job = await this.prisma.jobListing.findUnique({
      where: { id: jobId },
      select: { eventType: true, subjects: true, regions: true },
    });

    if (!job) return [];

    // Build category search based on eventType or subjects
    const searchCategories = job.eventType ? [job.eventType] : job.subjects;

    const businesses = await this.prisma.businessProfile.findMany({
      where: {
        isVerified: true,
        categories: { hasSome: searchCategories },
      },
      include: {
        user: { select: { id: true, name: true } },
      },
      take: limit,
    });

    return businesses;
  }
}
