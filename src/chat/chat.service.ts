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

  async getUserConversations(userId: number) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: { select: { avatarUrl: true } },
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: { select: { avatarUrl: true } },
          },
        },
      },
    });

    const conversationMap = new Map<
      number,
      {
        partner: {
          id: number;
          name: string | null;
          email: string;
          avatarUrl: string | null;
        };
        roomId: string;
        lastMessage: {
          id: number;
          content: string;
          createdAt: string;
          senderId: number;
          isRead: boolean;
        };
        unreadCount: number;
      }
    >();

    for (const msg of messages) {
      const isSender = msg.senderId === userId;
      const partner = isSender ? msg.receiver : msg.sender;
      const partnerId = partner.id;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner: {
            id: partner.id,
            name: partner.name,
            email: partner.email,
            avatarUrl: partner.profile?.avatarUrl ?? null,
          },
          roomId: this.getConversationRoomId(userId, partnerId),
          lastMessage: {
            id: msg.id,
            content: msg.content,
            createdAt: msg.createdAt.toISOString(),
            senderId: msg.senderId,
            isRead: msg.isRead,
          },
          unreadCount: 0,
        });
      }

      if (msg.receiverId === userId && !msg.isRead) {
        const item = conversationMap.get(partnerId)!;
        item.unreadCount += 1;
      }
    }

    return Array.from(conversationMap.values());
  }

  /**
   * Đánh dấu toàn bộ tin nhắn từ người gửi cụ thể tới người dùng hiện tại là đã đọc
   */
  async markMessagesAsRead(currentUserId: number, senderId: number) {
    const result = await this.prisma.message.updateMany({
      where: {
        senderId,
        receiverId: currentUserId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      updatedCount: result.count,
    };
  }

  async getConversationHistory(
    user1Id: number,
    user2Id: number,
    limit: number = 50,
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
