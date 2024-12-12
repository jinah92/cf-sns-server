import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    // @InjectRepository(UsersModel)
    // private readonly usersRepository: Repository<UsersModel>,
  ) {}

  // repository 접근은 비동기이기 때문에 async 키워드를 사용한다.
  async getAllPosts() {
    return this.postsRepository.find({
      relations: ['author'],
    });
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
  // 1) 오름차순으로 정렬하는 pagination만 구현한다

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

  async createPost(authorId: number, postDto: CreatePostDto) {
    // 1. create -> 저장할 객체를 생성한다.
    // 2. save -> 객체를 저장한다. (create에서 생성한 객체를 저장한다.)

    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      ...postDto,
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
