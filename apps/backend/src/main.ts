import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require('cors');
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 🔴 CRITICAL: Express CORS middleware MUST run BEFORE NestJS pipeline
  // This ensures CORS headers are present even on Guard exceptions (401)
  app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: false,
  }));

  // API Prefixing
  app.setGlobalPrefix('api');

  // Global Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Body Parser (NestJS standard)
  app.useBodyParser('json', { limit: '50mb' });
  app.useBodyParser('urlencoded', { limit: '50mb', extended: true });

  // Root Health Check v1.4.0
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (req: any, res: any) => res.status(200).send({ status: 'ok', version: '1.4.0' }));
  httpAdapter.get('/api/health', (req: any, res: any) => res.status(200).send({ status: 'api-ok', version: '1.4.0' }));

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`[v1.4.0] Server running on port ${port} with Express CORS middleware`);
}

bootstrap().catch(err => {
  console.error('Fatal Bootstrap Error:', err);
  process.exit(1);
});
