import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Role } from '@prisma/client';

describe('Admin Verification (e2e)', () => {
  let app: INestApplication;
  let teacherToken: string;
  let adminToken: string;
  let certificationId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    // 1. Get Teacher Token
    const teacherLogin = await request(app.getHttpServer())
      .get('/api/auth/test-login?email=teacher@test.com&role=TEACHER')
      .expect(200);
    teacherToken = teacherLogin.body.accessToken;

    // 2. Get Admin Token
    const adminLogin = await request(app.getHttpServer())
      .get('/api/auth/test-login?email=admin@test.com&role=ADMIN')
      .expect(200);
    adminToken = adminLogin.body.accessToken;

    // 3. Teacher uploads a certificate to test with
    const { join } = require('path');
    const { writeFileSync, unlinkSync } = require('fs');
    const tempFile = join(__dirname, 'test-cert.png');
    writeFileSync(tempFile, 'fake content');

    const uploadRes = await request(app.getHttpServer())
      .post('/api/users/certifications/upload')
      .set('Authorization', `Bearer ${teacherToken}`)
      .attach('file', tempFile)
      .expect(201);
    certificationId = uploadRes.body.id;
    unlinkSync(tempFile);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('PATCH /api/admin/certifications/:id/status', () => {
    it('should return 403 for non-admins', async () => {
      return request(app.getHttpServer())
        .patch(`/api/admin/certifications/${certificationId}/status`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ status: 'APPROVED' })
        .expect(403);
    });

    it('should approve certification and verify teacher', async () => {
      // Approve
      await request(app.getHttpServer())
        .patch(`/api/admin/certifications/${certificationId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'APPROVED' })
        .expect(200);

      // Check if teacher is now verified
      const profileRes = await request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(profileRes.body.teacherProfile.isVerified).toBe(true);
    });
  });
});
