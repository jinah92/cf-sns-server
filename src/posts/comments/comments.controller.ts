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
  UseInterceptors,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { User } from '../../users/decorator/user.decorator';
import { UsersModel } from '../../users/entities/users.entity';
import { IsPublic } from '../../common/decorator/is-public.decorator';
import { IsCommentMineOrAdminGuard } from './guard/is-comment-mine-or-admin.guard';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner as QR } from 'typeorm';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { PostsService } from '../posts.service';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly postService: PostsService,
  ) {
    /**
     * 1) entity 생성
     * author => 작성자
     * post => 귀속되는 포스트
     * comment => 댓글 내용
     * likeCount: 좋아요 개수
     *
     * id => PrimaryGeneratedColumn
     * createdAt => 생성일자
     * updatedAt => 업데이트일자
     *
     * 2) GET() pagination
     * 3) GET(:commentId) 특정 comment 하나를 가져옴
     * 4) POST() comment를 생성
     * 5) PATCH(':commentId') 특정 comment를 업데이트
     * 6) DELETE(':commentId') 특정 comment를 삭제
     */
  }

  @Get()
  @IsPublic()
  getComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: PaginateCommentsDto,
  ) {
    return this.commentsService.paginateComments(query, postId);
  }

  @Get(':commentId')
  @IsPublic()
  getCommentById(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.commentsService.getCommentById(commentId);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async postComment(
    @Param('postId') postId: number,
    @Body() body: CreateCommentDto,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    const response = await this.commentsService.createComment(
      body,
      postId,
      user,
      qr,
    );

    await this.postService.incrementCommentCount(postId, qr);

    return response;
  }

  @Patch(':commentId')
  @UseGuards(IsCommentMineOrAdminGuard)
  patchComments(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() body: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(commentId, body);
  }

  @Delete(':commentId')
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(IsCommentMineOrAdminGuard)
  async deletePost(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @QueryRunner() qr: QR,
  ) {
    const response = await this.commentsService.deleteComment(commentId, qr);

    await this.postService.decrementCommentCount(postId, qr);

    return response;
  }
}
