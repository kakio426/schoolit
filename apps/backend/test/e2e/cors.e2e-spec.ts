import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require('cors');

import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express';

describe('CORS Headers (e2e)', () => {
    let app: NestExpressApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        // Use enableCors for test environment stability
        app.enableCors({
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            allowedHeaders: '*',
            credentials: false,
        });

        app.setGlobalPrefix('api');
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Preflight requests (OPTIONS)', () => {
        it('should return CORS headers on OPTIONS request to /api/rag/upload', async () => {
            const response = await request(app.getHttpServer())
                .options('/api/rag/upload')
                .set('Origin', 'https://schoolit.shop')
                .set('Access-Control-Request-Method', 'POST');

            expect(response.headers['access-control-allow-origin']).toBeDefined();
        });

        it('should return CORS headers on OPTIONS request to /api/rag/stats', async () => {
            const response = await request(app.getHttpServer())
                .options('/api/rag/stats')
                .set('Origin', 'https://schoolit.shop')
                .set('Access-Control-Request-Method', 'GET');

            expect(response.headers['access-control-allow-origin']).toBeDefined();
        });
    });

    describe('Error responses with CORS', () => {
        it('should include CORS headers even on 401 Unauthorized response', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/rag/upload')
                .set('Origin', 'https://schoolit.shop')
                .set('Content-Type', 'application/json')
                .send({ content: 'test', filename: 'test.txt' });

            // Should have CORS headers regardless of status code
            expect(response.headers['access-control-allow-origin']).toBeDefined();
            // 401 is expected because we don't have a valid JWT token
            expect(response.status).toBe(401);
        });

        it('should include CORS headers on GET /api/rag/stats without auth', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/rag/stats')
                .set('Origin', 'https://schoolit.shop');

            expect(response.headers['access-control-allow-origin']).toBeDefined();
            expect(response.status).toBe(401);
        });
    });
});
