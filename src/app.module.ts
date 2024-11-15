import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    PostsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [],
      synchronize: true, // TypeORM 기준으로 데이터베이스 싱크를 맞춰준다. production 환경에서는 사용하지 않는 것이 좋다.
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
