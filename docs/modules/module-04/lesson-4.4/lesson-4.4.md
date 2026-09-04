# Lesson 4.4: Auth Decorators & Global Guard — Vận Dụng @CurrentUser() & @Public() Bảo Vệ Toàn Diện Hệ Thống

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-Auth_Decorators-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS Auth Decorators" />
  <img src="https://img.shields.io/badge/Reflector-Metadata-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="Reflector Metadata" />
  <img src="https://img.shields.io/badge/Security-Secure_by_Default-10B981?style=for-the-badge&logo=security&logoColor=white" alt="Secure by Default" />
  <img src="https://img.shields.io/badge/Global_Guard-APP_GUARD-F59E0B?style=for-the-badge&logo=json&logoColor=white" alt="Global Guard" />
  <img src="https://img.shields.io/badge/pnpm-Package_Manager-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
</p>

<p align="center">
  <img src="./assets/lesson_overview_banner.svg" alt="Lesson Overview Banner" width="100%" />
</p>

---

> [!NOTE]
> ⏱️ **Thời lượng dự kiến:** 12 – 15 phút  
> 🎯 **Mục tiêu bài học:** Vận dụng kỹ thuật Custom Decorators đã học từ **Lesson 3.5** để giải quyết bài toán cốt lõi trong hệ thống Authentication: loại bỏ hoàn toàn mùi code (Code Smell) `@Request() req: any` bằng Custom Param Decorator `@CurrentUser()`; áp dụng Route Decorator `@Public()` với `SetMetadata` kết hợp `Reflector` để tạo cơ chế bypass Global `JwtAuthGuard` cho các Route công khai; thiết lập kiến trúc bảo mật "Secure by Default" cho toàn bộ ứng dụng bằng token `APP_GUARD`.

---

## 1. Đặt Vấn Đề: Tối Ưu Hóa Trải Nghiệm Lập Trình & Bảo Mật Với Decorators

Trong **Lesson 4.2 & 4.3**, sau khi người dùng xác thực thành công qua JWT Token, `JwtStrategy` sẽ gán đối tượng payload vào `req.user`. Khi muốn lấy thông tin này ở Controller, chúng ta thường phải viết:

```typescript
// 🔴 MÙI CODE (CODE SMELL): Phải tiêm cả Request object và ép kiểu thủ công
@Get('profile')
getProfile(@Request() req: any) {
  const user = req.user;
  return user;
}
```

Cách làm trên bộc lộ 3 nhược điểm lớn:

1. **Lặp code (Boilerplate Code):** Mọi Handler cần thông tin người dùng đều phải tiêm `@Request() req: any`.
2. **Mất Type-Safety:** Việc dùng kiểu `any` làm mất tính năng autocomplete gợi ý code của TypeScript.
3. **Phụ thuộc vào Express Request Object:** Làm mã nguồn bị gắn chặt với tầng HTTP bên dưới.

Đồng thời, việc phải gắn `@UseGuards(JwtAuthGuard)` lên **từng Controller** rất dễ dẫn đến rủi ro: Lập trình viên quên gắn Guard ở một Controller mới tạo, vô tình biến API nhạy cảm thành công khai!

Vận dụng nền tảng **Custom Param Decorator** và **Metadata Decorator** đã học ở **Lesson 3.5**, chúng ta sẽ giải quyết triệt để 2 bài toán này:

- **`@CurrentUser()` (Custom Param Decorator):** Tự động trích xuất `req.user` từ `ExecutionContext` với đầy đủ Type-Safe.
- **`@Public()` (Custom Route Decorator):** Gán nhãn "Bỏ qua kiểm tra JWT" cho các Route công khai, cho phép biến `JwtAuthGuard` thành **Global Guard** bảo vệ mặc định toàn bộ ứng dụng (_Secure by Default_).

```mermaid
flowchart TD
    subgraph BadPractice ["🔴 CÁCH LÀM THỦ CÔNG (Code Smell & Rủi Ro)"]
        ReqAny["@Request() req: any"] --> ReadUser["const user = req.user"]
        ManualGuard["Quên gắn @UseGuards() trên Controller"] --> SecurityRisk["⚠️ Rò rỉ dữ liệu (Unprotected Route)"]
    end

    subgraph GoodPractice ["🟢 AUTH DECORATORS & GLOBAL GUARD (Clean & Secure)"]
        DecUser["@CurrentUser() user: JwtPayload"] --> CleanCode["Gọn gàng, Type-Safe 100%"]
        DecPublic["@Public() trên Route công khai"] --> GlobalProtection["🛡️ Mặc định bảo vệ 100% routes với APP_GUARD"]
    end
```

---

## 2. Luồng Hoạt Động Của Global JwtAuthGuard Khi Kết Hợp Với `@Public()` & `@CurrentUser()`

Khi biến `JwtAuthGuard` thành **Global Guard** (áp dụng cho TOÀN BỘ các API trong ứng dụng), luồng xử lý sẽ diễn ra như sau:

```mermaid
sequenceDiagram
    autonumber
    actor Client as 📱 HTTP Client
    participant Guard as 🛡️ Global JwtAuthGuard
    participant Reflector as 🔍 Reflector Metadata
    participant Controller as 📄 Controller Handler

    Client->>Guard: 1. Gửi HTTP Request tới Endpoint
    Guard->>Reflector: 2. Lấy metadata 'IS_PUBLIC_KEY' từ Route Handler / Class

    alt Route có gắn @Public()
        Reflector-->>Guard: isPublic = true
        Guard->>Controller: 🟢 3a. Cho phép đi tiếp (Bỏ qua verify Bearer Token)
    else Route KHÔNG có @Public() (Mặc định riêng tư)
        Reflector-->>Guard: isPublic = false / undefined
        Note over Guard: Verify Bearer Token trong Header Authorization
        alt Token KHÔNG hợp lệ / Thiếu Token
            Guard-->>Client: 🔴 3b. Trả về 401 Unauthorized Response
        else Token HỢP LỆ
            Guard->>Controller: 🟢 3c. Cho phép đi tiếp (Gắn user vào req.user)
            Note over Controller: Handler lấy user nhanh bằng @CurrentUser()
        end
    end
```

---

## 3. Hướng Dẫn Thực Hành Step-by-Step

### 📌 Bước 1: Triển Khai Custom Param Decorator `@CurrentUser()`

Tạo tệp `src/shared/decorators/current-user.decorator.ts` sử dụng hàm `createParamDecorator()`:

📄 **`src/shared/decorators/current-user.decorator.ts`**

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserData } from '../interfaces/auth.interface';

/**
 * Custom Param Decorator trích xuất thông tin User từ Request Object (do JwtStrategy gán vào)
 *
 * Cách sử dụng:
 * 1. Lấy toàn bộ đối tượng: getProfile(@CurrentUser() user: UserData)
 * 2. Lấy 1 trường cụ thể: getUserId(@CurrentUser('userId') userId: string)
 */
export const CurrentUser = createParamDecorator(
  (data: keyof UserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Express.Request>();
    const user = request.user as UserData;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
```

---

### 📌 Bước 2: Triển Khai Custom Route Decorator `@Public()`

Tạo tệp `src/shared/decorators/public.decorator.ts` sử dụng `SetMetadata()`:

📄 **`src/shared/decorators/public.decorator.ts`**

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'IS_PUBLIC_KEY';

/**
 * Custom Route Decorator đánh dấu Route Handler hoặc Controller là công khai (Public)
 * Giúp bypass quy trình kiểm tra Token của Global JwtAuthGuard
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

---

### 📌 Bước 3: Nâng Cấp `JwtAuthGuard` Kết Hợp `Reflector` Đọc Metadata

Mở tệp `src/auth/guards/jwt-auth.guard.ts` và tích hợp `Reflector` để kiểm tra cờ `IS_PUBLIC_KEY`:

📄 **`src/auth/guards/jwt-auth.guard.ts`**

```typescript
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../shared/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    // 1. Trích xuất cờ 'IS_PUBLIC_KEY' từ Route Handler hoặc Controller Class
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

Thay vì gắn `@UseGuards(JwtAuthGuard)` trên từng Controller thủ công, chúng ta đăng ký nó làm **Global Guard** với token `APP_GUARD` trong `AppModule`. Toàn bộ ứng dụng mặc định sẽ được bảo vệ:

📄 **`src/app.module.ts`**

```typescript
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './prisma/prisma.module';
import { envValidationSchema } from './config/env.validation';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { PrismaClientExceptionFilter } from './shared/filters/prisma-client-exception.filter';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: envValidationSchema,
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 🛡️ 1. Đăng ký JwtAuthGuard làm Global Guard cho TOÀN BỘ ứng dụng
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 2. Global Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // 3. Global Exception Filters
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude({ path: 'health', method: RequestMethod.GET })
      .forRoutes('*');
  }
}
```

---

### 📌 Bước 5: Áp Dụng Decorators Gọn Gàng Trong Controllers

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
import { Public } from '../shared/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() // 🔓 Route công khai: Người dùng chưa có tài khoản có thể Đăng ký
  @Version('1')
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public() // 🔓 Route công khai: Đăng nhập để lấy Access Token
  @Version('1')
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

#### 2. Áp dụng `@CurrentUser()` trong `UsersController`:

📄 **`src/users/users.controller.ts`**

```typescript
import { Controller, Get, Version } from '@nestjs/common';
import {
  CurrentUser,
  JwtPayload,
} from '../shared/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  // 🔒 Route này mặc định được bảo vệ bởi Global JwtAuthGuard
  @Version('1')
  @Get('profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    // ✨ Clean Code: Trích xuất user trực tiếp, không cần @Request() req: any
    return {
      message: 'Thông tin tài khoản xác thực từ Token',
      user,
    };
  }

  // 💡 Trích xuất trực tiếp một trường dữ liệu cụ thể:
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

Gửi yêu cầu Đăng nhập mà KHÔNG kèm Header Authorization:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alex@example.com", "password": "Password123!"}'
```

📥 **Phản hồi HTTP nhận được từ Server (`200 OK`):**

```json
{
  "statusCode": 200,
  "message": "Thao tác thực hiện thành công!",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2026-08-13T16:00:00.000Z",
  "path": "/api/v1/auth/login"
}
```

✅ **Kết quả:** Global Guard phát hiện decorator `@Public()`, tự động cho phép request đi qua mà không bắt lỗi 401!

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
  "message": "Thao tác thực hiện thành công!",
  "data": {
    "message": "Thông tin tài khoản xác thực từ Token",
    "user": {
      "userId": "clx890xyz123",
      "email": "alex@example.com"
    }
  },
  "timestamp": "2026-08-13T16:05:00.000Z",
  "path": "/api/v1/users/profile"
}
```

✅ **Kết quả:** `@CurrentUser()` trích xuất chính xác payload người dùng từ token và truyền trực tiếp vào Handler với đầy đủ gợi ý Type-Safety của TypeScript!

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
  "timestamp": "2026-08-13T16:10:00.000Z",
  "path": "/api/v1/users/profile"
}
```

✅ **Kết quả:** Mọi API trong hệ thống mặc định đều được bảo vệ an toàn bởi Global Guard trừ khi được gắn cờ `@Public()`.

---

## 5. Tổng Kết Bài Học & Checklist Ghi Nhớ

```mermaid
mindmap
  root(("Auth Decorators & Global Guard"))
    "Kiến Trúc Secure by Default"
      "Đăng ký JwtAuthGuard qua APP_GUARD"
      "Mặc định bảo vệ 100% Routes"
      "Loại bỏ rủi ro quên gắn Guard"
    "Custom Param Decorator"
      "createParamDecorator()"
      "@CurrentUser() lấy toàn bộ user"
      "@CurrentUser('userId') lấy 1 trường"
      "Loại bỏ @Request() req: any"
    "Custom Route Decorator"
      "SetMetadata(IS_PUBLIC_KEY, true)"
      "Reflector.getAllAndOverride()"
      "Bypass kiểm tra token cho Public APIs"
```

### ✅ Checklist Ghi Nhớ Bài Học:

- [x] Hiểu rõ lợi ích của kiến trúc "Secure by Default" khi đăng ký Global Guard qua `APP_GUARD`.
- [x] Vận dụng kỹ thuật `createParamDecorator` (từ Lesson 3.5) để tạo `@CurrentUser()`.
- [x] Hỗ trợ trích xuất toàn bộ object hoặc 1 thuộc tính cụ thể với `@CurrentUser('userId')`.
- [x] Vận dụng kỹ thuật `SetMetadata` (từ Lesson 3.5) để tạo `@Public()`.
- [x] Nâng cấp `JwtAuthGuard` tích hợp `Reflector` để đọc cờ `IS_PUBLIC_KEY`.
- [x] Đăng ký `JwtAuthGuard` làm Global Guard trong `AppModule` bằng token `APP_GUARD`.
- [x] Thử nghiệm cURL thành công cho cả Route Public, Route Protected dùng `@CurrentUser()` và Route bị chặn 401.

---

👉 **Bài tiếp theo:** [Lesson 4.5: Rate Limiting — Giới Hạn Lượt Gọi API Với @nestjs/throttler](../lesson-4.5/lesson-4.5.md)
