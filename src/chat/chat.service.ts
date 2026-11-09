import { UserData } from '@/auth/interfaces/jwt.interface';
import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ProcessedMessageResult,
  SendMessagePayload,
} from './interfaces/chat.interface';
import { CHAT_ROOM } from '@/shared/constants/chat.constant';
import { ChatMapper } from './mappers/chat.mapper';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  getConversationRoomId(user1Id: number, user2Id: number): string {
    const sortedIds = [user1Id, user2Id].sort((a, b) => a - b);
    return `${CHAT_ROOM.CONVERSATION_PREFIX}${sortedIds[0]}_${sortedIds[1]}`;
  }

  async processRoomMessage(
    sender: UserData,
    payload: SendMessagePayload,
  ): Promise<ProcessedMessageResult> {
    let targetRoom = payload.roomId;
    let savedMessage: Awaited<
      ReturnType<ChatService['saveDirectMessage']>
    > | null = null;

    // 1. Nếu có receiverId -> Đây là Direct Chat 1-1: Lưu DB và sinh mã phòng 1-1
    if (payload.receiverId) {
      savedMessage = await this.saveDirectMessage(
        sender.userId,
        payload.receiverId,
        payload.content,
      );

      targetRoom = this.getConversationRoomId(
        sender.userId,
        payload.receiverId,
      );
    }

    // 2. Bảo vệ: Nếu không có cả roomId lẫn receiverId -> Ném lỗi nghiệp vụ
    if (!targetRoom) {
      throw new BadRequestException(
        'Vui lòng cung cấp roomId (phòng chat) hoặc receiverId (người nhận)!',
      );
    }

    // 4. Sử dụng ChatMapper để đóng gói payload broadcast (Tách biệt hoàn toàn khỏi Service)
    const broadcastPayload = ChatMapper.toBroadcastPayload({
      sender,
      payload,
      savedMessage,
    });

    return {
      targetRoom,
      broadcastPayload,
    };
  }

  async saveDirectMessage(
    senderId: number,
    receiverId: number,
    content: string,
  ) {
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, name: true, email: true },
    });

    if (!receiver) {
      throw new NotFoundException(
        `Người nhận với ID #${receiverId} không tồn tại trong hệ thống!`,
      );
    }

    const message = await this.prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: { avatarUrl: true },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    this.logger.log(
      `💾 Đã lưu tin nhắn #${message.id} từ User #${senderId} tới User #${receiverId}`,
    );

    return message;
  }
}
