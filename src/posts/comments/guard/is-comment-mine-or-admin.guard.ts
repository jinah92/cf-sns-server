import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CommentsService } from '../comments.service';
import { UsersModel } from '../../../users/entities/users.entity';
import { RolesEnum } from '../../../users/constants/roles.const';
import { Request } from 'express';

@Injectable()
export class IsCommentMineOrAdminGuard implements CanActivate {
  constructor(private readonly commentService: CommentsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request & {
      user: UsersModel;
    };

    const { user } = req;

    if (!user) {
      throw new UnauthorizedException('사용자 정보를 가져올 수 없습니다.');
    }

    if (user.role === RolesEnum.ADMIN) {
      return true;
    }

    const commentId = req.params.commentId;

    if (!commentId) {
      throw new BadRequestException(
        'Comment ID가 파라미터로 제공되어야 합니다.',
      );
    }

    return this.commentService.isCommentMine(user.id, parseInt(commentId));
  }
}
