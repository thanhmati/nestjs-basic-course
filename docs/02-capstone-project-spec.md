# Capstone Project Architecture: Real-Time Social Chat App

> **Tài liệu kỹ thuật thiết kế CSDL & Bản đồ API cho đồ án tốt nghiệp**

---

## 1. Mô Hình Sơ Đồ Thực Thể Quan Hệ (ERD Diagram)

```mermaid
erDiagram
    USER ||--o{ POST : "creates"
    USER ||--o{ COMMENT : "writes"
    USER ||--o{ MESSAGE : "sends"
    USER ||--o{ NOTIFICATION : "receives"
    POST ||--o{ COMMENT : "contains"

    USER {
        string id PK
        string email UK
        string password
        string name
        string avatarUrl
        datetime createdAt
    }

    POST {
        string id PK
        string content
        string imageUrl
        string authorId FK
        datetime createdAt
    }

    COMMENT {
        string id PK
        string content
        string postId FK
        string authorId FK
        datetime createdAt
    }

    MESSAGE {
        string id PK
        string content
        string senderId FK
        string roomId
        datetime createdAt
    }

    NOTIFICATION {
        string id PK
        string type
        string message
        string userId FK
        boolean isRead
        datetime createdAt
    }
```

---

## 2. Luồng Real-Time Chat & Notification (Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    actor UserA as User A (Sender)
    participant WS as WebSocket Gateway
    participant Event as Event Emitter
    participant DB as PostgreSQL (Prisma)
    actor UserB as User B (Receiver)

    UserA->>WS: Send Message Event (roomId, content)
    WS->>DB: Save Message to Database
    DB-->>WS: Message Saved (id, timestamp)
    WS-->>UserA: Emit 'messageSent' Success
    WS-->>UserB: Broadcast 'newMessage' to Room

    Note over UserA, DB: Khi User A Comment vào bài viết của User B
    UserA->>Event: Trigger Event 'comment.created'
    Event->>DB: Save Notification
    Event->>WS: Push Real-time Notification
    WS-->>UserB: Emit 'newNotification' Event
```

---

## 3. Bản Đồ REST API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/register` | Đăng ký tài khoản người dùng mới | No |
| `POST` | `/api/v1/auth/login` | Đăng nhập & Lấy Access Token | No |
| `GET` | `/api/v1/posts` | Lấy danh sách bài viết (Phân trang + Caching) | Optional |
| `POST` | `/api/v1/posts` | Tạo bài viết mới kèm upload hình ảnh | Bearer Token |
| `POST` | `/api/v1/posts/:id/comments` | Thêm bình luận (Bắn Event Notification) | Bearer Token |
| `GET` | `/api/v1/health` | Terminus Healthcheck (Soi DB & RAM) | No |
| `WS` | `ws://localhost:3000/socket.io` | WebSocket Gateway Chat & Real-time Alerts | Handshake Token |
