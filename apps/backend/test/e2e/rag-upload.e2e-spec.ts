import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('RAG Upload (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api');
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    // RED: This might fail if endpoint logic is broken or AuthGuard blocks it 
    // (We expect 401 if unauthorized, or 201 if we mock auth)
    // For TDD, let's first check if endpoint exists and requires auth
    it('/api/rag/upload (POST) without auth should return 401', () => {
        return request(app.getHttpServer())
            .post('/api/rag/upload')
            .send({ content: 'Test content', filename: 'test.txt' })
            .expect(401);
    });

    // TODO: Add authorized test case with JWT
});
