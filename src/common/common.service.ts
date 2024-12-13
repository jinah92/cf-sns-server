import { BadRequestException, Injectable } from '@nestjs/common';
import { BasePaginationDto } from './entity/base-pagination.dto';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { BaseModel } from './entity/base.entity';
import { FILTER_MAPPER } from './const/filter-mapper.const';
import { HOST, PROTOCOL } from './const/env.const';

@Injectable()
export class CommonService {
  paginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    return dto.page
      ? this.pagePaginate(dto, repository, overrideFindOptions)
      : this.cursorPaginate(dto, repository, overrideFindOptions, path);
  }

  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ) {}

  private async cursorPaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    const findOptions = this.composeFindOptions<T>(dto);

    const results = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    });

    const lastItem =
      results.length > 0 && results.length === dto.take
        ? results[results.length - 1]
        : null;

    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/posts`);

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

    return {
      data: results,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: results.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  private composeFindOptions<T extends BaseModel>(
    dto: BasePaginationDto,
  ): FindManyOptions<T> {
    /**
     * where,
     * order,
     * take,
     * skip => page 기반인 경우에만
     *
     * 1) where로 시작하면 필터 로직 적용
     * 2) order로 시작하면 정렬 로직 적용
     * 3) 필터 로직을 적용한다면 '__" 기준으로 split했을 때 3개의 값으로 나뉘는지, 2개의 값으로 나뉘는지 확인
     *   3-1) 3개의 값으로 나뉘면 FILTER_MAPPER에서 해당되는 operator 함수를 찾아서 적용한다
     *       ex. ['where', 'id', 'more_than']
     *   3-2) 2개의 값으로 나뉘면 정확한 값을 필터하는 경우 (opertaor 사용 X)
     *       ex. ['where', 'id']
     * 4) order의 경우 3-2 방법을 적용한다
     */
    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (key.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseFilter(key, value),
        };
      } else if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseFilter(key, value),
        };
      }
    }

    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? dto.take * (dto.page - 1) : null,
    };
  }

  private parseFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsWhere<T> {
    const options: FindOptionsWhere<T> = {};

    /**
     * ex. where__id__more_than => ['where', 'id', 'more_than']
     */
    const split = key.split('__');

    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(
        `where 필터는 '__'로 split 했을 때 길이가 2 또는 3이어야 합니다. key: ${key}`,
      );
    }

    if (split.length === 2) {
      const [_, field] = split;
      options[field] = value;
    } else {
      /**
       * split 길이가 3인 경우, Typeorm 유틸리티 적용이 필요하다.
       *
       * ex. where__id__more_than인 경우, where는 버려도 되고 / id는 키값이 되고 / more_than은 typeorm 유틸리티가 된다.
       *
       * FILTER_MAPPER에 미리 정의해둔 값들로
       * feild 값에 FILTER_MAPPER에서 해당되는 utility를 가져온 후 값에 적용해준다.
       */
      const [_, field, oprator] = split;

      // where__id__between = 3, 4
      // 만약 split 대상 문자가 존재하지 않으면 길이가 무조건 1이다
      // const values = value.toString().split(',');

      // filed => id, operator => more_than
      // FILTER_MAPPER[operator] => MoreThan
      options[field] = FILTER_MAPPER[oprator](value);
    }

    return options;
  }
}
