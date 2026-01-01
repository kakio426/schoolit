import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { Role } from '@prisma/client';

describe('Auth System (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clean up test user if exists
    try {
      await prisma.user.delete({ where: { email: testUser.email } });
    } catch (e) {
      // Ignore if user doesn't exist
    }
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    email: 'e2e@school.com',
    password: 'password123',
    role: Role.SCHOOL,
  };

  describe('POST /api/auth/signup', () => {
    it('should register a new user and return 201', () => {
      return request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.email).toBe(testUser.email);
          expect(res.body.password).not.toBeDefined(); // Password should not be returned
        });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login and return JWT token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
        });
    });
  });
});
