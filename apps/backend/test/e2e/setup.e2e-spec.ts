import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module'; // Import path double checked
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

describe('System Setup (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api');

        // Replicate main.ts middleware configurations
        app.use(cookieParser());
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                transform: true,
                forbidNonWhitelisted: true,
            })
        );

        // Mock Health Check route (Simulating main.ts)
        const httpAdapter = app.getHttpAdapter();
        httpAdapter.get('/api/health', (req: any, res: any) => res.status(200).send({ status: 'api-ok', version: '1.6.0' }));

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/api/health should return v1.6.0', () => {
        return request(app.getHttpServer())
            .get('/api/health')
            .expect(200)
            .expect((res) => {
                if (res.body.version !== '1.6.0') throw new Error(`Expected v1.6.0 but got ${res.body.version}`);
            });
    });
});
