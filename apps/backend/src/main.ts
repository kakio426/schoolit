import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs'; // fs import 추가
import * as path from 'path';
import * as os from 'os';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  console.log(`[Bootstrap] Starting app in ${process.env.NODE_ENV} mode...`);

  // NestJS standard way to set body limits and enable CORS
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
  });

  // Security & Connectivity: High compatibility mode
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
  });

  // Global prefix for all API routes
  app.setGlobalPrefix('api');

  // Custom body limits for RAG text payloads
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use(require('express').json({ limit: '50mb' }));
  expressApp.use(require('express').urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT || 4000;

  // Root health check
  app.getHttpAdapter().get('/', (req: any, res: any) => {
    res.send({ status: 'ok', message: 'SchoolIt Backend is Running' });
  });

  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port: ${port}`);
}
bootstrap();
