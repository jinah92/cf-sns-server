import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatsService } from './chats.service';

@WebSocketGateway({
  // ws://localhost:3001/chats
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
  constructor(private readonly chatsService: ChatsService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    console.log(`on connect called: ${socket.id}`);
  }

  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const chat = await this.chatsService.createChat(data);
  }

  @SubscribeMessage('enter_chat')
  enterChat(
    // 방의 chat id를 리스트로 받는다
    @MessageBody() data: number[],
    @ConnectedSocket() socket: Socket,
  ) {
    for (const chatId of data) {
      // socket.join()
      socket.join(chatId.toString());
    }
  }

  // socket.on('send_message', message => console.log(message));
  @SubscribeMessage('send_message')
  sendMessage(
    @MessageBody() message: { message: string; chatId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    // 브로드캐스팅 (메시지 보낸 client을 제외하고 해당되는 room에 속한 client에 메시지 전송)
    socket
      .to(message.chatId.toString())
      .emit('receive_message', message.message);

    // 해당하는 room에 연결된 client에 메시지 전달
    // this.server
    //   .in(message.chatId.toString())
    //   .emit('receive_message', 'hello from server');
  }
}
