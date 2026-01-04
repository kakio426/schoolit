import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma.service';

describe('Search Jobs API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let teacherToken: string;
  let schoolToken: string;
  let jobId1: number;
  let jobId2: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api'); // Match main.ts configuration
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
      '/api/auth/test-login?email=teacher_search@test.com&role=TEACHER',
    );
    console.log('Teacher login response:', teacherRes.status, teacherRes.body);
    teacherToken = teacherRes.body.accessToken;

    const schoolRes = await request(app.getHttpServer()).get(
      '/api/auth/test-login?email=school_search@test.com&role=SCHOOL',
    );
    console.log('School login response:', schoolRes.status, schoolRes.body);
    schoolToken = schoolRes.body.accessToken;

    // Create school profile
    const schoolProfileRes = await request(app.getHttpServer())
      .patch('/api/users/school/profile')
      .set('Authorization', `Bearer ${schoolToken}`)
      .send({
        schoolName: '서울초등학교',
        address: '서울시 강남구',
        description: '우수한 교육 환경',
      });
    console.log('School profile creation:', schoolProfileRes.status, schoolProfileRes.body);

    // Create job listings
    const job1 = await request(app.getHttpServer())
      .post('/api/jobs')
      .set('Authorization', `Bearer ${schoolToken}`)
      .send({
        title: '수학 강사 모집',
        description: '초등 수학 전문 강사를 찾습니다',
        subjects: ['수학'],
        regions: ['서울'],
      });
    console.log('Job 1 creation:', job1.status, job1.body);
    jobId1 = job1.body.id;

    const job2 = await request(app.getHttpServer())
      .post('/api/jobs')
      .set('Authorization', `Bearer ${schoolToken}`)
      .send({
        title: '영어 강사 모집',
        description: '원어민 수준의 영어 강사',
        subjects: ['영어'],
        regions: ['경기'],
      });
    jobId2 = job2.body.id;

    console.log('Test setup complete:');
    console.log('- Job 1 ID:', jobId1);
    console.log('- Job 2 ID:', jobId2);
    console.log('- Teacher Token:', teacherToken ? 'SET' : 'NOT SET');
    console.log('- Teacher Token value:', teacherToken);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/matching/jobs', () => {
    it('should search jobs by subject (Test 10.1.1)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/matching/jobs')
        .query({ subject: '수학' })
        .set('Authorization', `Bearer ${teacherToken}`);

      console.log('Response status:', res.status);
      console.log('Response body:', JSON.stringify(res.body));

      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toContain('수학');
    });

    it('should search jobs by region (Test 10.1.2)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/matching/jobs')
        .query({ region: '서울' })
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(res.body.length).toBe(1);
      expect(res.body[0].regions).toContain('서울');
    });

    it('should return empty array when no match (Test 10.1.3)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/matching/jobs')
        .query({ subject: '과학' })
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('should search with multiple filters (Test 10.1.4)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/matching/jobs')
        .query({ subject: '수학', region: '서울' })
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(res.body.length).toBe(1);
      expect(res.body[0].subjects).toContain('수학');
      expect(res.body[0].regions).toContain('서울');
    });
  });
});
