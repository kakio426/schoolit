import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Job Applications (e2e)', () => {
    let app: INestApplication;
    let teacherToken: string;
    let schoolToken: string;
    let jobId: number;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api');
        await app.init();

        // 1. Setup School
        const schoolLogin = await request(app.getHttpServer())
            .get('/api/auth/test-login?email=school_app_test@test.com&role=SCHOOL')
            .expect(200);
        schoolToken = schoolLogin.body.accessToken;

        // Ensure School Profile
        await request(app.getHttpServer())
            .patch('/api/users/school/profile')
            .set('Authorization', `Bearer ${schoolToken}`)
            .send({ schoolName: 'App Test School' });

        // Create Job
        const jobRes = await request(app.getHttpServer())
            .post('/api/jobs')
            .set('Authorization', `Bearer ${schoolToken}`)
            .send({
                title: 'Application Test Job',
                description: 'Test Description',
                subjects: ['Math'],
                regions: ['Seoul'],
            })
            .expect(201);
        jobId = jobRes.body.id;

        // 2. Setup Teacher
        const teacherLogin = await request(app.getHttpServer())
            .get('/api/auth/test-login?email=teacher_app_test@test.com&role=TEACHER')
            .expect(200);
        teacherToken = teacherLogin.body.accessToken;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/applications/:id/apply', () => {
        it('should allow teacher to apply (Test 9.2.1)', async () => {
            await request(app.getHttpServer())
                .post(`/api/applications/${jobId}/apply`)
                .set('Authorization', `Bearer ${teacherToken}`)
                .send({ message: 'I am interested' })
                .expect(201);
        });

        it('should prevent duplicate applications (Test 9.2.2)', async () => {
            await request(app.getHttpServer())
                .post(`/api/applications/${jobId}/apply`)
                .set('Authorization', `Bearer ${teacherToken}`)
                .send({ message: 'Again' })
                .expect(400); // Bad Request or Conflict
        });

        it('should return 403 for schools', async () => {
            await request(app.getHttpServer())
                .post(`/api/applications/${jobId}/apply`)
                .set('Authorization', `Bearer ${schoolToken}`)
                .expect(403);
        });
    });

    describe('GET /api/applications/me', () => {
        it('should return my applications (Test 9.2.6)', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/applications/me')
                .set('Authorization', `Bearer ${teacherToken}`)
                .expect(200);

            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body[0].jobId).toBe(jobId);
        });
    });
});
