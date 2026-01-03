import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/auth/profile', () => {
    it('should return 401 Unauthorized when no token is provided (Test 4.1)', async () => {
      const response = await request(app.getHttpServer()).get('/api/auth/profile');
      console.log('Status 4.1:', response.status);
      expect(response.status).toBe(401);
    });

    it('should return 200 and user data when valid JWT is provided (Test 4.2)', async () => {
      // 1. Get a token via test-login (already implemented in auth.controller)
      const loginResponse = await request(app.getHttpServer())
        .get('/api/auth/test-login')
        .expect(200);

      const token = loginResponse.body.accessToken;

      // 2. Call profile with token
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('role');
          expect(res.body).not.toHaveProperty('password');
        });
    });
  });
});
