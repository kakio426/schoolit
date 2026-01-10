import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  // CORS configuration
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'https://schoolit.shop',
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Accept, Authorization',
    });
    console.log(`CORS enabled for production: ${process.env.FRONTEND_URL}`);
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
