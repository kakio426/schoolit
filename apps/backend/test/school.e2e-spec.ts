import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('School Profile (e2e)', () => {
  let app: INestApplication;
  let schoolToken: string;
  let teacherToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    // 1. Get School Token
    const schoolLogin = await request(app.getHttpServer())
      .get('/api/auth/test-login?email=school@test.com&role=SCHOOL')
      .expect(200);
    schoolToken = schoolLogin.body.accessToken;

    // 2. Get Teacher Token (for unauthorized tests)
    const teacherLogin = await request(app.getHttpServer())
      .get('/api/auth/test-login?email=teacher_school_test@test.com&role=TEACHER')
      .expect(200);
    teacherToken = teacherLogin.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/users/school/profile', () => {
    it('should return 403 for non-school users (Test 8.1.3)', async () => {
      return request(app.getHttpServer())
        .get('/api/users/school/profile')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });

    it('should return school profile or empty object (Test 8.1.1)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/users/school/profile')
        .set('Authorization', `Bearer ${schoolToken}`)
        .expect(200);

      // It might be empty if not created yet
      if (Object.keys(res.body).length > 0) {
        expect(res.body).toHaveProperty('userId');
      }
    });
  });

  describe('PATCH /api/users/school/profile', () => {
    it('should update school specific details (Test 8.1.2)', async () => {
      const updateData = {
        schoolName: 'Test High School',
        address: '123 Test St, Seoul',
        website: 'https://school.test.com',
        description: 'A prestigious test school',
      };

      const res = await request(app.getHttpServer())
        .patch('/api/users/school/profile')
        .set('Authorization', `Bearer ${schoolToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.schoolProfile.schoolName).toBe(updateData.schoolName);
      expect(res.body.schoolProfile.description).toBe(updateData.description);
    });
  });
});
