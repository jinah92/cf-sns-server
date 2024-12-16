import { join } from 'path';

// 서버 프로젝트의 루트 폴더
export const PROJECT_ROOT_PATH = process.cwd();
// 외부에서 접근 가능한 파일들을 모아두는 폴더
export const PUBLIC_ROLDER_NAME = 'public';
// post 이미지들을 저장할 폴더
export const POSTS_FOLDER_NAME = 'posts';

// 실제 공개폴더의 절대 경로
// {프로젝트 경로}/public
export const PUBLIC_FOLDER_PATH = join(PROJECT_ROOT_PATH, PUBLIC_ROLDER_NAME);

// post 이미지를 저장할 폴더의 절대 경로
export const POST_IMAGE_PATH = join(PUBLIC_FOLDER_PATH, POSTS_FOLDER_NAME);

// /public/posts/xxx.jpg (클라이언트에 노출할 경로)
export const POST_PUBLIC_IMAGE_PATH = join(
  PUBLIC_ROLDER_NAME,
  POSTS_FOLDER_NAME,
);
