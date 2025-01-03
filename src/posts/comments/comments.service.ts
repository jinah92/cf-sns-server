import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsModel } from './entity/comments.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PostsService } from '../posts.service';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommonService } from '../../common/common.service';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { UsersModel } from '../../users/entities/users.entity';
import { DEFAULT_COMMENT_FIND_OPTIONS } from './const/default-comment-find-options.const';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsModel)
    private readonly commentsRepository: Repository<CommentsModel>,
    private readonly postsService: PostsService,
    private readonly commonService: CommonService,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<CommentsModel>(CommentsModel)
      : this.commentsRepository;
  }

  paginateComments(dto: PaginateCommentsDto, postId: number) {
    return this.commonService.paginate(
      dto,
      this.commentsRepository,
      {
        ...DEFAULT_COMMENT_FIND_OPTIONS,
        where: {
          post: {
            id: postId,
          },
        },
      },
      `posts/${postId}/comments`,
    );
  }

  async getCommentById(id: number) {
    const comment = await this.commentsRepository.findOne({
      ...DEFAULT_COMMENT_FIND_OPTIONS,
      where: {
        id,
      },
    });

    if (!comment) {
      throw new BadRequestException(`id: ${id} comment가 존재하지 않습니다`);
    }

    return comment;
  }

  async createComment(
    dto: CreateCommentDto,
    postId: number,
    author: UsersModel,
    qr?: QueryRunner,
  ) {
    const commentsRepository = this.getRepository(qr);

    const newComment = await commentsRepository.save({
      ...dto,
      post: {
        id: postId,
      },
      author,
    });

    return newComment;
  }

  async updateComment(commentId: number, dto: UpdateCommentDto) {
    const prevComment = await this.commentsRepository.preload({
      id: commentId,
      ...dto,
    });

    const newComment = await this.commentsRepository.save(prevComment);

    return newComment;
  }

  async deleteComment(id: number, qr?: QueryRunner) {
    const commentsRepository = this.getRepository(qr);

    const comment = await commentsRepository.findOne({
      where: {
        id,
      },
    });

    if (!comment) {
      throw new BadRequestException('존재하지 않는 댓글입니다');
    }

    await commentsRepository.delete({ id });

    return id;
  }

  async isCommentMine(userId: number, commentId: number) {
    return this.commentsRepository.exists({
      where: {
        id: commentId,
        author: {
          id: userId,
        },
      },
      relations: {
        author: true,
      },
    });
  }
}
