import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. MAXIMUM PERMISSIVE CORS (The "Nuclear" Option for 6-hour bugs)
  app.enableCors({
    origin: (origin, callback) => callback(null, true), // Highly permissive
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*', // Support every custom header
    exposedHeaders: '*',
    credentials: true,
  });

  // 2. API Prefixing
  app.setGlobalPrefix('api');

  // 3. Global Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // 4. Body Parser (NestJS standard)
  app.useBodyParser('json', { limit: '50mb' });
  app.useBodyParser('urlencoded', { limit: '50mb', extended: true });

  // 5. Root Health Check v1.3.1
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (req: any, res: any) => res.status(200).send({ status: 'ok', version: '1.3.1' }));
  httpAdapter.get('/api/health', (req: any, res: any) => res.status(200).send({ status: 'api-ok', version: '1.3.1' }));

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
}

bootstrap().catch(err => {
  console.error('Fatal Bootstrap Error:', err);
  process.exit(1);
});
