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

  // Ensure upload directory exists (Prevent Multer Error)
  const uploadDir = path.join(os.tmpdir(), 'schoolit-uploads');
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`[Bootstrap] Created temp upload directory: ${uploadDir}`);
    }
  } catch (err) {
    console.error(`[Bootstrap] Failed to create upload directory:`, err);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Increase body size limit for large file uploads
  app.useBodyParser('json', { limit: '50mb' });
  app.useBodyParser('urlencoded', { limit: '50mb', extended: true });

  // CORS configuration (Max permissiveness to resolve long-standing issues)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: false,
  });
  console.log(`[Bootstrap] CORS configured to '*' for maximum compatibility`);

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());

  // Railway assigned PORT or fallback to 4000
  const port = process.env.PORT || 4000;

  // Root health check for debugging
  app.getHttpAdapter().get('/', (req: any, res: any) => {
    res.send({ status: 'ok', timestamp: new Date().toISOString(), message: 'SchoolIt Backend is Running' });
  });

  // Must listen on 0.0.0.0 to accept external traffic in cloud environments
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port: ${port}`);
}
bootstrap();
