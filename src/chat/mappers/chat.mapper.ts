import { UserData } from '@/auth/interfaces/jwt.interface';
import {
  ChatBroadcastPayload,
  SendMessagePayload,
  UserRoomEventPayload,
} from '../interfaces/chat.interface';
import { ChatService } from '../chat.service';

export class ChatMapper {
  static toUserRoomEvent(user: UserData): UserRoomEventPayload {
    return {
      userId: user.userId,
      email: user.email,
      timestamp: new Date().toISOString(),
    };
  }

  static toBroadcastPayload(params: {
    sender: UserData;
    payload: SendMessagePayload;
    savedMessage?: Awaited<ReturnType<ChatService['saveDirectMessage']>> | null;
  }): ChatBroadcastPayload {
    const { sender, payload, savedMessage } = params;
    const senderUser = savedMessage?.sender;

    const resolvedId = savedMessage?.id ?? Date.now();
    const resolvedName = senderUser?.name || sender.email;
    const resolvedAvatar = senderUser?.profile?.avatarUrl || null;

    return {
      id: resolvedId,
      messageId: savedMessage?.id ?? resolvedId,
      senderId: sender.userId,
      receiverId: payload.receiverId ?? null,
      senderEmail: sender.email,
      senderName: resolvedName,
      content: payload.content,
      roomId: payload.roomId ?? null,
      createdAt: savedMessage?.createdAt
        ? savedMessage.createdAt.toISOString()
        : new Date().toISOString(),
      sender: {
        id: sender.userId,
        name: resolvedName,
        email: sender.email,
        avatarUrl: resolvedAvatar,
        profile: {
          avatarUrl: resolvedAvatar,
        },
      },
    };
  }
}
