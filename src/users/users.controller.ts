import {
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from './decorator/role.decorator';
import { RolesEnum } from './constants/roles.const';
import { User } from './decorator/user.decorator';
import { UsersModel } from './entities/users.entity';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { QueryRunner as QR } from 'typeorm';
import { QueryRunner } from '../common/decorator/query-runner.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(RolesEnum.ADMIN)
  /**
   * serialization(직렬화): 현재 시스템에서 사용되는 nest.js 데이터의 구조를 다른 시스템에서도 쉽게 사용 할 수 있는 포맷으로 변환
   *                      => class의 object에서 JSON 포맷으로 변환
   *
   * deserialization: 역직렬화
   */
  getUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('follow/me')
  async getFollow(
    @User() user: UsersModel,
    @Query('includeNotConfirmed', new DefaultValuePipe(false), ParseBoolPipe)
    includeNotConfirmed: boolean,
  ) {
    return this.usersService.getFollowers(user.id, includeNotConfirmed);
  }

  @Post('follow/:id')
  @UseInterceptors(TransactionInterceptor)
  async postFollow(
    @User() user: UsersModel,
    @Param('id', ParseIntPipe) followeeId: number,
    @QueryRunner() qr: QR,
  ) {
    await this.usersService.followUser(user.id, followeeId, qr);

    return true;
  }

  @Patch('follow/:id/confirm')
  @UseInterceptors(TransactionInterceptor)
  async patchFollowConfirm(
    @User() user: UsersModel,
    @Param('id', ParseIntPipe) followerId: number,
    @QueryRunner() qr: QR,
  ) {
    await this.usersService.confirmFollow(followerId, user.id, qr);
    await this.usersService.incrementFollowerCount(user.id, qr);

    return true;
  }

  @Delete('follow/:id')
  @UseInterceptors(TransactionInterceptor)
  async deleteFollow(
    @User() user: UsersModel,
    @Param('id', ParseIntPipe) followeeId: number,
    @QueryRunner() qr: QR,
  ) {
    await this.usersService.deleteFollow(user.id, followeeId, qr);
    await this.usersService.decrementFollowerCount(user.id, qr);

    return true;
  }
}
