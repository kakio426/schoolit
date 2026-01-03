import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Communication (E2E)', () => {
    let app: INestApplication;
    let schoolToken: string;
    let teacherToken: string;
    let schoolId: number;
    let teacherId: number;
    let jobId: number;
    let appId: number;
    let roomId: number;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        // Ensure prefix is consistent with main.ts if it has one
        app.setGlobalPrefix('api');
        await app.init();

        // 1. Login School
        const schoolLogin = await request(app.getHttpServer())
            .get('/api/auth/test-login?email=school_match_test@example.com&role=SCHOOL')
            .expect(200);
        schoolToken = schoolLogin.body.accessToken;
        schoolId = schoolLogin.body.id;

        // 2. Login Teacher
        const teacherLogin = await request(app.getHttpServer())
            .get('/api/auth/test-login?email=teacher_match_test@example.com&role=TEACHER')
            .expect(200);
        teacherToken = teacherLogin.body.accessToken;
        teacherId = teacherLogin.body.id;

        // 2a. Create School Profile
        await request(app.getHttpServer())
            .patch('/api/users/school/profile')
            .set('Authorization', `Bearer ${schoolToken}`)
            .send({ schoolName: 'Test School', address: 'Seoul' })
            .expect(200);

        // 2b. Create Teacher Profile
        await request(app.getHttpServer())
            .patch('/api/users/profile')
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({ bio: 'I am a teacher', subjects: ['Math'], regions: ['Seoul'] })
            .expect(200);

        // 3. Create Job (School)
        const jobRes = await request(app.getHttpServer())
            .post('/api/jobs')
            .set('Authorization', `Bearer ${schoolToken}`)
            .send({
                title: 'Chat Test Job',
                description: 'Testing chat flow',
                subjects: ['Math'],
                regions: ['Seoul']
            })
            .expect(201);
        jobId = jobRes.body.id;
    });

    afterAll(async () => {
        await app.close();
    });

    it('Step 1: School suggests job to Teacher', async () => {
        await request(app.getHttpServer())
            .post(`/api/applications/${jobId}/suggest`)
            .set('Authorization', `Bearer ${schoolToken}`)
            .send({ teacherUserId: teacherId })
            .expect(201);
    });

    it('Step 2: Teacher sees suggestion', async () => {
        const res = await request(app.getHttpServer())
            .get('/api/applications/me')
            .set('Authorization', `Bearer ${teacherToken}`)
            .expect(200);

        const suggestion = res.body.find(a => a.jobId === jobId && a.isSuggestion);
        expect(suggestion).toBeDefined();
        appId = suggestion.id;
    });

    it('Step 3: Teacher accepts suggestion (Interwiewing)', async () => {
        await request(app.getHttpServer())
            .patch(`/api/applications/${appId}/status`)
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({ status: 'INTERVIEWING' })
            .expect(200);
    });

    it('Step 4: Check if Chat Room is created', async () => {
        const res = await request(app.getHttpServer())
            .get('/api/chat/rooms')
            .set('Authorization', `Bearer ${teacherToken}`)
            .expect(200);

        const room = res.body.find(r => r.jobId === jobId);
        expect(room).toBeDefined();
        roomId = room.id;
    });

    it('Step 5: Teacher sends message', async () => {
        await request(app.getHttpServer())
            .post(`/api/chat/rooms/${roomId}/messages`)
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({ content: 'Hello School!' })
            .expect(201);
    });

    it('Step 6: School sees message', async () => {
        const res = await request(app.getHttpServer())
            .get(`/api/chat/rooms/${roomId}/messages`)
            .set('Authorization', `Bearer ${schoolToken}`)
            .expect(200);

        expect(res.body).toHaveLength(1);
        expect(res.body[0].content).toBe('Hello School!');
    });
});
