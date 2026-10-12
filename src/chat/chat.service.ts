import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { UserData } from '@/auth/interfaces/jwt.interface';
import { CHAT_ROOM } from './constants/chat.constant';
import { SendMessageDto } from './dto/send-message.dto';

export interface ChatBroadcastPayload {
  messageId: number | null;
  senderId: number;
  senderEmail: string;
  senderName: string;
  content: string;
  roomId: string;
  createdAt: string;
}

export interface UserRoomEventPayload {
  userId: number;
  email: string;
  timestamp: string;
}

export interface ProcessedMessageResult {
  targetRoom: string;
  broadcastPayload: ChatBroadcastPayload;
}

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
    dto: SendMessageDto,
  ): Promise<ProcessedMessageResult> {
    let targetRoom = dto.roomId;
    let savedMessage: Awaited<
      ReturnType<ChatService['saveDirectMessage']>
    > | null = null;

    if (dto.receiverId) {
      savedMessage = await this.saveDirectMessage(
        sender.userId,
        dto.receiverId,
        dto.content,
      );

      targetRoom = this.getConversationRoomId(sender.userId, dto.receiverId);
    }

    if (!targetRoom) {
      throw new BadRequestException(
        'Vui lòng cung cấp roomId (phòng chat) hoặc receiverId (người nhận)!',
      );
    }

    const broadcastPayload: ChatBroadcastPayload = {
      messageId: savedMessage?.id || null,
      senderId: sender.userId,
      senderEmail: sender.email,
      senderName: savedMessage?.sender?.name || sender.email,
      content: dto.content,
      roomId: targetRoom,
      createdAt: savedMessage?.createdAt
        ? savedMessage.createdAt.toISOString()
        : new Date().toISOString(),
    };

    return {
      targetRoom,
      broadcastPayload,
    };
  }

  createUserRoomEventPayload(user: UserData): UserRoomEventPayload {
    return {
      userId: user.userId,
      email: user.email,
      timestamp: new Date().toISOString(),
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

  async getConversationHistory(
    user1Id: number,
    user2Id: number,
    limit: number = 20,
  ) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: user1Id, receiverId: user2Id },
          { senderId: user2Id, receiverId: user1Id },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
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
      },
    });

    return messages.reverse();
  }
}
