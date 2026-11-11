export interface JoinRoomPayload {
  roomId: string;
}

export interface SendMessagePayload {
  content: string;
  roomId?: string;
  receiverId?: number;
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

export interface ChatBroadcastPayload {
  id: number;
  messageId: number | null;
  senderId: number;
  receiverId?: number | null;
  senderEmail: string;
  senderName: string;
  content: string;
  roomId?: string | null;
  createdAt: string;
  sender?: {
    id: number;
    name: string;
    email: string;
    avatarUrl?: string | null;
    profile?: {
      avatarUrl?: string | null;
    } | null;
  };
}

export interface SendNotificationPayload {
  id: number;
  title: string;
  content: string;
  postId: number;
  commentAuthorId: number;
  commentAuthorName: string;
  createdAt: string;
}
