import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
async function bootstrap() {
  console.log(`[Bootstrap] Starting app in ${process.env.NODE_ENV} mode...`);

  const app = await NestFactory.create(AppModule);

  // CORS configuration
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    const frontendUrl = process.env.FRONTEND_URL || 'https://schoolit.shop';
    app.enableCors({
      origin: (requestOrigin, callback) => {
        const allowedOrigins = [frontendUrl, 'https://schoolit.shop', 'http://localhost:3000', 'http://127.0.0.1:3000'];

        // !requestOrigin은 Postman이나 서버 간 통신일 때 등 Origin 헤더가 없을 경우 허용
        if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
          callback(null, true);
        } else {
          console.warn(`[CORS Blocked] Request Origin: ${requestOrigin}`);
          callback(null, false); // Block
        }
      },
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Accept, Authorization',
    });
    console.log(`[Bootstrap] CORS enabled for production with whitelist`);
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
