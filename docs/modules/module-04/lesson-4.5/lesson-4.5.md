# Lesson 4.5: Google OAuth2 — Tích Hợp Đăng Nhập Mạng Xã Hội Đa Chiến Lược Với Passport Trong NestJS

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-Framework-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Passport.js-Multi_Strategy-34A853?style=for-the-badge&logo=google&logoColor=white" alt="Passport.js Multi Strategy" />
  <img src="https://img.shields.io/badge/OAuth2.0-Social_Login-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="OAuth 2.0" />
  <img src="https://img.shields.io/badge/TypeScript-Language-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/pnpm-Package_Manager-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
</p>

<p align="center">
  <img src="./assets/lesson_overview_banner.svg" alt="Lesson Overview Banner" width="100%" />
</p>

---

> [!NOTE]
> ⏱️ **Thời lượng dự kiến:** 12 – 15 phút  
> 🎯 **Mục tiêu bài học:** Chứng minh sức mạnh vượt trội của kiến trúc đa chiến lược (Pluggable Multi-Strategy) trong Passport.js bằng cách tích hợp tính năng **Đăng nhập bằng Google (Google OAuth2 Social Login)**; hiểu rõ luồng trao đổi mã ủy quyền (Authorization Code Flow); xây dựng `GoogleStrategy` và `GoogleAuthGuard`; xử lý đồng bộ dữ liệu người dùng (Upsert User) trong cơ sở dữ liệu và phát hành chuỗi JWT Access Token đồng nhất với hệ thống xác thực đã xây dựng từ Lesson 4.2 & Lesson 4.4.

---

## 1. Đặt Vấn Đề: Tại Sao Cần Social Login & Sức Mạnh "Cắm Rút" Của Passport.js

Trong thực tế phát triển sản phẩm số, tính năng **Đăng nhập qua Mạng xã hội (Social Login)** như Google, Facebook, Apple, GitHub là tiêu chuẩn bắt buộc nhằm:

- **Tăng tỷ lệ chuyển đổi (Conversion Rate):** Người dùng không cần phải nhớ thêm mật khẩu hoặc điền form đăng ký dài dòng, chỉ cần 1 click là có thể sử dụng ứng dụng ngay.
- **Nâng cao độ tin cậy:** Địa chỉ email từ tài khoản Google đã được Google xác thực (Verified Email), giảm thiểu tài khoản ảo và spam.

<p align="center">
  <img src="./assets/google_oauth_flow_mockup.jpg" alt="Google OAuth Passport Flow Mockup" width="100%" />
</p>

### ⚖️ So Sánh: Tự Code Thủ Công (Native OAuth2) vs. Passport Strategy

Khi tự viết luồng OAuth2 thủ công (Native OAuth2), bạn phải tự quản lý hàng loạt endpoint chuyển hướng (Redirect URI), mã hóa state phòng chống tấn công CSRF, tự gửi HTTP request trao đổi `code` lấy Google Token, rồi lại gọi Google API lấy thông tin Profile.

Với **Passport.js**, toàn bộ quy trình này được module hóa thành một **Chiến lược (Strategy)** độc lập:

| Tiêu Chí So Sánh       | Tự Code Thủ Công (Native OAuth2)                                   | Sử Dụng Passport Google Strategy                                                                   |
| :--------------------- | :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| **Kiến trúc mã nguồn** | Rải rác khắp Controller, Service, Guard gây rối loạn codebase.     | Đóng gói trọn vẹn trong `GoogleStrategy` & `GoogleAuthGuard`.                                      |
| **Khả năng mở rộng**   | Thêm đăng nhập Facebook, Apple phải viết lại toàn bộ luồng từ đầu. | Giữ nguyên kiến trúc, chỉ cần cài thêm strategy tương ứng (`passport-facebook`, `passport-apple`). |
| **Tính độc lập**       | Dễ ảnh hưởng hoặc làm vỡ luồng xác thực JWT hiện tại.              | **Cắm - Rút (Pluggable):** JWT Strategy và Google Strategy hoạt động song song mà không xung đột.  |
| **Dữ liệu trả về**     | Phải tự chuẩn hóa JSON thô từ các API khác nhau của Google.        | Hàm `validate()` nhận sẵn đối tượng `Profile` đã được parse chuẩn mực.                             |

> [!TIP]
> **Điểm cốt lõi:** Khi người dùng đăng nhập bằng Google thành công, hệ thống backend của chúng ta vẫn phát hành chuỗi **JWT Access Token của chính ứng dụng** (giống hệt kết quả đăng nhập thông thường ở Lesson 4.2). Nhờ đó, tất cả các API được bảo vệ bởi `JwtAuthGuard` (ở Lesson 4.4) hoàn toàn không cần sửa đổi dù người dùng đăng nhập bằng cách nào!

---

## 2. Thiết Lập Google Cloud Console & Biến Môi Trường (.env)

Để ứng dụng NestJS có thể giao tiếp với hệ thống ủy quyền của Google, chúng ta cần đăng ký ứng dụng trên **Google Cloud Console** để lấy cặp khóa nhận diện (`Client ID` và `Client Secret`).

<p align="center">
  <img src="./assets/google_oauth_consent_mockup.jpg" alt="Google Cloud Console Credentials & OAuth Consent Screen" width="100%" />
</p>

### Các Bước Cấu Hình Trên Google Cloud Console:

1. **Tạo Project mới:** Truy cập [Google Cloud Console](https://console.cloud.google.com/), tạo một dự án mới (ví dụ: `NestJS Social Auth`).
2. **Cấu hình OAuth Consent Screen:**
   - Chọn loại User Type: **External**.
   - Điền App Name (ví dụ: `NestJS Course App`) và Developer Contact Email.
   - Thêm Scopes cơ bản: `.../auth/userinfo.email` và `.../auth/userinfo.profile`.
3. **Tạo OAuth 2.0 Client ID:**
   - Vào menu **Credentials** ➔ Click **Create Credentials** ➔ Chọn **OAuth client ID**.
   - Application type: **Web application**.
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs (Quan trọng):**  
     `http://localhost:3000/api/v1/auth/google/callback`
   - Nhấn **Create**, bạn sẽ nhận được `Client ID` và `Client Secret`.

### Cấu Hình Biến Môi Trường:

Mở tệp `.env` của dự án và bổ sung 3 thông số vừa tạo:

📄 **`.env`**

```env
# ==========================================
# GOOGLE OAUTH2 CREDENTIALS
# ==========================================
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-YOUR_GOOGLE_CLIENT_SECRET"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/v1/auth/google/callback"
```

> [!IMPORTANT]
> `GOOGLE_CALLBACK_URL` trong file `.env` phải trùng khớp 100% với đường dẫn bạn đã khai báo trong danh sách **Authorized redirect URIs** trên Google Cloud Console. Nếu sai lệch dù chỉ một ký tự hoặc dấu gạch chéo `/`, Google sẽ lập tức trả về lỗi `redirect_uri_mismatch` (400).

---

## 3. Cài Đặt Thư Viện & Xây Dựng GoogleStrategy & GoogleAuthGuard

### Bước 1: Cài Đặt Thư Viện Passport Google OAuth2

Chúng ta sử dụng package chính thức và phổ biến nhất của Passport dành cho Google OAuth 2.0:

```bash
pnpm add passport-google-oauth20
pnpm add -D @types/passport-google-oauth20
```

---

### Bước 2: Định Nghĩa Kiểu Dữ Liệu Google User Payload

Tạo tệp định nghĩa dữ liệu trích xuất từ Google Profile để đảm bảo Type-Safety trong TypeScript:

📄 **`src/auth/interfaces/google-user.interface.ts`**

```typescript
export interface GoogleUser {
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'google';
}
```

---

### Bước 3: Hiện Thực GoogleStrategy

Tương tự như `JwtStrategy` ở Lesson 4.4, `GoogleStrategy` kế thừa từ `PassportStrategy(Strategy, 'google')`:

📄 **`src/auth/strategies/google.strategy.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { GoogleUser } from '../interfaces/google-user.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { name, emails, photos } = profile;

    const email = emails?.[0]?.value;
    const fullName =
      `${name?.familyName || ''} ${name?.givenName || ''}`.trim() ||
      profile.displayName;
    const avatarUrl = photos?.[0]?.value;

    if (!email) {
      return done(
        new Error('Không tìm thấy thông tin email từ tài khoản Google!'),
        false,
      );
    }

    const user: GoogleUser = {
      email,
      name: fullName,
      avatarUrl,
      provider: 'google',
    };

    done(null, user);
  }
}
```

> [!TIP]
>
> - `scope: ['email', 'profile']`: Yêu cầu Google cấp quyền truy cập email và thông tin tài khoản cơ bản.
> - `done(null, user)`: Báo hiệu xác thực thông tin profile thành công. Passport sẽ tự động gán đối tượng `user` này vào `req.user`.

---

### Bước 4: Tạo Guard Chuyên Dụng GoogleAuthGuard

Kế thừa `AuthGuard('google')` để tự động hóa toàn bộ cơ chế chuyển hướng và bắt mã code:

📄 **`src/auth/guards/google-auth.guard.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  // AuthGuard('google') tự động làm 2 việc:
  // 1. Khi gọi GET /auth/google: Tự chuyển hướng trình duyệt sang trang đăng nhập của Google.
  // 2. Khi Google gọi về GET /auth/google/callback?code=...: Tự bắt mã code và kích hoạt GoogleStrategy.validate().
}
```

---

## 4. Tích Hợp AuthService, AuthController & Đăng Ký AuthModule

Sau khi Google xác nhận người dùng hợp lệ và `GoogleStrategy` trích xuất được email và tên, việc tiếp theo của hệ thống Backend là:

1. Tìm xem email này đã có tài khoản trong Database chưa.
2. Nếu chưa có ➔ Tự động tạo mới (Upsert).
3. Phát hành **Access Token JWT của chính hệ thống chúng ta** để client dùng cho tất cả các API sau này.

### Bước 1: Bổ Sung Phương Thức `socialLogin` Trong AuthService

Mở tệp `src/auth/auth.service.ts` và thêm phương thức xử lý tài khoản Google:

📄 **`src/auth/auth.service.ts`**

```typescript
import { GoogleUser } from './interfaces/google-user.interface';
import * as crypto from 'crypto';

// Bổ sung vào class AuthService:
@Injectable()
export class AuthService {
  // ... các phương thức register, login, generateAccessToken hiện có ...

  /**
   * Xử lý đăng nhập bằng tài khoản mạng xã hội (Google)
   * Tự động tạo tài khoản mới nếu chưa tồn tại trong cơ sở dữ liệu
   */
  async socialLogin(googleUser: GoogleUser) {
    const { email, name, avatarUrl } = googleUser;

    // 1. Kiểm tra xem người dùng đã tồn tại trong DB chưa
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    // 2. Nếu chưa tồn tại -> Tạo user mới (Social Account)
    if (!user) {
      // Do schema DB yêu cầu password, ta tự sinh mật khẩu ngẫu nhiên an toàn và mã hóa
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword =
        await this.hashService.hashPassword(randomPassword);

      user = await this.prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });
    }

    // 3. Phát hành JWT Access Token của hệ thống (đồng bộ với Lesson 4.2 & 4.4)
    const accessToken = await this.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );

    return {
      accessToken,
    };
  }
}
```

---

### Bước 2: Khai Báo 2 Endpoints Trong AuthController

Chúng ta cần 2 routes:

1. `GET /auth/google`: Điểm kích hoạt đăng nhập (chuyển hướng người dùng sang Google).
2. `GET /auth/google/callback`: Điểm Google gọi về kèm mã xác nhận.

📄 **`src/auth/auth.controller.ts`**

```typescript
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { AuthService } from './auth.service';
import { GoogleUser } from './interfaces/google-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ... các routes register, login hiện có ...

  /**
   * Route 1: Kích hoạt luồng đăng nhập Google
   * Client hoặc trình duyệt gọi vào đây sẽ được chuyển hướng tới trang cấp quyền của Google
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Luồng chuyển hướng được xử lý tự động hoàn toàn bởi GoogleAuthGuard
  }

  /**
   * Route 2: Callback tiếp nhận mã ủy quyền từ Google
   * Sau khi người dùng nhấn 'Cho phép', Google sẽ chuyển hướng về route này
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request) {
    // req.user chứa dữ liệu trả về từ GoogleStrategy.validate()
    const googleUser = req['user'] as GoogleUser;
    return this.authService.socialLogin(googleUser);
  }
}
```

---

### Bước 3: Đăng Ký GoogleStrategy Trong AuthModule

Cập nhật `AuthModule` để NestJS Dependency Injection nhận diện và khởi tạo Strategy mới:

📄 **`src/auth/auth.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    JwtStrategy,
    GoogleStrategy,
    GoogleAuthGuard,
  ],
  exports: [JwtModule, PassportModule, JwtAuthGuard],
})
export class AuthModule {}
```

> [!IMPORTANT]
> Hãy nhìn lại toàn bộ quá trình vừa thực hiện: Chúng ta vừa bổ sung thêm một cơ chế đăng nhập cực kỳ phức tạp (OAuth 2.0) mà **không phải sửa đổi dù chỉ 1 dòng code** trong `JwtStrategy`, `JwtAuthGuard` hay bất kỳ API nào khác! Đây chính là minh chứng sống động nhất cho nguyên lý **Open/Closed Principle** mà Passport mang lại.

---

## 5. Kịch Bản Kiểm Tra & Thử Nghiệm (Hands-on Lab)

### 🟢 Kịch Bản 1: Đăng Nhập Thành Công Bằng Google & Sử Dụng Access Token

#### Bước 1: Khởi động Server

```bash
pnpm start:dev
```

#### Bước 2: Mở Trình Duyệt & Đăng Nhập

Mở trình duyệt (Chrome/Brave) và truy cập vào đường dẫn:

```text
http://localhost:3000/api/v1/auth/google
```

- Trình duyệt sẽ tự động chuyển hướng sang trang đăng nhập tài khoản Google.
- Bạn chọn tài khoản và nhấn nút **Cho phép (Allow)**.
- Google chuyển hướng trở lại `http://localhost:3000/api/v1/auth/google/callback`.
- Màn hình trình duyệt hiển thị kết quả JSON:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjUsImVtYWlsIjoic3R1ZGVudC5kZW1vQGdtYWlsLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzg5..."
}
```

#### Bước 3: Dùng Token Vừa Nhận Để Gọi Protected Route (Chứng Minh Tính Đồng Bộ)

Sao chép chuỗi `accessToken` ở trên và thực hiện lệnh gọi cURL vào endpoint `/users/profile` (được bảo vệ bởi `JwtAuthGuard` từ Lesson 4.4):

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Kết Quả Trả Về (200 OK):**

```json
{
  "userId": 5,
  "email": "student.demo@gmail.com",
  "role": "USER"
}
```

🎉 **Thành công vượt trội:** Tài khoản tạo từ Google đã được tích hợp hoàn hảo vào hệ sinh thái JWT của ứng dụng!

---

### 🔴 Kịch Bản 2: Kiểm Thử Lỗi & Ngăn Chặn (Blocked/Error Flow)

#### Tình huống A: Người dùng nhấn "Cancel" hoặc từ chối cấp quyền trên màn hình Google

- **Hiện tượng:** Google sẽ redirect về callback với tham số query `?error=access_denied`.
- **Hành vi của Passport:** `GoogleAuthGuard` tự động chặn lại và trả về mã lỗi HTTP `401 Unauthorized`.

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### Tình huống B: Khai báo sai Callback URL hoặc Client Secret

- **Hiện tượng:** Nếu `GOOGLE_CALLBACK_URL` trong `.env` không trùng với Google Cloud Console, Google sẽ từ chối chuyển hướng ngay từ trang đầu tiên với màn hình báo lỗi:
  > **400. That’s an error. Error: redirect_uri_mismatch**
- **Cách khắc phục:** Kiểm tra lại từng ký tự cổng (port), giao thức (`http` vs `https`) và tiền tố đường dẫn (`/api/v1/auth/google/callback`).

---

## 6. Tổng Kết Bài Học & Checklist Ghi Nhớ

```mermaid
mindmap
  root(("Google OAuth2 Social Login"))
    "Strategy Pattern"
      "passport-google-oauth20"
      "Cắm rút độc lập"
      "Không ảnh hưởng JWT hiện tại"
    "Google Cloud Setup"
      "OAuth Consent Screen"
      "Client ID & Client Secret"
      "Authorized Redirect URI"
    "Triển Khai Code"
      "GoogleStrategy validate() lấy profile"
      "GoogleAuthGuard chuyển hướng & bắt code"
      "AuthService.socialLogin() Upsert User"
    "Kết Quả Cuối Cùng"
      "User được tạo trong Database"
      "Phát hành App JWT Access Token đồng bộ"
```

### ✅ Checklist Ghi Nhớ Bài Học:

- [x] Hiểu sâu luồng ủy quyền **Authorization Code Flow** của chuẩn OAuth 2.0.
- [x] Thấy rõ giá trị thực tế của **Passport Strategy Pattern** khi cắm thêm phương thức xác thực mới vào hệ thống mà không làm ảnh hưởng code cũ.
- [x] Đăng ký ứng dụng và cấu hình thành công Credentials trên Google Cloud Console.
- [x] Triển khai `GoogleStrategy` kế thừa `PassportStrategy(Strategy, 'google')` và trích xuất thông tin profile chuẩn xác.
- [x] Sử dụng `GoogleAuthGuard` để tự động hóa việc chuyển hướng và nhận callback.
- [x] Xây dựng logic **Upsert User** trong `AuthService` và phát hành JWT Token đồng bộ với toàn bộ hệ thống.
- [x] Kiểm nghiệm thành công việc sử dụng chuỗi JWT của user Google để truy cập Protected Route của `JwtAuthGuard`.

---

👉 **Bài tiếp theo:** [Lesson 4.6: Auth Decorators & Global Guard — Vận Dụng @CurrentUser() & @Public() Bảo Vệ Toàn Diện Hệ Thống](../lesson-4.6/lesson-4.6.md)
