# Lesson 4.2: JWT Auth — Đăng Ký, Đăng Nhập & Cấp Phát Access Token Trong NestJS

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-JWT_Authentication-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS JWT" />
  <img src="https://img.shields.io/badge/JSON_Web_Token-v9.0-3178C6?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Passport-Strategy-10B981?style=for-the-badge&logo=passport&logoColor=white" alt="Passport" />
  <img src="https://img.shields.io/badge/Stateless-Access_Token-F59E0B?style=for-the-badge&logo=security&logoColor=white" alt="Stateless" />
  <img src="https://img.shields.io/badge/pnpm-Package_Manager-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
</p>

<p align="center">
  <img src="./assets/lesson_overview_banner.svg" alt="Lesson Overview Banner" width="100%" />
</p>

---

> [!NOTE]
> ⏱️ **Thời lượng:** 12 – 15 phút thực chiến  
> 🎯 **Mục tiêu cốt lõi:**
>
> 1. Hiểu bản chất vì sao RESTful API bắt buộc phải dùng Token thay vì Session hay gửi Password liên tục.
> 2. Giải mã cấu trúc 3 phần của JWT: **Header – Payload – Signature**.
> 3. Cấu hình `@nestjs/jwt` kết hợp `ConfigService` và tái sử dụng `HashService` từ `SharedServiceModule`.
> 4. Xây dựng hoàn chỉnh luồng Đăng ký / Đăng nhập và thực nghiệm kiểm tra Token trên **jwt.io**.

---

## 1. Bản Chất Xác Thực: Tại Sao REST API Chọn JWT?

### ❓ Câu Hỏi Lớn: "Sau khi đăng nhập, Server nhận diện bạn bằng cách nào?"

Giao thức HTTP vốn dĩ **Stateless (Mất trí nhớ giữa các request)**. Mỗi khi bạn gọi một API mới (đăng bài, sửa profile), Server không tự nhớ bạn là ai!

- ❌ **Cách ngây thơ 1:** Gửi `email & password` trong mọi request? ➔ **Thảm họa:** Mật khẩu dễ lộ qua mạng, và thuật toán `bcrypt` ngốn ~70ms CPU/request sẽ đánh sập máy chủ khi có đông người dùng!
- ❌ **Cách ngây thơ 2:** Chỉ gửi `userId: 1`? ➔ **Thảm họa:** Hacker đổi số `1` thành số `2` (Admin) là chiếm sạch dữ liệu người khác!

👉 **Giải pháp:** Sau khi đăng nhập thành công, Server trao cho Client một **"Chứng chỉ danh tính"**.

### ⚖️ So Sánh Kiến Trúc: Session-Based (Stateful) vs JWT Token-Based (Stateless)

<p align="center">
  <img src="./assets/session_vs_jwt_architecture.jpg" alt="Session vs JWT Architecture Comparison" width="100%" />
</p>

| Tiêu chí kỹ thuật        | 🔴 Session-Based (Stateful)                            | 🟢 JWT Token-Based (Stateless)                                      |
| :----------------------- | :----------------------------------------------------- | :------------------------------------------------------------------ |
| **Nơi lưu trữ dữ liệu**  | **Server-side:** Server lưu session trong RAM / Redis. | **Client-side:** Dữ liệu user đóng gói trực tiếp trong Token.       |
| **Xác thực mỗi Request** | Phải gọi I/O truy vấn tìm session trong Redis/DB.      | Tự kiểm tra Chữ ký số bằng toán học (~0.01ms, không chạm DB).       |
| **Mở rộng cụm (Scale)**  | Phức tạp, bắt buộc cấu hình Redis Cluster để đồng bộ.  | **Scale ngang tự do**, bất kỳ server nào cũng tự verify độc lập.    |
| **Môi trường ứng dụng**  | Gò bó bởi Cookie trình duyệt Web.                      | Chuẩn Header `Bearer Token`, tối ưu cho Mobile App & Microservices. |

---

### 📱 Giải Phẫu 3 Phần Của JWT: Header • Payload • Signature

Một chuỗi JWT gồm 3 phần phân cách bằng dấu chấm: `Header.Payload.Signature`

<p align="center">
  <img src="./assets/jwt_auth_ui_mockup.jpg" alt="JWT Token Inspector & Login UI Mockup" width="95%" />
</p>

```text
  eyJhbGciOiJIUzI1Ni... . eyJzdWIiOjEsImVtYWls... . SflKxwRJSMeKKF2QT4fwpMeJf...
  └───────────────────┘   └──────────────────────┘   └───────────────────────────┘
            │                        │                             │
     1. HEADER (Đỏ)           2. PAYLOAD (Tím)              3. SIGNATURE (Cyan)
```

1. 🔴 **Header:** Khai báo loại token và thuật toán ký (thường là `HS256`).
2. 🟣 **Payload (Claims):** Dữ liệu công khai của người dùng (`sub`: User ID, `email`, `role`, `exp`: Hạn dùng).
3. 🔵 **Signature (Chữ ký số):** Con dấu bảo an được tính bằng công thức:
   $$\text{Signature} = \text{HMACSHA256}(\text{Base64}(Header) + "." + \text{Base64}(Payload),\ \text{JWT\_SECRET})$$

> [!CAUTION]
> **Điểm mấu chốt cần nhớ:**
>
> - Payload chỉ được mã hóa **Base64URL** (bất kỳ ai cũng đọc được trên jwt.io). **Tuyệt đối không lưu mật khẩu thô vào Payload!**
> - **Tại sao hacker không sửa được dữ liệu?** Nếu hacker đổi `role: "USER"` thành `role: "ADMIN"`, chữ ký số tính lại sẽ lệch với con dấu cũ ➔ Server từ chối ngay lập tức!

---

## 2. Quy Trình Đăng Nhập & Cấp Phát Token (Auth Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Client as "📱 Client (App / Postman)"
    participant Ctrl as "📄 AuthController"
    participant AuthSvc as "⚡ AuthService"
    participant HashSvc as "🔐 HashService"
    participant JwtSvc as "🔑 JwtService"

    Client->>Ctrl: "POST /api/v1/auth/login { email, password }"
    Ctrl->>AuthSvc: "login(loginDto)"
    AuthSvc->>HashSvc: "comparePassword(password, dbPassword)"

    alt Mật khẩu KHÔNG KHỚP
        HashSvc-->>AuthSvc: false
        AuthSvc-->>Client: "🔴 401 Unauthorized"
    else Mật khẩu KHỚP
        HashSvc-->>AuthSvc: true
        AuthSvc->>JwtSvc: "signAsync({ sub, email, role })"
        JwtSvc-->>AuthSvc: "Chuỗi signed JWT accessToken"
        AuthSvc-->>Client: "🟢 200 OK { user, accessToken }"
    end
```

---

## 3. Hướng Dẫn Thực Hành Step-by-Step

### 📂 Cấu Trúc File Triển Khai

```
src/
├── auth/
│   ├── dto/
│   │   ├── register.dto.ts          👈 DTO validation đăng ký
│   │   └── login.dto.ts             👈 DTO validation đăng nhập
│   ├── auth.controller.ts           👈 API endpoints /auth/register & /login
│   ├── auth.service.ts              👈 Nghiệp vụ băm pass & ký phát JWT
│   └── auth.module.ts               👈 JwtModule.registerAsync() với ConfigService
├── shared/services/
│   ├── hash.service.ts              👈 HashService tái sử dụng (Lesson 4.1)
│   └── shared-service.module.ts     👈 @Global() module
└── app.module.ts                    👈 Đăng ký AuthModule vào root
```

---

### 📌 Bước 0: Cài Đặt Thư Viện

```bash
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt
pnpm add -D @types/passport-jwt
```

---

### 📌 Bước 1: Khai Báo Biến Môi Trường JWT

📄 **`.env`**

```env
JWT_SECRET="nestjs_basic_course_super_secret_jwt_key_2026"
JWT_EXPIRES_IN="1d"
```

Cập nhật schema xác thực trong 📄 **`src/config/env.validation.ts`**:

```typescript
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'preprod', 'prod')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  GLOBAL_PREFIX: Joi.string().default('api'),
  VERSION_API: Joi.string().default('1'),
  VERSION_PREFIX: Joi.string().default('v'),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
});
```

---

### 📌 Bước 2: Tạo DTOs Cho Đăng Ký & Đăng Nhập

📄 **`src/auth/dto/register.dto.ts`**

```typescript
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  @IsNotEmpty({ message: 'Email không được để trống!' })
  email: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự!' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống!' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự!' })
  password: string;

  @IsOptional()
  @IsString({ message: 'Họ tên phải là chuỗi ký tự!' })
  name?: string;
}
```

📄 **`src/auth/dto/login.dto.ts`**

```typescript
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  @IsNotEmpty({ message: 'Email không được để trống!' })
  email: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự!' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống!' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự!' })
  password: string;
}
```

---

### 📌 Bước 3: Cấu Hình `AuthModule` Với `JwtModule.registerAsync()`

📄 **`src/auth/auth.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    // Nạp JWT_SECRET và JWT_EXPIRES_IN bất đồng bộ từ ConfigService
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
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

> [!TIP]
> Nhờ `SharedServiceModule` đã gắn `@Global()` tại `AppModule`, `AuthModule` có thể tiêm trực tiếp `HashService` mà **không cần import lại**.

---

### 📌 Bước 4: Triển Khai `AuthService`

📄 **`src/auth/auth.service.ts`**

```typescript
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { HashService } from '@/shared/services/hash.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Đăng ký tài khoản & phát hành Access Token
   */
  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // 1. Kiểm tra email duy nhất
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email này đã được sử dụng!');
    }

    // 2. Băm mật khẩu bằng HashService
    const hashedPassword = await this.hashService.hashPassword(password);

    // 3. Tạo User trong CSDL (loại bỏ trường password)
    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword, name },
      omit: { password: true },
    });

    // 4. Phát hành Token
    const accessToken = await this.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );

    return { user, accessToken };
  }

  /**
   * Đăng nhập hệ thống & kiểm tra mật khẩu
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Tìm user theo email
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }

    // 2. So khớp mật khẩu với HashService
    const isPasswordValid = await this.hashService.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }

    // 3. Phát hành Token & ẩn password
    const accessToken = await this.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken };
  }

  /**
   * Helper ký JWT Access Token
   */
  private async generateAccessToken(
    userId: number,
    email: string,
    role: string,
  ) {
    const payload = { sub: userId, email, role };
    return this.jwtService.signAsync(payload);
  }
}
```

---

### 📌 Bước 5: Triển Khai `AuthController`

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
import { ResponseMessage } from '@/shared/decorators/response-message.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Version('1')
  @Post('register')
  @ResponseMessage('Đăng ký tài khoản thành công!')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Version('1')
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Đăng nhập thành công!')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

---

### 📌 Bước 6: Đăng Ký `AuthModule` Vào `AppModule`

📄 **`src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './prisma/prisma.module';
import { SharedServiceModule } from './shared/services/shared-service.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    SharedServiceModule,
    AuthModule, // 👈 Khai báo AuthModule
    UsersModule,
    PostsModule,
  ],
})
export class AppModule {}
```

---

## 4. Kịch Bản Kiểm Tra & Thực Nghiệm (Hands-on Lab)

Khởi động server:

```bash
pnpm start:dev
```

---

### 🟢 Kịch Bản 1: Đăng Ký & Nhận JWT Access Token

```bash
curl -i -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "Password123!",
    "name": "Dev Hero"
  }'
```

📥 **Phản hồi từ Server (`201 Created`):**

```json
{
  "statusCode": 201,
  "message": "Đăng ký tài khoản thành công!",
  "data": {
    "user": {
      "id": 1,
      "email": "dev@example.com",
      "name": "Dev Hero",
      "role": "USER",
      "createdAt": "2026-09-20T00:15:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiZGV2QGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NzAwMDAwMDAsImV4cCI6MTc3MDA4NjQwMH0.X9J2..."
  }
}
```

---

### 🟢 Kịch Bản 2: Đăng Nhập & Khám Phá Bí Mật Trên jwt.io

```bash
curl -i -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "Password123!"
  }'
```

🔍 **Thực nghiệm ngay trên [jwt.io](https://jwt.io):**

1. Copy chuỗi `accessToken` nhận được và dán vào ô **Debugger** trên trang web.
2. Bạn sẽ thấy Payload được giải mã tức thì:
   ```json
   {
     "sub": 1,
     "email": "dev@example.com",
     "role": "USER",
     "iat": 1770000000,
     "exp": 1770086400
   }
   ```
3. Phía dưới hiển thị: **`Signature Verified`** (Con dấu hợp lệ!).
4. 🧪 **Thử nghiệm nghịch ngợm:** Thử sửa `sub: 1` thành `sub: 2` trong ô Payload. Chữ ký lập tức chuyển sang màu đỏ: **`Invalid Signature`**! Điều này chứng minh không ai có thể làm giả Token nếu không có `JWT_SECRET`.

---

### 🔴 Kịch Bản 3: Đăng Nhập Sai Mật Khẩu (`401 Unauthorized`)

```bash
curl -i -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "dev@example.com", "password": "WrongPassword!" }'
```

📥 **Phản hồi lỗi (`401 Unauthorized`):**

```json
{
  "statusCode": 401,
  "message": "Email hoặc mật khẩu không chính xác!",
  "error": "Unauthorized"
}
```

---

## 5. Tổng Kết Bài Học & Checklist Ghi Nhớ

```mermaid
mindmap
  root(("NestJS JWT Authentication"))
    "Bản Chất & Nhu Cầu"
      "HTTP Stateless: Không lưu trạng thái giữa các request"
      "Stateful Session: Tốn RAM và khó scale cụm"
      "Stateless JWT: Token tự chứa thông tin và verify offline"
    "Cấu Trúc Token"
      "Header: Thuật toán HS256"
      "Payload: Dữ liệu user (sub, email, role)"
      "Signature: Chữ ký số HMAC-SHA256"
    "Cấu Hình NestJS"
      "JwtModule.registerAsync() nạp từ ConfigService"
      "Inject HashService từ SharedServiceModule"
    "Luồng Nghiệp Vụ"
      "register(): Băm pass -> Tạo user -> Ký Token"
      "login(): So khớp bcrypt -> Ký Token"
```

### ✅ Checklist Ghi Nhớ:

- [x] Hiểu bản chất vì sao RESTful API chọn JWT Stateless thay vì Session truyền thống.
- [x] Nắm rõ cấu trúc 3 phần: Header, Payload (Base64URL) và Signature (Chữ ký số).
- [x] Biết lý do vì sao hacker không thể tự ý sửa đổi nội dung của JWT Token.
- [x] Cài đặt và cấu hình `JwtModule.registerAsync()` trong NestJS.
- [x] Kết hợp `HashService` từ `SharedServiceModule` để hoàn thiện API đăng ký / đăng nhập.
- [x] Biết cách dùng `jwt.io` để kiểm tra Payload và thẩm định tính toàn vẹn của chữ ký số.

---

👉 **Bài tiếp theo:** [Lesson 4.3: Guards — Bảo Vệ API Bằng JwtAuthGuard & Passport Strategy](../lesson-4.3/lesson-4.3.md)
