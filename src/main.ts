import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // Type Annotation 역할 수행
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  ); // global pipe로 설정

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
