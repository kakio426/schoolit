import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express'; // 👈 용량 제한 설정을 위해 추가

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  // [핵심 1] Payload Size 제한 해제 (PDF 텍스트 등 큰 데이터 수신용)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // [핵심 2] CORS 완벽 허용 (인증 쿠키 포함 가능)
  app.enableCors({
    origin: true, // 요청을 보낸 도메인을 그대로 허용 (개발 편의성)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // 쿠키/인증 헤더 허용
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API URL 프리픽스 설정 (예: /api/users)
  app.setGlobalPrefix('api');

  // Swagger 설정 (선택 사항이지만 유지)
  const config = new DocumentBuilder()
    .setTitle('School It API')
    .setDescription('School administrative support platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`Application is running on port ${port}`);
  logger.log(`CORS enabled for origin: true`);
}
bootstrap();
