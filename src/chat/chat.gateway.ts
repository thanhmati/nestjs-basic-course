import { WsJwtGuard } from '@/auth/guards/ws-jwt.guard';
import { type UserData } from '@/auth/interfaces/jwt.interface';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/chat', // Phân vùng namespace riêng cho Chat
  cors: {
    origin: '*', // Cho phép kết nối từ mọi client (tránh lỗi CORS)
  },
})
@UseGuards(WsJwtGuard)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Namespace;

  afterInit(server: Namespace) {
    this.logger.log(`🚀 ChatGateway [${server.name}] đã khởi tạo thành công!`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`🟢 Client kết nối thành công: [ID: ${client.id}]`);
  }

  handleDisconnect(client: Socket) {
    this.logger.warn(`🔴 Client ngắt kết nối: [ID: ${client.id}]`);
  }

  @SubscribeMessage('chat_message')
  handleChatMessage(
    @MessageBody() payload: { sender: string; content: string },
    @ConnectedSocket() client: Socket,
    @CurrentUser() user: UserData,
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
