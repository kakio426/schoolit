import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
// We are importing AppModule which doesn't exist yet - this will cause a compile error (RED)
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // This will fail because AppModule is not defined
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // We expect the API to be prefixed with /api
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        // We expect a JSON response with status: 'ok'
        if (res.body.status !== 'ok') {
          throw new Error('Expected status: ok');
        }
      });
  });
});
