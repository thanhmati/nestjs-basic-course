# Kịch Bản Giảng Dạy (Instructor Script)

## Lesson 4.4: Passport.js & JwtStrategy — Chuẩn Hóa Xác Thực API Chuyên Nghiệp Trong NestJS

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

## 🎯 Thông Tin Tổng Quan Bài Học

- **Bài học:** Lesson 4.4: Passport.js & JwtStrategy — Chuẩn Hóa Xác Thực API Chuyên Nghiệp Trong NestJS
- **Khóa học:** NestJS Thực Chiến: Xây Dựng API Từ Cơ Bản Đến Nâng Cao
- **Thời lượng dự kiến:** 11 – 13 phút thực chiến
- **Mục tiêu cốt lõi:**
  1. Thấu hiểu vì sao **Passport.js & Strategy Pattern (Mô thức Chiến Lược)** là tiêu chuẩn công nghiệp bắt buộc khi hệ thống mở rộng nhiều phương thức xác thực (JWT, Google, GitHub, Apple, Local).
  2. Phân tích điểm nghẽn nghiêm trọng của việc tự viết Guard thủ công (Native Guard) khi quy mô dự án phình to.
  3. Cài đặt và cấu hình bộ thư viện chuẩn của NestJS: `@nestjs/passport`, `passport`, `passport-jwt` và types.
  4. Live-code 100% triển khai `JwtStrategy` kế thừa `PassportStrategy(Strategy, 'jwt')`, tự động trích xuất Bearer Token qua `ExtractJwt` và thẩm định chữ ký số với `ConfigService`.
  5. Nắm chắc cơ chế kỳ diệu: Bất kỳ dữ liệu nào trả về từ hàm `validate(payload)` sẽ được Passport **tự động inject vào `req.user`**.
  6. Xây dựng và tùy biến `JwtAuthGuard` kế thừa `AuthGuard('jwt')`, ghi đè `handleRequest()` để bắt lỗi chuyên sâu: phân biệt rạch ròi giữa **`TokenExpiredError`** (hết hạn) và **`JsonWebTokenError`** (giả mạo).
  7. Thay thế `NativeAuthGuard` bằng `JwtAuthGuard` trên endpoint `GET /api/v1/users/profile`, thực nghiệm kiểm thử 3 kịch bản cURL thực tế.
- **Chuẩn bị trước khi quay (Instructor Pre-recording Checklist):**
  - [x] Đang ở branch `lesson/4.4` (`git checkout -b lesson/4.4`).
  - [x] VS Code đặt ở độ phân giải full HD 1080p, font JetBrains Mono cỡ 16–18 rõ nét.
  - [x] Mở sẵn 2 tab Terminal: Tab 1 chạy server NestJS (`pnpm start:dev`), Tab 2 dùng để chạy lệnh cài đặt thư viện và cURL kiểm thử.
  - [x] Mở sẵn thư mục `assets/` gồm 4 hình ảnh minh họa đắt giá: `multi_auth_methods_expansion.jpg`, `native_guards_scaling_problem.jpg`, `passport_multi_strategy_hub.jpg`, và `passport_testing_mockup.jpg`.
  - [x] Chuẩn bị sẵn một tài khoản test trong CSDL (`alex@example.com` / `Password123!`) từ các bài học trước để đăng nhập lấy JWT Token nhanh chóng.

---

## ⏱️ Sơ Đồ Phân Bổ Thời Gian (Timeline Roadmap)

```mermaid
flowchart LR
    S1["<b>Phần 1: Khởi Động & Bài Toán Mở Rộng Auth</b><br/>(00:00 - 02:45)<br/>Native Guard vs Multi-Provider Scaling"] --> S2["<b>Phần 2: Strategy Pattern & Passport Hub</b><br/>(02:45 - 04:45)<br/>Kiến trúc cắm rút & Tự động inject req.user"]
    S2 --> S3["<b>Phần 3: Live-Code JwtStrategy</b><br/>(04:45 - 07:30)<br/>Cài đặt thư viện & PassportStrategy('jwt')"]
    S3 --> S4["<b>Phần 4: Tùy Biến JwtAuthGuard & Module</b><br/>(07:30 - 09:30)<br/>handleRequest bắt lỗi & Khóa route Profile"]
    S4 --> S5["<b>Phần 5: Hands-on Lab Thực Chiến</b><br/>(09:30 - 11:45)<br/>Test 3 kịch bản: 200 OK, Expired & Tampered"]
    S5 --> S6["<b>Phần 6: Tổng Kết, Thử Thách & Commit</b><br/>(11:45 - 12:45)<br/>Mindmap, Cầu nối Google OAuth2 & Git commit"]
```

---

## 🎬 Chi Tiết Kịch Bản Giảng Dạy Từng Phân Cảnh (Scene-by-Scene)

---

### PHẦN 1: KHỞI ĐỘNG & BÀI TOÁN MỞ RỘNG XÁC THỰC TRONG DOANH NGHIỆP (00:00 – 02:45)

#### ⏱️ Phút 00:00 - 01:15 | Lời Mở Đầu Cuốn Hút & Đặt Vấn Đề

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Giảng viên xuất hiện trên webcam với phong thái tự tin, chuyên nghiệp.
  - Chiếu Slide Title bài học và Banner Overview `lesson_overview_banner.svg`.
  - Chuyển sang chiếu hình ảnh thực tế [multi_auth_methods_expansion.jpg](./assets/multi_auth_methods_expansion.jpg) minh họa sự bùng nổ của các phương thức đăng nhập trong một ứng dụng hiện đại.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Xin chào tất cả các bạn! Chào mừng các bạn quay trở lại với chuỗi bài học chuyên sâu về Bảo Mật & Xác Thực trong khóa học **NestJS Thực Chiến**!
  >
  > Ở bài học 4.3 trước, chúng ta đã tự tay viết một `NativeAuthGuard` thuần NestJS để kiểm tra Token và bảo vệ route profile cá nhân. Điều đó giúp chúng ta hiểu tận gốc rễ cơ chế `CanActivate` và `ExecutionContext`.
  >
  > Tuy nhiên, hãy thử đặt mình vào vị trí của một Tech Lead hoặc Senior Developer trong một dự án thực tế:
  >
  > Hôm nay, ứng dụng của bạn khởi đầu với việc đăng nhập bằng **Email & JWT Token**. Mọi thứ chạy rất mượt mà.
  >
  > Nhưng tuần sau, khách hàng hoặc Product Manager yêu cầu:
  > _'Hệ thống cần thêm nút Đăng nhập bằng Google! Thêm nút Đăng nhập bằng GitHub cho giới lập trình viên! Và sắp tới là Đăng nhập bằng Apple ID cho người dùng iOS!'_
  >
  > Hãy nhìn lên màn hình: Hệ thống xác thực hiện đại không bao giờ dừng lại ở một phương thức duy nhất!
  >
  > Vậy chuyện gì sẽ xảy ra nếu chúng ta tiếp tục tự viết Guard thủ công cho từng loại đăng nhập?"

---

#### ⏱️ Phút 01:15 - 02:45 | Vấn Đề Của Native Guard Khi Mở Rộng & Nhu Cầu Chuẩn Hóa

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Chiếu hình ảnh minh họa [native_guards_scaling_problem.jpg](./assets/native_guards_scaling_problem.jpg) thể hiện sự rối rắm và trùng lặp mã nguồn khi cố tự viết các Guard riêng lẻ.
  - Highlight 3 nhược điểm cốt tử: Vi phạm Single Responsibility, lặp code bóc tách header, khó bảo trì.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Nếu tiếp tục tự viết theo cách thủ công của Lesson 4.3:
  >
  > - Mỗi khi có phương thức đăng nhập mới, bạn sẽ phải tạo ra một Guard mới: `GoogleAuthGuard`, `GithubAuthGuard`, `LocalAuthGuard`...
  > - Trong mỗi Guard đó, bạn lại phải tự viết hàm bóc tách Header, tự xử lý verify chữ ký, tự bắt các lỗi OAuth redirect...
  > - Và tai hại nhất là: **Guard bị ôm đồm quá nhiều trách nhiệm!** Nó vừa phải làm nhiệm vụ chặn lọc (`canActivate`), vừa phải gánh luôn việc xử lý thuật toán xác thực phức tạp.
  >
  > Mã nguồn của bạn sẽ nhanh chóng biến thành một mớ 'spaghetti code', cực kỳ khó test và bảo trì!
  >
  > Để giải quyết triệt để vấn đề này, các kỹ sư phần mềm trên thế giới sử dụng một thiết kế kiến trúc kinh điển mang tên **Strategy Pattern (Mô thức Chiến Lược)**, và trong hệ sinh thái Node.js/NestJS, giải pháp số một chính là **Passport.js**!
  >
  > Bài học hôm nay — **Lesson 4.4: Passport.js & JwtStrategy — Chuẩn Hóa Xác Thực API Chuyên Nghiệp Trong NestJS** sẽ nâng cấp toàn bộ hệ thống xác thực của chúng ta lên chuẩn Enterprise!"

---

### PHẦN 2: GIẢI MÃ STRATEGY PATTERN & KIẾN TRÚC CẮM RÚT CỦA PASSPORT.JS (02:45 – 04:45)

#### ⏱️ Phút 02:45 - 04:00 | Khái Niệm "Trạm Cắm Rút Chiến Lược" (Pluggable Architecture)

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Chiếu toàn màn hình sơ đồ kiến trúc [passport_multi_strategy_hub.jpg](./assets/passport_multi_strategy_hub.jpg).
  - Dùng chuột chỉ rõ 3 thành phần: **AuthGuard (Công tắc kích hoạt)** ➔ **Passport Strategy Hub (Các module cắm rút)** ➔ **Chuẩn hóa đầu ra `req.user`**.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Mời các bạn nhìn lên sơ đồ kiến trúc của **Passport Multi-Strategy Hub** trong NestJS.
  >
  > Hãy tưởng tượng NestJS Passport Engine giống hệt như một **Trạm điều khiển trung tâm với các cổng cắm rút (Pluggable Architecture)**:
  >
  > 1. **AuthGuard (`@UseGuards(AuthGuard('...'))`):**  
  >    Đóng vai trò là **Công tắc kích hoạt**. Nó đứng trước Controller và chỉ định: _'Endpoint này yêu cầu xác thực bằng chiến lược nào?'_. Ví dụ: `AuthGuard('jwt')` hay `AuthGuard('google')`. Guard chỉ làm đúng nhiệm vụ gác cổng!
  >
  > 2. **Các Strategy (Chiến lược xác thực):**  
  >    Đóng vai trò là các **hộp module cắm rút độc lập**:
  >    - Khi cần xác thực Bearer Token ➔ Ta cắm module `JwtStrategy` (`passport-jwt`).
  >    - Khi cần đăng nhập Google ở Lesson 4.5 ➔ Ta chỉ việc cắm thêm module `GoogleStrategy` (`passport-google-oauth20`).
  >    - Khi cần đăng nhập Mật khẩu ➔ Ta cắm `LocalStrategy` (`passport-local`).
  >      Các module này độc lập hoàn toàn, không đụng chạm hay làm ảnh hưởng lẫn nhau!
  > 3. **Đặc quyền lớn nhất — Chuẩn hóa đầu ra duy nhất (`req.user`):**  
  >    Dù người dùng đăng nhập bằng JWT, Google, hay GitHub... thì sau khi xác thực thành công, Passport đều tự động gom dữ liệu sạch và gán vào một biến duy nhất là **`req.user`**!  
  >    Các Controller và Service phía sau không cần quan tâm user đăng nhập từ nguồn nào, chỉ cần đọc `req.user` là có đầy đủ thông tin!"

---

#### ⏱️ Phút 04:00 - 04:45 | So Sánh Trực Quan: Native Guard vs Passport Strategy

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Chiếu bảng so sánh 4 tiêu chí cốt lõi:
    - Khả năng mở rộng đa nguồn
    - Phân tách trách nhiệm (Separation of Concerns)
    - Tự động bóc tách Bearer Token
    - Tự động hóa gán `req.user`

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Hãy nhìn vào bảng so sánh trên màn hình để thấy sự khác biệt một trời một vực:
  >
  > - Ở Native Guard, chúng ta phải tự viết hàm cắt chuỗi `split(' ')` để lấy token. Ở Passport, thư viện `ExtractJwt` làm điều đó tự động chỉ với 1 dòng cấu hình.
  > - Ở Native Guard, ta phải tự gán `request['user'] = ...` thủ công. Ở Passport, hàm `validate()` trả về cái gì thì Passport tự động bơm cái đó vào `req.user` một cách tự động và Type-Safe!
  > - Và quan trọng nhất: Khi muốn mở rộng sang Google OAuth ở bài học tiếp theo, với Passport chúng ta **không phải sửa một dòng code nào** của hệ thống hiện tại, mà chỉ việc cắm thêm một file Strategy mới!
  >
  > Bây giờ, chúng ta cùng bắt tay vào phần Live-Code triển khai chuẩn mực này nhé!"

---

### PHẦN 3: LIVE-CODE CÀI ĐẶT & XÂY DỰNG JWTSTRATEGY (04:45 – 07:30)

#### ⏱️ Phút 04:45 - 05:45 | Cài Đặt Bộ Thư Viện Passport

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Mở tab Terminal 2 trong VS Code.
  - Gõ lệnh cài đặt các gói thư viện xác thực:
    `pnpm add @nestjs/passport passport passport-jwt`
    `pnpm add -D @types/passport-jwt`

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Bước đầu tiên, chúng ta cần cài đặt bộ thư viện Passport vào dự án:
  >
  > ```bash
  > pnpm add @nestjs/passport passport passport-jwt
  > pnpm add -D @types/passport-jwt
  > ```
  >
  > Các bạn lưu ý:
  >
  > - `@nestjs/passport` là module tích hợp chính thức của NestJS, cung cấp các decorator và helper như `PassportStrategy`, `AuthGuard`.
  > - `passport` là thư viện xác thực lõi nổi tiếng nhất trong thế giới Node.js.
  > - `passport-jwt` là plugin chuyên trách xử lý việc bóc tách và giải mã JSON Web Token.
  > - Và `@types/passport-jwt` cung cấp đầy đủ gợi ý kiểu dữ liệu cho TypeScript."

---

#### ⏱️ Phút 05:45 - 07:30 | Live-Code Triển Khai `JwtStrategy` Kế Thừa `PassportStrategy`

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Tạo thư mục: `src/auth/strategies/`.
  - Tạo tệp 📄 **`src/auth/strategies/jwt.strategy.ts`**.
  - Gõ code từng bước, giải thích chi tiết hàm `constructor()` với `super({...})` và phương thức `validate()`.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Bây giờ, chúng ta tạo thư mục mới: `src/auth/strategies/` và khởi tạo tệp: `jwt.strategy.ts`:
  >
  > 📄 **`src/auth/strategies/jwt.strategy.ts`**
  >
  > ```typescript
  > import { Injectable, UnauthorizedException } from '@nestjs/common';
  > import { ConfigService } from '@nestjs/config';
  > import { PassportStrategy } from '@nestjs/passport';
  > import { ExtractJwt, Strategy } from 'passport-jwt';
  > import { JwtPayload, UserData } from '../interfaces/jwt.interface';
  >
  > @Injectable()
  > export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  >   constructor(configService: ConfigService) {
  >     super({
  >       // 1. Tự động trích xuất Bearer Token từ Header Authorization: Bearer <token>
  >       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  >       // 2. Bắt buộc kiểm tra hạn dùng (ném TokenExpiredError nếu hết hạn)
  >       ignoreExpiration: false,
  >       // 3. Khóa bí mật dùng để Passport kiểm tra chữ ký số HMAC-SHA256
  >       secretOrKey:
  >         configService.get<string>('JWT_SECRET') || 'fallback_secret',
  >     });
  >   }
  >
  >   /**
  >    * validate() được Passport tự động gọi SAU KHI đã verify chữ ký số thành công
  >    */
  >   validate(payload: JwtPayload): UserData {
  >     if (!payload || !payload.sub) {
  >       throw new UnauthorizedException('Payload của Token không hợp lệ!');
  >     }
  >
  >     // Bất kỳ giá trị nào return ở đây sẽ được Passport tự động gán vào req.user!
  >     return {
  >       userId: payload.sub,
  >       email: payload.email,
  >       role: payload.role,
  >     };
  >   }
  > }
  > ```
  >
  > Hãy dừng lại vài giây để giải mã 3 điểm tinh hoa trong class này:
  >
  > 1. `extends PassportStrategy(Strategy, 'jwt')`:  
  >    Chúng ta kế thừa từ `PassportStrategy` của NestJS, truyền vào `Strategy` của `passport-jwt` và đặt tên định danh cho chiến lược này là `'jwt'`.
  >
  > 2. `ExtractJwt.fromAuthHeaderAsBearerToken()`:  
  >    Thay vì tự viết regex hay cắt chuỗi, hàm này tự động tìm kiếm Header `Authorization`, kiểm tra tiền tố `Bearer `, và bóc tách chuỗi token sạch sẽ.
  >
  > 3. **Phương thức `validate(payload)` — Điểm kỳ diệu nhất của Passport:**  
  >    Các bạn chú ý: Hàm `validate()` này **CHỈ ĐƯỢC GỌI KHI** Passport đã kiểm tra chữ ký số thành công và token vẫn còn hạn sử dụng! Nếu chữ ký sai hoặc token hết hạn, Passport sẽ chặn lại từ trước đó và không bao giờ bước vào hàm này.  
  >    Và giá trị mà bạn `return` trong hàm `validate()` sẽ được Passport **tự động bơm thẳng vào đối tượng `req.user`** trong mọi Controller!"

- 💡 **Mẹo sư phạm (Pedagogical Tip):**
  > Nhấn mạnh cơ chế: _`validate()` là cánh cổng cuối cùng để lọc và chuẩn hóa dữ liệu User trước khi đưa vào Controller!_ Bạn có thể truy vấn Database tại đây nếu muốn kiểm tra tài khoản có bị khóa hay không.

---

### PHẦN 4: TÙY BIẾN JWTAUTHGUARD & ĐĂNG KÝ MODULE (07:30 – 09:30)

#### ⏱️ Phút 07:30 - 08:30 | Tạo `JwtAuthGuard` Kế Thừa `AuthGuard('jwt')` & Bắt Lỗi Tiếng Việt

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Mở thư mục `src/auth/guards/`.
  - Tạo tệp 📄 **`src/auth/guards/jwt-auth.guard.ts`**.
  - Triển khai ghi đè phương thức `handleRequest()` để phân biệt `TokenExpiredError` và `JsonWebTokenError`.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Theo lý thuyết của NestJS, bạn có thể dùng trực tiếp `@UseGuards(AuthGuard('jwt'))`.  
  > Tuy nhiên, nếu dùng trực tiếp như vậy, mỗi khi token bị lỗi, Passport sẽ trả về thông báo lỗi mặc định bằng tiếng Anh rất cộc lốc: `Unauthorized`.
  >
  > Để mang lại trải nghiệm chuyên nghiệp (UX & DX vượt trội), chúng ta sẽ tạo một class riêng mang tên **`JwtAuthGuard`** kế thừa từ `AuthGuard('jwt')` và ghi đè phương thức **`handleRequest()`**:
  >
  > Tạo tệp: `src/auth/guards/jwt-auth.guard.ts`:
  >
  > 📄 **`src/auth/guards/jwt-auth.guard.ts`**
  >
  > ```typescript
  > import {
  >   ExecutionContext,
  >   Injectable,
  >   UnauthorizedException,
  > } from '@nestjs/common';
  > import { AuthGuard } from '@nestjs/passport';
  >
  > @Injectable()
  > export class JwtAuthGuard extends AuthGuard('jwt') {
  >   canActivate(context: ExecutionContext) {
  >     return super.canActivate(context);
  >   }
  >
  >   /**
  >    * Ghi đè handleRequest để phân loại và trả về thông báo lỗi tiếng Việt thân thiện
  >    */
  >   handleRequest<TUser = any>(
  >     err: unknown,
  >     user: TUser | false | null | undefined,
  >     info: unknown,
  >   ): TUser {
  >     if (err || !user) {
  >       // Trường hợp 1: Token đã hết hạn sử dụng
  >       if (info instanceof Error && info.name === 'TokenExpiredError') {
  >         throw new UnauthorizedException(
  >           'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!',
  >         );
  >       }
  >
  >       // Trường hợp 2: Token bị sửa đổi trái phép (sai chữ ký bí mật)
  >       if (info instanceof Error && info.name === 'JsonWebTokenError') {
  >         throw new UnauthorizedException(
  >           'Mã xác thực (Token) không hợp lệ!',
  >         );
  >       }
  >
  >       if (err instanceof Error) {
  >         throw err;
  >       }
  >
  >       // Trường hợp 3: Client không gửi Header Authorization
  >       throw new UnauthorizedException(
  >         'Bạn cần đăng nhập (gửi kèm Bearer Token) để truy cập tài nguyên này!',
  >       );
  >     }
  >
  >     return user;
  >   }
  > }
  > ```
  >
  > Các bạn thấy điều tuyệt vời ở đây chưa?  
  > Biến `info` chứa chính xác đối tượng lỗi từ thư viện JWT!  
  > Nhờ phân loại rạch ròi giữa `TokenExpiredError` và `JsonWebTokenError`, Frontend có thể dễ dàng bắt mã lỗi để tự động gọi API Refresh Token khi hết hạn, hoặc đăng xuất người dùng khi phát hiện token giả mạo!"

---

#### ⏱️ Phút 08:30 - 09:30 | Cấu Hình `AuthModule` & Bảo Vệ `UsersController`

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Mở tệp 📄 **`src/auth/auth.module.ts`**, thêm `PassportModule.register({ defaultStrategy: 'jwt' })`, đăng ký `JwtStrategy` và `JwtAuthGuard` vào `providers` và `exports`.
  - Mở tệp 📄 **`src/users/users.controller.ts`**, thay thế `NativeAuthGuard` bằng `@UseGuards(JwtAuthGuard)` và đọc `req.user as UserData`.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Bây giờ, chúng ta mở `src/auth/auth.module.ts` để đăng ký các thành phần này vào hệ thống DI:
  >
  > 📄 **`src/auth/auth.module.ts`**
  >
  > ```typescript
  > @Module({
  >   imports: [
  >     PassportModule.register({ defaultStrategy: 'jwt' }), // 👈 Đăng ký PassportModule
  >     JwtModule.registerAsync({ ... }),
  >   ],
  >   controllers: [AuthController],
  >   providers: [AuthService, JwtStrategy, JwtAuthGuard], // 👈 Cung cấp Strategy & Guard
  >   exports: [AuthService, JwtModule, PassportModule, JwtAuthGuard], // 👈 Export ra toàn hệ thống
  > })
  > export class AuthModule {}
  > ```
  >
  > Tiếp theo, hãy mở tệp `src/users/users.controller.ts` và thay thế Native Guard cũ bằng `JwtAuthGuard`:
  >
  > 📄 **`src/users/users.controller.ts`**
  >
  > ```typescript
  >   // 🛡️ BẢO VỆ ENDPOINT BẰNG PASSPORT JWT GUARD
  >   @UseGuards(JwtAuthGuard)
  >   @Get('profile')
  >   getProfile(@Req() req: Request) {
  >     return {
  >       message: 'Lấy thông tin cá nhân thành công qua Passport JwtAuthGuard!',
  >       user: req.user as UserData, // 👈 Passport tự động gán vào req.user chuẩn mực!
  >     };
  >   }
  > ```
  >
  > Nhìn vào biến `req.user`: Chúng ta không cần dùng cú pháp mảng `req['user']` như trước nữa, mà truy cập trực tiếp thuộc tính chuẩn `req.user` do Passport cung cấp!"

---

### PHẦN 5: HANDS-ON LAB — KIỂM THỬ 3 KỊCH BẢN THỰC CHIẾN (09:30 – 11:45)

#### ⏱️ Phút 09:30 - 10:15 | Đối Chiếu Kết Quả Trực Quan Qua Mockup & Bắt Đầu Test

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Chiếu hình ảnh UI Mockup [passport_testing_mockup.jpg](./assets/passport_testing_mockup.jpg) chỉ ra 3 kịch bản:
    - 🟢 Kịch bản 1: `200 OK` — Token hợp lệ
    - 🟠 Kịch bản 2: `401 Unauthorized` — `TokenExpiredError`
    - 🔴 Kịch bản 3: `401 Unauthorized` — `JsonWebTokenError`
  - Đảm bảo server đang chạy: `pnpm start:dev` ở Terminal 1.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Bây giờ là phần hào hứng nhất: **Hands-on Lab thực nghiệm trên Terminal**!
  >
  > Hãy nhìn vào ảnh mockup trên màn hình: Chúng ta sẽ lần lượt kiểm chứng cả 3 kịch bản từ thành công đến các loại lỗi xác thực tinh vi nhất!"

---

#### ⏱️ Phút 10:15 - 11:00 | Kịch Bản 1: Đăng Nhập Lấy Token & Truy Cập Profile Thành Công (`200 OK`)

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Tại Terminal 2, bắn lệnh cURL đăng nhập với tài khoản `alex@example.com`.
  - Copy Access Token nhận được và gửi request `GET /api/v1/users/profile`.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Trước tiên, chúng ta đăng nhập để lấy chiếc Access Token chuẩn:
  >
  > ```bash
  > curl -X POST http://localhost:3000/api/v1/auth/login \
  >   -H "Content-Type: application/json" \
  >   -d '{"email": "alex@example.com", "password": "Password123!"}'
  > ```
  >
  > Copy chuỗi `accessToken` trả về, và bắn vào endpoint Profile:
  >
  > ```bash
  > curl -X GET http://localhost:3000/api/v1/users/profile \
  >   -H "Authorization: Bearer <ACCESS_TOKEN_CỦA_BẠN>"
  > ```
  >
  > 💥 Hãy quan sát HTTP Status: `200 OK`!
  >
  > ```json
  > {
  >   "message": "Lấy thông tin cá nhân thành công qua Passport JwtAuthGuard!",
  >   "user": {
  >     "userId": 1,
  >     "email": "alex@example.com",
  >     "role": "USER"
  >   }
  > }
  > ```
  >
  > Passport đã tự động trích xuất token, verify chữ ký, gọi hàm `validate()` và inject thông tin của Alex vào `req.user` một cách hoàn hảo!"

---

#### ⏱️ Phút 11:00 - 11:45 | Kịch Bản 2 & 3: Kiểm Thử Lỗi Hết Hạn (`TokenExpiredError`) & Lỗi Giả Mạo (`JsonWebTokenError`)

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Gửi request với token hết hạn hoặc giả lập token cũ.
  - Gửi request với token sửa đổi chữ ký (`...FAKE_SIGNATURE`).
  - So sánh 2 thông báo lỗi tiếng Việt khác nhau trả về từ server.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Bây giờ sang **Kịch bản 2**: Khi một người dùng gửi token đã quá hạn sử dụng:
  >
  > ```bash
  > curl -X GET http://localhost:3000/api/v1/users/profile \
  >   -H "Authorization: Bearer <EXPIRED_TOKEN>"
  > ```
  >
  > Hãy nhìn vào thông báo lỗi:
  >
  > ```json
  > {
  >   "statusCode": 401,
  >   "message": "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!",
  >   "error": "Unauthorized"
  > }
  > ```
  >
  > Phương thức `handleRequest()` đã bắt đúng `TokenExpiredError` và trả về câu thông báo cực kỳ thân thiện!
  >
  > Và **Kịch bản 3**: Khi kẻ gian cố tình sửa đổi vài ký tự cuối trong chữ ký token:
  >
  > ```bash
  > curl -X GET http://localhost:3000/api/v1/users/profile \
  >   -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni...FAKE_SIGNATURE"
  > ```
  >
  > Server trả về:
  >
  > ```json
  > {
  >   "statusCode": 401,
  >   "message": "Mã xác thực (Token) không hợp lệ!",
  >   "error": "Unauthorized"
  > }
  > ```
  >
  > Passport nhận diện ngay lập tức đây là `JsonWebTokenError` và ngăn chặn kẻ tấn công tức thì!"

---

### PHẦN 6: TỔNG KẾT, GHI NHỚ & BƯỚC ĐỆM SANG GOOGLE OAUTH2 (11:45 – 12:45)

#### ⏱️ Phút 11:45 - 12:45 | Sơ Đồ Tư Duy Mindmap, Thử Thách & Git Commit

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Chiếu Mindmap tổng kết bài học.
  - Mở Terminal, thực hiện câu lệnh Git commit chuẩn mực.
  - Chiếu Slide giới thiệu bài học tiếp theo: **Lesson 4.5: Google OAuth2 Social Login**.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Như vậy trong bài học hôm nay, chúng ta đã đưa hệ thống xác thực của dự án lên chuẩn mực kiến trúc cao cấp nhất:
  >
  > 1. Hiểu sâu sắc **Strategy Pattern** và kiến trúc Pluggable cắm rút của Passport.js.
  > 2. Cài đặt và triển khai `JwtStrategy` với `ExtractJwt` và cơ chế tự động gán dữ liệu sạch từ `validate()` vào `req.user`.
  > 3. Tùy biến `JwtAuthGuard` với `handleRequest()` bắt chuẩn xác từng loại lỗi xác thực bằng tiếng Việt.
  > 4. Kiểm thử thành công trọn vẹn cả 3 kịch bản thực tế.
  >
  > Bây giờ, hãy mở Terminal và lưu lại bước tiến quan trọng này vào Git:
  >
  > ```bash
  > git add .
  > git commit -m "feat: implement passport jwt strategy and custom jwtauthguard"
  > ```
  >
  > 🎯 **Thử thách thực hành dành cho bạn:**  
  > Trong hàm `validate(payload)` của `JwtStrategy`, hãy thử inject thêm `UsersService` hoặc `PrismaService` để truy vấn CSDL: kiểm tra xem người dùng có bị đánh dấu `isBanned: true` hay không. Nếu bị ban, hãy ném ra `UnauthorizedException('Tài khoản của bạn đã bị khóa!')`. Bạn sẽ thấy việc bảo vệ API linh hoạt và mạnh mẽ đến dường nào!
  >
  > Ở bài học tiếp theo — **Lesson 4.5**, chúng ta sẽ tận hưởng thành quả của Strategy Pattern hôm nay: Tích hợp tính năng **Đăng nhập Google OAuth2 (Google Social Login)** chỉ bằng việc cắm thêm `GoogleStrategy` mà không cần đụng chạm tới một dòng code nào của JWT hiện tại!
  >
  > Cảm ơn các bạn đã theo dõi và hẹn gặp lại các bạn trong video tiếp theo!"

---

## 🧠 Sơ Đồ Tư Duy Tổng Kết Bài Học (Recap Mindmap)

```mermaid
mindmap
  root(("Lesson 4.4: Passport & JwtStrategy"))
    "Strategy Pattern Cốt Lõi"
      "Kiến trúc cắm rút Pluggable Architecture"
      "Tách rời Guard kích hoạt & Strategy xử lý"
      "Dễ mở rộng Google, GitHub, Local, Apple"
      "Chuẩn hóa đầu ra duy nhất req.user"
    "Triển Khai JwtStrategy"
      "Extends PassportStrategy(Strategy, 'jwt')"
      "ExtractJwt.fromAuthHeaderAsBearerToken()"
      "ignoreExpiration: false kiểm tra exp"
      "validate(payload) tự động inject req.user"
    "Tùy Biến JwtAuthGuard"
      "Extends AuthGuard('jwt')"
      "Ghi đè handleRequest xử lý lỗi chi tiết"
      "Bắt TokenExpiredError phiên hết hạn"
      "Bắt JsonWebTokenError token giả mạo"
    "Cấu Hình & Ứng Dụng"
      "PassportModule.register defaultStrategy"
      "Bảo vệ Route với @UseGuards(JwtAuthGuard)"
      "Lấy dữ liệu người dùng qua req.user Type-Safe"
    "Hands-on Lab Kiểm Thử"
      "200 OK: Token chuẩn xác"
      "401 Unauthorized: Phiên hết hạn"
      "401 Unauthorized: Chữ ký giả mạo"
```

---

## ✅ Checklist Kiểm Tra Chuẩn Bị Trước Khi Bấm Record (Ready to Record Checklist)

- [ ] Nhánh Git hiện tại đang là `lesson/4.4` sạch sẽ (`git branch` hiển thị đúng `lesson/4.4`).
- [ ] Gói `@nestjs/passport`, `passport`, `passport-jwt` và `@types/passport-jwt` đã sẵn sàng để cài đặt live trong video.
- [ ] CSDL PostgreSQL và Docker container đang hoạt động ổn định.
- [ ] VS Code đã cấu hình cỡ chữ 16–18 rõ ràng, terminal đôi sẵn sàng.
- [ ] Mở sẵn 4 ảnh minh họa trong thư mục `assets/` trên tab phụ để chuyển cảnh mượt mà: `multi_auth_methods_expansion.jpg`, `native_guards_scaling_problem.jpg`, `passport_multi_strategy_hub.jpg`, `passport_testing_mockup.jpg`.
- [ ] Lưu sẵn chuỗi cURL đăng nhập và token mẫu vào ghi chú để copy-paste mượt mà trong quá trình quay, tránh gõ sai chính tả gây gián đoạn mạch bài giảng.
- [ ] Giọng nói truyền cảm, nhiệt huyết, nhấn mạnh vào giá trị "Kiến trúc cắm rút (Pluggable Architecture)" và "Strategy Pattern".
