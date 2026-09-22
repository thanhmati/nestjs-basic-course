# Lesson 4.4: Passport.js & JwtStrategy — Chuẩn Hóa Xác Thực API Chuyên Nghiệp Trong NestJS

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-Passport-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS Passport" />
  <img src="https://img.shields.io/badge/Passport-JWT_Strategy-3178C6?style=for-the-badge&logo=passport&logoColor=white" alt="Passport Strategy" />
  <img src="https://img.shields.io/badge/Pattern-Strategy_Pattern-10B981?style=for-the-badge&logo=designpatterns&logoColor=white" alt="Strategy Pattern" />
  <img src="https://img.shields.io/badge/Security-JwtAuthGuard-F59E0B?style=for-the-badge&logo=security&logoColor=white" alt="JwtAuthGuard" />
  <img src="https://img.shields.io/badge/pnpm-Package_Manager-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
</p>

<p align="center">
  <img src="./assets/lesson_overview_banner.svg" alt="Lesson Overview Banner" width="100%" />
</p>

---

> [!NOTE]
> ⏱️ **Thời lượng dự kiến:** 12 – 15 phút  
> 🎯 **Mục tiêu bài học:** Nắm vững tư duy thiết kế **Strategy Pattern** trong bài toán xác thực (Authentication); giải mã sự kết hợp giữa thư viện tiêu chuẩn công nghiệp Passport.js và NestJS thông qua gói `@nestjs/passport` và `passport-jwt`; tự tay triển khai `JwtStrategy` trích xuất và xác thực Token từ Header `Authorization: Bearer <token>`; thấu hiểu cơ chế tự động gán dữ liệu từ `validate(payload)` vào `req.user`; xây dựng `JwtAuthGuard` kế thừa `AuthGuard('jwt')` với khả năng tùy biến thông báo lỗi tiếng Việt thân thiện qua `handleRequest()`; thực hành kịch bản kiểm thử chặn đứng truy cập hết hạn (`TokenExpiredError`) và sai chữ ký (`JsonWebTokenError`).

---

## 1. Tại Sao Lại Là Passport.js? Bản Chất Của Strategy Pattern

Trong **Lesson 4.3**, chúng ta đã tự tay viết `NativeAuthGuard` sử dụng `JwtService.verifyAsync()`. Mặc dù Guard đó hoạt động rất tốt, nhưng nó bộc lộ hạn chế lớn khi ứng dụng mở rộng:

- Nếu ứng dụng cần hỗ trợ thêm đăng nhập bằng **Username/Password (Local)**, **Google OAuth2**, **Facebook**, **GitHub**, **Apple ID**, hoặc **API Key**?
- Nếu chúng ta viết toàn bộ logic giải mã và kiểm tra tài khoản vào trong một hoặc nhiều Guard thủ công, mã nguồn sẽ nhanh chóng trở thành một "mớ bòng bong", vi phạm nghiêm trọng nguyên lý Single Responsibility (Đơn trách nhiệm).

### 💡 Giải Pháp: Strategy Pattern (Mô Thức Chiến Lược)

**Passport.js** là thư viện xác thực nổi tiếng nhất trong hệ sinh thái Node.js. Nó giải quyết bài toán trên bằng cách chia nhỏ hệ thống thành 2 phần độc lập:

1. **Guard (Người gác cửa):** Chỉ quan tâm: _"Request này cần dùng chiến lược nào để kiểm tra? Nếu hợp lệ thì cho qua, nếu sai thì chặn lại"_.
2. **Strategy (Chiến lược kiểm tra cụ thể):** Mỗi hình thức đăng nhập là một Strategy độc lập:
   - `LocalStrategy`: Kiểm tra email/mật khẩu trong DB.
   - `JwtStrategy`: Kiểm tra tính hợp lệ của Bearer JWT Token.
   - `GoogleStrategy`: Chuyển hướng và xác thực qua Google OAuth.

```mermaid
flowchart TD
    subgraph ClientLayer ["📱 Incoming Request"]
        Req["HTTP Request"]
    end

    subgraph GuardLayer ["🛡️ NestJS Guard Layer"]
        Guard["JwtAuthGuard<br/><i>extends AuthGuard('jwt')</i>"]
    end

    subgraph PassportLayer ["🔑 Passport Strategy Registry"]
        direction LR
        Local["LocalStrategy<br/><i>(User/Password)</i>"]
        JWT["JwtStrategy<br/><i>(Bearer Token)</i>"]
        Google["GoogleStrategy<br/><i>(OAuth2)</i>"]
    end

    Req --> Guard
    Guard -->|"Ủy quyền xác thực cho"| JWT
    JWT -->|"validate() thành công"| Injected["Tự động gắn vào req.user"]
    Injected --> Controller["📄 Controller Handler"]
```

NestJS đóng gói sẵn Passport thông qua package chính chủ **`@nestjs/passport`**, giúp việc triển khai Strategy trở nên gọn gàng, Type-Safe và đồng bộ với hệ thống Dependency Injection của NestJS.

---

## 2. Cài Đặt Hệ Sinh Thái & Vòng Đời Xác Thực

### 📌 Cài Đặt Thư Viện Cần Thiết

Chạy lệnh cài đặt các gói thư viện xác thực vào dự án:

```bash
pnpm add @nestjs/passport passport passport-jwt
pnpm add -D @types/passport-jwt
```

---

### 🔹 Sơ Đồ Tuần Tự (Sequence Diagram) Vòng Đời JwtAuthGuard & JwtStrategy

Cơ chế phối hợp giữa `@nestjs/passport`, `passport-jwt` và NestJS Guard tạo nên một chu trình bảo vệ khép kín:

```mermaid
sequenceDiagram
    autonumber
    actor Client as 📱 HTTP Client
    participant Guard as 🛡️ JwtAuthGuard (AuthGuard)
    participant Strategy as 🔑 JwtStrategy (Passport)
    participant Controller as 📄 Controller Handler

    Client->>Guard: GET /api/v1/users/profile (Header: Authorization Bearer Token)
    Guard->>Strategy: Chuyển Request tới Passport JwtStrategy

    Note over Strategy: 1. ExtractJwt.fromAuthHeaderAsBearerToken()<br/>2. Decode & Verify signature với JWT_SECRET<br/>3. Kiểm tra thời hạn hiệu lực (exp)

    alt Token SAI / HẾT HẠN / THIẾU HEADER
        Strategy-->>Guard: Trả về lỗi / Unauthorized
        Guard->>Guard: handleRequest(err, user, info)
        Guard-->>Client: 🔴 401 Unauthorized ("Token đã hết hạn!" / "Token không hợp lệ!")
    else Token HỢP LỆ & CÒN HẠN
        Strategy->>Strategy: Gọi validate(payload)
        Strategy-->>Guard: Trả về user object payload
        Note over Guard: Tự động gán kết quả: req.user = user
        Guard->>Controller: 🟢 Cho phép Request đi tiếp vào Handler
        Controller-->>Client: 200 OK (Dữ liệu Profile từ req.user)
    end
```

---

## 3. Hướng Dẫn Thực Hành Step-by-Step — Triển Khai Chuẩn Hóa

---

### 📌 Bước 1: Triển Khai `JwtStrategy` Kế Thừa `PassportStrategy`

Tạo thư mục `src/auth/strategies/` và khởi tạo tệp `jwt.strategy.ts`:

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
      // 2. Không bỏ qua kiểm tra hạn dùng (Tự động ném lỗi nếu token hết hạn)
      ignoreExpiration: false,
      // 3. Cung cấp Secret Key để Passport verify chữ ký Signature
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback_secret',
    });
  }

  /**
   * Phương thức validate() tự động được Passport gọi SAU KHI đã verify chữ ký Token thành công
   * @param payload Dữ liệu đã giải mã từ JWT Payload ({ sub, email })
   * @returns Đối tượng sẽ được Passport gán tự động vào req.user
   */
  async validate(payload: JwtPayload) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Payload của Token không hợp lệ!');
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
> **Cơ chế tự động của Passport (The "Magic" of `validate()`):**
> Khi `validate(payload)` hoàn thành và trả về một đối tượng (ví dụ `{ userId, email }`), Passport sẽ tự động gán đối tượng này vào thuộc tính `req.user` của HTTP Request. Nhờ đó, bạn có thể dễ dàng truy cập thông tin người dùng đang đăng nhập ở bất kỳ Controller nào mà không cần phải gọi lại Database!

---

### 📌 Bước 2: Triển Khai `JwtAuthGuard` Tùy Biến `handleRequest`

Tạo tệp `jwt-auth.guard.ts` trong `src/auth/guards/`:

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
  canActivate(context: ExecutionContext) {
    // Có thể bổ sung logic tùy biến trước khi Passport xử lý
    return super.canActivate(context);
  }

  /**
   * Tùy biến phản hồi lỗi thân thiện bằng tiếng Việt khi xác thực thất bại
   */
  handleRequest<TUser = any>(
    err: unknown,
    user: TUser | false | null | undefined,
    info: unknown,
  ): TUser {
    if (err || !user) {
      // 1. Bắt lỗi Token đã hết hạn
      if (info instanceof Error && info.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!',
        );
      }

      // 2. Bắt lỗi Token sai chữ ký hoặc bị sửa đổi trái phép
      if (info instanceof Error && info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Mã xác thực (Token) không hợp lệ!');
      }

      if (err instanceof Error) {
        throw err;
      }

      // 3. Lỗi mặc định khi thiếu Header Authorization
      throw new UnauthorizedException(
        'Bạn cần đăng nhập (gửi kèm Bearer Token) để truy cập tài nguyên này!',
      );
    }

    return user;
  }
}
```

> [!TIP]
> Bằng cách ghi đè phương thức `handleRequest()`, chúng ta phân biệt được chính xác nguyên nhân thất bại: Do token hết hạn (`TokenExpiredError`) hay do hacker sửa đổi chữ ký (`JsonWebTokenError`), từ đó cung cấp trải nghiệm phản hồi (Developer & User Experience) chuẩn mực nhất.

---

### 📌 Bước 3: Đăng Ký Trong `AuthModule`

Mở tệp `src/auth/auth.module.ts`, import `PassportModule` và đăng ký `JwtStrategy` cùng `JwtAuthGuard` làm providers:

📄 **`src/auth/auth.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    // Đăng ký PassportModule với chiến lược mặc định là 'jwt'
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
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtModule, PassportModule, JwtAuthGuard],
})
export class AuthModule {}
```

---

### 📌 Bước 4: Bảo Vệ API Profile Trong `UsersController` Bằng `JwtAuthGuard`

Mở tệp `src/users/users.controller.ts` và chuyển sang sử dụng `JwtAuthGuard`:

📄 **`src/users/users.controller.ts`**

```typescript
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  // 🛡️ BẢO VỆ ENDPOINT NÀY VỚI PASSPORT JWT GUARD
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return {
      message: 'Lấy thông tin cá nhân thành công qua Passport JwtAuthGuard!',
      user: req.user, // 👈 Passport tự động gán vào req.user từ hàm validate()
    };
  }
}
```

---

## 4. Kịch Bản Kiểm Tra & Thử Nghiệm (Hands-on Lab)

---

### 🟢 Kịch Bản 1: Thành Công (Success Flow) — Gửi Bearer Token Hợp Lệ

1. **Đăng nhập lấy Access Token:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alex@example.com", "password": "Password123!"}'
```

_Giả sử Token trả về là:_ `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHg4OTA...`

2. **Gọi API `/api/v1/users/profile` kèm Header Authorization:**

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHg4OTA..."
```

📥 **Phản hồi HTTP nhận được (`200 OK`):**

```json
{
  "message": "Lấy thông tin cá nhân thành công qua Passport JwtAuthGuard!",
  "user": {
    "userId": "clx890xyz123",
    "email": "alex@example.com"
  }
}
```

✅ **Kết quả:** `JwtAuthGuard` kích hoạt `JwtStrategy`, Passport verify chữ ký số thành công, kích hoạt `validate()` và gắn dữ liệu vào `req.user`.

---

### 🔴 Kịch Bản 2: Kiểm Thử Bắt Lỗi & Ngăn Chặn (Blocked Flows)

#### Test 1: Gọi API nhưng KHÔNG gửi kèm Header Authorization:

```bash
curl -X GET http://localhost:3000/api/v1/users/profile
```

📥 **Phản hồi HTTP nhận được (`401 Unauthorized`):**

```json
{
  "statusCode": 401,
  "message": "Bạn cần đăng nhập (gửi kèm Bearer Token) để truy cập tài nguyên này!",
  "error": "Unauthorized"
}
```

#### Test 2: Gửi Token đã hết hạn (Expired Token):

Nếu token tạo với `expiresIn: '1s'` và đã quá hạn sử dụng:

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer <EXPIRED_TOKEN>"
```

📥 **Phản hồi HTTP nhận được (`401 Unauthorized`):**

```json
{
  "statusCode": 401,
  "message": "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!",
  "error": "Unauthorized"
}
```

#### Test 3: Gửi Token bị sửa đổi chữ ký (Tampered Signature):

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni...FAKE_SIGNATURE"
```

📥 **Phản hồi HTTP nhận được (`401 Unauthorized`):**

```json
{
  "statusCode": 401,
  "message": "Mã xác thực (Token) không hợp lệ!",
  "error": "Unauthorized"
}
```

✅ **Kết quả:** `handleRequest` trong `JwtAuthGuard` đã phân loại chuẩn xác từng loại lỗi và trả về phản hồi tiếng Việt trực quan, đúng chuẩn RESTful API.

---

## 5. Tổng Kết Bài Học & Checklist Ghi Nhớ

```mermaid
mindmap
  root(("Passport.js & JwtStrategy"))
    "Strategy Pattern"
      "Tách rời Guard và Thuật toán kiểm tra"
      "Dễ mở rộng: Local, JWT, OAuth2, API Key"
    "Cấu Hình JwtStrategy"
      "Extends PassportStrategy(Strategy, 'jwt')"
      "ExtractJwt.fromAuthHeaderAsBearerToken()"
      "secretOrKey thẩm định chữ ký"
      "validate(payload) tự động gán vào req.user"
    "Tùy Biến JwtAuthGuard"
      "Extends AuthGuard('jwt')"
      "handleRequest bắt TokenExpiredError"
      "handleRequest bắt JsonWebTokenError"
    "Bảo Vệ Endpoint"
      "@UseGuards(JwtAuthGuard)"
      "Nhận req.user Type-Safe ở Controller"
```

### ✅ Checklist Ghi Nhớ Bài Học:

- [x] Hiểu rõ vì sao Passport.js và Strategy Pattern được chọn để chuẩn hóa tầng xác thực cho ứng dụng doanh nghiệp.
- [x] Cài đặt thành công bộ thư viện: `@nestjs/passport`, `passport`, `passport-jwt`, `@types/passport-jwt`.
- [x] Triển khai `JwtStrategy` kế thừa `PassportStrategy` với các cấu hình `ExtractJwt` và `secretOrKey`.
- [x] Nắm chắc cơ chế tự động gán dữ liệu trả về từ `validate(payload)` vào đối tượng `req.user`.
- [x] Tạo `JwtAuthGuard` kế thừa `AuthGuard('jwt')` và tùy biến `handleRequest()` xử lý lỗi chuyên nghiệp.
- [x] Đăng ký `PassportModule` và `JwtStrategy` trong `AuthModule`.
- [x] Sử dụng `@UseGuards(JwtAuthGuard)` để bảo vệ endpoint `/users/profile`.
- [x] Thực hành cURL kiểm thử thành công (200 OK) và các trường hợp lỗi (401: Thiếu token, Hết hạn token, Sai chữ ký).

---

👉 **Bài tiếp theo:** [Lesson 4.5: Auth Decorators & Global Guard — Vận Dụng @CurrentUser() & @Public() Bảo Vệ Toàn Diện Hệ Thống](../lesson-4.5/lesson-4.5.md)
