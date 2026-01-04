import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Job Listings (e2e)', () => {
  let app: INestApplication;
  let schoolToken: string;
  let teacherToken: string;
  let createdJobId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    // Get Tokens (Use unique emails to avoid profile conflicts if logic ensures profile existence)
    const schoolLogin = await request(app.getHttpServer())
      // Helper to ensure school profile exists (logic in UserService/AuthService might need creation)
      // But auth/test-login creates User.
      // We might need to manually ensure School Profile exists if Job creation depends on it.
      // Our previous tests for school profile showed it returns empty if not exists.
      // So we might need to create it first.
      .get('/api/auth/test-login?email=school_jobs@test.com&role=SCHOOL')
      .expect(200);
    schoolToken = schoolLogin.body.accessToken;

    const teacherLogin = await request(app.getHttpServer())
      .get('/api/auth/test-login?email=teacher_jobs@test.com&role=TEACHER')
      .expect(200);
    teacherToken = teacherLogin.body.accessToken;

    // Ensure School Profile exists for the user
    await request(app.getHttpServer())
      .patch('/api/users/school/profile')
      .set('Authorization', `Bearer ${schoolToken}`)
      .send({ schoolName: 'Job School' })
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/jobs', () => {
    it('should create a job listing (Test 8.2.1)', async () => {
      const jobData = {
        title: 'Math Teacher Needed',
        description: 'Teaching Algebra to high school students',
        subjects: ['Math'],
        regions: ['Seoul'],
      };

      const res = await request(app.getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${schoolToken}`)
        .send(jobData)
        .expect(201);

      createdJobId = res.body.id;
      expect(res.body.title).toBe(jobData.title);
      expect(res.body.schoolProfileId).toBeDefined();
    });

    it('should return 403 for teachers', async () => {
      await request(app.getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ title: 'Hack' })
        .expect(403);
    });
  });

  describe('GET /api/jobs', () => {
    it('should return all listings (Test 8.2.2)', async () => {
      await request(app.getHttpServer())
        .get('/api/jobs')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBeTruthy();
          expect(res.body.length).toBeGreaterThanOrEqual(1);
          // Verify structure
          const job = res.body.find((j) => j.id === createdJobId);
          expect(job).toBeDefined();
          expect(job.title).toBe('Math Teacher Needed');
        });
    });
  });

  describe('PATCH /api/jobs/:id', () => {
    it('should update job listing if owner (Test 8.2.3)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/jobs/${createdJobId}`)
        .set('Authorization', `Bearer ${schoolToken}`)
        .send({ active: false })
        .expect(200);

      expect(res.body.active).toBe(false);
    });

    it('should return 403/404 if not owner or not authorized', async () => {
      // Teacher trying to update school job
      await request(app.getHttpServer())
        .patch(`/api/jobs/${createdJobId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ active: true })
        .expect(403);
    });
  });
});
