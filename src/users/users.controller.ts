import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  // @UseInterceptors(ClassSerializerInterceptor)
  /**
   * serialization(직렬화): 현재 시스템에서 사용되는 nest.js 데이터의 구조를 다른 시스템에서도 쉽게 사용 할 수 있는 포맷으로 변환
   *                      => class의 object에서 JSON 포맷으로 변환
   *
   * deserialization: 역직렬화
   */
  getUsers() {
    return this.usersService.getAllUsers();
  }
}