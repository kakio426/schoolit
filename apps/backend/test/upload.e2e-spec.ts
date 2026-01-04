import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { join } from 'path';
import * as fs from 'fs';

describe('Certification Upload (e2e)', () => {
  let app: INestApplication;
  let teacherToken: string;

  beforeAll(async () => {
    try {
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
    } catch (error) {
      console.error('Test Setup Error:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/users/certifications/upload', () => {
    it('should return 401 if unauthorized (Test 6.1.1)', async () => {
      return request(app.getHttpServer()).post('/api/users/certifications/upload').expect(401);
    });

    it('should return 400 for invalid file types (Test 6.1.2)', async () => {
      const tempFile = join(__dirname, 'test.txt');
      fs.writeFileSync(tempFile, 'test content');

      try {
        await request(app.getHttpServer())
          .post('/api/users/certifications/upload')
          .set('Authorization', `Bearer ${teacherToken}`)
          .attach('file', tempFile)
          .expect(400);
      } finally {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      }
    });

    it('should upload a valid image file and set default status to PENDING (Test 6.2.1)', async () => {
      const dummyImagePath = join(__dirname, 'dummy.png');
      fs.writeFileSync(dummyImagePath, 'dummy content');

      try {
        const res = await request(app.getHttpServer())
          .post('/api/users/certifications/upload')
          .set('Authorization', `Bearer ${teacherToken}`)
          .attach('file', dummyImagePath)
          .expect(201);

        expect(res.body.status).toBe('PENDING');
        expect(res.body.name).toBe('dummy.png');

        // Check profile is still NOT verified (Test 6.2.2)
        const profileRes = await request(app.getHttpServer())
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${teacherToken}`)
          .expect(200);

        expect(profileRes.body.teacherProfile.isVerified).toBe(false);
      } finally {
        if (fs.existsSync(dummyImagePath)) fs.unlinkSync(dummyImagePath);
      }
    });
  });

  describe('GET /api/users/certifications', () => {
    it('should return list of uploaded certifications (Test 6.2.5)', async () => {
      return request(app.getHttpServer())
        .get('/api/users/certifications')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBeTruthy();
        });
    });
  });
});
