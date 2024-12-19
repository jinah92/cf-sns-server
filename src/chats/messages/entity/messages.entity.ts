import { Column, Entity, ManyToOne } from 'typeorm';

import { IsString } from 'class-validator';
import { BaseModel } from '../../../common/entity/base.entity';
import { UsersModel } from '../../../users/entities/users.entity';
import { ChatsModel } from '../../entity/chats.entity';

@Entity()
export class MessagesModel extends BaseModel {
  @ManyToOne(() => ChatsModel, (user) => user.messages)
  chat: ChatsModel;

  @ManyToOne(() => UsersModel, (user) => user.messages)
  author: UsersModel;

  @Column()
  @IsString()
  message: string;
}
