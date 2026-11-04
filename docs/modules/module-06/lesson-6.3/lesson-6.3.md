# Lesson 6.3: WebSockets Chat Rooms & Message Persistence — Quản Lý Phòng Chat & Lưu Trữ Tin Nhắn Với Prisma ORM

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-Framework-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-Language-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Socket.io-Rooms-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Prisma-ORM_7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma ORM" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/pnpm-Package_Manager-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
</p>

<p align="center">
  <img src="./assets/lesson_overview_banner.png" alt="Lesson Overview Banner — NestJS WebSockets Chat Rooms & Message Persistence" width="85%" />
</p>

---

> [!NOTE]
> ⏱️ **Thời lượng:** 20 – 25 phút thực hành chuyên sâu  
> 🎯 **Mục tiêu bài học:**
>
> - **Bản Chất & Hình Dung Trực Quan:** Giải thích bản chất của **Socket.IO Rooms** (kênh phân nhóm ảo trên bộ nhớ RAM server) và phân biệt rõ ràng giữa `this.server.to().emit()` (gửi tất cả kể cả người gửi) và `client.to().emit()` (gửi tất cả trừ người gửi).
> - **Room Lifecycle:** Xây dựng tính năng tham gia phòng (`join_room`), rời phòng (`leave_room`) và cơ chế tự động dọn dẹp khi socket client ngắt kết nối.
> - **Targeted Broadcast:** Triển khai cơ chế phát tán thông điệp có chọn lọc chỉ đến đúng các client trong cùng một cuộc trò chuyện, ngăn chặn hoàn toàn rò rỉ tin nhắn ra toàn hệ thống.
> - **Architecture & Separation of Concerns:** Tách biệt triệt để trách nhiệm giữa các thành phần: Network Dispatcher (`ChatGateway`), Data Transformation (`ChatMapper`), Type Contracts (`chat.interface.ts`) và Business & Database Persistence (`ChatService`).
> - **Message Persistence:** Lưu trữ tin nhắn bền vững vào bảng `messages` trong PostgreSQL thông qua `PrismaService` theo đúng quan hệ thực thể `senderId` và `receiverId`.
> - **History Query:** Truy vấn danh sách lịch sử tin nhắn gần nhất khi người dùng mới tham gia phòng trò chuyện.
> - **Verify & Debug:** Kiểm thử truyền nhận tin nhắn giữa nhiều client trong các phòng khác nhau bằng Web Client test script và xử lý triệt để các lỗi bất đồng bộ thường gặp.

> [!IMPORTANT]
> **Prerequisites:**
>
> - Đã khởi tạo `ChatGateway` với Namespace `/chat` ([Lesson 6.1](../lesson-6.1/lesson-6.1.md)).
> - Đã bảo vệ Gateway bằng `WsJwtGuard` và decorator `@CurrentUser()` ([Lesson 6.2](../lesson-6.2/lesson-6.2.md)).
> - Nắm vững mô hình dữ liệu Prisma Client & quan hệ thực thể `User` - `Message` ([Module 2](../../module-02/lesson-2.3/lesson-2.3.md)).

---

## 1. Vấn Đề Thực Tế: Broadcast Toàn Cục & Nỗi Đau Mất Dữ Liệu Khi F5 (Why?)

Ở hai bài học trước, chúng ta đã khởi tạo thành công kết nối WebSocket và bảo mật bằng JWT. Tuy nhiên, luồng gửi tin nhắn hiện tại đang mắc phải **hai vấn đề nghiêm trọng**:

```typescript
// ❌ CÁCH LÀM HIỆN TẠI TRONG LESSON 6.2:
@SubscribeMessage('chat_message')
handleChatMessage(@MessageBody() payload: { content: string }) {
  // 1. Bắn cho TẤT CẢ mọi người kết nối vào /chat!
  this.server.emit('new_message', { content: payload.content });
  // 2. Không lưu vào đâu cả, dữ liệu chỉ bay trên RAM!
}
```

```text
❌ TRẢI NGHIỆM THỰC TẾ CỦA NGƯỜI DÙNG:

    Alice (User #1)                     Bob (User #2)                  Charlie (User #3)
          │                                   │                                │
          ├─── [chat_message: "Chào Bob"] ───►│ (Server)                       │
          │                                   ├─── [new_message: "Chào Bob"] ─►│ (Nhận được!)
          │                                   └─── [new_message: "Chào Bob"] ──┼───────────────► 💥 Charlie cũng nhận được!
          │                                                                    │    (Rò rỉ dữ liệu riêng tư)
          │                                                                    │
          ├─── [Alice ấn F5 Reload trang] ────────────────────────────────────►│
          │                                                                    │
          ▼                                                                    ▼
   MÀN HÌNH TRẮNG TINH! Toàn bộ lịch sử cuộc trò chuyện biến mất hoàn toàn!
```

### ⚠️ Hệ quả kỹ thuật:

1. **Rò rỉ quyền riêng tư (Privacy Leak):** Khi User A nhắn tin cho User B, toàn bộ User C, D, E đang online đều nhận được thông báo tin nhắn này.
2. **Spam băng thông mạng (Network Choke):** Nếu có 10,000 người kết nối, một tin nhắn bất kỳ sẽ được nhân bản thành 10,000 gói tin gửi xuống tất cả mọi người.
3. **Mất mát dữ liệu (Data Loss - Ephemerality):** Socket.io chỉ truyền tải gói tin qua TCP. Nếu không có lớp lưu trữ bền vững (Persistence Layer), mọi tin nhắn sẽ biến mất vĩnh viễn ngay khi socket ngắt kết nối.

👉 **Giải pháp kiến trúc:**

- Áp dụng **Socket.IO Rooms** để tạo không gian phòng chat cô lập.
- Tích hợp **Prisma ORM** lưu trữ tin nhắn vào PostgreSQL và tải lịch sử cuộc trò chuyện.

---

## 2. Bản Chất Socket.IO Rooms & Mô Hình Lưu Trữ Tin Nhắn (What?)

### 2.1 Cách Hình Dung Trực Quan: Socket.IO Rooms Là Gì?

Trong Socket.IO, **Room** là một **kênh ảo (Virtual Channel)** được quản lý hoàn toàn phía Server nhằm nhóm các socket connections lại với nhau.

<p align="center">
  <img src="./assets/socketio_rooms_concept.png" alt="Socket.IO Rooms Concept Visualization" width="85%" />
</p>

> [!TIP]
> **Room không đòi hỏi một bảng `Room` trong Database!**  
> Bản chất của Room ở tầng Socket.IO chỉ là một cấu trúc dữ liệu `Map<string, Set<string>>` nằm trong bộ nhớ RAM của Node.js:
>
> ```typescript
> // Mô hình trong RAM của Socket.io Adapter:
> rooms = {
>   room_frontend: Set(['socket_id_1', 'socket_id_2']),
>   room_backend: Set(['socket_id_3']),
>   conversation_1_2: Set(['socket_id_1', 'socket_id_4']),
> };
> ```

Mỗi khi một client gọi `client.join('room_frontend')`, Socket.IO chỉ đơn giản là thêm `client.id` vào Set của phòng đó.

### 2.2 Phân Biệt Các Kiểu Phát Tán (Broadcast Cheat Sheet)

| Cú pháp Socket.io                          | Đối tượng nhận                                   | Trường hợp sử dụng thực tế                                  |
| :----------------------------------------- | :----------------------------------------------- | :---------------------------------------------------------- |
| `this.server.emit('event', data)`          | **Tất cả mọi client** trong namespace            | Thông báo bảo trì toàn hệ thống, tin tức chung.             |
| `this.server.to(room).emit('event', data)` | **Tất cả client trong room** (bao gồm người gửi) | Tin nhắn mới trong phòng chat, thông báo phòng.             |
| `client.to(room).emit('event', data)`      | **Tất cả client trong room TRỪ người gửi**       | Thông báo: _"Alice đang gõ phím..."_, _"Bob đã vào phòng"_. |
| `client.emit('event', data)`               | **Chỉ riêng người gửi**                          | Phản hồi lỗi riêng tư, xác nhận thao tác.                   |

---

### 2.3 Luồng Xử Lý Kép: Real-Time Broadcast & Database Persistence

<p align="center">
  <img src="./assets/message_persistence_pipeline.png" alt="Message Persistence Pipeline Visualization" width="85%" />
</p>

Khi một tin nhắn được gửi lên Server, hệ thống triển khai một luồng xử lý đồng thời (Forked Execution):

---

## 3. Chuẩn Hóa Hằng Số, Interfaces & Data Mapper (How - Step 1)

Trước khi viết code logic, chúng ta cần tuân thủ **3 nguyên tắc Clean Architecture cốt lõi**:

1. **Loại bỏ hoàn toàn Magic Strings:** Mọi tên sự kiện Socket.io và định dạng tên phòng phải được quy tụ về một file hằng số tập trung.
2. **Contracts & Type Safety qua Interfaces:** Trong giao tiếp WebSocket thời gian thực, payload của event là các plain objects trao đổi trực tiếp qua Socket.io. Thay vì tạo class DTO cồng kềnh với `class-validator`, ta định nghĩa các contracts tường minh bằng **TypeScript Interfaces** trong file riêng biệt (`chat.interface.ts`).
3. **Tách biệt Data Mapping (Single Responsibility Principle):** Các hàm chuyển đổi cấu trúc dữ liệu (Format DTO/Entity sang Broadcast Payload hoặc Room Event Payload) không nên để lẫn trong Service mà được tách riêng thành **`ChatMapper`** (`chat.mapper.ts`).

### 3.1 Định Nghĩa Hằng Số WebSocket Sự Kiện & Phòng Chat

Tạo file constants mới trong module chat:

📄 **`src/chat/constants/chat.constant.ts`**

```typescript
export const CHAT_EVENTS = {
  // Client to Server
  PING: 'ping',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  SEND_ROOM_MESSAGE: 'send_room_message',
  GET_HISTORY: 'get_history',

  // Server to Client
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  NEW_ROOM_MESSAGE: 'new_room_message',
} as const;

export const CHAT_ROOM = {
  CONVERSATION_PREFIX: 'conversation:',
} as const;
```

> [!TIP]
> **Lợi ích của `as const` và Hằng số tập trung:**
>
> - IDE tự động gợi ý code (IntelliSense), ngăn chặn 100% lỗi gõ nhầm chính tả (typo).
> - Khi cần đổi tên event, bạn chỉ cần sửa ở đúng 1 dòng trong file constant thay vì phải đi tìm và thay thế hàng chục file.
> - Có thể export và tái sử dụng trực tiếp sang dự án Frontend Client (Next.js/React/Vue).

---

### 3.2 Quy Ước Định Danh Phòng (Room Naming Convention)

Hệ thống hỗ trợ 2 loại phòng chat:

1. **Phòng thảo luận theo chủ đề / Nhóm (Group Room):**  
   Định dạng: `room:<topic_name>` (ví dụ: `room:general`, `room:nestjs`).
2. **Cuộc trò chuyện trực tiếp 1-1 (Direct Message):**  
   Để đảm bảo dù Alice nhắn cho Bob hay Bob nhắn cho Alice thì cả hai đều tham gia chung một phòng, chúng ta sắp xếp `userId` tăng dần kết hợp với tiền tố `CHAT_ROOM.CONVERSATION_PREFIX`:  
   Định dạng: `conversation:${Math.min(user1, user2)}_${Math.max(user1, user2)}`  
   _(Ví dụ: User #1 và User #5 luôn trò chuyện trong room `conversation:1_5`)_.

---

### 3.3 Chuẩn Hóa Cấu Trúc Dữ Liệu Bằng Interfaces (Contracts)

> [!NOTE]
> **Tại sao dùng Interface thay vì Class DTO trong WebSockets?**  
> Trong WebSocket với Socket.IO, các payload gửi nhận là các plain JavaScript objects trao đổi trực tiếp qua sự kiện socket. Khác với HTTP request đi qua body parser và global HTTP `ValidationPipe`, `@SubscribeMessage` không tự động transform thành instance của class DTO.  
> Việc tạo các class DTO cồng kềnh với `class-validator` / `class-transformer` vừa tốn chi phí runtime không cần thiết, vừa tạo cảm giác phụ thuộc giả tạo. Do đó, việc định nghĩa **TypeScript Interfaces** trong file riêng biệt là giải pháp chuẩn mực, nhẹ và mang lại Type Safety cao nhất.

Tạo file interfaces cho chat:

📄 **`src/chat/interfaces/chat.interface.ts`**

```typescript
/**
 * Payload khi client yêu cầu tham gia hoặc rời phòng
 */
export interface JoinRoomPayload {
  roomId: string;
}

/**
 * Payload khi client gửi tin nhắn vào phòng hoặc chat trực tiếp 1-1
 */
export interface SendMessagePayload {
  content: string;
  roomId?: string;
  receiverId?: number;
}

/**
 * Payload khi client yêu cầu lấy lịch sử trò chuyện trực tiếp 1-1
 */
export interface GetHistoryPayload {
  receiverId: number;
  limit?: number;
}

/**
 * Cấu trúc tin nhắn phát tán (Broadcast) đồng bộ tới các client trong phòng
 */
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

/**
 * Payload sự kiện khi người dùng tham gia hoặc rời khỏi phòng
 */
export interface UserRoomEventPayload {
  userId: number;
  email: string;
  timestamp: string;
}

/**
 * Kết quả sau khi ChatService xử lý tin nhắn
 */
export interface ProcessedMessageResult {
  targetRoom: string;
  broadcastPayload: ChatBroadcastPayload;
}

// Type aliases hỗ trợ tính tương thích và quy ước gọi tên payload
export type JoinRoomDto = JoinRoomPayload;
export type SendMessageDto = SendMessagePayload;
export type GetHistoryDto = GetHistoryPayload;
```

---

### 3.4 Tách Biệt Data Mapper Sang File Riêng

> [!TIP]
> **Tại sao nên tách riêng Mapper khỏi Service?**
>
> - **Nguyên tắc Đơn trách nhiệm (SRP):** `ChatService` chỉ tập trung vào nghiệp vụ lưu CSDL (Prisma ORM) và điều phối luồng. Nó không nên gánh thêm trách nhiệm chuyển đổi hay định dạng JSON payload cho client.
> - **Dễ dàng Unit Test:** Các hàm trong Mapper là **Pure Functions** (hàm thuần túy: nhận input và trả về output), không phụ thuộc vào Database hay Network nên có thể test độc lập 100% cực kỳ dễ dàng.
> - **Tái sử dụng linh hoạt:** Cả `ChatGateway` và `ChatService` đều có thể gọi trực tiếp mapper mà không gây phụ thuộc vòng (circular dependency).

Tạo file mapper riêng cho chat:

📄 **`src/chat/mappers/chat.mapper.ts`**

```typescript
import type { UserData } from '@/auth/interfaces/jwt.interface';
import type {
  ChatBroadcastPayload,
  SendMessagePayload,
  UserRoomEventPayload,
} from '../interfaces/chat.interface';

export class ChatMapper {
  /**
   * Chuyển đổi dữ liệu User sang payload sự kiện thành viên vào/rời phòng
   */
  static toUserRoomEvent(user: UserData): UserRoomEventPayload {
    return {
      userId: user.userId,
      email: user.email,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Đóng gói payload broadcast tin nhắn chuẩn hóa cho client
   */
  static toBroadcastPayload(params: {
    sender: UserData;
    payload: SendMessagePayload;
    senderUser?: {
      name?: string | null;
      profile?: { avatarUrl?: string | null } | null;
    } | null;
    savedMessage?: {
      id: number;
      createdAt: Date;
    } | null;
  }): ChatBroadcastPayload {
    const { sender, payload, senderUser, savedMessage } = params;
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
```

---

## 4. Xây Dựng `ChatService` Kết Nối Prisma ORM & Đóng Gói Nghiệp Vụ (How - Step 2)

> [!IMPORTANT]
> **Nguyên tắc Kiến Trúc: Tách Biệt Service và Mapper!**  
> `ChatService` tập trung duy nhất vào nghiệp vụ cơ sở dữ liệu (Prisma ORM) và điều phối luồng xử lý. Toàn bộ cấu trúc kiểu dữ liệu được import từ `interfaces/chat.interface.ts`, và việc format payload được ủy quyền hoàn toàn cho `ChatMapper`.

Tạo và hoàn thiện `ChatService`:

📄 **`src/chat/chat.service.ts`**

```typescript
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { UserData } from '@/auth/interfaces/jwt.interface';
import { CHAT_ROOM } from './constants/chat.constant';
import type {
  ProcessedMessageResult,
  SendMessagePayload,
} from './interfaces/chat.interface';
import { ChatMapper } from './mappers/chat.mapper';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sinh mã phòng chuẩn hóa cho cuộc trò chuyện trực tiếp 1-1
   */
  getConversationRoomId(user1Id: number, user2Id: number): string {
    const sortedIds = [user1Id, user2Id].sort((a, b) => a - b);
    return `${CHAT_ROOM.CONVERSATION_PREFIX}${sortedIds[0]}_${sortedIds[1]}`;
  }

  /**
   * Xử lý toàn bộ logic gửi tin nhắn (Direct chat 1-1 lưu DB hoặc Room chat)
   */
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

    // 3. Lấy thông tin hồ sơ của người gửi để đính kèm Avatar và Tên hiển thị (Dùng ?? để short-circuit không query thừa khi chat 1-1)
    const senderUser =
      savedMessage?.sender ??
      (await this.prisma.user.findUnique({
        where: { id: sender.userId },
        select: {
          id: true,
          name: true,
          email: true,
          profile: { select: { avatarUrl: true } },
        },
      }));

    // 4. Sử dụng ChatMapper để đóng gói payload broadcast (Tách biệt hoàn toàn khỏi Service)
    const broadcastPayload = ChatMapper.toBroadcastPayload({
      sender,
      payload,
      senderUser,
      savedMessage,
    });

    return {
      targetRoom,
      broadcastPayload,
    };
  }

  /**
   * Lưu trữ tin nhắn trực tiếp vào PostgreSQL thông qua Prisma ORM
   */
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

  /**
   * Lấy lịch sử tin nhắn gần nhất giữa 2 người dùng
   */
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
```

---

## 5. Cập Nhật `ChatGateway` — Tầng Truyền Dẫn Mạng Tinh Gọn (How - Step 3)

Nhờ chuyển toàn bộ business logic sang `ChatService` và sử dụng hằng số `CHAT_EVENTS`, file Gateway giờ đây cực kỳ gọn gàng, trong sáng và chỉ đóng vai trò **Bộ điều hướng mạng (Network Dispatcher)**:

📄 **`src/chat/chat.gateway.ts`**

```typescript
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
import type { UserData } from '@/auth/interfaces/jwt.interface';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { CHAT_EVENTS } from './constants/chat.constant';
import { ChatService } from './chat.service';
import { ChatMapper } from './mappers/chat.mapper';
import type {
  GetHistoryPayload,
  JoinRoomPayload,
  SendMessagePayload,
} from './interfaces/chat.interface';

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

  constructor(private readonly chatService: ChatService) {}

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

  @SubscribeMessage(CHAT_EVENTS.PING)
  handlePing(@ConnectedSocket() client: Socket): string {
    this.logger.debug(`Ping nhận được từ [${client.id}]`);
    return 'pong';
  }

  // =================================================================
  // 1. THAM GIA PHÒNG CHAT (JOIN ROOM)
  // =================================================================
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

    // Gửi sự kiện thông báo cho các client KHÁC trong phòng thông qua ChatMapper
    client
      .to(roomId)
      .emit(CHAT_EVENTS.USER_JOINED, ChatMapper.toUserRoomEvent(user));

    return {
      status: 'success',
      message: `Bạn đã tham gia phòng ${roomId} thành công`,
      roomId,
    };
  }

  // =================================================================
  // 2. RỜI PHÒNG CHAT (LEAVE ROOM)
  // =================================================================
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

  // =================================================================
  // 3. GỬI TIN NHẮN THEO PHÒNG (SEND ROOM MESSAGE)
  // =================================================================
  @SubscribeMessage(CHAT_EVENTS.SEND_ROOM_MESSAGE)
  async handleSendRoomMessage(
    @MessageBody() payload: SendMessagePayload,
    @CurrentUser() user: UserData,
  ) {
    // Ủy quyền toàn bộ nghiệp vụ xử lý tin nhắn & lưu DB cho Service
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

  // =================================================================
  // 4. LẤY LỊCH SỬ TIN NHẮN (CONVERSATION HISTORY)
  // =================================================================
  @SubscribeMessage(CHAT_EVENTS.GET_HISTORY)
  async handleGetHistory(
    @MessageBody() payload: GetHistoryPayload,
    @CurrentUser() user: UserData,
  ) {
    const history = await this.chatService.getConversationHistory(
      user.userId,
      payload.receiverId,
      payload.limit,
    );

    return {
      status: 'success',
      data: history,
    };
  }
}
```

---

## 6. Đăng Ký `ChatService` Vào `ChatModule` (How - Step 4)

Vì `PrismaModule` đã được cấu hình `@Global()` ở Module 2, chúng ta chỉ cần khai báo `ChatService` vào mảng `providers` của `ChatModule`:

📄 **`src/chat/chat.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ChatGateway, ChatService],
  exports: [ChatGateway, ChatService],
})
export class ChatModule {}
```

---

## 7. Kiểm Thử Trực Quan: Web Client Đa Phòng (Verify)

Tạo một trang web test nhỏ để giả lập 2 người dùng trò chuyện độc lập trong phòng:

📄 **`test-chat-room.html`** _(Tạo ở thư mục gốc dự án)_

```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <title>Test NestJS WebSockets Chat Rooms</title>
    <script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
    <style>
      body {
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #0f172a;
        color: #f8fafc;
        margin: 20px;
      }
      .card {
        background: #1e293b;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        border: 1px solid #334155;
      }
      input,
      button {
        padding: 8px 12px;
        border-radius: 4px;
        border: 1px solid #475569;
        background: #0f172a;
        color: white;
        margin-right: 8px;
      }
      button {
        background: #e0234e;
        border-color: #e0234e;
        cursor: pointer;
        font-weight: bold;
      }
      button:hover {
        background: #b81c3e;
      }
      #messages {
        height: 260px;
        overflow-y: auto;
        background: #0f172a;
        padding: 12px;
        border-radius: 6px;
        border: 1px solid #334155;
        list-style: none;
      }
      #messages li {
        margin-bottom: 8px;
        padding: 6px 10px;
        border-radius: 4px;
        background: #1e293b;
      }
      .system {
        color: #38bdf8;
        font-style: italic;
      }
    </style>
  </head>
  <body>
    <h2>🚀 NestJS Socket.IO Rooms & Persistence Tester</h2>

    <div class="card">
      <label>Access Token (Bearer): </label>
      <input
        type="text"
        id="token"
        placeholder="Dán JWT Access Token vào đây"
        style="width: 50%;"
      />
      <button onclick="connectSocket()">Kết Nối Gateway</button>
      <span id="connStatus" style="color: #ef4444; font-weight: bold;"
        >Chưa kết nối</span
      >
    </div>

    <div class="card">
      <input
        type="text"
        id="roomName"
        placeholder="Tên phòng (ví dụ: room:general)"
        value="room:general"
      />
      <button onclick="joinRoom()">Tham Gia Phòng</button>
      <button onclick="leaveRoom()">Rời Phòng</button>
    </div>

    <div class="card">
      <input
        type="number"
        id="receiverId"
        placeholder="Receiver ID (để trống nếu chat phòng)"
        style="width: 140px;"
      />
      <input
        type="text"
        id="msgContent"
        placeholder="Nhập nội dung tin nhắn..."
        style="width: 40%;"
      />
      <button onclick="sendMessage()">Gửi Tin Nhắn</button>
      <button
        onclick="getHistory()"
        style="background: #2563eb; border-color: #2563eb;"
      >
        Tải Lịch Sử (1-1)
      </button>
    </div>

    <div class="card">
      <h3>Lịch Sử Tin Nhắn:</h3>
      <ul id="messages"></ul>
    </div>

    <script>
      let socket = null;

      function connectSocket() {
        const token = document.getElementById('token').value.trim();
        if (!token) return alert('Vui lòng nhập Access Token!');

        socket = io('http://localhost:3000/chat', {
          auth: { token },
        });

        socket.on('connect', () => {
          document.getElementById('connStatus').innerText =
            `Đã kết nối (Socket ID: ${socket.id})`;
          document.getElementById('connStatus').style.color = '#22c55e';
        });

        socket.on('connect_error', (err) => {
          document.getElementById('connStatus').innerText =
            `Lỗi: ${err.message}`;
          document.getElementById('connStatus').style.color = '#ef4444';
        });

        // Nhận tin nhắn trong phòng
        socket.on('new_room_message', (msg) => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>[${msg.senderEmail}]:</strong> ${msg.content} <small style="color:#64748b;">(${msg.createdAt})</small>`;
          document.getElementById('messages').appendChild(li);
        });

        // Thông báo thành viên vào phòng
        socket.on('user_joined', (data) => {
          const li = document.createElement('li');
          li.className = 'system';
          li.innerText = `👋 Thành viên ${data.email} vừa tham gia phòng.`;
          document.getElementById('messages').appendChild(li);
        });
      }

      function joinRoom() {
        const roomId = document.getElementById('roomName').value;
        socket.emit('join_room', { roomId }, (ack) => {
          alert(ack.message);
        });
      }

      function leaveRoom() {
        const roomId = document.getElementById('roomName').value;
        socket.emit('leave_room', { roomId }, (ack) => {
          alert(ack.message);
        });
      }

      function sendMessage() {
        const content = document.getElementById('msgContent').value;
        const roomId = document.getElementById('roomName').value;
        const receiverIdVal = document.getElementById('receiverId').value;
        const receiverId = receiverIdVal ? Number(receiverIdVal) : undefined;

        socket.emit(
          'send_room_message',
          { content, roomId, receiverId },
          (ack) => {
            console.log('Ack server:', ack);
            document.getElementById('msgContent').value = '';
          },
        );
      }

      function getHistory() {
        const receiverIdVal = document.getElementById('receiverId').value;
        if (!receiverIdVal)
          return alert('Vui lòng nhập Receiver ID để tải lịch sử!');
        const receiverId = Number(receiverIdVal);

        socket.emit('get_history', { receiverId, limit: 10 }, (res) => {
          console.log('Lịch sử tin nhắn:', res);
          const list = document.getElementById('messages');
          list.innerHTML = '';
          if (res?.data) {
            res.data.forEach((msg) => {
              const li = document.createElement('li');
              li.innerHTML = `<strong>[${msg.sender?.name || msg.sender?.email || msg.senderId}]:</strong> ${msg.content} <small style="color:#64748b;">(${msg.createdAt})</small>`;
              list.appendChild(li);
            });
          }
        });
      }
    </script>
  </body>
</html>
```

### 🔬 Các Bước Kiểm Thử:

1. Mở 2 cửa sổ trình duyệt (Tab 1 đăng nhập tài khoản User A, Tab 2 đăng nhập tài khoản User B).
2. Cả 2 Tab cùng nhập `room:general` và bấm **Tham Gia Phòng**.
3. Tab 1 gửi tin nhắn -> Ngay lập tức Tab 2 nhận được thông điệp mà không cần reload trang.
4. Tab 1 đổi sang phòng `room:private` và gửi tin -> Tab 2 (vẫn ở `room:general`) hoàn toàn **KHÔNG nhận được**, chứng minh tính cô lập của Room.
5. Tab 1 điền `Receiver ID: 2` (ID của User B) và gửi tin -> Mở terminal kiểm tra cơ sở dữ liệu:
   ```bash
   pnpm prisma studio
   ```
   Bảng `messages` trong PostgreSQL đã xuất hiện bản ghi mới với đầy đủ `senderId: 1`, `receiverId: 2` và `content`!
6. Bấm nút **Tải Lịch Sử (1-1)** với Receiver ID vừa gửi -> Khung chat sẽ load lại toàn bộ các tin nhắn đã lưu từ Database!

---

## 8. Những Lỗi Thường Gặp & Cách Khắc Phục (Common Mistakes & Debugging)

### ❌ Lỗi 1: Nhầm lẫn giữa `socket.to()` và `server.to()`

- **Triệu chứng:** Người gửi tin nhắn thấy bạn mình nhận được nhưng chính bản thân mình lại không thấy tin nhắn hiển thị trên khung chat.
- **Nguyên nhân:** Dùng `client.to(room).emit()`. Phương thức này phát tán tới tất cả socket trong room **ngoại trừ chính socket đang gọi**.
- **Cách sửa:** Dùng `this.server.to(room).emit()` nếu muốn cả người gửi cũng nhận được sự kiện, hoặc phía người gửi cập nhật UI tức thì bằng callback/ack.

### ❌ Lỗi 2: Quên `await` khi thao tác CSDL trong WebSocket Handler

- **Triệu chứng:** Tin nhắn bay đi rất nhanh nhưng trong CSDL không có gì, hoặc thi thoảng server log ra lỗi `UnhandledPromiseRejection`.
- **Nguyên nhân:** Khác với HTTP Controller có Exception Filter bắt lỗi request, trong WebSocket handler nếu không `await` hàm async thì lỗi ném ra từ Prisma có thể làm crash socket connection.
- **Cách sửa:** Luôn gắn `await` khi gọi `chatService.saveDirectMessage(...)`.

### ❌ Lỗi 3: Tạo Room Name không nhất quán giữa 2 người dùng

- **Triệu chứng:** Alice nhắn cho Bob thì dùng room `conversation:1_2`, nhưng Bob nhắn cho Alice lại dùng room `conversation:2_1`. Kết quả là 2 người ở 2 phòng khác nhau và không ai thấy tin nhắn của ai!
- **Cách sửa:** Luôn sắp xếp ID tăng dần thông qua hàm chuẩn hóa kết hợp hằng số:
  ```typescript
  getConversationRoomId(id1: number, id2: number) {
    const [min, max] = [id1, id2].sort((a, b) => a - b);
    return `${CHAT_ROOM.CONVERSATION_PREFIX}${min}_${max}`;
  }
  ```

### ❌ Lỗi 4: Rải rác Magic Strings, Nhồi nhét Mapper vào Service & Lạm dụng Class DTO trong WebSockets

- **Triệu chứng:**
  - Viết chuỗi sự kiện tự do `'join_room'`, `'send_room_message'`, gõ nhầm một ký tự khiến client không bao giờ nhận được phản hồi mà compiler không hề cảnh báo.
  - Gateway chứa hàng chục dòng query Prisma, validate logic người nhận, format payload dẫn đến code phình to, khó bảo trì và không thể viết unit test.
  - Lạm dụng tạo các class DTO với `@IsString`, `@IsNotEmpty`... trong khi WebSocket events không chạy qua HTTP ValidationPipe, làm tăng code thừa mà không mang lại giá trị.
  - Để hàm format JSON payload và mapping sự kiện rải rác trong `ChatService`.
- **Nguyên nhân:** Vi phạm nguyên tắc **Clean Architecture** và **Single Responsibility Principle (SRP)**.
- **Cách sửa:**
  - Quy tụ toàn bộ chuỗi sự kiện vào file hằng số `src/chat/constants/chat.constant.ts`.
  - Định nghĩa Data Contracts rõ ràng bằng **TypeScript Interfaces** trong `src/chat/interfaces/chat.interface.ts`.
  - Tách biệt logic chuyển đổi dữ liệu sang **`ChatMapper`** (`src/chat/mappers/chat.mapper.ts`).
  - Gateway chỉ đóng vai trò bộ chuyển tiếp mạng (Thin Gateway); toàn bộ nghiệp vụ kiểm tra và lưu trữ CSDL được cô lập trong `ChatService`.

---

## 9. 🧩 Hands-on Lab & Thử Thách Mở Rộng (Hands-on Challenge)

### 🟢 Level 1: Follow Along

Thực hiện tạo `CHAT_EVENTS`, `chat.interface.ts`, `ChatMapper`, `ChatService`, tích hợp `PrismaService`, cấu hình event `join_room` và `send_room_message` trong `ChatGateway` theo hướng dẫn trên. Kiểm tra bằng `test-chat-room.html`.

### 🟡 Level 2: Debugging Challenge

Giả sử bạn muốn khi một client ngắt kết nối (`handleDisconnect`), server tự động thông báo cho tất cả các phòng mà client đó đang tham gia.  
_Gợi ý:_ Khảo sát `client.rooms` trong sự kiện `disconnecting` của Socket.io trước khi kết nối bị hủy hoàn toàn.

### 🔴 Level 3: Advanced Challenge

Xây dựng tính năng **Typing Indicator** (Thông báo người dùng đang soạn tin nhắn):

1. Bổ sung `TYPING: 'typing'` và `STOP_TYPING: 'stop_typing'` vào `CHAT_EVENTS`.
2. Lắng nghe sự kiện `@SubscribeMessage(CHAT_EVENTS.TYPING)`.
3. Dùng `client.to(roomId).emit(CHAT_EVENTS.USER_TYPING, { userId: user.userId })` để báo cho đối phương.
4. Khi người dùng dừng gõ, lắng nghe `@SubscribeMessage(CHAT_EVENTS.STOP_TYPING)` và thông báo `USER_STOP_TYPING`.

---

## 10. Tổng Kết

### 🎯 Điểm Cốt Lõi Cần Nhớ

- **Socket.IO Room** là cơ chế nhóm socket logic trên bộ nhớ RAM, là chìa khóa để triển khai chat nhóm và chat 1-1 mà không gây lãng phí tài nguyên mạng.
- **Clean Architecture & Thin Gateway:** Gateway chỉ đóng vai trò tầng truyền dẫn (Transport Dispatcher), toàn bộ nghiệp vụ lưu trữ CSDL thuộc về `ChatService`, logic chuyển đổi dữ liệu thuộc về `ChatMapper`, và hợp đồng dữ liệu được quy định bởi `chat.interface.ts`.
- **Eliminate Magic Strings:** Tuyệt đối không hardcode chuỗi sự kiện; luôn sử dụng hằng số tập trung `CHAT_EVENTS` và `CHAT_ROOM` để đảm bảo an toàn kiểu và khả năng refactor.
- Sử dụng `this.server.to(room).emit()` để gửi cho mọi người trong phòng; dùng `client.to(room).emit()` để loại trừ người gửi.
- Kết hợp Socket.io và Prisma ORM biến ứng dụng từ giao tiếp tạm thời (ephemeral) thành một hệ sinh thái mạng xã hội hoàn chỉnh có lưu trữ lịch sử tin nhắn.

### ✅ Checklist Hoàn Thành Bài Học

- [x] Hiểu bản chất Socket.IO Room và cấu trúc dữ liệu lưu trữ phía server.
- [x] Loại bỏ Magic Strings bằng file hằng số `chat.constant.ts`.
- [x] Chuẩn hóa hợp đồng dữ liệu (Data Contracts) bằng TypeScript Interfaces trong file riêng biệt `chat.interface.ts`.
- [x] Tách biệt logic chuyển đổi dữ liệu sang `ChatMapper` (`chat.mapper.ts`).
- [x] Đóng gói toàn bộ nghiệp vụ tin nhắn và lưu CSDL vào `ChatService.processRoomMessage()`.
- [x] Xây dựng `ChatGateway` tinh gọn theo chuẩn SRP kết hợp `CHAT_EVENTS`.
- [x] Kiểm thử gửi nhận tin nhắn đa phòng và kiểm tra dữ liệu trong bảng `messages`.

---

👉 **Bài tiếp theo:** Lesson 6.4: WebSockets + Event-Driven — Đẩy Thông Báo Thời Gian Thực Khi Có Bình Luận Mới
