import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Teacher Profile (e2e)', () => {
  let app: INestApplication;
  let teacherToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    // Get a token for a Teacher user
    const loginResponse = await request(app.getHttpServer())
      .get('/api/auth/test-login')
      .expect(200);
    teacherToken = loginResponse.body.accessToken;
    const userId = loginResponse.body.id;

    // Cleanup: Delete profile if exists
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.teacherProfile.deleteMany({ where: { userId } });
    await prisma.$disconnect();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/users/profile', () => {
    it('should return 200 with profile data (Test 5.1.1)', async () => {
      // Logic: This relies on the DB migration being applied
      return request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);
    });
  });

  describe('PATCH /api/users/profile', () => {
    it('should update bio and subjects (Test 5.1.2)', async () => {
      const updateData = {
        bio: 'Hello, I am a drone teacher.',
        subjects: ['DRONE', 'CODING'],
        regions: ['SEOUL_GANGNAM'],
      };

      return request(app.getHttpServer())
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.bio).toEqual(updateData.bio);
        });
    });

    it('should NOT allow updating isVerified (Test 5.1.3)', async () => {
      const maliciousUpdate = {
        isVerified: true,
      };

      return request(app.getHttpServer())
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(maliciousUpdate)
        .expect(200)
        .expect((res) => {
          // Should ideally check DB, but here checking response is a proxy
          // Since we filtered it in DTO/Service, it shouldn't be reflected if response returns updated obj
          // NOTE: Upsert returns the object. If we didn't update it, it won't be true (default false).
          expect(res.body.isVerified).toBe(false);
        });
    });
  });
});
