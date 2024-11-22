import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BasePaginatePostDto } from '../../common/dto/base-pagination.dto';

export class PaginatePostDto extends BasePaginatePostDto {
  @IsNumber()
  @IsOptional()
  where__likeCount__more_than: number;

  @IsString()
  @IsOptional()
  where__title__i_like: string;
}
