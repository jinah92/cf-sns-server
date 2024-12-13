import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { User } from '../users/decorator/user.decorator';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UsersModel } from '../users/entities/users.entity';
import { AccessTokenGuard } from '../auth/guard/berear-token.guard';
import { PaginatePostDto } from './dto/paginate-post.dto';

/**
 * @Controller('posts')
 * 첫번째 파라메터로 지정한 post는 URL prefix 경로를 의미한다.
 */
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * @Get()
   * 첫번째 파라메터로 지정한 post는 Controller URL prefix 기준으로 상대적인 경로를 의미한다.
   * 파라메터가 없는 경우 현재 URL prefix의 root 경로를 의미한다.
   */

  @Get()
  // @UseInterceptors(ClassSerializerInterceptor)
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
  @Post()
  @UseGuards(AccessTokenGuard)
  postPosts(
    @User('id') id: number,
    @Body() body: CreatePostDto,
    // @Body('title') title: string,
    // @Body('content') content: string,
  ) {
    return this.postsService.createPost(id, body);
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
