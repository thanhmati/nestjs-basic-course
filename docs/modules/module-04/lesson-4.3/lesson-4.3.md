# Lesson 4.3: Guards — Bảo Vệ REST API Bằng JwtAuthGuard & Passport Strategy Trong NestJS

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-Guards-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS Guards" />
  <img src="https://img.shields.io/badge/Passport-JWT_Strategy-3178C6?style=for-the-badge&logo=passport&logoColor=white" alt="Passport Strategy" />
  <img src="https://img.shields.io/badge/Authorization-Bearer_Token-10B981?style=for-the-badge&logo=opsgenie&logoColor=white" alt="Bearer Token" />
  <img src="https://img.shields.io/badge/Security-API_Protection-F59E0B?style=for-the-badge&logo=security&logoColor=white" alt="API Security" />
  <img src="https://img.shields.io/badge/pnpm-Package_Manager-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
</p>

<p align="center">
  <img src="./assets/lesson_overview_banner.svg" alt="Lesson Overview Banner" width="100%" />
</p>

---

> [!NOTE]
> ⏱️ **Thời lượng dự kiến:** 12 – 15 phút  
> 🎯 **Mục tiêu bài học:** Nắm vững khái niệm và vai trò của Guard (Bộ vệ sĩ bảo mật) trong Request Pipeline của NestJS; giải mã sự kết hợp mạnh mẽ giữa `@nestjs/passport` và `passport-jwt`; tự tay triển khai `JwtStrategy` trích xuất và xác thực Token từ Header `Authorization: Bearer <token>`; xây dựng `JwtAuthGuard` để bảo vệ các Endpoint riêng tư; thực hành kịch bản kiểm thử chặn đứng truy cập không hợp lệ (`401 Unauthorized`) và trích xuất thông tin `req.user`.

---

## 1. Guard Trong NestJS Là Gì? Vị Trí Trong Request Pipeline

### 💡 Ẩn Dụ Thực Tế: Vệ Sĩ Kiểm Tra Vé VIP Tại Cửa Phòng Riêng

Hãy tưởng tượng hệ thống API của bạn như một **Câu Lạc Bộ Cao Cấp**:

- **Sảnh ngoài (Public Endpoints):** Bất kỳ ai cũng có thể vào xem danh sách sản phẩm hay trang tin tức (API `@Public()`).
- **Phòng VIP (Protected Endpoints):** Khi khách hàng muốn xem trang Thông tin cá nhân (`/users/profile`) hay Đổi mật khẩu (`/auth/change-password`), họ phải bước qua **Vệ Sĩ Cửa Phòng (JwtAuthGuard)**.
- Vệ sĩ sẽ kiểm tra xem khách hàng có đeo **Vòng tay VIP hợp lệ (Bearer Token)** hay không:
  - Nếu vòng tay hợp lệ và chưa hết hạn ➔ Vệ sĩ mở cửa và gắn thông tin khách hàng vào danh sách phục vụ (`req.user`).
  - Nếu không có vòng tay hoặc vòng tay giả mạo ➔ Vệ sĩ từ chối cho vào ngay lập tức (`401 Unauthorized`).

```mermaid
flowchart LR
    subgraph Pipeline ["🚀 NestJS Request Pipeline"]
        direction LR
        Client["📱 Client Request<br/><i>Header: Bearer JWT</i>"] --> Middleware["⚙️ Middleware"]
        Middleware --> Guard{"🛡️ JwtAuthGuard<br/><i>(CanActivate Check)</i>"}
        Guard -->|"🟢 Token Hợp Lệ"| Pipe["⚡ Pipes / DTO"]
        Guard -->|"🔴 Không có / Sai Token"| Reject["🔴 401 Unauthorized"]
        Pipe --> Controller["📄 Controller Handler"]
    end
```

---

### 🔹 So Sánh Guard vs Middleware Về Mặt Phân Quyền

| Tiêu chí               | Middleware                                       | Guard (NestJS)                                                             |
| :--------------------- | :----------------------------------------------- | :------------------------------------------------------------------------- |
| **Vị trí chạy**        | Đầu tiên (Chưa biết Route Handler nào sắp xử lý) | Sau Middleware, **ngay trước khi vào Controller Handler**                  |
| **Đối tượng ngữ cảnh** | Chỉ truy cập được `req`, `res`, `next()`         | Truy cập `ExecutionContext` (biết rõ Class & Handler sắp gọi)              |
| **Ứng dụng tối ưu**    | Logging, CORS, Compression, Body Parser          | **Xác thực (Authentication) & Phân quyền (Role/Permission Authorization)** |

---

## 2. Kiến Trúc & Vòng Đời Bảo Vệ API Của JwtAuthGuard & JwtStrategy

Sự kết hợp giữa `@nestjs/passport`, `passport-jwt` và NestJS Guard tạo nên một hệ thống bảo vệ 2 lớp vô cùng chặt chẽ:

```mermaid
sequenceDiagram
    autonumber
    actor Client as 📱 HTTP Client
    participant Guard as 🛡️ JwtAuthGuard (AuthGuard)
    participant Strategy as 🔑 JwtStrategy (Passport)
    participant Controller as 📄 Controller Handler

    Client->>Guard: GET /api/v1/users/profile (Header: Authorization Bearer <token>)
    Guard->>Strategy: Chuyển Request tới Passport JwtStrategy

    Note over Strategy: 1. ExtractJwt.fromAuthHeaderAsBearerToken()<br/>2. Decode & Verify signature với JWT_SECRET<br/>3. Kiểm tra hạn dùng (exp)

    alt Token SAI / HẾT HẠN / THIẾU HEADER
        Strategy-->>Guard: Trả về lỗi Validation / Unauthorized
        Guard-->>Client: 🔴 401 Unauthorized ("Unauthorized")
    else Token HỢP LỆ & CÒN HẠN
        Strategy->>Strategy: Gọi validate(payload)
        Strategy-->>Guard: Trả về đối tượng user payload
        Note over Guard: Gắn kết quả vào req.user = user
        Guard->>Controller: 🟢 Cho phép Request đi tiếp vào Handler
        Controller-->>Client: 200 OK (Trả về dữ liệu Profile)
    end
```

---

## 3. Hướng Dẫn Thực Hành Step-by-Step — Viết & Đăng Ký Guard

### 📌 Bước 1: Triển Khai `JwtStrategy` Triết Xuất & Verify Token

Tạo thư mục `src/auth/strategies/` và tạo tệp `jwt.strategy.ts` kế thừa `PassportStrategy`:

📄 **`src/auth/strategies/jwt.strategy.ts`**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      // 1. Trích xuất Bearer Token từ Header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. Không bỏ qua kiểm tra hạn dùng (Tự động quăng lỗi nếu token hết hạn)
      ignoreExpiration: false,
      // 3. Cung cấp Secret Key để Passport verify chữ ký Signature
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback_secret',
    });
  }

  /**
   * Phương thức validate() tự động được gọi sau khi Passport đã verify chữ ký Token thành công
   * @param payload Dữ liệu đã giải mã từ JWT Payload ({ sub, email })
   * @returns Đối tượng sẽ được Passport gán tự động vào req.user
   */
  async validate(payload: JwtPayload) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Token payload không hợp lệ!');
    }

    // Giá trị trả về ở đây sẽ xuất hiện tại req.user trong các Controller Handler
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
```

> [!IMPORTANT]
> **Cơ chế tự động của Passport:**
> Khi `validate(payload)` trả về dữ liệu thành công (ví dụ `{ userId, email }`), Passport sẽ tự động gán dữ liệu này vào thuộc tính `req.user` của Request HTTP. Nhờ đó, bạn có thể dễ dàng truy cập thông tin người dùng đang đăng nhập ở bất kỳ Controller nào!

---

### 📌 Bước 2: Triển Khai `JwtAuthGuard` Class

Tạo thư mục `src/auth/guards/` và tạo tệp `jwt-auth.guard.ts` kế thừa `AuthGuard('jwt')`:

📄 **`src/auth/guards/jwt-auth.guard.ts`**

```typescript
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Có thể override handleRequest để tùy chỉnh thông báo lỗi 401 tiếng Việt
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          'Bạn cần đăng nhập (gửi kèm Bearer Token) để truy cập tài nguyên này!',
        )
      );
    }
    return user;
  }
}
```

---

### 📌 Bước 3: Đăng Ký `JwtStrategy` Trong `AuthModule`

Mở tệp `src/auth/auth.module.ts` và bổ sung `JwtStrategy` cùng `PassportModule` vào khai báo:

📄 **`src/auth/auth.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // 👈 Đăng ký JwtStrategy làm provider
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
```

---

### 📌 Bước 4: Bảo Vệ API Endpoints Bằng `@UseGuards(JwtAuthGuard)`

Mở tệp `src/users/users.controller.ts` và sử dụng decorator `@UseGuards(JwtAuthGuard)` để bảo vệ Endpoint lấy thông tin Profile:

📄 **`src/users/users.controller.ts`**

```typescript
import { Controller, Get, Request, UseGuards, Version } from '@nestjs/common';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  // 🛡️ Bảo vệ Endpoint này: Yêu cầu phải gửi kèm Bearer JWT Token hợp lệ
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ResponseMessage('Lấy thông tin cá nhân thành công!')
  getProfile(@Request() req: any) {
    // req.user được JwtStrategy.validate() gán tự động vào
    return {
      message: 'Thông tin tài khoản xác thực từ Token',
      user: req.user, // Trả về { userId: "...", email: "..." }
    };
  }
}
```

---

## 4. Kịch Bản Kiểm Tra & Thử Nghiệm (Hands-on Lab)

### 🟢 Kịch Bản 1: Thành Công — Truy Cập API Được Bảo Vệ Kèm Bearer Token Hợp Lệ

1. **Thực hiện Đăng nhập để lấy Access Token hợp lệ:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alex@example.com", "password": "Password123!"}'
```

_Giả sử bạn nhận được Token:_ `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHg4OTA...`

2. **Gọi API `/api/v1/users/profile` kèm Header Authorization:**

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHg4OTA..."
```

📥 **Phản hồi HTTP nhận được từ Server (`200 OK`):**

```json
{
  "statusCode": 200,
  "message": "Lấy thông tin cá nhân thành công!",
  "data": {
    "message": "Thông tin tài khoản xác thực từ Token",
    "user": {
      "userId": "clx890xyz123",
      "email": "alex@example.com"
    }
  },
  "timestamp": "2026-08-13T16:30:00.000Z",
  "path": "/api/v1/users/profile"
}
```

✅ **Kết quả:** `JwtAuthGuard` xác thực token thành công, trích xuất `req.user` và cho phép Handler trả về thông tin cá nhân.

---

### 🔴 Kịch Bản 2: Kiểm Thử Lỗi (Blocked Flow) — Không Gửi Token Hoặc Token Giả Mạo

#### Test 1: Gọi API nhưng KHÔNG gửi Header Authorization:

```bash
curl -X GET http://localhost:3000/api/v1/users/profile
```

📥 **Phản hồi HTTP nhận được (`401 Unauthorized`):**

```json
{
  "statusCode": 401,
  "message": "Bạn cần đăng nhập (gửi kèm Bearer Token) để truy cập tài nguyên này!",
  "error": "Unauthorized",
  "timestamp": "2026-08-13T16:30:05.000Z",
  "path": "/api/v1/users/profile"
}
```

#### Test 2: Gửi Token bị sửa đổi chữ ký (Fake / Tampered Token):

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni...FAKE_SIGNATURE"
```

📥 **Phản hồi HTTP nhận được (`401 Unauthorized`):**

```json
{
  "statusCode": 401,
  "message": "Bạn cần đăng nhập (gửi kèm Bearer Token) để truy cập tài nguyên này!",
  "error": "Unauthorized",
  "timestamp": "2026-08-13T16:30:10.000Z",
  "path": "/api/v1/users/profile"
}
```

✅ **Kết quả:** `JwtAuthGuard` phát hiện chữ ký giả mạo và chặn đứng yêu cầu ngay lập tức ở cửa ngõ API!

---

## 5. Tổng Kết Bài Học & Checklist Ghi Nhớ

```mermaid
mindmap
  root(("NestJS JwtAuthGuard"))
    "Vị trí Guard"
      "Chạy trước Controller Handler"
      "Sau Middleware"
      "Truy cập ExecutionContext"
    "Cơ chế JwtStrategy"
      "Extends PassportStrategy(Strategy, 'jwt')"
      "ExtractJwt.fromAuthHeaderAsBearerToken()"
      "Verify chữ ký bằng JWT_SECRET"
      "Gán dữ liệu vào req.user"
    "Áp dụng Bảo vệ"
      "@UseGuards(JwtAuthGuard)"
      "Cấp Controller hoặc cấp Route"
      "Trả về 401 nếu token không hợp lệ"
```

### ✅ Checklist Ghi Nhớ Bài Học:

- [x] Hiểu vị trí và vai trò của Guard trong Request Pipeline (xác thực & phân quyền).
- [x] Triển khai thành công `JwtStrategy` kế thừa `PassportStrategy` từ `passport-jwt`.
- [x] Cấu hình trích xuất Token từ Header `Authorization: Bearer <token>`.
- [x] Nắm vững cơ chế `validate(payload)` tự động gán dữ liệu người dùng vào `req.user`.
- [x] Xây dựng `JwtAuthGuard` kế thừa `AuthGuard('jwt')`.
- [x] Sử dụng `@UseGuards(JwtAuthGuard)` để bảo vệ thành công các Route Handler riêng tư.
- [x] Chạy kịch bản cURL kiểm thử truy cập thành công (200 OK) và truy cập bị chặn (401 Unauthorized).

---

👉 **Bài tiếp theo:** [Lesson 4.4: Custom Decorators — Tạo @CurrentUser() & @Public() Decorators](../lesson-4.4/lesson-4.4.md)
