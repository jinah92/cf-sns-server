import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RolesEnum } from '../../users/constants/roles.const';
import { PostsService } from '../posts.service';
import { Request } from 'express';
import { UsersModel } from '../../users/entities/users.entity';

@Injectable()
export class IsPostMineOrAdmin implements CanActivate {
  constructor(private readonly postService: PostsService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request & {
      user: UsersModel;
    };

    const { user } = req;

    if (!user) {
      throw new UnauthorizedException('사용자 정보를 가져올 수 없습니다.');
    }

    /**
     * Admin인 경우 패스
     */
    if (user.role === RolesEnum.ADMIN) {
      return true;
    }

    const postId = req.params.postId;

    if (!postId) {
      throw new BadRequestException('Post ID가 파라미터로 제공되어야 합니다.');
    }

    return this.postService.isPostMine(user.id, parseInt(postId));
  }
}
