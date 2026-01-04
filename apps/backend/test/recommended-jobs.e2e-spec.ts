import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma.service';

describe('Recommended Jobs API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let teacherToken: string;
  let schoolToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get(PrismaService);

    // Cleanup
    await prisma.jobApplication.deleteMany();
    await prisma.jobListing.deleteMany();
    await prisma.certification.deleteMany();
    await prisma.teacherProfile.deleteMany();
    await prisma.schoolProfile.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    const teacherRes = await request(app.getHttpServer()).get(
      '/api/auth/test-login?email=teacher_recommend@test.com&role=TEACHER',
    );
    teacherToken = teacherRes.body.accessToken;

    const schoolRes = await request(app.getHttpServer()).get(
      '/api/auth/test-login?email=school_recommend@test.com&role=SCHOOL',
    );
    schoolToken = schoolRes.body.accessToken;

    // Create teacher profile
    await request(app.getHttpServer())
      .patch('/api/users/profile')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        subjects: ['수학', '과학'],
        regions: ['서울', '경기'],
      });

    // Create school profile
    await request(app.getHttpServer())
      .patch('/api/users/school/profile')
      .set('Authorization', `Bearer ${schoolToken}`)
      .send({
        schoolName: '추천테스트학교',
        address: '서울시 강남구',
      });

    // Create job listings with different match scores
    // Perfect match job (수학 + 서울)
    await request(app.getHttpServer())
      .post('/api/jobs')
      .set('Authorization', `Bearer ${schoolToken}`)
      .send({
        title: '수학 강사 모집 (서울)',
        description: '초등 수학',
        subjects: ['수학'],
        regions: ['서울'],
      });

    // Partial match job (과학 + 부산)
    await request(app.getHttpServer())
      .post('/api/jobs')
      .set('Authorization', `Bearer ${schoolToken}`)
      .send({
        title: '과학 강사 모집 (부산)',
        description: '중등 과학',
        subjects: ['과학'],
        regions: ['부산'],
      });

    // No match job (영어 + 대구)
    await request(app.getHttpServer())
      .post('/api/jobs')
      .set('Authorization', `Bearer ${schoolToken}`)
      .send({
        title: '영어 강사 모집 (대구)',
        description: '고등 영어',
        subjects: ['영어'],
        regions: ['대구'],
      });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/matching/recommended-jobs', () => {
    it('should return jobs sorted by match score (Test 10.2.2)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/matching/recommended-jobs')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);

      // First job should be the best match (수학 + 서울)
      expect(res.body[0].title).toContain('수학');
      expect(res.body[0].matchScore).toBeGreaterThan(0);

      // Jobs should be sorted by matchScore descending
      for (let i = 0; i < res.body.length - 1; i++) {
        expect(res.body[i].matchScore).toBeGreaterThanOrEqual(res.body[i + 1].matchScore);
      }
    });

    it('should exclude jobs with no subject match (Test 10.2.3)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/matching/recommended-jobs')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      // 영어 job should not be included (no subject match)
      const englishJob = res.body.find((job) => job.title.includes('영어'));
      expect(englishJob).toBeUndefined();
    });
  });
});
