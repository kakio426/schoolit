import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieParser = require('cookie-parser');
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  // API 접두사 설정
  app.setGlobalPrefix('api');

  // 쿠키 파서 설정
  app.use(cookieParser());

  // Global Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Body Parser (NestJS standard)
  app.useBodyParser('json', { limit: '50mb' });
  app.useBodyParser('urlencoded', { limit: '50mb', extended: true });

  // 유효성 검사 파이프
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Schoolit API')
    .setDescription('Schoolit Backend API Documentation')
    .setVersion('1.6.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // --- CORS 설정 ---
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
      logger.error(`Blocked CORS origin: ${origin}`);
      logger.log(`Allowed origins are: ${allowedOrigins.join(', ')}`);

      // 개발 중이나 문제 해결 중에는 허용할 수도 있음 (보안상 주의)
      // return callback(null, true); 

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });
  // --- CORS 설정 끝 ---

  // Root Health Check v1.6.0
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (req: any, res: any) => res.status(200).send({ status: 'ok', version: '1.6.0' }));
  httpAdapter.get('/api/health', (req: any, res: any) => res.status(200).send({ status: 'api-ok', version: '1.6.0' }));

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  logger.log(`[v1.6.0] Server running on port ${port}`);
  logger.log(`Environment: ${process.env.NODE_ENV}`);
}

bootstrap().catch(err => {
  console.error('Fatal Bootstrap Error:', err);
  process.exit(1);
});
