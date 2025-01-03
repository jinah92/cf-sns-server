import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entities/users.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { UserFollowersModel } from './entities/user-followers.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
    @InjectRepository(UserFollowersModel)
    private readonly userFollowersRepository: Repository<UserFollowersModel>,
  ) {}

  async createUser(_user: RegisterUserDto) {
    // 1. nickname 중복확인
    // exist() => 조건에 해당하는 갓이 있으면 true 반환
    const nicknameExist = await this.usersRepository.exists({
      where: {
        nickname: _user.nickname,
      },
    });

    if (nicknameExist) {
      throw new BadRequestException('이미 존재하는 nickname 입니다');
    }

    const emailExist = await this.usersRepository.exists({
      where: {
        email: _user.email,
      },
    });

    if (emailExist) {
      throw new BadRequestException('이미 존재하는 email 입니다');
    }

    const user = this.usersRepository.create({
      email: _user.email,
      nickname: _user.nickname,
      password: _user.password,
    });

    const newUser = await this.usersRepository.save(user);

    return newUser;
  }

  async getAllUsers() {
    return this.usersRepository.find();
  }

  async getUserByEmail(email: string) {
    return this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }

  async getUserById(id: number) {
    return this.usersRepository.findOne({
      where: {
        id,
      },
    });
  }

  async followUser(followerId: number, followeeId: number) {
    await this.userFollowersRepository.save({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      },
    });

    return true;
  }

  async getFollowers(userId: number): Promise<UsersModel[]> {
    /**
     * [
     *  {
     *    id: number,
     *    follower: UsersModel,
     *    followee: UsersModel,
     *    isConfirmed: boolean,
     *    createdAt: Date,
     *    updatedAt: Date
     *  }
     * ]
     */
    const result = await this.userFollowersRepository.find({
      where: {
        followee: {
          id: userId,
        },
      },
      relations: {
        follower: true,
        followee: true,
      },
    });

    return result.map((x) => x.follower);
  }
}
