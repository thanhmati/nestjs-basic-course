# Lesson 4.3: NestJS Guards — Kiểm Soát Quyền Truy Cập & Bảo Vệ API Trong NestJS

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-Guards-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS Guards" />
  <img src="https://img.shields.io/badge/Interface-CanActivate-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="CanActivate" />
  <img src="https://img.shields.io/badge/Security-Native_Guard-10B981?style=for-the-badge&logo=security&logoColor=white" alt="Native Guard" />
  <img src="https://img.shields.io/badge/Pipeline-Request_Lifecycle-F59E0B?style=for-the-badge&logo=fastapi&logoColor=white" alt="Request Lifecycle" />
  <img src="https://img.shields.io/badge/pnpm-Package_Manager-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
</p>

<p align="center">
  <img src="./assets/lesson_overview_banner.svg" alt="Lesson Overview Banner" width="100%" />
</p>

---

> [!NOTE]
> ⏱️ **Thời lượng dự kiến:** 10 – 12 phút  
> 🎯 **Mục tiêu bài học:** Nắm vững khái niệm cốt lõi của Guard trong NestJS; hiểu rõ vị trí của Guard trong vòng đời xử lý request (Request Lifecycle); phân biệt tổng quan sự khác nhau giữa Middleware và Guard; tự tay xây dựng một **Native Guard thuần NestJS** (`NativeAuthGuard`) sử dụng `JwtService` để bảo vệ API Endpoint mà không cần phụ thuộc vào thư viện bên ngoài; thực hành kiểm thử cURL bắt lỗi `401 Unauthorized`.

---

## 1. Guard Trong NestJS Là Gì? Vị Trí Trong Request Pipeline

### 🔹 Khái Niệm Cốt Lõi

Trong NestJS, **Guard** là một lớp (class) được đánh dấu bằng decorator `@Injectable()` và thực thi interface `CanActivate`.

Guard có **nhiệm vụ duy nhất (Single Responsibility)**: Xác định xem một request gửi đến có được phép xử lý bởi **Route Handler** hay không, dựa trên các điều kiện cụ thể tại thời điểm chạy (runtime) như:

- Người dùng đã đăng nhập hay chưa? (Xác thực - Authentication)
- Token gửi kèm có hợp lệ và còn hạn sử dụng không?
- Người dùng có đủ quyền hạn (Roles / Permissions) để truy cập tài nguyên này không?

<p align="center">
  <img src="./assets/guard_concept_diagram.svg" alt="NestJS Guard Architecture Concept" width="90%" />
</p>

- Khi Guard trả về **`true`**: Request được phép đi tiếp vào Route Handler trong Controller.
- Khi Guard trả về **`false`** hoặc ném một **`Exception`** (ví dụ: `UnauthorizedException`): Request bị chặn đứng ngay lập tức tại cổng và trả về mã lỗi HTTP tương ứng (ví dụ: `401 Unauthorized` hoặc `403 Forbidden`).

---

### 🔹 Vị Trí Chiến Lược Trong Request Lifecycle

Hãy quan sát vị trí của Guard trong chuỗi xử lý Request của NestJS:

<p align="center">
  <img src="./assets/guard_pipeline_architecture.svg" alt="NestJS Request Lifecycle & Guard Pipeline Architecture" width="100%" />
</p>

> [!IMPORTANT]
> **Cơ chế ngắt mạch sớm (Short-Circuit / Fail-Safe):**
> Guard chạy **ngay sau Middleware** và **trước toàn bộ Interceptors, Pipes và Handler**. Nếu xác thực không thành công, request bị từ chối ngay lập tức. Điều này giúp hệ thống tiết kiệm tối đa tài nguyên xử lý (không cần parse DTO hay truy vấn Database khi request không hợp lệ).

---

### ⚖️ So Sánh Tổng Quan: Guard vs Middleware

Nhiều bạn thường thắc mắc: _"Tại sao không dùng luôn Middleware để kiểm tra Token mà lại cần thêm Guard?"_. Bảng tóm tắt dưới đây giúp bạn phân biệt rõ ràng:

| Tiêu Chí             | ⚙️ Middleware                                                                                | 🛡️ Guard                                                                                         |
| :------------------- | :------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| **Vị trí**           | Chạy đầu tiên khi request tới server.                                                        | Chạy sau Middleware, ngay trước Handler.                                                         |
| **Nhận biết Route**  | ❌ **Không biết:** Chỉ nhận `req, res, next()`, không biết Controller hay hàm nào sắp xử lý. | ✅ **Biết rõ:** Biết chính xác Controller Class và Action Method nào sẽ xử lý request tiếp theo. |
| **Mục đích sử dụng** | Tác vụ chung: ghi log HTTP, CORS, nén dữ liệu, phân giải body.                               | **Bảo mật:** Xác thực danh tính (Authentication) và phân quyền (Authorization).                  |

---

## 2. Hướng Dẫn Thực Hành Step-by-Step — Tự Tay Xây Dựng Native Guard Thuần NestJS

Để hiểu bản chất Guard hoạt động như thế nào trước khi học các thư viện phức tạp hơn, chúng ta sẽ tự tay viết một `NativeAuthGuard` sử dụng chính `JwtService` đã tạo từ **Lesson 4.2**.

---

### 📌 [Bước 1/3] Khởi Tạo & Triển Khai `NativeAuthGuard`

Tạo thư mục `src/auth/guards/` và tạo tệp `native-auth.guard.ts`:

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
    // 1. Chuyển đổi ngữ cảnh sang HTTP và lấy đối tượng Request
    const request = context.switchToHttp().getRequest<Request>();

    // 2. Trích xuất Bearer Token từ Header Authorization
    const token = this.extractTokenFromHeader(request);

    // 3. Chặn đứng ngay nếu Client không gửi Token
    if (!token) {
      throw new UnauthorizedException(
        'Yêu cầu bị từ chối: Thiếu Bearer Token trong Header Authorization!',
      );
    }

    try {
      // 4. Giải mã và verify tính toàn vẹn của Token với Secret Key
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      // 5. Gắn dữ liệu người dùng giải mã được vào request['user']
      request['user'] = {
        userId: payload.sub,
        email: payload.email,
      };
    } catch {
      // 6. Bắt lỗi khi Token sai chữ ký hoặc đã quá hạn sử dụng
      throw new UnauthorizedException(
        'Yêu cầu bị từ chối: Token không hợp lệ hoặc đã hết hạn!',
      );
    }

    // 7. Vệ sĩ mở cửa: Cho phép request đi tiếp vào Controller Handler
    return true;
  }

  /**
   * Helper trích xuất chuỗi Token từ cấu trúc "Bearer <token>"
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

🔍 **Giải Mã Các Dòng Lệnh Trọng Tâm:**

- `implements CanActivate`: Khai báo bắt buộc để một class trở thành NestJS Guard.
- `context.switchToHttp().getRequest<Request>()`: Lấy đối tượng `Request` từ ngữ cảnh thực thi HTTP.
- `await this.jwtService.verifyAsync(...)`: Kiểm tra chữ ký bí mật của token. Nếu token bị sửa đổi hoặc hết hạn, hàm sẽ ném lỗi và nhảy vào khối `catch`.
- `request['user'] = { ... }`: Gán dữ liệu người dùng vào request để các Controller phía sau có thể sử dụng.
- `return true`: Chấp thuận cho request bước tiếp vào Route Handler.

---

### 📌 [Bước 2/3] Bảo Vệ Endpoint Trong `UsersController` Bằng `@UseGuards()`

Mở tệp `src/users/users.controller.ts`, sử dụng decorator `@UseGuards(NativeAuthGuard)` để bảo vệ Endpoint lấy thông tin cá nhân:

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
      user: req['user'], // 👈 Dữ liệu được NativeAuthGuard giải mã và gắn vào
    };
  }
}
```

---

### 📌 [Bước 3/3] Export `JwtModule` & Cấu Hình Module

Vì `NativeAuthGuard` sử dụng `JwtService`, ta cần export `JwtModule` và `NativeAuthGuard` trong `AuthModule`:

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
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, NativeAuthGuard],
  exports: [AuthService, JwtModule, NativeAuthGuard], // 👈 Export để các module khác sử dụng
})
export class AuthModule {}
```

Sau đó, import `AuthModule` vào `UsersModule`:

📄 **`src/users/users.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // 👈 Cung cấp JwtService & NativeAuthGuard
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

---

## 3. Kịch Bản Kiểm Tra & Thử Nghiệm (Hands-on Lab)

Khởi động máy chủ NestJS:

```bash
pnpm start:dev
```

### 📸 Trực Quan Hóa Kiểm Thử Bằng API Client Mockup

Hình ảnh so sánh kết quả kiểm thử API `/api/v1/users/profile` giữa hai trường hợp có token và không có token:

<p align="center">
  <img src="./assets/guard_api_testing_mockup.jpg" alt="API Testing Mockup: Authorized 200 OK vs Unauthorized 401" width="95%" />
</p>

---

### 🟢 Kịch Bản 1: Thành Công (Success Flow) — Gửi Kèm Token Hợp Lệ

1. **Đăng nhập để nhận Access Token:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alex@example.com", "password": "Password123!"}'
```

_Giả sử Token nhận được là:_ `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHg4OTA...`

2. **Gọi API Profile kèm Header `Authorization`:**

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHg4OTA..."
```

📥 **Phản hồi từ Server (`200 OK`):**

```json
{
  "message": "Xác thực tài khoản thành công qua NativeAuthGuard!",
  "user": {
    "userId": "clx890xyz123",
    "email": "alex@example.com"
  }
}
```

✅ **Kết quả:** `NativeAuthGuard` thẩm định token hợp lệ, gán thông tin vào `req['user']` và cho phép trả về dữ liệu Profile.

---

### 🔴 Kịch Bản 2: Kiểm Thử Bị Chặn (Blocked Flow) — Thiếu Token Hoặc Token Sai

#### Test 1: Gọi API nhưng KHÔNG gửi Header Authorization

```bash
curl -X GET http://localhost:3000/api/v1/users/profile
```

📥 **Phản hồi từ Server (`401 Unauthorized`):**

```json
{
  "statusCode": 401,
  "message": "Yêu cầu bị từ chối: Thiếu Bearer Token trong Header Authorization!",
  "error": "Unauthorized"
}
```

#### Test 2: Gửi Token bị sửa đổi nội dung (Fake Signature)

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni...FAKE_SIGNATURE"
```

📥 **Phản hồi từ Server (`401 Unauthorized`):**

```json
{
  "statusCode": 401,
  "message": "Yêu cầu bị từ chối: Token không hợp lệ hoặc đã hết hạn!",
  "error": "Unauthorized"
}
```

✅ **Kết quả:** `NativeAuthGuard` phát hiện token không hợp lệ và chặn đứng yêu cầu ngay tại cửa ngõ!

---

## 4. Vì Sao Native Guard Chưa Đủ Cho Dự Án Lớn? Cầu Nối Tới Passport.js

`NativeAuthGuard` giúp chúng ta hiểu rõ 100% bản chất cách Guard chặn lọc request. Tuy nhiên, trong các dự án thực tế quy mô lớn, nếu chỉ tự viết Guard thế này sẽ gặp khó khăn:

1. **Khó mở rộng nhiều cơ chế đăng nhập (Multi-Strategy):** Khi hệ thống cần đăng nhập Google OAuth, Facebook, Apple ID, API Key... việc tự viết từng Guard thủ công sẽ gây trùng lặp mã nguồn.
2. **Cần tách rời trách nhiệm:** Guard chỉ nên làm nhiệm vụ _Cho qua hay chặn lại?_, còn việc _bóc tách token và thuật toán xác thực_ nên để một tầng chuyên biệt gọi là **Strategy** đảm nhận.

Đó chính là lý do bài học tiếp theo chúng ta sẽ tìm hiểu **Passport.js** — giải pháp xác thực tiêu chuẩn công nghiệp được tích hợp sẵn trong NestJS qua `@nestjs/passport`.

---

## 5. Tổng Kết Bài Học & Checklist Ghi Nhớ

```mermaid
mindmap
  root(("Lesson 4.3: NestJS Guards"))
    "Khái Niệm Guard"
      "Implements CanActivate"
      "Single Responsibility: Cho phép hoặc Chặn"
      "Ngắt mạch sớm (Short-circuit) tiết kiệm CPU"
    "Guard vs Middleware"
      "Middleware: Không biết Controller đích"
      "Guard: Biết rõ Controller & Handler đích"
    "NativeAuthGuard"
      "Trích xuất Bearer Token từ header"
      "verifyAsync bằng JwtService"
      "Gán payload vào req['user']"
    "Áp Dụng"
      "@UseGuards(NativeAuthGuard)"
      "200 OK khi token chuẩn"
      "401 Unauthorized khi thiếu/sai token"
```

### ✅ Checklist Ghi Nhớ Bài Học:

- [x] Hiểu rõ vai trò và vị trí của Guard trong NestJS Request Lifecycle.
- [x] Phân biệt được sự khác nhau tổng quan giữa Middleware và Guard.
- [x] Nắm vững cú pháp cơ bản của interface `CanActivate`.
- [x] Tự tay viết được `NativeAuthGuard` sử dụng `JwtService.verifyAsync()`.
- [x] Áp dụng `@UseGuards(NativeAuthGuard)` để bảo vệ route `/users/profile`.
- [x] Thử nghiệm thành công cURL bắt lỗi HTTP 401 khi thiếu token hoặc gửi token sai.
- [x] Hiểu lý do vì sao cần bước tiếp sang tìm hiểu Passport.js ở bài học tiếp theo.

---

👉 **Bài tiếp theo:** [Lesson 4.4: Passport.js & JwtStrategy — Chuẩn Hóa Xác Thực API Chuyên Nghiệp Trong NestJS](../lesson-4.4/lesson-4.4.md)
