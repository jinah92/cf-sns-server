import { Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { CommonService } from '../common/common.service';
import { ConfigService } from '@nestjs/config';
import { ENV_HOST_KEY, ENV_PROTOCOL_KEY } from '../common/const/env-keys.const';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
    // @InjectRepository(UsersModel)
    // private readonly usersRepository: Repository<UsersModel>,
  ) {}

  // repository 접근은 비동기이기 때문에 async 키워드를 사용한다.
  async getAllPosts() {
    return this.postsRepository.find({
      relations: ['author'],
    });
  }

  async paginationPosts(dto: PaginatePostDto) {
    return this.commonService.paginate(
      dto,
      this.postsRepository,
      { relations: ['author'] },
      'posts',
    );
    // return dto.page
    //   ? this.pagePaginationPosts(dto)
    //   : this.cursorPaginationPosts(dto);
  }

  async pagePaginationPosts(dto: PaginatePostDto) {
    /**
     * data: Data[],
     * total: number,
     */
    const [posts, count] = await this.postsRepository.findAndCount({
      skip: dto.take * (dto.page - 1), // page는 1부터 세기
      take: dto.take,
      order: {
        createdAt: dto.order__createdAt,
      },
    });

    return {
      data: posts,
      total: count,
    };
  }

  async cursorPaginationPosts(dto: PaginatePostDto) {
    const where: FindOptionsWhere<PostsModel> = {};

    if (dto.where__id__less_than) {
      where.id = LessThan(dto.where__id__less_than);
    } else if (dto.where__id__more_than) {
      where.id = MoreThan(dto.where__id__more_than);
    }

    const posts = await this.postsRepository.find({
      where,
      order: {
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });

    // 해당되는 포스트가 0개 이상이면, 마지막 포스트를 가져오고 아니면 null을 가져온다
    const lastItem =
      posts.length > 0 && posts.length === dto.take
        ? posts[posts.length - 1]
        : null;

    const nextUrl =
      lastItem &&
      new URL(
        `${this.configService.get(ENV_PROTOCOL_KEY)}://${this.configService.get(ENV_HOST_KEY)}/posts`,
      );

    if (nextUrl) {
      /**
       * dto의 key를 순회하면서
       * key에 해당되는 value가 존재하면, parama에 그대로 붙여넣는다.
       */
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (
            key !== 'where__id__more_than' &&
            key !== 'where__id__less_than'
          ) {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }

      let key = null;

      if (dto.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    /**
     * Response
     *
     * date: Data[],
     * cursour: {
     *  after: 마지막 Data의 id
     * },
     * count: 응답한 데이터의 개수
     * next: 다음 요청 URL
     */
    return {
      data: posts,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: posts.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  async genratePost(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(userId, {
        title: 'test' + i,
        content: 'content' + i,
      });
    }
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  async createPost(authorId: number, postDto: CreatePostDto, image?: string) {
    // 1. create -> 저장할 객체를 생성한다.
    // 2. save -> 객체를 저장한다. (create에서 생성한 객체를 저장한다.)

    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      ...postDto,
      image,
      likeCount: 0,
      commentCount: 0,
    });

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async updatePost(id: number, postDto: UpdatePostDto) {
    // save의 기능
    // 1. 만약에 데이터가 존재하지 않는다면 새로운 데이터를 생성한다. (id 기준)
    // 2. 만약에 데이터가 존재한다면 데이터를 업데이트한다. (id 기준)

    const findPost = await this.postsRepository.findOne({ where: { id } });

    if (!findPost) {
      throw new NotFoundException();
    }

    const post = this.postsRepository.create({
      ...findPost,
      ...postDto,
    });

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async deletePost(id: number) {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException();
    }

    await this.postsRepository.delete({ id });

    return id;
  }
}
