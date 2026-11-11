import { WsJwtGuard } from '@/auth/guards/ws-jwt.guard';
import { type UserData } from '@/auth/interfaces/jwt.interface';
import { CHAT_EVENTS, CHAT_ROOM } from '@/shared/constants/chat.constant';
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
import {
  type SendMessagePayload,
  type JoinRoomPayload,
  SendNotificationPayload,
} from './interfaces/chat.interface';
import { ChatMapper } from './mappers/chat.mapper';
import { ChatService } from './chat.service';

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

  constructor(private readonly chatService: ChatService) {}

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

  @SubscribeMessage(CHAT_EVENTS.JOIN_ROOM)
  async handleJoinRoom(
    @MessageBody() payload: JoinRoomPayload,
    @ConnectedSocket() client: Socket,
    @CurrentUser() user: UserData,
  ) {
    const { roomId } = payload;

    await client.join(roomId);

    this.logger.log(
      `📥 [${user.email}] (${client.id}) đã tham gia phòng: ${roomId}`,
    );

    client
      .to(roomId)
      .emit(CHAT_EVENTS.USER_JOINED, ChatMapper.toUserRoomEvent(user));

    return {
      status: 'success',
      message: `Bạn đã tham gia phòng ${roomId} thành công`,
      roomId,
    };
  }

  @SubscribeMessage(CHAT_EVENTS.LEAVE_ROOM)
  async handleLeaveRoom(
    @MessageBody() payload: JoinRoomPayload,
    @ConnectedSocket() client: Socket,
    @CurrentUser() user: UserData,
  ) {
    const { roomId } = payload;

    await client.leave(roomId);

    this.logger.log(
      `📤 [${user.email}] (${client.id}) đã rời khỏi phòng: ${roomId}`,
    );

    client
      .to(roomId)
      .emit(CHAT_EVENTS.USER_LEFT, ChatMapper.toUserRoomEvent(user));

    return {
      status: 'success',
      message: `Bạn đã rời phòng ${roomId}`,
      roomId,
    };
  }

  @SubscribeMessage(CHAT_EVENTS.SEND_ROOM_MESSAGE)
  async handleSendRoomMessage(
    @MessageBody() payload: SendMessagePayload,
    @CurrentUser() user: UserData,
  ) {
    const { targetRoom, broadcastPayload } =
      await this.chatService.processRoomMessage(user, payload);

    // Phát tán tin nhắn tới đúng phòng mục tiêu (Group Room hoặc Cuộc hội thoại 1-1)
    this.server
      .to(targetRoom)
      .emit(CHAT_EVENTS.NEW_ROOM_MESSAGE, broadcastPayload);

    this.logger.log(
      payload.receiverId
        ? `💬 [Direct Chat: ${targetRoom}] [${user.email}] -> User #${payload.receiverId}: ${payload.content}`
        : `💬 [Room: ${targetRoom}] [${user.email}]: ${payload.content}`,
    );

    return {
      status: 'sent',
      message: broadcastPayload,
    };
  }

  @SubscribeMessage(CHAT_EVENTS.SUBSCRIBE_NOTIFICATIONS)
  async handleSubscribeNotifications(
    @ConnectedSocket() client: Socket,
    @CurrentUser() user: UserData,
  ) {
    const userRoom = `${CHAT_ROOM.USER_PREFIX}${user.userId}`;
    await client.join(userRoom);

    this.logger.log(
      `🔔 [${user.email}] (${client.id}) đã tham gia phòng thông báo: ${userRoom}`,
    );

    return {
      status: 'subscribed',
      room: userRoom,
    };
  }

  sendNotificationToUser(userId: number, payload: SendNotificationPayload) {
    const userRoom = `${CHAT_ROOM.USER_PREFIX}${userId}`;
    this.server.to(userRoom).emit(CHAT_EVENTS.NEW_NOTIFICATION, payload);
    this.logger.log(`🔔 Đã đẩy thông báo tới phòng người dùng [${userRoom}]`);
  }
}
