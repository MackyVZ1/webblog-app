import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(process.env.UPLOAD_DIR || join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    setHeaders: (response) => response.setHeader('Cache-Control', 'public, max-age=31536000, immutable'),
  });
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: (process.env.FRONTEND_ORIGIN || 'http://localhost:4321').split(','),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('Pulse & Pixel API')
    .setDescription('Content API for the Pulse & Pixel web blog')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
