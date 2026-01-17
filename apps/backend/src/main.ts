import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs'; // fs import 추가
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  console.log(`[Bootstrap] Starting app in ${process.env.NODE_ENV} mode...`);

  // Ensure upload directory exists (Prevent Multer Error)
  const uploadDir = './uploads/temp';
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

  // CORS configuration
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    const rawFrontendUrl = process.env.FRONTEND_URL || 'https://schoolit.shop';
    console.log(`[Bootstrap] Configured Frontend URL: ${rawFrontendUrl}`);
    const normalize = (url: string) => url.replace(/\/$/, '');

    app.enableCors({
      origin: (requestOrigin, callback) => {
        const allowedOrigins = [
          rawFrontendUrl,
          'https://schoolit.shop',
          'https://www.schoolit.shop', // 서브도메인 추가
          'http://localhost:3000',
        ];

        if (!requestOrigin) {
          console.log('[CORS] Allowing no-origin request (server-to-server or curl)');
          callback(null, true);
          return;
        }

        const isAllowed = allowedOrigins.some(
          (allowed) => normalize(allowed) === normalize(requestOrigin),
        );

        if (isAllowed) {
          // console.log(`[CORS Allowed] ${requestOrigin}`); // too noisy
          callback(null, true);
        } else {
          console.warn(`[CORS Blocked] Request Origin: "${requestOrigin}", Allowed: ${JSON.stringify(allowedOrigins)}`);
          callback(null, false);
        }
      },
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Accept, Authorization',
      optionsSuccessStatus: 204,
    });
    console.log(`[Bootstrap] CORS production config updated`);
  } else {
    // Failsafe: Allow ANY origin and disable credentials (cookies) since we use Bearer tokens.
    app.enableCors({
      origin: '*',
      credentials: false,
    });
    console.log('CORS enabled for development (Allow All)');
  }

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());

  // Railway assigned PORT or fallback to 8080 (Matches your Networking setting)
  const port = process.env.PORT || 4000;

  // Must listen on 0.0.0.0 to accept external traffic in cloud environments
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port: ${port}`);
}
bootstrap();
