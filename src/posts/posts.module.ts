import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { CommonModule } from '../common/common.module';
import { ImageModel } from '../common/entity/image.entity';
import { PostsImagesService } from './image/images.service';

@Module({
  imports: [
    // TypeORM의 모델에 해당하는 데이터를 주입할 때 forFeature()를 사용한다.
    TypeOrmModule.forFeature([PostsModel, ImageModel]),
    UsersModule,
    AuthModule,
    CommonModule,
  ],
  exports: [PostsService],
  controllers: [PostsController],
  providers: [PostsService, PostsImagesService],
})
export class PostsModule {}
