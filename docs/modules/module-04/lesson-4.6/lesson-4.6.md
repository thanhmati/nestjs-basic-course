# Lesson 4.6: Auth Decorators & Global Guard — Vận Dụng @CurrentUser() & @Public() Bảo Vệ Toàn Diện Hệ Thống

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-Auth_Decorators-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS Auth Decorators" />
  <img src="https://img.shields.io/badge/Reflector-Metadata-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="Reflector Metadata" />
  <img src="https://img.shields.io/badge/Security-Secure_by_Default-10B981?style=for-the-badge&logo=security&logoColor=white" alt="Secure by Default" />
  <img src="https://img.shields.io/badge/Global_Guard-APP_GUARD-F59E0B?style=for-the-badge&logo=json&logoColor=white" alt="Global Guard" />
  <img src="https://img.shields.io/badge/TypeScript-Type_Safe-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/pnpm-Package_Manager-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
</p>

<p align="center">
  <img src="./assets/lesson_overview_banner.svg" alt="Lesson Overview Banner" width="100%" />
</p>

---

> [!NOTE]
> ⏱️ **Thời lượng dự kiến:** 12 – 15 phút  
> 🎯 **Mục tiêu bài học:** Vận dụng kỹ thuật Custom Decorators đã học từ **Lesson 3.5** để giải quyết triệt để 2 bài toán cốt lõi trong hệ thống Authentication:
>
> 1. Loại bỏ hoàn toàn mùi code (Code Smell) `@Req() req: Request` bằng Custom Param Decorator `@CurrentUser()` hỗ trợ trích xuất dữ liệu Type-Safe 100%.
> 2. Đánh dấu các Route công khai với Custom Route Decorator `@Public()` kết hợp `Reflector`.
> 3. Thiết lập kiến trúc bảo mật **"Secure by Default"** cho toàn bộ ứng dụng bằng token `APP_GUARD`, khóa mặc định mọi API nhạy cảm và chỉ mở cửa cho các Route được chỉ định.

---

## 1. Đặt Vấn Đề: 2 "Cơn Ác Mộng" Trong Hệ Thống Authentication & Giải Pháp

Sau khi hoàn thành xác thực bằng JWT (Lesson 4.4) và Google OAuth2 (Lesson 4.5), hệ thống backend của chúng ta đã có thể nhận diện người dùng. Tuy nhiên, khi đưa vào dự án thực tế với hàng chục Controllers, bạn sẽ lập tức đối mặt với **2 vấn đề nghiêm trọng**:

### 🔴 Vấn Đề 1: Mùi Code (Code Smell) Khi Lấy Thông Tin Người Dùng

Mỗi khi một Controller Handler cần thông tin của người dùng đang đăng nhập (ví dụ: `userId`, `email`), cách viết thông thường là tiêm toàn bộ đối tượng Request của Express:

```typescript
// ❌ MÙI CODE (CODE SMELL): Phải tiêm cả Request object và ép kiểu thủ công
@Get('profile')
getProfile(@Req() req: Request) {
  const user = req['user'] as UserData;
  return user;
}
```

<p align="center">
  <img src="./assets/current_user_code_smell_vs_clean_mockup.jpg" alt="Legacy Code Smell vs Clean Type Safe Decorator" width="85%" />
</p>

| Tiêu Chí So Sánh              | Cách Làm Cũ (`@Req() req: Request`)                         | Giải Pháp `@CurrentUser()`                                         |
| :---------------------------- | :---------------------------------------------------------- | :----------------------------------------------------------------- |
| **Độ gọn gàng (Cleanliness)** | Cồng kềnh, phải tiêm cả đối tượng HTTP Request đồ sộ.       | Gọn gàng, chỉ trích xuất đúng đối tượng User hoặc trường cần lấy.  |
| **Type-Safety**               | Phải tự ép kiểu thủ công (`as UserData`), dễ sai lệch.      | Tự động có gợi ý code (IntelliSense) từ TypeScript.                |
| **Tính độc lập tầng HTTP**    | Gắn chặt mã nguồn với tầng HTTP nền tảng (Express/Fastify). | Trừu tượng hóa hoàn toàn thông qua NestJS `ExecutionContext`.      |
| **Khả năng Unit Testing**     | Phải tạo mock phức tạp cho toàn bộ đối tượng `Request`.     | Chỉ cần truyền trực tiếp object `user` giả lập vào hàm Controller. |

---

### 🔴 Vấn Đề 2: Lỗ Hổng "Lập Trình Viên Hay Quên" (The Forgetful Developer Risk)

Nếu chúng ta tiếp tục dùng cách bảo vệ thủ công bằng cách gắn `@UseGuards(JwtAuthGuard)` trên từng Controller hoặc từng Route:

- Dự án có 50 Controllers ➔ Bạn phải nhớ gõ `@UseGuards(JwtAuthGuard)` đúng 50 lần.
- **Rủi ro chí mạng:** Trong môi trường teamwork, một lập trình viên mới tạo thêm `BillingController` hoặc `UserSettingsController` nhưng **quên gắn Guard**. Kết quả là các API nhạy cảm đó lập tức bị phơi bày ra ngoài Internet mà không ai hay biết!

> [!CAUTION]
> **Triết Lý "Secure by Default" (Bảo Mật Mặc Định):**  
> Một hệ thống phần mềm chuyên nghiệp luôn phải tuân thủ nguyên tắc **"Mặc định KHÓA TOÀN BỘ"**. Tất cả các Route sinh ra trong hệ thống đều phải được tự động bảo vệ bởi `JwtAuthGuard`. Chỉ những Route nào được gắn cờ công khai rõ ràng bằng `@Public()` (như `/auth/login`, `/auth/register`, `/health`) mới được phép bỏ qua xác thực token.

---

## 2. Kiến Trúc "Secure by Default" & Cơ Chế Metadata Với Reflector

Để hiện thực hóa triết lý "Secure by Default", chúng ta kết hợp 3 thành phần cốt lõi của NestJS:

1. **`APP_GUARD` (Global Guard):** Đăng ký `JwtAuthGuard` ở cấp độ toàn cục thông qua NestJS Dependency Injection. Mọi HTTP Request khi đi vào ứng dụng đều phải đi qua cánh cổng này trước tiên.
2. **`@Public()` (Custom Route Decorator):** Sử dụng `SetMetadata()` để gán một nhãn đánh dấu `IS_PUBLIC_KEY = true` lên các Route không cần đăng nhập.
3. **`Reflector`:** Công cụ của NestJS giúp Guard đọc lại nhãn metadata từ Route Handler hoặc Controller Class để quyết định mở luồng xanh hay bắt buộc kiểm tra JWT Token.

<p align="center">
  <img src="./assets/auth_decorators_architecture_mockup.jpg" alt="Secure by Default Architecture Mockup" width="85%" />
</p>

### 🔄 Luồng Xử Lý Request Chi Tiết (Sequence Flow):

```mermaid
sequenceDiagram
    autonumber
    actor Client as "📱 HTTP Client"
    participant Guard as "🛡️ Global JwtAuthGuard"
    participant Reflector as "🔍 Reflector (Metadata Reader)"
    participant Controller as "📄 Controller Handler"

    Client->>Guard: "1. Gửi HTTP Request tới Endpoint"
    Guard->>Reflector: "2. Đọc metadata 'IS_PUBLIC_KEY' từ Handler & Class"

    alt "Route có gắn nhãn @Public() (Ví dụ: /auth/login)"
        Reflector-->>Guard: "isPublic = true"
        Guard->>Controller: "🟢 Cho phép đi tiếp ngay (Bypass verify Token)"
    else "Route KHÔNG gắn @Public() (Mặc định riêng tư, ví dụ: /users/profile)"
        Reflector-->>Guard: "isPublic = false / undefined"
        Note over Guard: "Kích hoạt super.canActivate(context) của Passport"
        alt "Token hợp lệ"
            Guard->>Controller: "🟢 Cho phép truy cập (Tự gán user vào req.user)"
            Note over Controller: "Handler lấy dữ liệu nhanh qua @CurrentUser()"
        else "Thiếu token hoặc Token hết hạn"
            Guard-->>Client: "🔴 Chặn đứng với 401 Unauthorized Response"
        end
    end
```

---

## 3. Hướng Dẫn Thực Hành Step-by-Step

### 📌 Bước 1: Khai Báo Khóa Metadata Trong `metadata.constant.ts`

Tuân thủ kiến trúc đã thiết lập ở Module 3 (cùng với `RESPONSE_MESSAGE_KEY` và `BYPASS_TRANSFORM_KEY`), chúng ta bổ sung khóa `IS_PUBLIC_KEY` vào tệp hằng số chung:

📄 **`src/shared/constants/metadata.constant.ts`**

```typescript
export const RESPONSE_MESSAGE_KEY = 'RESPONSE_MESSAGE_KEY';
export const BYPASS_TRANSFORM_KEY = 'BYPASS_TRANSFORM_KEY';
export const IS_PUBLIC_KEY = 'IS_PUBLIC_KEY';
```

---

### 📌 Bước 2: Triển Khai Custom Route Decorator `@Public()`

Tạo tệp `src/shared/decorators/public.decorator.ts` sử dụng hàm `SetMetadata()` kết hợp khóa vừa khai báo:

📄 **`src/shared/decorators/public.decorator.ts`**

```typescript
import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../constants/metadata.constant';

/**
 * Custom Route Decorator đánh dấu Route Handler hoặc Controller là công khai (Public)
 * Giúp bypass quy trình kiểm tra Token của Global JwtAuthGuard
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

---

### 📌 Bước 3: Triển Khai Custom Param Decorator `@CurrentUser()`

Tạo tệp `src/shared/decorators/current-user.decorator.ts` sử dụng `createParamDecorator()` của NestJS, kết nối trực tiếp với kiểu dữ liệu `UserData` từ `src/auth/interfaces/jwt.interface.ts`:

📄 **`src/shared/decorators/current-user.decorator.ts`**

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserData } from '@/auth/interfaces/jwt.interface';
import { Request } from 'express';

/**
 * Custom Param Decorator trích xuất dữ liệu người dùng từ Request Object (do JwtStrategy gán vào)
 *
 * Cách sử dụng linh hoạt:
 * 1. Lấy toàn bộ UserData: @CurrentUser() user: UserData
 * 2. Lấy 1 trường cụ thể:  @CurrentUser('userId') userId: number
 *                         @CurrentUser('email') email: string
 */
export const CurrentUser = createParamDecorator(
  (data: keyof UserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request['user'] as UserData;

    // Nếu không có thông tin user (ví dụ gọi ở route public), trả về null
    if (!user) {
      return null;
    }

    // Nếu truyền tên trường (data), chỉ trả về giá trị trường đó; ngược lại trả về toàn bộ user
    return data ? user[data] : user;
  },
);
```

> [!TIP]
> Nhờ khai báo `data: keyof UserData | undefined`, TypeScript sẽ tự động gợi ý chính xác các thuộc tính có trong `UserData` (`'userId' | 'email'`). Nếu bạn gõ `@CurrentUser('invalidField')`, trình biên dịch sẽ báo lỗi ngay lập tức!

---

### 📌 Bước 4: Nâng Cấp `JwtAuthGuard` Tích Hợp `Reflector`

Mở tệp `src/auth/guards/jwt-auth.guard.ts`. Chúng ta giữ nguyên logic xử lý lỗi chi tiết (`TokenExpiredError`, `JsonWebTokenError`) đã xây dựng từ Lesson 4.4, và bổ sung `Reflector` để kiểm tra cờ `IS_PUBLIC_KEY`:

📄 **`src/auth/guards/jwt-auth.guard.ts`**

```typescript
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '@/shared/constants/metadata.constant';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    // 1. Kiểm tra xem Route Handler hoặc Class Controller có được gắn @Public() không
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // Ưu tiên kiểm tra method handler trước
      context.getClass(), // Nếu method không có, kiểm tra class controller
    ]);

    // 2. Nếu là Route công khai -> Cho phép đi qua ngay mà không cần Token
    if (isPublic) {
      return true;
    }

    // 3. Nếu là Route riêng tư -> Kích hoạt cơ chế xác thực JWT chuẩn của Passport
    return super.canActivate(context);
  }

  override handleRequest<TUser = any>(
    err: unknown,
    user: TUser | false | null | undefined,
    info: unknown,
  ): TUser {
    if (err || !user) {
      if (info instanceof Error && info.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!',
        );
      }

      if (info instanceof Error && info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Mã xác thực (Token) không hợp lệ!');
      }

      if (err instanceof Error) {
        throw err;
      }

      throw new UnauthorizedException(
        'Bạn cần đăng nhập (gửi kèm Bearer Token) để truy cập tài nguyên này!',
      );
    }

    return user;
  }
}
```

> [!IMPORTANT]
> **Phương thức `reflector.getAllAndOverride()`:**  
> Ta truyền vào mảng `[context.getHandler(), context.getClass()]`. NestJS sẽ ưu tiên đọc metadata ở cấp độ hàm (Handler) trước. Nếu ở hàm có khai báo, nó sẽ ghi đè (override) cấu hình ở cấp độ Class Controller. Điều này giúp bạn có thể linh hoạt gắn `@Public()` cho 1 Route duy nhất trong một Controller riêng tư, hoặc gắn `@Public()` cho cả Controller.

---

### 📌 Bước 5: Đăng Ký `JwtAuthGuard` Làm Global Guard Trong `AppModule`

Thay vì gắn `@UseGuards(JwtAuthGuard)` thủ công trên từng Controller, chúng ta đăng ký nó làm **Global Guard** bằng token `APP_GUARD` trong `AppModule`:

📄 **`src/app.module.ts`**

```typescript
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { SharedServiceModule } from './shared/services/shared-service.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaClientExceptionFilter } from './shared/filters/prisma-client-exception.filter';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: envValidationSchema,
      isGlobal: true,
    }),
    PrismaModule,
    SharedServiceModule,
    UsersModule,
    PostsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 🛡️ ĐĂNG KÝ GLOBAL GUARD: Bảo vệ mặc định 100% routes trong toàn bộ ứng dụng
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Filters & Interceptors
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude({
        path: 'health',
        method: RequestMethod.GET,
      })
      .forRoutes('{*path}');
  }
}
```

> [!TIP]
> **Tại sao dùng `APP_GUARD` trong `AppModule` thay vì `app.useGlobalGuards()` trong `main.ts`?**  
> Khi gọi `app.useGlobalGuards(new JwtAuthGuard(...))` ở `main.ts`, Guard nằm ngoài vùng kiểm soát của NestJS Dependency Injection, bạn sẽ không thể tự động inject `Reflector` hay các Service khác vào Guard. Dùng `APP_GUARD` giúp Guard trở thành một phần của DI Container, tận dụng trọn vẹn khả năng inject dependencies!

---

### 📌 Bước 6: Áp Dụng Thực Chiến Trong Controllers

#### 1. Áp Dụng `@Public()` Trong `AuthController`:

Tất cả các API đăng ký, đăng nhập và Google OAuth cần mở công khai cho người dùng chưa đăng nhập. Bạn có thể gắn `@Public()` lên từng route hoặc gắn trực tiếp ở cấp Controller:

📄 **`src/auth/auth.controller.ts`**

```typescript
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ResponseMessage } from '@/shared/decorators/response-message.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GoogleUser } from './interfaces/google-user.interface';
import { Public } from '@/shared/decorators/public.decorator';

@Public() // 🔓 Gắn cấp Class: Toàn bộ routes trong AuthController đều là Public
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ResponseMessage('Đăng ký tài khoản thành công!')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Đăng nhập thành công!')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request) {
    const googleUser = req['user'] as GoogleUser;
    return this.authService.socialLogin(googleUser);
  }
}
```

---

#### 2. Áp Dụng `@CurrentUser()` Trong `UsersController`:

Trong `UsersController`, chúng ta **xóa bỏ hoàn toàn** `@UseGuards(JwtAuthGuard)` vì Global Guard đã tự động bảo vệ route này. Đồng thời thay thế `@Req() req: Request` bằng `@CurrentUser()`:

📄 **`src/users/users.controller.ts`**

```typescript
import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { UserData } from '@/auth/interfaces/jwt.interface';

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

  // 🔒 Route này mặc định được bảo vệ bởi Global Guard (không cần @UseGuards)
  @Get('profile')
  getProfile(@CurrentUser() user: UserData) {
    // ✨ Clean Code: Trích xuất user trực tiếp, an toàn và đầy đủ gợi ý kiểu dữ liệu
    return {
      message: 'Lấy thông tin tài khoản thành công qua @CurrentUser()',
      user,
    };
  }

  // 💡 Trích xuất trực tiếp một trường dữ liệu cụ thể (userId có kiểu number)
  @Get('my-id')
  getMyId(@CurrentUser('userId') userId: number) {
    return { myUserId: userId };
  }
}
```

---

## 4. Kịch Bản Kiểm Tra & Thử Nghiệm (Hands-on Lab)

### 🟢 Kịch Bản 1: Kiểm Thử Route Public (`@Public()`) KHÔNG Cần Gửi Token

Thực hiện gọi API đăng nhập mà không truyền bất kỳ Bearer Token nào:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alex@example.com", "password": "Password123!"}'
```

📥 **Phản hồi nhận được (`200 OK`) qua `TransformInterceptor`:**

```json
{
  "statusCode": 200,
  "message": "Đăng nhập thành công!",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWxleEBleGFtcGxlLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzg5..."
  },
  "timestamp": "2026-09-22T11:10:00.000Z",
  "path": "/api/v1/auth/login"
}
```

✅ **Kết quả:** Global Guard đọc thấy metadata `@Public()`, tự động cho phép request đi qua mà không báo lỗi 401!

---

### 🟢 Kịch Bản 2: Kiểm Thử Route Protected Sử Dụng `@CurrentUser()`

Gửi yêu cầu tới Endpoint `/api/v1/users/profile` kèm Bearer Token hợp lệ vừa lấy được:

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

📥 **Phản hồi nhận được (`200 OK`):**

```json
{
  "statusCode": 200,
  "message": "Thao tác thực hiện thành công",
  "data": {
    "message": "Lấy thông tin tài khoản thành công qua @CurrentUser()",
    "user": {
      "userId": 1,
      "email": "alex@example.com"
    }
  },
  "timestamp": "2026-09-22T11:12:00.000Z",
  "path": "/api/v1/users/profile"
}
```

✅ **Kết quả:** `@CurrentUser()` trích xuất chính xác payload người dùng và truyền trực tiếp vào Handler mà không cần gọi `req['user']`!

---

### 🔴 Kịch Bản 3: Kiểm Thử Route Protected Nhưng KHÔNG Gửi Token (Bị Chặn)

Thử gọi API Profile nhưng không gửi kèm Token trong Header:

```bash
curl -X GET http://localhost:3000/api/v1/users/profile
```

📥 **Phản hồi nhận được (`401 Unauthorized`) qua `HttpExceptionFilter`:**

```json
{
  "statusCode": 401,
  "message": "Bạn cần đăng nhập (gửi kèm Bearer Token) để truy cập tài nguyên này!",
  "error": "Unauthorized",
  "timestamp": "2026-09-22T11:15:00.000Z",
  "path": "/api/v1/users/profile"
}
```

✅ **Kết quả:** Kiến trúc "Secure by Default" hoạt động hoàn hảo! Bất kỳ Route nào không có `@Public()` đều tự động được khóa chặt.

---

## 5. Tổng Kết Bài Học & Checklist Ghi Nhớ

```mermaid
mindmap
  root(("Auth Decorators & Global Guard"))
    "Kiến Trúc Secure by Default"
      "Đăng ký JwtAuthGuard bằng APP_GUARD"
      "Mặc định bảo vệ 100% routes"
      "Triệt tiêu rủi ro quên gắn Guard"
    "Custom Param Decorator"
      "@CurrentUser() trích xuất req.user"
      "@CurrentUser('userId') lấy 1 trường"
      "Loại bỏ mùi code @Req() req: Request"
      "Type-Safe 100% với UserData"
    "Custom Route Decorator"
      "@Public() gắn nhãn IS_PUBLIC_KEY"
      "Reflector.getAllAndOverride()"
      "Mở luồng xanh cho Login, Register, Google"
```

### ✅ Checklist Ghi Nhớ Bài Học:

- [x] Hiểu sâu triết lý kiến trúc **"Secure by Default"** và vì sao nên ưu tiên khóa mặc định toàn bộ API.
- [x] Nắm rõ cơ chế hoạt động của token **`APP_GUARD`** trong `AppModule` kết hợp NestJS Dependency Injection.
- [x] Tự tay xây dựng Custom Param Decorator **`@CurrentUser()`** hỗ trợ trích xuất toàn bộ user hoặc từng thuộc tính cụ thể với gợi ý kiểu dữ liệu TypeScript.
- [x] Tự tay xây dựng Custom Route Decorator **`@Public()`** sử dụng `SetMetadata`.
- [x] Nâng cấp `JwtAuthGuard` sử dụng **`Reflector.getAllAndOverride()`** để kiểm tra metadata ở cả cấp độ Handler và Controller Class.
- [x] Thực hành cấu hình `@Public()` cho `AuthController` và `@CurrentUser()` cho `UsersController`.
- [x] Kiểm thử cURL thành công cả 3 kịch bản: Route Public (200 OK), Route Protected có token (200 OK), và Route Protected không token (401 Unauthorized).

---

👉 **Bài tiếp theo:** [Lesson 4.7: Rate Limiting — Giới Hạn Lượt Gọi API Với @nestjs/throttler](../lesson-4.7/lesson-4.7.md)
