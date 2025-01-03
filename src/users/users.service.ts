import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entities/users.entity';
import { QueryRunner, Repository } from 'typeorm';
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

  getUsersRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UsersModel>(UsersModel)
      : this.usersRepository;
  }

  getUserFollowRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UserFollowersModel>(UserFollowersModel)
      : this.userFollowersRepository;
  }

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

  async followUser(followerId: number, followeeId: number, qr?: QueryRunner) {
    const userFollowerRepository = this.getUserFollowRepository(qr);

    await userFollowerRepository.save({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      },
    });

    return true;
  }

  async getFollowers(
    userId: number,
    includeNotConfirmed: boolean,
  ): Promise<UsersModel[]> {
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
    const where = {
      followee: {
        id: userId,
      },
    };

    if (!includeNotConfirmed) {
      where['isConfirmed'] = true;
    }

    const result = await this.userFollowersRepository.find({
      where,
      relations: {
        follower: true,
        followee: true,
      },
    });

    return result.map((x) => x.follower);
  }

  async confirmFollow(
    followerId: number,
    followeeId: number,
    qr?: QueryRunner,
  ) {
    const userFollowersRepository = this.getUserFollowRepository(qr);

    const existing = await userFollowersRepository.findOne({
      where: {
        follower: {
          id: followerId,
        },
        followee: {
          id: followeeId,
        },
      },
      relations: {
        follower: true,
        followee: true,
      },
    });

    if (!existing) {
      throw new BadRequestException('존재하지 않는 팔로우 요청입니다.');
    }

    await this.userFollowersRepository.save({ ...existing, isConfirmed: true });

    return true;
  }

  async deleteFollow(followerId: number, followeeId: number, qr?: QueryRunner) {
    const userFollowersRepository = this.getUserFollowRepository(qr);

    await userFollowersRepository.delete({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      },
    });

    return true;
  }

  async incrementFollowerCount(userId: number, qr?: QueryRunner) {
    const userRepository = await this.getUsersRepository(qr);

    await userRepository.increment(
      {
        id: userId,
      },
      'followerCount',
      1,
    );
  }

  async decrementFollowerCount(userId: number, qr?: QueryRunner) {
    const userRepository = await this.getUsersRepository(qr);

    await userRepository.decrement(
      {
        id: userId,
      },
      'followerCount',
      1,
    );
  }
}
