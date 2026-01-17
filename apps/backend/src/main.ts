import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieParser = require('cookie-parser');
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { json, urlencoded } from 'express';

async function bootstrap() {
  // 1. CORS 옵션을 끈 상태로 앱 생성 (수동 설정을 위함)
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: false });
  const logger = new Logger('Bootstrap');

  // API 접두사 설정
  app.setGlobalPrefix('api');

  // 2. CORS 설정 (가장 먼저 적용 - 입구컷 방지)
  const allowedOrigins = [
    'http://localhost:3000',
    'https://schoolit.shop',
    'https://schoolit-frontend.up.railway.app',
    process.env.FRONTEND_URL,
  ].filter((origin): origin is string => !!origin);

  app.enableCors({
    origin: (origin, callback) => {
      // origin이 없으면(서버 간 통신 or Postman 등) 허용
      if (!origin) {
        return callback(null, true);
      }

      // 허용된 도메인인지 확인
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // 디버깅을 위해 막힌 Origin을 로그에 출력
      logger.warn(`Blocked CORS origin: ${origin}`);
      logger.log(`Allowed origins are: ${allowedOrigins.join(', ')}`);

      // 개발 중 편의를 위해 에러 대신 허용할 수도 있음 (보안 주의)
      // callback(null, true); 

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });

  // 3. 용량 제한 설정 (CORS 직후 적용 - 50MB까지 허용)
  // NestJS의 기본 BodyParser 대신 Express의 json/urlencoded를 직접 미들웨어로 등록하여 순서 보장
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // 4. 쿠키 및 유효성 검사
  app.use(cookieParser());

  // Global Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // 유효성 검사 파이프
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      // forbidNonWhitelisted: true, // <-- 이 옵션이 빡빡하면 에러가 잘 남. 일단 주석 처리.
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // 5. Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Schoolit API')
    .setDescription('Schoolit Backend API Documentation')
    .setVersion('1.7.0') // Updated version
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Root Health Check v1.7.0
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (req: any, res: any) => res.status(200).send({ status: 'ok', version: '1.7.0' }));
  httpAdapter.get('/api/health', (req: any, res: any) => res.status(200).send({ status: 'api-ok', version: '1.7.0' }));

  const port = process.env.PORT || 8000;
  await app.listen(port, '0.0.0.0');
  logger.log(`[v1.7.0] Server running on port ${port}`);
  logger.log(`Environment: ${process.env.NODE_ENV}`);
}

bootstrap().catch(err => {
  console.error('Fatal Bootstrap Error:', err);
  process.exit(1);
});
