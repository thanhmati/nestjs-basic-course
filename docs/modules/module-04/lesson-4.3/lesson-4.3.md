# Lesson 4.3: Guards Nền Tảng — Kiểm Soát Quyền Truy Cập Với CanActivate & ExecutionContext Trong NestJS

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-Guards-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS Guards" />
  <img src="https://img.shields.io/badge/Interface-CanActivate-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="CanActivate" />
  <img src="https://img.shields.io/badge/Context-ExecutionContext-10B981?style=for-the-badge&logo=node.js&logoColor=white" alt="ExecutionContext" />
  <img src="https://img.shields.io/badge/Security-Native_Guard-F59E0B?style=for-the-badge&logo=security&logoColor=white" alt="Native Guard" />
  <img src="https://img.shields.io/badge/pnpm-Package_Manager-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
</p>

<p align="center">
  <img src="./assets/lesson_overview_banner.svg" alt="Lesson Overview Banner" width="100%" />
</p>

---

> [!NOTE]
> ⏱️ **Thời lượng dự kiến:** 12 – 15 phút  
> 🎯 **Mục tiêu bài học:** Thấu hiểu bản chất cốt lõi của Guard trong kiến trúc NestJS; giải mã interface `CanActivate` và đối tượng ngữ cảnh `ExecutionContext`; phân biệt rạch ròi sự khác nhau giữa Middleware và Guard; tự tay xây dựng một **Native Guard thuần NestJS** (`NativeAuthGuard`) sử dụng `JwtService` để kiểm tra Bearer Token mà không cần phụ thuộc vào bất kỳ thư viện trung gian nào; thực hành áp dụng `@UseGuards()` bảo vệ Route và chạy kịch bản thử nghiệm bắt lỗi `401 Unauthorized`.

---

## 1. Guard Trong NestJS Là Gì? Vị Trí Trong Request Pipeline

### 💡 Ẩn Dụ Thực Tế: Vệ Sĩ Soát Vé Tại Cửa Phòng VIP

Hãy tưởng tượng toàn bộ hệ thống API của bạn như một **Câu Lạc Bộ Âm Nhạc Cao Cấp**:

- **Cổng vào sảnh ngoài (Public Endpoints):** Bất kỳ ai cũng có thể vào sảnh để xem menu đồ uống hoặc nghe giới thiệu sự kiện (ví dụ: API Đăng ký `/auth/register`, Đăng nhập `/auth/login`).
- **Cửa phòng VIP (Protected Endpoints):** Khi khách muốn vào khu vực riêng tư như xem Thông tin tài khoản (`/users/profile`) hoặc Đổi mật khẩu (`/auth/change-password`), họ bắt buộc phải đối mặt với **Vệ Sĩ Cửa Phòng (Guard)**.
- Vệ sĩ chỉ quan tâm đúng một câu hỏi nhị phân: **"Vị khách này có đủ tư cách bước vào hay không?"**:
  - Nếu khách xuất trình **Vòng tay VIP hợp lệ (Bearer Token)** ➔ Vệ sĩ mở cửa (`return true`), đồng thời gắn thẻ tên khách vào danh sách phục vụ (`req['user'] = payload`).
  - Nếu khách không có vòng tay hoặc đeo vòng tay giả ➔ Vệ sĩ chặn ngay tại cửa và mời ra ngoài (`throw UnauthorizedException` hoặc `return false` ➔ HTTP `401 Unauthorized`).

```mermaid
flowchart LR
    subgraph Pipeline ["🚀 NestJS Request Lifecycle"]
        direction LR
        Client["📱 Client Request<br/><i>Header: Bearer Token</i>"] --> Middleware["⚙️ Middleware<br/><i>(Log, CORS, Body)</i>"]
        Middleware --> Guard{"🛡️ CanActivate Guard<br/><i>(true or false?)</i>"}
        Guard -->|"🟢 true (Cho phép)"| InterceptorPre["⚡ Interceptors (Pre)"]
        InterceptorPre --> Pipe["🧪 Pipes / DTO Validation"]
        Pipe --> Controller["📄 Controller Handler"]
        Guard -->|"🔴 false / Exception"| Reject["🔴 401 Unauthorized"]
    end
```

---

### 🔹 So Sánh Guard vs Middleware: Tại Sao Cần Cả Hai?

Trong **Lesson 3.3**, chúng ta đã tự tay viết `LoggerMiddleware`. Nhiều lập trình viên thường thắc mắc: _"Tại sao không dùng luôn Middleware để kiểm tra Token và chặn request?"_.

Bảng so sánh dưới đây sẽ làm sáng tỏ sự phân công trách nhiệm:

| Tiêu chí                          | Middleware (Express/NestJS)                                                                     | Guard (NestJS)                                                                                               |
| :-------------------------------- | :---------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| **Vị trí chạy**                   | Chạy đầu tiên khi request tới Server.                                                           | Chạy **sau Middleware** và **ngay trước Interceptors/Pipes/Handler**.                                        |
| **Ngữ cảnh (`ExecutionContext`)** | **Mù mờ:** Chỉ biết `req`, `res`, `next()`. Không biết Controller hay Handler nào sắp được gọi. | **Tường minh:** Biết chính xác Class và Handler nào sẽ xử lý request tiếp theo thông qua `ExecutionContext`. |
| **Cơ chế ra quyết định**          | Phải tự gọi `res.status(401).json(...)` hoặc `next(err)`.                                       | Trả về `boolean` (`true`/`false`) hoặc ném NestJS Exception (`UnauthorizedException`, `ForbiddenException`). |
| **Nhiệm vụ tối ưu**               | Tác vụ chung: ghi log HTTP, nén dữ liệu (gzip), phân giải Cookie, CORS.                         | **Xác thực (Authentication) & Phân quyền (Authorization / RBAC).**                                           |

> [!IMPORTANT]
> **Điểm mấu chốt:** Guard được thiết kế chuyên biệt cho việc **bảo vệ và phân quyền**. Nhờ có `ExecutionContext`, Guard có thể đọc được Metadata gắn trên từng Controller hoặc Route Handler (chúng ta sẽ tận dụng sức mạnh này ở **Lesson 4.5** với `@Public()` và `Reflector`).

---

## 2. Giải Mã Interface `CanActivate` & Đối Tượng `ExecutionContext`

### 1. Interface `CanActivate`

Mọi Guard trong NestJS bắt buộc phải là một Class được đánh dấu `@Injectable()` và `implements CanActivate`:

```typescript
export interface CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean>;
}
```

Phương thức `canActivate` có thể xử lý đồng bộ (trả về `boolean`) hoặc bất đồng bộ (trả về `Promise<boolean>` hoặc RxJS `Observable<boolean>`):

- Trả về `true`: Request được phép đi tiếp vào Pipe và Handler.
- Trả về `false`: NestJS tự động ném ra `ForbiddenException` (HTTP `403 Forbidden`).
- Ném trực tiếp Exception: Ví dụ `throw new UnauthorizedException(...)` để trả về HTTP `401 Unauthorized` kèm thông điệp rõ ràng.

---

### 2. Đối Tượng `ExecutionContext`

`ExecutionContext` kế thừa từ `ArgumentsHost`, cung cấp phương thức linh hoạt để làm việc đa nền tảng (HTTP REST, WebSockets, Microservices):

```mermaid
flowchart TD
    subgraph ExecutionContext ["🧠 ExecutionContext Capabilities"]
        direction TB
        EC["ExecutionContext"]
        EC --> Switch["context.switchToHttp()"]
        Switch --> GetReq["getRequest() (Express Request)"]
        Switch --> GetRes["getResponse() (Express Response)"]
        EC --> TargetClass["context.getClass()<br/><i>(Biết Controller nào: UsersController)</i>"]
        EC --> TargetHandler["context.getHandler()<br/><i>(Biết Action nào: getProfile)</i>"]
    end
```

Nhờ `context.switchToHttp().getRequest()`, Guard có thể trích xuất toàn bộ Headers, Body, Params từ Client gửi lên.

---

## 3. Hướng Dẫn Thực Hành Step-by-Step — Xây Dựng Native Guard Thuần NestJS

Để hiểu 100% nguyên lý hoạt động "dưới mui xe" (Under the hood) mà **không bị phụ thuộc vào bất kỳ thư viện thứ 3 nào (như Passport)**, chúng ta sẽ tự tay triển khai `NativeAuthGuard` sử dụng `JwtService` đã cấu hình từ **Lesson 4.2**.

---

### 📌 Bước 1: Tạo Tệp `native-auth.guard.ts`

Tạo thư mục `src/auth/guards/` và khởi tạo tệp `native-auth.guard.ts`:

📄 **`src/auth/guards/native-auth.guard.ts`**

```typescript
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class NativeAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Lấy đối tượng Request từ ExecutionContext
    const request = context.switchToHttp().getRequest<Request>();

    // 2. Trích xuất Bearer Token từ Header Authorization
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'Yêu cầu bị từ chối: Thiếu Bearer Token trong Header Authorization!',
      );
    }

    try {
      // 3. Giải mã và verify tính toàn vẹn của Token với Secret Key
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      // 4. Gắn dữ liệu người dùng giải mã được vào request['user']
      request['user'] = {
        userId: payload.sub,
        email: payload.email,
      };
    } catch {
      throw new UnauthorizedException(
        'Yêu cầu bị từ chối: Token không hợp lệ hoặc đã hết hạn!',
      );
    }

    // 5. Trả về true: Vệ sĩ cho phép request bước tiếp vào Controller Handler
    return true;
  }

  /**
   * Helper trích xuất Token từ định dạng: "Authorization: Bearer <token>"
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
```

> [!TIP]
> **Giải mã luồng hoạt động:**
>
> 1. Trích xuất chuỗi sau từ khóa `Bearer`.
> 2. Dùng `jwtService.verifyAsync()` để kiểm tra chữ ký số HMAC-SHA256 với `JWT_SECRET`. Nếu ai đó cố tình sửa payload dù chỉ 1 ký tự, hàm sẽ quăng lỗi ngay lập tức.
> 3. Nếu hợp lệ, gắn `request['user'] = { userId: payload.sub, email: payload.email }`.
> 4. `return true` để mở cửa cho request đi tiếp.

---

### 📌 Bước 2: Bảo Vệ Endpoint Bằng `@UseGuards(NativeAuthGuard)`

Mở tệp `src/users/users.controller.ts` và gắn Guard lên Endpoint xem thông tin Profile:

📄 **`src/users/users.controller.ts`**

```typescript
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { NativeAuthGuard } from '../auth/guards/native-auth.guard';

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

  // 🛡️ BẢO VỆ ENDPOINT NÀY VỚI NATIVE GUARD
  @UseGuards(NativeAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return {
      message: 'Xác thực tài khoản thành công qua NativeAuthGuard!',
      user: req['user'], // 👈 Dữ liệu do Guard gắn vào
    };
  }
}
```

---

### 📌 Bước 3: Đăng Ký Provider & Export `JwtModule`

Vì `NativeAuthGuard` sử dụng `JwtService` và `ConfigService`, khi Controller ở `UsersModule` sử dụng Guard này, NestJS cần quyền truy cập vào `JwtService`.

Hãy mở `src/auth/auth.module.ts` và export `JwtModule` cùng `NativeAuthGuard`:

📄 **`src/auth/auth.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { NativeAuthGuard } from './guards/native-auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '1d'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, NativeAuthGuard],
  exports: [AuthService, JwtModule, NativeAuthGuard], // 👈 Export để module khác sử dụng
})
export class AuthModule {}
```

Sau đó import `AuthModule` vào `UsersModule` (nếu chưa có):

📄 **`src/users/users.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

---

## 4. Kịch Bản Kiểm Tra & Thử Nghiệm (Hands-on Lab)

Hãy khởi động máy chủ để kiểm tra:

```bash
pnpm start:dev
```

---

### 🟢 Kịch Bản 1: Thành Công (Success Flow) — Gửi Bearer Token Hợp Lệ

1. **Đăng nhập để lấy Access Token hợp lệ:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alex@example.com", "password": "Password123!"}'
```

📥 Giả sử bạn nhận được Access Token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHg4OTA...`

2. **Gọi API `/api/v1/users/profile` kèm Header `Authorization`:**

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHg4OTA..."
```

📥 **Phản hồi HTTP nhận được từ Server (`200 OK`):**

```json
{
  "message": "Xác thực tài khoản thành công qua NativeAuthGuard!",
  "user": {
    "userId": "clx890xyz123",
    "email": "alex@example.com"
  }
}
```

✅ **Kết quả:** `NativeAuthGuard` đã trích xuất token, thẩm định chữ ký số thành công, gắn user vào request và trả về dữ liệu Profile chính xác.

---

### 🔴 Kịch Bản 2: Kiểm Thử Bị Chặn (Blocked Flow) — Thiếu Token Hoặc Token Giả Mạo

#### Test 1: Gọi API nhưng KHÔNG gửi Header Authorization

```bash
curl -X GET http://localhost:3000/api/v1/users/profile
```

📥 **Phản hồi HTTP nhận được (`401 Unauthorized`):**

```json
{
  "statusCode": 401,
  "message": "Yêu cầu bị từ chối: Thiếu Bearer Token trong Header Authorization!",
  "error": "Unauthorized"
}
```

#### Test 2: Gửi Token bị thay đổi nội dung (Fake Signature / Tampered Token)

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.FAKE_PAYLOAD.FAKE_SIGNATURE"
```

📥 **Phản hồi HTTP nhận được (`401 Unauthorized`):**

```json
{
  "statusCode": 401,
  "message": "Yêu cầu bị từ chối: Token không hợp lệ hoặc đã hết hạn!",
  "error": "Unauthorized"
}
```

✅ **Kết quả:** Vệ sĩ đã phát hiện token giả mạo và từ chối ngay lập tức ở cửa ngõ, không cho phép request chạm vào Controller Handler!

---

## 5. Tại Sao Native Guard Chưa Đủ Cho Ứng Dụng Enterprise? Cầu Nối Sang Passport.js

Như bạn vừa thấy, việc tự viết một `NativeAuthGuard` rất trực quan và giúp ta hiểu cặn kẽ cách NestJS bảo vệ endpoint.

Tuy nhiên, trong các dự án thực tế quy mô lớn, nếu chỉ dừng lại ở cách này, bạn sẽ gặp phải các hạn chế sau:

1. **Khó mở rộng đa phương thức đăng nhập (Multi-Strategy):**
   - Nếu ngày mai ứng dụng cần hỗ trợ: Đăng nhập Google, Facebook, Apple ID, Đăng nhập bằng API Key, hoặc Refresh Token thì sao?
   - Nếu mỗi loại đăng nhập lại phải tự viết một Guard thủ công, mã nguồn sẽ bị lặp lại, khó bảo trì và dễ sơ hở bảo mật.
2. **Không phân tách độc lập giữa "Cơ chế Chặn Request" và "Thuật toán Xác Thực":**
   - Guard nên tập trung vào việc: _Cho qua hay chặn lại?_
   - Việc _bóc tách token, verify chữ ký, truy vấn user từ DB_ nên thuộc về một lớp nghiệp vụ riêng biệt gọi là **Strategy (Chiến lược xác thực)**.

Đó chính là lý do vì sao hệ sinh thái Node.js phát minh ra thư viện tiêu chuẩn công nghiệp **Passport.js**, và NestJS tích hợp mượt mà thông qua gói **`@nestjs/passport`**.

---

## 6. Tổng Kết Bài Học & Checklist Ghi Nhớ

```mermaid
mindmap
  root(("NestJS Guards Nền Tảng"))
    "Khái Niệm Guard"
      "Implements CanActivate"
      "Trả về boolean hoặc ném Exception"
      "Vị trí: Sau Middleware, trước Interceptors & Pipes"
    "ExecutionContext"
      "switchToHttp() lấy Request & Response"
      "getClass() biết Controller đích"
      "getHandler() biết Method đích"
    "NativeAuthGuard"
      "Tự trích xuất Header Bearer"
      "Dùng JwtService.verifyAsync()"
      "Gán req['user']"
    "Áp dụng"
      "@UseGuards(NativeAuthGuard)"
      "Bảo vệ cấp Method hoặc cấp Controller"
```

### ✅ Checklist Ghi Nhớ Bài Học:

- [x] Hiểu rõ vai trò của Guard như một "vệ sĩ" đưa ra quyết định cho phép (`true`) hoặc chặn (`false`/`UnauthorizedException`).
- [x] Phân biệt rõ sự khác nhau giữa Middleware và Guard (khả năng tiếp cận `ExecutionContext`).
- [x] Nắm vững cấu trúc interface `CanActivate` và phương thức `canActivate(context)`.
- [x] Tự tay viết thành công `NativeAuthGuard` sử dụng `JwtService` thuần túy.
- [x] Trích xuất Header `Authorization: Bearer <token>` và gán thông tin vào `request['user']`.
- [x] Sử dụng decorator `@UseGuards()` để bảo vệ endpoint `/users/profile`.
- [x] Thử nghiệm thành công cURL bắt lỗi 401 khi không gửi token hoặc gửi token sai.
- [x] Hiểu lý do vì sao cần nâng cấp lên kiến trúc Strategy Pattern với Passport.js ở bài học tiếp theo.

---

👉 **Bài tiếp theo:** [Lesson 4.4: Passport.js & JwtStrategy — Chuẩn Hóa Xác Thực API Chuyên Nghiệp Trong NestJS](../lesson-4.4/lesson-4.4.md)
