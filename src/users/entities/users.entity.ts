import { Column, Entity, OneToMany } from 'typeorm';
import { Roles } from '../constants/roles.const';
import { PostsModel } from '../../posts/entities/posts.entity';
import { IsEmail, IsString, Length } from 'class-validator';
import { Exclude } from 'class-transformer';
import { BaseModel } from '../../common/entity/base.entity';

@Entity()
export class UsersModel extends BaseModel {
  @Column({
    length: 20, //  최대길이 : 20
    unique: true, // 유일무일한 값이 되어야 함
  })
  nickname: string;

  @Column({
    unique: true, // 유일무일한 값이 되어야 함
  })
  @IsEmail()
  email: string;

  @Column()
  @IsString()
  @Length(3, 8)
  /**
   * (request)
   * FE => BE
   * plain object (JSON) => class instance (DTO)
   *
   * (response)
   * BE => FE
   * class instance (DTO) => plain object (JSON)
   *
   * toClassOnly : class instance 변환할때만 (request로 나갈 때)
   * toPlainOnly : palin object로 변환할때만 (response로 나갈 때)
   */
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: Roles,
    default: Roles.USER,
  })
  role: Roles;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];
}
