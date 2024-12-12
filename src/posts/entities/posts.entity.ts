import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersModel } from '../../users/entities/users.entity';

import { IsString } from 'class-validator';

@Entity()
export class PostsModel {
  @PrimaryGeneratedColumn()
  id: number;

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
