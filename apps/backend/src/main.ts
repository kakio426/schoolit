import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as fs from 'fs';
import { join } from 'path';

async function bootstrap() {
  // Ensure uploads directory exists
  const uploadsDir = join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('Created uploads directory:', uploadsDir);
  }

  const app = await NestFactory.create(AppModule);

  // CORS configuration
  // Failsafe: Allow ANY origin and disable credentials (cookies) since we use Bearer tokens.
  // This resolves "Failed to fetch" caused by strict CORS + Wildcard conflicts.
  app.enableCors({
    origin: '*',
    credentials: false,
  });

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());

  // Railway assigned PORT or fallback to 8080 (Matches your Networking setting)
  const port = process.env.PORT || 4000;

  // Must listen on 0.0.0.0 to accept external traffic in cloud environments
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port: ${port}`);
}
bootstrap();
