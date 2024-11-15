import { Injectable, NotFoundException } from '@nestjs/common';

export interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

const posts: PostModel[] = [
  {
    id: 1,
    author: 'newjeans_official',
    title: '뉴진스 민지',
    content: '메이크업 고치고 있는 민지',
    likeCount: 10000000,
    commentCount: 999999,
  },
  {
    id: 2,
    author: 'blackpink_official',
    title: '블랙핑크 제니',
    content: '무대 위의 제니',
    likeCount: 20000000,
    commentCount: 1999999,
  },
  {
    id: 3,
    author: 'bts_official',
    title: 'BTS RM',
    content: '새 앨범 발매',
    likeCount: 30000000,
    commentCount: 2999999,
  },
  {
    id: 4,
    author: 'twice_official',
    title: '트와이스 나연',
    content: '팬미팅 현장',
    likeCount: 15000000,
    commentCount: 1499999,
  },
  {
    id: 5,
    author: 'redvelvet_official',
    title: '레드벨벳 아이린',
    content: '화보 촬영 중',
    likeCount: 18000000,
    commentCount: 1799999,
  },
];

@Injectable()
export class PostsService {
  getAllPosts(): PostModel[] {
    return posts;
  }

  getPostById(id: number): PostModel {
    const post = posts.find((post) => post.id === id);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  createPost(author: string, title: string, content: string) {
    const post: PostModel = {
      id: posts.at(-1).id + 1,
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    };

    posts.push(post);
  }

  updatePost(id: number, author?: string, title?: string, content?: string) {
    const post = posts.find((post) => post.id === id);

    if (!post) {
      throw new NotFoundException();
    }

    if (author) {
      post.author = author;
    }

    if (title) {
      post.title = title;
    }

    if (content) {
      post.content = content;
    }

    return post;
  }

  deletePost(id: number) {
    const postIndex = posts.findIndex((post) => post.id === id);

    if (postIndex === -1) {
      throw new NotFoundException();
    }

    posts.splice(postIndex, 1);

    return id;
  }
}
