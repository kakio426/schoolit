import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { json, urlencoded } from 'express';

async function bootstrap() {
  console.log(`[Bootstrap] Starting app in ${process.env.NODE_ENV} mode...`);

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. CORS - Set explicitly for accuracy
  app.enableCors({
    origin: '*', // Most permissive for initial fix
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: false,
  });

  // 2. Global Prefix
  app.setGlobalPrefix('api');

  // 3. Middlewares for Body Limits (Direct Express usage is most reliable)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // 4. Global Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // 5. Health Check at Root (Verification)
  app.getHttpAdapter().get('/', (req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      message: 'SchoolIt Backend v1.1.0 Ready',
      env: process.env.NODE_ENV
    });
  });

  // 6. Listen on PORT
  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`[Bootstrap] Application is running on port: ${port}`);
}

bootstrap().catch(err => {
  console.error('[Bootstrap] Fatal startup error:', err);
  process.exit(1);
});
