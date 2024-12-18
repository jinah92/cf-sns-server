import { IsNumber, IsOptional, IsIn } from 'class-validator';

type Order = 'ASC' | 'DESC';

export class BasePaginationDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  // 이전 마지막 데이터의 ID
  // 이 프로퍼티에 입력된 ID보다 높은 ID값부터 가져오기
  @IsNumber()
  @IsOptional()
  where__id__more_than?: number;

  @IsNumber()
  @IsOptional()
  where__id__less_than?: number;

  // 정렬
  // createdAt : 생성된 시간의 내림차/오름차순으로 정렬
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/prefer-as-const
  order__createdAt?: Order = 'ASC'; // dto의 기본값을 넣어주기 위해서는, main에 globalPipie를 설정해줘야함. ValidationPipe의 transform 옵션을 true로 설정한다.

  // 몇개의 데이터를 응답으로 받을지
  @IsNumber()
  @IsOptional()
  take: number = 20;
}
