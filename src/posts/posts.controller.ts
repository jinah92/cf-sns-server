import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { User } from '../users/decorator/user.decorator';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UsersModel } from '../users/entities/users.entity';
import { AccessTokenGuard } from '../auth/guard/berear-token.guard';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { ImageModelType } from '../common/entity/image.entity';
import { DataSource } from 'typeorm';
import { PostsImagesService } from './image/images.service';
import { LogInterceptor } from '../common/interceptor/log.interceptor';

/**
 * @Controller('posts')
 * 첫번째 파라메터로 지정한 post는 URL prefix 경로를 의미한다.
 */
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly dataSource: DataSource,
    private readonly postsimagesService: PostsImagesService,
  ) {}

  /**
   * @Get()
   * 첫번째 파라메터로 지정한 post는 Controller URL prefix 기준으로 상대적인 경로를 의미한다.
   * 파라메터가 없는 경우 현재 URL prefix의 root 경로를 의미한다.
   */

  @Get()
  @UseInterceptors(LogInterceptor)
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginationPosts(query);
  }

  // GET /posts/:id
  // @Param() 데코레이터를 통해서 받아올 수 있다.
  // @Param('id') 매개변수를 통해 어떤 파라메터를 가져올지 지정할 수 있다.
  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostRandom(@User() user: UsersModel) {
    await this.postsService.genratePost(user.id);

    return true;
  }

  // POST /posts
  // @Body() 데코레이터를 통해서 데이터를 받아올 수 있다.
  // @Body('author') 데코레이터를 통해서 받고자 하는 데이터의 키를 지정할 수 있다.

  // DTO - Data Transfer Object

  // <<Transaction>>
  // A model, B model
  // Post api => A 모델을 저장하고, B 모델을 저장한다.
  // await repository.save(a);
  // await repository.save(b);
  //
  // 만약 a를 저장하다가 실패하면 b를 저장하지 안될 경우
  // all or nothing

  // Transaction의 기능
  // 1. start => 시작
  // 2. commit => 저장
  // 3. rollback => 원상복구
  @Post()
  @UseGuards(AccessTokenGuard)
  async postPosts(@User('id') id: number, @Body() body: CreatePostDto) {
    // 트랜잭션과 관련된 모든 쿼리를 담당할 쿼리 러너를 생성한다.
    const qr = this.dataSource.createQueryRunner();
    // 쿼리 러너에 연결한다
    await qr.connect();
    // 쿼리 러너에서 트랜잭션을 시작한다.
    // 이 시점부터 같은 쿼리 러너를 사용하면 트랜잭션 안에서 데이터베이스 액션을 실행할 수 있다.
    await qr.startTransaction();

    // 로직 실행
    try {
      const post = await this.postsService.createPost(id, body, qr);

      for (let i = 0; i < body.images.length; i++) {
        await this.postsimagesService.createPostImage(
          {
            post,
            order: i,
            path: body.images[i],
            type: ImageModelType.POST_IMAGE,
          },
          qr,
        );
      }

      await qr.commitTransaction(); // commit
      await qr.release();

      return this.postsService.getPostById(post.id);
    } catch (e) {
      // 에러가 발생하면, 트랜잭션을 종료하고 원래 상태로 되돌린다. (rollback)
      await qr.rollbackTransaction();
      await qr.release();

      throw new InternalServerErrorException('알 수 없는 에러');
    }
  }

  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, body);
  }

  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(+id);
  }
}
