import { Column, Entity, ManyToOne } from 'typeorm';
import { UsersModel } from '../../users/entities/users.entity';

import { IsString } from 'class-validator';
import { BaseModel } from '../../common/entity/base.entity';

@Entity()
export class PostsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false,
  })
  author: UsersModel;

  @Column()
  @IsString()
  title: string;

  @Column()
  @IsString()
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
