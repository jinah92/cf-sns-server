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
      whitelist: true, // dto에서 정의하지 않은 프로퍼티를 쿼리로 보낼 경우, striping 처리
      forbidNonWhitelisted: true, // striping 하지 않고 에러로 반환
    }),
  ); // global pipe로 설정

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
