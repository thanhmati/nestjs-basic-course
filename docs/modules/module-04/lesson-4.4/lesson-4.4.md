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
> ⏱️ **Thời lượng dự kiến:** 10 – 12 phút  
> 🎯 **Mục tiêu bài học:** Thấu hiểu lợi ích vượt trội của **Passport.js & Strategy Pattern** khi mở rộng hệ thống xác thực theo chuẩn tài liệu [NestJS Passport Recipes](https://docs.nestjs.com/recipes/passport); làm chủ cơ chế phối hợp giữa `@nestjs/passport` và `passport-jwt`; tự tay triển khai `JwtStrategy` trích xuất Token và tự động inject dữ liệu từ `validate()` vào `req.user`; tùy biến `JwtAuthGuard` với phương thức `handleRequest()` bắt chuẩn xác các mã lỗi `TokenExpiredError` và `JsonWebTokenError` bằng tiếng Việt chuyên nghiệp; thực hành kịch bản kiểm thử API Profile.

---

## 1. Tại Sao Lại Cần Passport.js? Sức Mạnh Mở Rộng Của Strategy Pattern

Trong **Lesson 4.3**, chúng ta đã tự tay viết `NativeAuthGuard` để bảo vệ API bằng Bearer Token. Nếu dự án của bạn **chỉ có duy nhất một phương thức đăng nhập bằng JWT**, thì Native Guard hoàn toàn đủ dùng.

Nhưng trong thực tế phát triển phần mềm doanh nghiệp, một ứng dụng hiếm khi dừng lại ở một phương thức xác thực duy nhất:

- Hôm nay: Người dùng đăng nhập bằng **JWT Token**.
- Ngày mai: Khách hàng yêu cầu thêm nút **"Đăng nhập với Google"**, **"Đăng nhập với GitHub"**, **"Đăng nhập Apple"**, hoặc **"Đăng nhập Mật khẩu (Local Username/Password)"**.

<p align="center">
  <img src="./assets/multi_auth_methods_expansion.jpg" alt="Rapid Evolution of Web Authentication Methods: Single JWT vs Multi-Provider Authentication" width="95%" />
</p>

---

### 💡 Vấn Đề Của Việc Tự Viết Thủ Công (Native Guards):

Nếu tiếp tục tự viết theo cách thủ công:

- Mỗi khi thêm 1 cách đăng nhập mới, bạn phải tự viết một Guard mới (`GoogleAuthGuard`, `LocalAuthGuard`, `GithubAuthGuard`...).
- Trong mỗi Guard, bạn lại phải tự xử lý việc parse Header, giải mã chữ ký, redirect OAuth, xử lý lỗi...
- Hậu quả: **Mã nguồn bị phình to, lặp lại logic và cực kỳ khó bảo trì!**

---

### 🚀 Giải Pháp: Passport.js — "Trạm Cắm Rút Chiến Lược Đa Năng" (Pluggable Architecture)

**Passport.js** giải quyết triệt để bài toán này nhờ vào mô thức **Strategy Pattern (Mô thức Chiến Lược)**:

<p align="center">
  <img src="./assets/passport_multi_strategy_hub.jpg" alt="Passport.js Pluggable Strategy Hub in NestJS Architecture" width="95%" />
</p>

Hãy tưởng tượng **NestJS Passport Engine** như một **Trạm điều khiển trung tâm**:

- **Guard (`AuthGuard`):** Đóng vai trò là "công tắc kích hoạt" — chỉ định request này cần dùng chiến lược nào (ví dụ: `AuthGuard('jwt')` hay `AuthGuard('google')`).
- **Các Strategy (Chiến lược):** Đóng vai trò là các **"module cắm rút" (Pluggable Cartridges)** độc lập:
  - Cần xác thực Token? ➔ Cắm module `JwtStrategy` (`passport-jwt`).
  - Cần đăng nhập Google? ➔ Cắm module `GoogleStrategy` (`passport-google-oauth20`).
  - Cần đăng nhập GitHub? ➔ Cắm module `GithubStrategy` (`passport-github2`).
  - Cần đăng nhập Mật khẩu? ➔ Cắm module `LocalStrategy` (`passport-local`).
- **Chuẩn hóa đầu ra duy nhất (`req.user`):** Dù người dùng đăng nhập bằng bất kỳ chiến lược nào, Passport đều chuẩn hóa kết quả và tự động gán vào đối tượng **`req.user`**! Controller của bạn không cần quan tâm người dùng đăng nhập từ nguồn nào.

---

### ⚖️ Bảng So Sánh Trực Quan: Native Guard vs Passport Strategy

| Tiêu Chí                         | 🔴 Tự Viết Thủ Công (Native Guard)                         | 🟢 Hệ Sinh Thái Passport (Strategy Pattern)                              |
| :------------------------------- | :--------------------------------------------------------- | :----------------------------------------------------------------------- |
| **Khi thêm Google/GitHub Login** | Phải viết lại Guard mới từ đầu, tự bắt lỗi OAuth phức tạp. | Chỉ cần cài thư viện và tạo thêm 1 file `Strategy` độc lập.              |
| **Trách nhiệm của Guard**        | Ôm đồm cả việc chặn lọc lẫn giải mã token, verify chữ ký.  | Tách bạch: Guard chỉ kích hoạt, Strategy xử lý nghiệp vụ.                |
| **Bóc tách Bearer Token**        | Phải tự viết hàm regex / `split(' ')` thủ công.            | Tự động hóa qua `ExtractJwt.fromAuthHeaderAsBearerToken()`.              |
| **Truy cập thông tin User**      | Phải tự gán `req['user'] = ...` trong Guard.               | **Cơ chế tự động:** Kết quả từ hàm `validate()` được gán vào `req.user`. |

---

## 2. Hướng Dẫn Thực Hành Step-by-Step — Triển Khai Passport JWT

Chúng ta sẽ tích hợp Passport vào dự án NestJS để bảo vệ endpoint `/users/profile` theo chuẩn tài liệu chính thức [NestJS Passport Recipes](https://docs.nestjs.com/recipes/passport).

---

### 📌 [Bước 1/4] Cài Đặt Bộ Thư Viện Passport

Chạy lệnh cài đặt các gói thư viện xác thực vào dự án:

```bash
pnpm add @nestjs/passport passport passport-jwt
pnpm add -D @types/passport-jwt
```

---

### 📌 [Bước 2/4] Triển Khai `JwtStrategy` Kế Thừa `PassportStrategy`

Tạo thư mục `src/auth/strategies/` và khởi tạo tệp `jwt.strategy.ts`:

📄 **`src/auth/strategies/jwt.strategy.ts`**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, UserData } from '../interfaces/jwt.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      // 1. Tự động bóc tách Bearer Token từ Header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. Không bỏ qua hạn dùng (Passport sẽ ném TokenExpiredError nếu hết hạn)
      ignoreExpiration: false,
      // 3. Khóa bí mật dùng để Passport verify chữ ký HMAC-SHA256
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback_secret',
    });
  }

  /**
   * Phương thức validate() tự động được Passport gọi SAU KHI đã verify chữ ký số thành công
   * @param payload Dữ liệu đã giải mã từ JWT ({ sub, email, role })
   * @returns Đối tượng sẽ được Passport tự động gán vào req.user
   */
  validate(payload: JwtPayload): UserData {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Payload của Token không hợp lệ!');
    }

    // Giá trị return ở đây sẽ xuất hiện tại req.user trong các Controller
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
```

🔍 **Bảng Giải Mã Chi Tiết Cấu Hình:**

| Cấu Hình            | Ý Nghĩa Kỹ Thuật                                                                                          |
| :------------------ | :-------------------------------------------------------------------------------------------------------- |
| `jwtFromRequest`    | Chỉ định vị trí trích xuất token (tự động đọc Header `Authorization: Bearer <token>`).                    |
| `ignoreExpiration`  | `false`: Yêu cầu kiểm tra thời gian hết hạn (`exp`). Nếu hết hạn, Passport sẽ tự chặn lại.                |
| `secretOrKey`       | Khóa bí mật đối xứng để Passport thẩm định tính toàn vẹn của chữ ký số.                                   |
| `validate(payload)` | Nơi bạn chuẩn hóa dữ liệu trả về. Bất kỳ giá trị nào hàm này trả về sẽ được gán thẳng vào **`req.user`**! |

---

### 📌 [Bước 3/4] Tạo `JwtAuthGuard` Tùy Biến Thông Báo Lỗi Tiếng Việt

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
    return super.canActivate(context);
  }

  /**
   * Ghi đè handleRequest để trả về thông báo lỗi tiếng Việt thân thiện
   */
  handleRequest<TUser = any>(
    err: unknown,
    user: TUser | false | null | undefined,
    info: unknown,
  ): TUser {
    if (err || !user) {
      // 1. Phân loại lỗi Token đã hết hạn
      if (info instanceof Error && info.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!',
        );
      }

      // 2. Phân loại lỗi Token bị sửa đổi chữ ký trái phép
      if (info instanceof Error && info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Mã xác thực (Token) không hợp lệ!');
      }

      if (err instanceof Error) {
        throw err;
      }

      // 3. Mặc định khi không gửi Header Authorization
      throw new UnauthorizedException(
        'Bạn cần đăng nhập (gửi kèm Bearer Token) để truy cập tài nguyên này!',
      );
    }

    return user;
  }
}
```

> [!TIP]
> **Điểm cộng trải nghiệm (DX & UX):**
> Nhờ ghi đè `handleRequest()`, hệ thống phân biệt rạch ròi giữa lỗi **hết hạn phiên** (`TokenExpiredError`) và lỗi **token giả mạo** (`JsonWebTokenError`), giúp lập trình viên Frontend dễ dàng viết logic điều hướng (ví dụ: tự động refresh token khi hết hạn).

---

### 📌 [Bước 4/4] Khai Báo Trong `AuthModule` & Bảo Vệ `UsersController`

Mở `src/auth/auth.module.ts`, khai báo `PassportModule` và đăng ký `JwtStrategy` cùng `JwtAuthGuard`:

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
    // Đăng ký PassportModule với default strategy là 'jwt'
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
  exports: [AuthService, JwtModule, PassportModule, JwtAuthGuard], // 👈 Export để các module khác sử dụng
})
export class AuthModule {}
```

Tiếp theo, mở `src/users/users.controller.ts` và sử dụng `JwtAuthGuard`:

📄 **`src/users/users.controller.ts`**

```typescript
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserData } from '../auth/interfaces/jwt.interface';

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

  // 🛡️ BẢO VỆ ENDPOINT BẰNG PASSPORT JWT GUARD
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return {
      message: 'Lấy thông tin cá nhân thành công qua Passport JwtAuthGuard!',
      user: req.user as UserData, // 👈 Passport tự động gán vào req.user từ hàm validate()
    };
  }
}
```

---

## 3. Kịch Bản Kiểm Tra & Thử Nghiệm (Hands-on Lab)

Khởi động máy chủ NestJS:

```bash
pnpm start:dev
```

### 📸 Đối Chiếu Kết Quả Trực Quan Qua API Inspection Mockup

Hình ảnh so sánh trực quan giữa 3 kịch bản kiểm thử:

<p align="center">
  <img src="./assets/passport_testing_mockup.jpg" alt="Passport Testing Inspection Mockup: 200 OK vs Expired Token vs Tampered Token" width="95%" />
</p>

---

### 🟢 Kịch Bản 1: Thành Công (Success Flow) — Bearer Token Hợp Lệ

1. **Đăng nhập lấy Access Token:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alex@example.com", "password": "Password123!"}'
```

_Giả sử nhận được Token:_ `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWxleEBleGFtcGxlLmNvbSIsInJvbGUiOiJVU0VSIi...`

2. **Gọi API Profile với Header Authorization:**

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

📥 **Phản hồi HTTP nhận được từ Server (`200 OK`):**

```json
{
  "message": "Lấy thông tin cá nhân thành công qua Passport JwtAuthGuard!",
  "user": {
    "userId": 1,
    "email": "alex@example.com"
  }
}
```

✅ **Kết quả:** Passport verify chữ ký thành công, hàm `validate()` được gọi và tự động inject đối tượng `{ userId: 1, email: "alex@example.com" }` vào `req.user`.

---

### 🟠 Kịch Bản 2: Kiểm Thử Token Hết Hạn (`TokenExpiredError`)

Gửi một Token đã quá thời hạn sử dụng:

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer <EXPIRED_TOKEN>"
```

📥 **Phản hồi nhận được (`401 Unauthorized`):**

```json
{
  "statusCode": 401,
  "message": "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!",
  "error": "Unauthorized"
}
```

✅ **Kết quả:** `handleRequest()` phát hiện `TokenExpiredError` và trả về thông báo tiếng Việt trực quan.

---

### 🔴 Kịch Bản 3: Kiểm Thử Token Giả Mạo Chữ Ký (`JsonWebTokenError`)

Gửi một Token bị can thiệp sửa đổi trái phép:

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni...FAKE_SIGNATURE"
```

📥 **Phản hồi nhận được (`401 Unauthorized`):**

```json
{
  "statusCode": 401,
  "message": "Mã xác thực (Token) không hợp lệ!",
  "error": "Unauthorized"
}
```

✅ **Kết quả:** Passport phát hiện chữ ký sai lệch với `JWT_SECRET` và từ chối truy cập ngay lập tức.

---

## 4. Tổng Kết Bài Học & Checklist Ghi Nhớ

```mermaid
mindmap
  root(("Passport.js & JwtStrategy"))
    "Lợi Ích Cốt Lõi"
      "Strategy Pattern (Kiến trúc cắm rút)"
      "Dễ mở rộng: Google, GitHub, Local"
      "Tách rời Guard & Thuật toán xác thực"
    "Cấu Hình JwtStrategy"
      "Extends PassportStrategy(Strategy, 'jwt')"
      "ExtractJwt.fromAuthHeaderAsBearerToken()"
      "secretOrKey verify chữ ký"
      "validate(payload) tự động gán vào req.user"
    "Tùy Biến JwtAuthGuard"
      "Extends AuthGuard('jwt')"
      "handleRequest bắt TokenExpiredError"
      "handleRequest bắt JsonWebTokenError"
    "Áp Dụng Thực Tế"
      "@UseGuards(JwtAuthGuard)"
      "Truy cập req.user Type-Safe ở Controller"
```

### ✅ Checklist Ghi Nhớ Bài Học:

- [x] Hiểu rõ vì sao Passport.js và Strategy Pattern giải quyết triệt để bài toán mở rộng nhiều phương thức xác thực (Pluggable Architecture).
- [x] Cài đặt thành công bộ thư viện: `@nestjs/passport`, `passport`, `passport-jwt`, `@types/passport-jwt`.
- [x] Triển khai `JwtStrategy` kế thừa `PassportStrategy(Strategy, 'jwt')`.
- [x] Nắm chắc cơ chế tự động gán dữ liệu trả về từ `validate(payload)` vào đối tượng `req.user`.
- [x] Xây dựng `JwtAuthGuard` kế thừa `AuthGuard('jwt')` và tùy biến `handleRequest()` xử lý lỗi chuyên nghiệp.
- [x] Đăng ký `PassportModule` và `JwtStrategy` trong `AuthModule`.
- [x] Sử dụng `@UseGuards(JwtAuthGuard)` để bảo vệ endpoint `/users/profile`.
- [x] Kiểm thử thành công 3 kịch bản: `200 OK`, `TokenExpiredError` (401), và `JsonWebTokenError` (401).

---

👉 **Bài tiếp theo:** [Lesson 4.5: Google OAuth2 — Tích Hợp Đăng Nhập Mạng Xã Hội Đa Chiến Lược Với Passport Trong NestJS](../lesson-4.5/lesson-4.5.md)
