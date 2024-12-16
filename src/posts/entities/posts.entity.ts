import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { UsersModel } from '../../users/entities/users.entity';

import { IsString } from 'class-validator';
import { BaseModel } from '../../common/entity/base.entity';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { ImageModel } from '../../common/entity/image.entity';

@Entity()
export class PostsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false,
  })
  author: UsersModel;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  title: string;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;

  @OneToMany((type) => ImageModel, (image) => image.post)
  images?: ImageModel[];
}
