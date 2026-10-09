import { Logger, UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { WsJwtGuard } from '@/auth/guards/ws-jwt.guard';
import { CurrentWsUser } from './decorators/current-ws-user.decorator';
import type { UserData } from '@/auth/interfaces/jwt.interface';

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Namespace;

  afterInit(server: Namespace) {
    this.logger.log(
      `🚀 WebSocket Chat Gateway ${server.name} đã sẵn sàng hoạt động!`,
    );
  }

  handleConnection(client: Socket) {
    this.logger.log(`🟢 Client kết nối vào ${this.server.name}: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.warn(
      `🔴 Client ngắt kết nối khỏi ${this.server.name}: ${client.id}`,
    );
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): string {
    this.logger.debug(`Ping nhận được từ [${client.id}]`);
    return 'pong';
  }

  @SubscribeMessage('chat_message')
  handleChatMessage(
    @MessageBody() payload: { content: string },
    @ConnectedSocket() client: Socket,
    @CurrentWsUser() user: UserData,
  ) {
    this.logger.log(`💬 Tin nhắn từ [${user.email}]: ${payload.content}`);

    const broadcastData = {
      senderId: user.userId,
      senderEmail: user.email,
      content: payload.content,
      senderSocketId: client.id,
      timestamp: new Date().toISOString(),
    };

    this.server.emit('new_message', broadcastData);

    return {
      status: 'success',
      deliveredAt: broadcastData.timestamp,
    };
  }
}
