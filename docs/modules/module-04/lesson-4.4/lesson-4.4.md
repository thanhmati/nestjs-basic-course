# Lesson 4.4: Custom Decorators — Tạo @CurrentUser() & @Public() Decorators Trong NestJS

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-Custom_Decorators-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS Custom Decorators" />
  <img src="https://img.shields.io/badge/Reflector-Metadata-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="Reflector Metadata" />
  <img src="https://img.shields.io/badge/Clean_Code-Type_Safe-10B981?style=for-the-badge&logo=opsgenie&logoColor=white" alt="Clean Code" />
  <img src="https://img.shields.io/badge/Global_Guard-APP_GUARD-F59E0B?style=for-the-badge&logo=security&logoColor=white" alt="Global Guard" />
  <img src="https://img.shields.io/badge/pnpm-Package_Manager-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
</p>

<p align="center">
  <img src="./assets/lesson_overview_banner.svg" alt="Lesson Overview Banner" width="100%" />
</p>

---

> [!NOTE]
> ⏱️ **Thời lượng dự kiến:** 12 – 15 phút  
> 🎯 **Mục tiêu bài học:** Nắm vững sức mạnh của Custom Decorators trong NestJS giúp làm sạch mã nguồn (Clean Code); loại bỏ mùi code (Code Smell) khi dùng `@Request() req: any` bằng cách xây dựng Custom Param Decorator `@CurrentUser()`; tự tay triển khai Route Decorator `@Public()` với `SetMetadata` kết hợp `Reflector` để bypass Global `JwtAuthGuard` cho các API công khai; thực hành kịch bản kiểm thử mã nguồn ngắn gọn, Type-Safe và chuyên nghiệp.

---

## 1. Vấn Đề "Code Smell" Với `@Request() req` & Giải Pháp Custom Decorator

### 💡 Ẩn Dụ Thực Tế: Thẻ Tên Nhân Viên & Vé Ưu Tiên Luồng Xanh

Trong các bài học trước, khi muốn lấy thông tin người dùng đang đăng nhập trong Controller, chúng ta phải viết:

```typescript
// 🔴 MÙI CODE (CODE SMELL): Phải ép kiểu req: any và gọi req.user thủ công
@Get('profile')
getProfile(@Request() req: any) {
  const user = req.user;
  return user;
}
```

Việc này tạo ra 3 nhược điểm lớn:

1. **Lặp code (Boilerplate Code):** Controller nào cũng phải tiêm `@Request() req: any`.
2. **Mất Type-Safety:** Phải dùng kiểu `any` làm mất tính năng autocomplete gợi ý code của TypeScript.
3. **Phụ thuộc vào Express Request Object:** Làm mã nguồn bị gắn chặt với tầng HTTP bên dưới.

Để giải quyết triệt để vấn đề này, NestJS cung cấp cơ chế **Custom Decorators**:

- **`@CurrentUser()` (Custom Param Decorator):** Tự động trích xuất `req.user` từ `ExecutionContext` và ép kiểu Type-Safe.
- **`@Public()` (Custom Route Decorator):** Gán nhãn "Luồng Xanh / Bỏ qua kiểm tra JWT" cho các Route công khai (Login, Register, Healthcheck).

```mermaid
flowchart TD
    subgraph BadPractice ["🔴 CODE THỦ CÔNG (Code Smell)"]
        ReqAny["@Request() req: any"] --> ReadUser["const user = req.user"]
        ReadUser --> LossType["Mất gợi ý TypeScript Autocomplete & Dễ gõ sai tên thuộc tính"]
    end

    subgraph GoodPractice ["🟢 CUSTOM DECORATORS (Clean Code)"]
        DecUser["@CurrentUser() user: JwtPayload"] --> CleanCode["Gọn gàng, Type-Safe 100%"]
        DecField["@CurrentUser('userId') userId: string"] --> CleanField["Trích xuất chính xác 1 thuộc tính"]
    end
```

---

## 2. Luồng Xử Lý Của Global JwtAuthGuard Khi Kết Hợp Với `@Public()` & `@CurrentUser()`

Khi biến `JwtAuthGuard` thành **Global Guard** (áp dụng cho TOÀN BỘ các API trong ứng dụng), luồng xử lý sẽ diễn ra như sau:

```mermaid
sequenceDiagram
    autonumber
    actor Client as 📱 HTTP Client
    participant Guard as 🛡️ Global JwtAuthGuard
    participant Reflector as 🔍 Reflector Metadata
    participant Controller as 📄 Controller Handler

    Client->>Guard: Gửi HTTP Request tới Endpoint
    Guard->>Reflector: Lấy metadata 'isPublic' từ Route Handler / Class

    alt Route có gắn @Public()
        Reflector-->>Guard: isPublic = true
        Guard->>Controller: 🟢 Cho phép đi tiếp (Không cần check JWT Token)
    else Route KHÔNG có @Public() (Mặc định riêng tư)
        Reflector-->>Guard: isPublic = false / undefined
        Note over Guard: Verify Bearer Token trong Header Authorization
        alt Token KHÔNG hợp lệ / Thiếu Token
            Guard-->>Client: 🔴 401 Unauthorized Response
        else Token HỢP LỆ
            Guard->>Controller: 🟢 Cho phép đi tiếp (Gắn user vào req.user)
            Note over Controller: Handler lấy user bằng @CurrentUser()
        end
    end
```

---

## 3. Hướng Dẫn Thực Hành Step-by-Step — Viết & Áp Dụng Custom Decorators

### 📌 Bước 1: Triển Khai Custom Param Decorator `@CurrentUser()`

Tạo tệp `src/shared/decorators/current-user.decorator.ts` sử dụng hàm `createParamDecorator`:

📄 **`src/shared/decorators/current-user.decorator.ts`**

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../auth/strategies/jwt.strategy';

/**
 * Custom Param Decorator trích xuất thông tin User từ Request Object (do JwtStrategy gán vào)
 *
 * Ví dụ sử dụng:
 * 1. Lấy toàn bộ đối tượng user: getProfile(@CurrentUser() user: JwtPayload)
 * 2. Lấy 1 trường cụ thể: getPosts(@CurrentUser('userId') userId: string)
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user) {
      return null;
    }

    // Nếu người dùng truyền param (vd: @CurrentUser('userId')), trả về đúng thuộc tính đó
    return data ? user[data] : user;
  },
);
```

---

### 📌 Bước 2: Triển Khai Custom Route Decorator `@Public()`

Tạo tệp `src/shared/decorators/public.decorator.ts` sử dụng `SetMetadata`:

📄 **`src/shared/decorators/public.decorator.ts`**

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Custom Decorator đánh dấu Route Handler hoặc Controller là công khai (Public)
 * Giúp bypass kiểm tra JwtAuthGuard Toàn cục
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

---

### 📌 Bước 3: Nâng Cấp `JwtAuthGuard` Kết Hợp `Reflector` Đọc Metadata

Mở tệp `src/auth/guards/jwt-auth.guard.ts` và tích hợp `Reflector` để kiểm tra cờ `isPublic`:

📄 **`src/auth/guards/jwt-auth.guard.ts`**

```typescript
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    // 1. Trích xuất cờ 'isPublic' từ Route Handler hoặc Controller Class
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. Nếu Route được gắn @Public(), cho phép truy cập ngay mà không cần verify JWT Token
    if (isPublic) {
      return true;
    }

    // 3. Nếu là Route riêng tư, tiếp tục kích hoạt quy trình kiểm tra Token của Passport
    return super.canActivate(context);
  }

  override handleRequest(err: any, user: any, info: any) {
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

### 📌 Bước 4: Đăng Ký `JwtAuthGuard` Làm Global Guard Trong `AppModule`

Thay vì gắn `@UseGuards(JwtAuthGuard)` trên từng Controller thủ công, chúng ta đăng ký nó làm **Global Guard** với token `APP_GUARD` trong `AppModule`. Mọi Route sẽ tự động được bảo vệ trừ khi có `@Public()`!

📄 **`src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  providers: [
    // 🛡️ Đăng ký JwtAuthGuard làm Global Guard cho TOÀN BỘ ứng dụng
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```

---

### 📌 Bước 5: Áp Dụng Decorators Siêu Gọn Gàng Trong Controllers

#### 1. Áp dụng `@Public()` trong `AuthController`:

📄 **`src/auth/auth.controller.ts`**

```typescript
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Version,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() // 🔓 Route này công khai, ai cũng có thể Đăng ký
  @Version('1')
  @Post('register')
  @ResponseMessage('Đăng ký tài khoản thành công!')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public() // 🔓 Route này công khai, ai cũng có thể Đăng nhập
  @Version('1')
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Đăng nhập thành công!')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

#### 2. Áp dụng `@CurrentUser()` trong `UsersController`:

📄 **`src/users/users.controller.ts`**

```typescript
import { Controller, Get, Version } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('users')
export class UsersController {
  // 🔒 Route này mặc định được bảo vệ bởi Global JwtAuthGuard
  @Version('1')
  @Get('profile')
  @ResponseMessage('Lấy thông tin cá nhân thành công!')
  getProfile(@CurrentUser() user: JwtPayload) {
    // ✨ Clean Code: Không cần @Request() req: any nữa!
    return {
      message: 'Thông tin tài khoản xác thực từ Token',
      user,
    };
  }

  // 💡 Ví dụ lấy trực tiếp userId:
  @Version('1')
  @Get('my-id')
  getMyId(@CurrentUser('userId') userId: string) {
    return { myUserId: userId };
  }
}
```

---

## 4. Kịch Bản Kiểm Tra & Thử Nghiệm (Hands-on Lab)

### 🟢 Kịch Bản 1: Kiểm Thử Route Public (`@Public()`) KHÔNG Cần Gửi Token

Thử gửi yêu cầu Đăng nhập mà KHÔNG kèm Header Authorization:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alex@example.com", "password": "Password123!"}'
```

📥 **Phản hồi HTTP nhận được từ Server (`200 OK`):**

```json
{
  "statusCode": 200,
  "message": "Đăng nhập thành công!",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

✅ **Kết quả:** Global Guard phát hiện decorator `@Public()`, tự động cho phép request đi qua mượt mà mà không bắt lỗi 401!

---

### 🟢 Kịch Bản 2: Kiểm Thử Route Protected Sử Dụng `@CurrentUser()`

Gửi yêu cầu tới Endpoint `/api/v1/users/profile` kèm Bearer Token hợp lệ:

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
  }
}
```

✅ **Kết quả:** `@CurrentUser()` trích xuất chính xác `user` từ token và truyền trực tiếp vào Handler với đầy đủ Type-Safety của TypeScript!

---

### 🔴 Kịch Bản 3: Kiểm Thử Route Protected Nhưng KHÔNG Gửi Token (Bị Global Guard Chặn)

Thử gọi API Profile nhưng KHÔNG gửi Bearer Token:

```bash
curl -X GET http://localhost:3000/api/v1/users/profile
```

📥 **Phản hồi HTTP nhận được (`401 Unauthorized`):**

```json
{
  "statusCode": 401,
  "message": "Bạn cần đăng nhập (gửi kèm Bearer Token) để truy cập tài nguyên này!",
  "error": "Unauthorized",
  "timestamp": "2026-08-13T16:40:00.000Z",
  "path": "/api/v1/users/profile"
}
```

✅ **Kết quả:** Mọi API trong hệ thống mặc định đều được bảo mật tuyệt đối bởi Global Guard trừ khi có `@Public()`.

---

## 5. Tổng Kết Bài Học & Checklist Ghi Nhớ

```mermaid
mindmap
  root(("NestJS Custom Decorators"))
    "Tránh Code Smell"
      "Loại bỏ @Request() req: any"
      "Đảm bảo Type-Safety 100%"
      "Code siêu gọn gàng"
    "Custom Param Decorator"
      "createParamDecorator()"
      "@CurrentUser() lấy toàn bộ user"
      "@CurrentUser('userId') lấy 1 trường"
    "Custom Route Decorator"
      "SetMetadata(IS_PUBLIC_KEY, true)"
      "Kế hợp Reflector trong JwtAuthGuard"
      "Bypass token check cho Public APIs"
    "Global Guard Setup"
      "Cấu hình { provide: APP_GUARD }"
      "Bảo vệ mặc định toàn bộ ứng dụng"
```

### ✅ Checklist Ghi Nhớ Bài Học:

- [x] Hiểu lý do tại sao dùng `@Request() req: any` là Mùi Code (Code Smell) và lợi ích của Custom Decorators.
- [x] Tạo thành công Custom Param Decorator `@CurrentUser()` bằng `createParamDecorator`.
- [x] Hỗ trợ trích xuất toàn bộ object hoặc 1 thuộc tính cụ thể với `@CurrentUser('userId')`.
- [x] Tạo thành công Custom Route Decorator `@Public()` bằng `SetMetadata`.
- [x] Nâng cấp `JwtAuthGuard` tích hợp `Reflector` để đọc cờ `isPublic`.
- [x] Đăng ký `JwtAuthGuard` làm Global Guard trong `AppModule` bằng `APP_GUARD`.
- [x] Thử nghiệm cURL thành công cho cả Route Public, Route Protected dùng `@CurrentUser()` và Route bị chặn 401.

---

👉 **Bài tiếp theo:** [Lesson 4.5: Rate Limiting — Giới Hạn Lượt Gọi API Với @nestjs/throttler](../lesson-4.5/lesson-4.5.md)
