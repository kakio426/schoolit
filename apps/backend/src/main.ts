import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  console.log(`[Bootstrap] Starting app in ${process.env.NODE_ENV} mode...`);

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. CORS - Standard and Permissive for Vercel/Railway compatibility
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
    credentials: false, // Must be false when origin is '*'
  });

  // 2. Body Parser - NestJS standard way (internally uses express)
  app.useBodyParser('json', { limit: '50mb' });
  app.useBodyParser('urlencoded', { limit: '50mb', extended: true });

  // 3. Prefixing
  app.setGlobalPrefix('api');

  // 4. Global Filters for JSON errors
  app.useGlobalFilters(new HttpExceptionFilter());

  // 5. Health Check at Root (Verification)
  app.getHttpAdapter().get('/', (req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      message: 'SchoolIt Backend v1.2.0 Stable',
      timestamp: new Date().toISOString()
    });
  });

  // 6. Execution
  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`[Bootstrap] v1.2.0 Server running on port ${port}`);
}

bootstrap().catch(err => {
  console.error('[Bootstrap] Fatal startup error:', err);
  process.exit(1);
});
