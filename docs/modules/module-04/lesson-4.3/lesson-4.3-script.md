# Kịch Bản Giảng Dạy (Instructor Script)

## Lesson 4.3: NestJS Guards — Kiểm Soát Quyền Truy Cập & Bảo Vệ API Trong NestJS

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

## 🎯 Thông Tin Tổng Quan Bài Học

- **Bài học:** Lesson 4.3: NestJS Guards — Kiểm Soát Quyền Truy Cập & Bảo Vệ API Trong NestJS
- **Khóa học:** NestJS Thực Chiến: Xây Dựng API Từ Cơ Bản Đến Nâng Cao
- **Thời lượng dự kiến:** 11 – 13 phút thực chiến
- **Mục tiêu cốt lõi:**
  1. Thấu hiểu bản chất **Guard** trong NestJS: Lớp chuyên trách duy nhất (Single Responsibility) quyết định cho phép hay chặn đứng request.
  2. Nắm vững vị trí chiến lược của Guard trong **Request Lifecycle**: Chạy ngay sau Middleware và trước Interceptor / Pipe / Controller, kích hoạt cơ chế **ngắt mạch sớm (Short-Circuit / Fail-Safe)** giúp tiết kiệm tài nguyên CPU.
  3. Phân biệt rành mạch giữa **Middleware** (không biết route đích) và **Guard** (có `ExecutionContext`, biết rõ Controller Class và Handler Method đích).
  4. Live-code 100% tự tay xây dựng một **Native Guard thuần NestJS** (`NativeAuthGuard`) thực thi interface `CanActivate`, trích xuất Bearer Token và thẩm định qua `JwtService.verifyAsync()`.
  5. Định nghĩa Type-Safe interfaces (`JwtPayload`, `UserData`) và gán thông tin người dùng (`userId`, `email`, `role`) vào `request['user']`.
  6. Áp dụng decorator `@UseGuards(NativeAuthGuard)` để khóa bảo vệ endpoint cá nhân `GET /api/v1/users/profile`.
  7. Thực hành Hands-on Lab kiểm thử 3 kịch bản: `200 OK` khi token hợp lệ, `401 Unauthorized` khi thiếu Header Authorization, và `401 Unauthorized` khi gửi Token giả mạo hoặc hết hạn.
  8. Phân tích vì sao Native Guard chưa đủ cho dự án Enterprise quy mô lớn, tạo bước đệm hoàn hảo dẫn dắt sang **Passport.js & JwtStrategy** ở Lesson 4.4.
- **Chuẩn bị trước khi quay (Instructor Pre-recording Checklist):**
  - [x] Đang ở branch `lesson/4.3` sạch sẽ.
  - [x] Mở sẵn VS Code ở độ phân giải 1080p, cỡ chữ font JetBrains Mono từ 16–18 rõ nét.
  - [x] Đảm bảo PostgreSQL & Docker container đang chạy, kết nối CSDL và Prisma ổn định.
  - [x] Mở sẵn 2 tab Terminal: Tab 1 chạy server NestJS (`pnpm start:dev`), Tab 2 dùng để gõ lệnh cURL kiểm thử.
  - [x] Mở sẵn thư mục `assets/` gồm: `guard_concept_diagram.svg`, `guard_pipeline_architecture.svg`, và `guard_api_testing_mockup.jpg` để chuyển cảnh minh họa trực quan.
  - [x] Chuẩn bị sẵn tài khoản mẫu trong CSDL (ví dụ: `alex@example.com` / `Password123!`) từ bài học 4.2 để đăng nhập lấy token nhanh chóng.

---

## ⏱️ Sơ Đồ Phân Bổ Thời Gian (Timeline Roadmap)

```mermaid
flowchart LR
    S1["<b>Phần 1: Khởi Động & Khái Niệm Guard</b><br/>(00:00 - 02:30)<br/>Vệ sĩ kiểm soát & Cơ chế Short-Circuit"] --> S2["<b>Phần 2: Request Lifecycle & So Sánh</b><br/>(02:30 - 04:30)<br/>Guard vs Middleware & ExecutionContext"]
    S2 --> S3["<b>Phần 3: Live-Code NativeAuthGuard</b><br/>(04:30 - 07:15)<br/>Implements CanActivate & verifyAsync"]
    S3 --> S4["<b>Phần 4: Bảo Vệ Route /users/profile</b><br/>(07:15 - 08:30)<br/>@UseGuards & Đọc req.user"]
    S4 --> S5["<b>Phần 5: Hands-on Lab Thực Chiến</b><br/>(08:30 - 11:00)<br/>Test 3 kịch bản: 200 OK & 401 Unauthorized"]
    S5 --> S6["<b>Phần 6: Cầu Nối Passport & Commit</b><br/>(11:00 - 12:15)<br/>Multi-Strategy, Mindmap & Git commit"]
```

---

## 🎬 Chi Tiết Kịch Bản Giảng Dạy Từng Phân Cảnh (Scene-by-Scene)

---

### PHẦN 1: KHỞI ĐỘNG & BẢN CHẤT CỦA GUARD TRONG NESTJS (00:00 – 02:30)

#### ⏱️ Phút 00:00 - 01:15 | Kết Nối Bài Học 4.2 & Đặt Vấn Đề Thực Tế

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Giảng viên xuất hiện trên webcam với phong thái hào hứng, truyền năng lượng tích cực.
  - Chiếu Slide Title bài học và Banner Overview `lesson_overview_banner.svg`.
  - Chuyển sang chiếu sơ đồ khái niệm [guard_concept_diagram.svg](./assets/guard_concept_diagram.svg) minh họa hình ảnh "Người gác cổng / Vệ sĩ" đứng trước Route Handler.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Xin chào tất cả các bạn! Chào mừng các bạn quay trở lại với chuỗi bài học chuyên sâu về **Authentication & Authorization** trong khóa học **NestJS Thực Chiến**!
  >
  > Ở bài học 4.2 trước, chúng ta đã cùng nhau xây dựng hoàn chỉnh luồng Đăng ký, Đăng nhập và cấp phát chiếc 'vòng tay định danh' — tức chuỗi **JSON Web Token (JWT)**.
  >
  > Nhưng một câu hỏi thực tế đặt ra là: Sau khi Client đã cầm chiếc chìa khóa Access Token trong tay, mỗi khi họ gửi request lên để xem thông tin cá nhân, sửa hồ sơ, hay thanh toán đơn hàng... **Ai sẽ là người đứng ra kiểm tra chiếc chìa khóa đó trước khi cho phép request bước vào Controller?**
  >
  > Nếu chúng ta viết code kiểm tra token thủ công bên trong từng hàm của Controller, code sẽ cực kỳ rác, trùng lặp và vi phạm nghiêm trọng nguyên lý kiến trúc phần mềm!
  >
  > Trong NestJS, giải pháp chuẩn mực và thanh lịch nhất cho bài toán này chính là **Guard** — Vị 'vệ sĩ canh cửa' quyền năng của hệ thống.
  >
  > Và chào mừng các bạn đến với **Lesson 4.3: NestJS Guards — Kiểm Soát Quyền Truy Cập & Bảo Vệ API Trong NestJS**!"

---

#### ⏱️ Phút 01:15 - 02:30 | Định Nghĩa Guard & Ẩn Dụ "Vệ Sĩ Cửa Hàng / Quán Bar"

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Dùng con trỏ chuột highlight vào hình vẽ Guard trên sơ đồ [guard_concept_diagram.svg](./assets/guard_concept_diagram.svg).
  - Chiếu 2 nhánh rẽ: Trả về `true` (cho qua) và `false` / Exception (ném lỗi 401).

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Vậy bản chất **Guard** trong NestJS là gì?
  >
  > Về mặt kỹ thuật, Guard là một class TypeScript được gắn decorator `@Injectable()` và thực thi (implements) một interface duy nhất mang tên: **`CanActivate`**.
  >
  > Guard hoạt động theo nguyên lý **Single Responsibility (Đơn nhiệm)** cực kỳ rõ ràng:
  > Nó chỉ trả lời đúng một câu hỏi nhị phân: **Request này có được phép đi tiếp hay không?**
  >
  > 🚪 **Ẩn dụ trực quan:**
  > Hãy tưởng tượng Guard giống hệt như một **chàng vệ sĩ (Bouncer)** đứng ngay trước cửa một câu lạc bộ hoặc khu VIP:
  >
  > - Khách tới cửa xuất trình vé hoặc thẻ thành viên.
  > - Vệ sĩ soi đèn kiểm tra:
  >   - Nếu vé hợp lệ, còn hạn sử dụng ➔ Vệ sĩ gật đầu, **mở cửa cho vào (`return true`)**.
  >   - Nếu khách không có vé, hoặc vé bị làm giả, hoặc vé hết hạn ➔ Vệ sĩ chặn ngay tại bậc thềm, **từ chối thẳng thừng (`return false` hoặc ném `UnauthorizedException`)**, khách không bao giờ được bước chân vào bên trong quầy!
  >
  > Trong ứng dụng của chúng ta cũng vậy: Khi Guard từ chối, request sẽ lập tức dừng lại và Client nhận về mã lỗi HTTP `401 Unauthorized` hoặc `403 Forbidden`!"

- 💡 **Mẹo sư phạm (Pedagogical Tip):**
  > Nhấn mạnh từ khóa "Single Responsibility": Guard không làm nhiệm vụ tính toán dữ liệu kinh doanh, không ghi log phức tạp; nhiệm vụ duy nhất của nó là **thẩm định điều kiện để Cho qua hay Chặn lại**.

---

### PHẦN 2: VỊ TRÍ TRONG REQUEST PIPELINE & GUARD VS MIDDLEWARE (02:30 – 04:30)

#### ⏱️ Phút 02:30 - 03:30 | Mổ Xẻ Sơ Đồ Request Lifecycle & Cơ Chế Fail-Safe Ngắt Mạch Sớm

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Chiếu toàn màn hình sơ đồ kiến trúc [guard_pipeline_architecture.svg](./assets/guard_pipeline_architecture.svg).
  - Dùng chuột rà qua các chặng: `Client Request ➔ Global/Route Middleware ➔ GUARDS (CanActivate) ➔ Interceptors ➔ Pipes ➔ Route Handler`.
  - Highlight vị trí của Guards nằm ngay trước Interceptors & Pipes.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Bây giờ, mời các bạn nhìn lên sơ đồ chuỗi xử lý Request Lifecycle của NestJS — đây là kiến thức nền tảng cực kỳ quan trọng mà bất kỳ lập trình viên NestJS nào cũng phải nằm lòng.
  >
  > Khi một HTTP Request từ Client bay tới server:
  >
  > 1. Điểm dừng chân đầu tiên là **Middleware** (ví dụ như CORS, Logger, cookieParser).
  > 2. Ngay sau Middleware, request sẽ đụng ngay bức tường bảo vệ thứ hai: **GUARDS**!
  > 3. Chỉ khi Guard chấp thuận (`true`), request mới được đi tiếp qua **Interceptors**, rồi đến **Pipes** (để validate dữ liệu DTO), và cuối cùng mới chạm tới **Route Handler** trong Controller.
  >
  > ⚡ **Cơ chế ngắt mạch sớm (Short-Circuit / Fail-Safe):**  
  > Hãy chú ý lợi thế cực lớn của kiến trúc này:  
  > Giả sử một request tấn công hoặc request không gửi token, Guard sẽ chặn đứng ngay lập tức tại chặng số 2. Hệ thống **không hề tốn một chu kỳ CPU nào** để chạy qua Interceptor, không cần parse body hay validate DTO, và càng không tốn tài nguyên truy vấn Database!  
  > Đây chính là cơ chế bảo vệ máy chủ tối ưu nhất trước các cuộc tấn công quét request dồn dập."

---

#### ⏱️ Phút 03:30 - 04:30 | So Sánh Bản Chất: Tại Sao Cần Guard Mà Không Dùng Luôn Middleware?

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Chiếu bảng so sánh đối đầu giữa **⚙️ Middleware** và **🛡️ Guard**.
  - Highlight tham số `ExecutionContext` của Guard.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Rất nhiều bạn khi học từ Express sang thường hỏi:  
  > _'Anh ơi, ở Express em toàn viết `authMiddleware(req, res, next)` để kiểm tra Token. Tại sao sang NestJS lại sinh ra Guard làm gì cho phức tạp?'_
  >
  > Câu trả lời nằm ở **Ngữ cảnh thực thi (Execution Context)**:
  >
  > - **Middleware:** Được kế thừa trực tiếp từ Express. Nó chỉ có 3 tham số thô: `req, res, next()`. Middleware chạy từ rất sớm, nó hoàn toàn 'mù thông tin' về tương lai — nó **không hề biết** request này sẽ rơi vào Controller nào, method nào sắp xử lý, hay hàm đó có gắn metadata phân quyền gì đặc biệt hay không.
  > - **Guard:** Là công dân hạng nhất (First-class citizen) của NestJS. Guard nhận vào tham số cực kỳ quyền năng là **`ExecutionContext`**. Nhờ đối tượng này, Guard không những lấy được `Request`, mà nó còn biết chính xác Controller Class và Handler Method nào sắp được gọi thông qua các hàm như `context.getClass()` và `context.getHandler()`.
  >
  > Nhờ vậy, sau này ở bài học phân quyền nâng cao (RBAC), Guard có thể đọc được metadata như: _'Ủa, hàm này yêu cầu quyền Admin, xem user hiện tại có role Admin không?'_ — điều mà Middleware thông thường hoàn toàn bất lực!
  >
  > Tóm lại: **Tác vụ chung hạ tầng (Log, CORS, Compress) ➔ Dùng Middleware. Còn Bảo mật, Xác thực & Phân quyền ➔ Bắt buộc dùng Guard!**"

---

### PHẦN 3: LIVE-CODE XÂY DỰNG NATIVE AUTH GUARD THUẦN NESTJS (04:30 – 07:15)

#### ⏱️ Phút 04:30 - 05:30 | Định Nghĩa Interface Type-Safe Cho JWT Payload & User Data

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Chuyển màn hình sang VS Code.
  - Tạo tệp 📄 **`src/auth/interfaces/jwt.interface.ts`**.
  - Khai báo interface `JwtPayload` và `UserData` với kiểu `Role` từ Prisma enum.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Để code đạt chuẩn Enterprise Type-Safe, trước tiên chúng ta định nghĩa các Interface đại diện cho dữ liệu giải mã từ JWT và dữ liệu gắn vào Request.
  >
  > Chúng ta tạo tệp: `src/auth/interfaces/jwt.interface.ts`:
  >
  > 📄 **`src/auth/interfaces/jwt.interface.ts`**
  >
  > ```typescript
  > import { Role } from '@/generated/prisma/enums';
  >
  > export interface JwtPayload {
  >   sub: number;
  >   email: string;
  >   role: Role;
  > }
  >
  > export interface UserData {
  >   userId: number;
  >   email: string;
  >   role: Role;
  > }
  > ```
  >
  > `sub` đại diện cho ID người dùng theo chuẩn RFC 7519, `email` và `role` giúp chúng ta phân quyền chính xác sau này!"

---

#### ⏱️ Phút 05:30 - 06:30 | Triển Khai Class `NativeAuthGuard` Với `CanActivate`

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Tạo thư mục: `src/auth/guards/`.
  - Tạo tệp 📄 **`src/auth/guards/native-auth.guard.ts`**.
  - Gõ từng dòng code, phân tích logic trích xuất Bearer Token và verify token.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Bây giờ, chúng ta cùng nhau tự tay xây dựng một **`NativeAuthGuard` thuần NestJS 100%**.
  >
  > Tạo tệp: `src/auth/guards/native-auth.guard.ts`:
  >
  > 📄 **`src/auth/guards/native-auth.guard.ts`**
  >
  > ```typescript
  > import {
  >   CanActivate,
  >   ExecutionContext,
  >   Injectable,
  >   UnauthorizedException,
  > } from '@nestjs/common';
  > import { ConfigService } from '@nestjs/config';
  > import { JwtService } from '@nestjs/jwt';
  > import { Request } from 'express';
  > import { JwtPayload } from '../interfaces/jwt.interface';
  >
  > @Injectable()
  > export class NativeAuthGuard implements CanActivate {
  >   constructor(
  >     private readonly configService: ConfigService,
  >     private readonly jwtService: JwtService,
  >   ) {}
  >
  >   async canActivate(context: ExecutionContext): Promise<boolean> {
  >     // Bước 1: Lấy đối tượng Request từ ExecutionContext
  >     const request = context.switchToHttp().getRequest<Request>();
  >
  >     // Bước 2: Bóc tách Bearer Token từ Header Authorization
  >     const token = this.extractTokenFromHeader(request);
  >
  >     // Bước 3: Chặn đứng ngay nếu Client không gửi Token
  >     if (!token) {
  >       throw new UnauthorizedException(
  >         'Yêu cầu bị từ chối: Thiếu Bearer Token trong Header Authorization!',
  >       );
  >     }
  >
  >     try {
  >       // Bước 4: Thẩm định chữ ký số và thời hạn với Secret Key
  >       const secret = this.configService.get<string>('JWT_SECRET');
  >       const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
  >         secret,
  >       });
  >
  >       // Bước 5: Đính kèm dữ liệu User sạch vào request['user']
  >       request['user'] = {
  >         userId: payload.sub,
  >         email: payload.email,
  >         role: payload.role,
  >       };
  >     } catch {
  >       // Bước 6: Bắt lỗi nếu Token sai chữ ký hoặc đã hết hạn
  >       throw new UnauthorizedException(
  >         'Yêu cầu bị từ chối: Token không hợp lệ hoặc đã hết hạn!',
  >       );
  >     }
  >
  >     // Bước 7: Cánh cửa mở ra: Cho phép request đi tiếp vào Controller!
  >     return true;
  >   }
  >
  >   private extractTokenFromHeader(request: Request): string | undefined {
  >     const authHeader = request.headers.authorization;
  >     if (!authHeader) {
  >       return undefined;
  >     }
  >
  >     const [type, token] = authHeader.split(' ');
  >     return type === 'Bearer' ? token : undefined;
  >   }
  > }
  > ```
  >
  > Đoạn code này hoàn hảo ở chỗ:
  >
  > - Chúng ta chủ động ném `throw new UnauthorizedException()` với thông báo tiếng Việt rõ ràng, giúp Frontend hiển thị message thân thiện thay vì lỗi 403 mặc định.
  > - Dữ liệu `request['user']` đã được type-safe qua `JwtPayload`, đính kèm cả `role` của người dùng!"

---

#### ⏱️ Phút 06:30 - 07:15 | Cấu Hình Export Trong AuthModule & Import Vào UsersModule

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Mở tệp 📄 **`src/auth/auth.module.ts`**, thêm `NativeAuthGuard` vào `providers` và `exports`.
  - Mở tệp 📄 **`src/users/users.module.ts`**, import `AuthModule`.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Để `UsersModule` sử dụng được Guard này, chúng ta cần cấu hình Module theo chuẩn NestJS DI.
  >
  > Mở tệp `src/auth/auth.module.ts`:
  >
  > 📄 **`src/auth/auth.module.ts`**
  >
  > ```typescript
  > @Module({
  >   imports: [JwtModule.registerAsync({ ... })],
  >   controllers: [AuthController],
  >   providers: [AuthService, NativeAuthGuard],
  >   exports: [NativeAuthGuard, JwtModule], // 👈 Export NativeAuthGuard & JwtModule
  > })
  > export class AuthModule {}
  > ```
  >
  > Tiếp theo, mở tệp `src/users/users.module.ts` và import `AuthModule` vào:
  >
  > 📄 **`src/users/users.module.ts`**
  >
  > ```typescript
  > @Module({
  >   imports: [AuthModule], // 👈 Đón nhận NativeAuthGuard
  >   providers: [UsersService],
  >   controllers: [UsersController],
  > })
  > export class UsersModule {}
  > ```
  >
  > Rất ngăn nắp và đúng chuẩn module hóa!"

---

### PHẦN 4: BẢO VỆ ENDPOINT BẰNG @USEGUARDS() (07:15 – 08:30)

#### ⏱️ Phút 07:15 - 08:30 | Gắn Guard Vào Route `GET /users/profile` Trong UsersController

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Mở tệp 📄 **`src/users/users.controller.ts`**.
  - Thêm endpoint `@Get('profile')` có gắn decorator `@UseGuards(NativeAuthGuard)`.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Bây giờ, chúng ta sẽ cử 'chàng vệ sĩ' `NativeAuthGuard` ra đứng gác trước endpoint lấy thông tin cá nhân của người dùng.
  >
  > Mở tệp `src/users/users.controller.ts`:
  >
  > 📄 **`src/users/users.controller.ts`**
  >
  > ```typescript
  > import {
  >   Body,
  >   Controller,
  >   Get,
  >   Post,
  >   Req,
  >   UseGuards,
  > } from '@nestjs/common';
  > import { Request } from 'express';
  > import { UsersService } from './users.service';
  > import { CreateUserDto } from './dto/create-user.dto';
  > import { NativeAuthGuard } from '@/auth/guards/native-auth.guard';
  > import { UserData } from '@/auth/interfaces/jwt.interface';
  >
  > @Controller('users')
  > export class UsersController {
  >   constructor(private readonly usersService: UsersService) {}
  >
  >   // 🛡️ CỬ VỆ SĨ ĐỨNG GÁC ENDPOINT NÀY
  >   @UseGuards(NativeAuthGuard)
  >   @Get('profile')
  >   getProfile(@Req() req: Request) {
  >     return {
  >       message: 'Xác thực tài khoản thành công qua NativeAuthGuard!',
  >       user: req['user'] as UserData, // 👈 Dữ liệu Type-Safe được Guard truyền vào
  >     };
  >   }
  > }
  > ```
  >
  > Các bạn nhìn xem: Chỉ một dòng decorator: `@UseGuards(NativeAuthGuard)` đặt ngay trên đầu hàm `getProfile()`, toàn bộ cánh cổng dẫn vào endpoint này đã được bảo vệ tuyệt đối.
  >
  > Controller hoàn toàn không cần bận tâm token verify ra sao, khóa bí mật là gì — phân tách trách nhiệm hoàn hảo!"

---

### PHẦN 5: HANDS-ON LAB — KIỂM THỬ 3 KỊCH BẢN THỰC CHIẾN (08:30 – 11:00)

#### ⏱️ Phút 08:30 - 09:30 | Kịch Bản 1: Đăng Nhập & Truy Cập Thành Công (`200 OK`)

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Chiếu hình ảnh UI Mockup [guard_api_testing_mockup.jpg](./assets/guard_api_testing_mockup.jpg) chỉ ra 2 luồng: `200 OK (Authorized)` và `401 Unauthorized`.
  - Mở Terminal 1 kiểm tra server: `pnpm start:dev` đang chạy mượt mà.
  - Chuyển sang Terminal 2: Bắn cURL đăng nhập để lấy Token, sau đó gọi `GET /api/v1/users/profile`.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Bây giờ là lúc chúng ta thực chiến trên Terminal với 3 kịch bản kiểm thử không thể bỏ qua!
  >
  > **Kịch bản 1: Luồng thành công (Happy Path)**
  >
  > Đầu tiên, chúng ta đăng nhập để lấy Access Token:
  >
  > ```bash
  > curl -X POST http://localhost:3000/api/v1/auth/login \
  >   -H "Content-Type: application/json" \
  >   -d '{"email": "alex@example.com", "password": "Password123!"}'
  > ```
  >
  > Server trả về: `accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`.
  >
  > Bây giờ, chúng ta dùng token này để gọi vào API cá nhân:
  >
  > ```bash
  > curl -X GET http://localhost:3000/api/v1/users/profile \
  >   -H "Authorization: Bearer <ACCESS_TOKEN_CỦA_BẠN>"
  > ```
  >
  > 💥 Hãy quan sát kết quả trả về:
  >
  > ```json
  > {
  >   "message": "Xác thực tài khoản thành công qua NativeAuthGuard!",
  >   "user": {
  >     "userId": 1,
  >     "email": "alex@example.com",
  >     "role": "USER"
  >   }
  > }
  > ```
  >
  > Tuyệt vời! HTTP Status `200 OK`. `NativeAuthGuard` đã thẩm định token hợp lệ, giải mã payload và cho phép Controller trả về thông tin profile chính xác!"

---

#### ⏱️ Phút 09:30 - 10:15 | Kịch Bản 2: Chặn Đứng Request Không Gửi Token (`401 Unauthorized`)

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Tại Terminal 2, gõ lệnh cURL gọi thẳng vào `/api/v1/users/profile` mà không truyền kèm Header `Authorization`.
  - Highlight mã trạng thái HTTP `401` và thông điệp lỗi tiếng Việt rõ ràng.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Bây giờ sang **Kịch bản 2**: Giả sử một người dùng chưa đăng nhập hoặc bot quét gọi vào endpoint này mà **KHÔNG GỬI** Header Authorization:
  >
  > ```bash
  > curl -i -X GET http://localhost:3000/api/v1/users/profile
  > ```
  >
  > Ngay lập tức Server phản hồi:
  > `HTTP/1.1 401 Unauthorized`!
  >
  > ```json
  > {
  >   "statusCode": 401,
  >   "message": "Yêu cầu bị từ chối: Thiếu Bearer Token trong Header Authorization!",
  >   "error": "Unauthorized"
  > }
  > ```
  >
  > Các bạn thấy không? `NativeAuthGuard` đã chặn đứng request ngay từ bước số 3, trước khi gọi đến `JwtService`, bảo vệ server an toàn 100%!"

---

#### ⏱️ Phút 10:15 - 11:00 | Kịch Bản 3: Chặn Đứng Token Giả Mạo Chữ Ký Hoặc Đã Hết Hạn

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Lấy token hợp lệ ban nãy, sửa vài ký tự cuối cùng trong phần Signature thành chuỗi bất kỳ: `...FAKE_SIGNATURE`.
  - Gửi request và quan sát mã lỗi `401`.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Và **Kịch bản 3**: Kịch bản kẻ tấn công tinh vi cố tình chỉnh sửa nội dung Token, hoặc một chiếc token đã quá hạn sử dụng:
  >
  > Chúng ta lấy chuỗi token chuẩn lúc nãy, nhưng sửa các ký tự cuối cùng của chữ ký thành `...FAKE_SIGNATURE`:
  >
  > ```bash
  > curl -i -X GET http://localhost:3000/api/v1/users/profile \
  >   -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni...FAKE_SIGNATURE"
  > ```
  >
  > Server vẫn kiên quyết trả về: **`401 Unauthorized`**!
  >
  > ```json
  > {
  >   "statusCode": 401,
  >   "message": "Yêu cầu bị từ chối: Token không hợp lệ hoặc đã hết hạn!",
  >   "error": "Unauthorized"
  > }
  > ```
  >
  > Thuật toán `jwtService.verifyAsync()` đã phát hiện con dấu bí mật bị sai lệch hoàn toàn so với `JWT_SECRET`, và lập tức ném lỗi để Guard đóng sập cánh cửa lại. Không một kẻ gian nào có thể lọt qua!"

---

### PHẦN 6: VÌ SAO CẦN PASSPORT.JS? TỔNG KẾT & GIT COMMIT (11:00 – 12:15)

#### ⏱️ Phút 11:00 - 11:45 | Giới Hạn Của Native Guard & Cầu Nối Sang Passport.js

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Chiếu Slide so sánh: Tự viết Native Guard vs Chuẩn công nghiệp Passport.js.
  - Nhắc tới các tính năng tương lai: Đăng nhập Google, Facebook, Refresh Token, API Key.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Tới đây, các bạn có thể đặt câu hỏi:  
  > _'Thầy ơi, NativeAuthGuard chạy xịn sò như thế này rồi, tại sao người ta vẫn khuyên dùng thư viện **Passport.js**?'_
  >
  > `NativeAuthGuard` cực kỳ tuyệt vời để chúng ta hiểu sâu sắc 100% bản chất cơ chế Guard của NestJS. Tuy nhiên, trong các dự án thực tế quy mô lớn, Native Guard sẽ bộc lộ 2 điểm nghẽn:
  >
  > 1. **Khó mở rộng đa phương thức xác thực (Multi-Strategy):** Mai này ứng dụng của bạn không chỉ đăng nhập bằng JWT, mà còn hỗ trợ Đăng nhập bằng Google OAuth, Apple ID, GitHub, Facebook, hoặc API Key... Nếu mỗi loại bạn lại tự ngồi viết một Guard thủ công thì mã nguồn sẽ phình to và rất khó bảo trì.
  > 2. **Vi phạm nguyên lý phân tách trách nhiệm:** Guard chỉ nên làm nhiệm vụ: _Cho qua hay Chặn lại?_. Còn việc _bóc tách token, giải mã, kết nối cơ sở dữ liệu để tìm User_ nên được đẩy sang một tầng chuyên biệt gọi là **Strategy**.
  >
  > Đó chính là lý do vì sao ở bài học tiếp theo — **Lesson 4.4**, chúng ta sẽ tích hợp **Passport.js & JwtStrategy** — chuẩn mực xác thực công nghiệp được NestJS hỗ trợ chính thức qua gói `@nestjs/passport`!"

---

#### ⏱️ Phút 11:45 - 12:15 | Mindmap Tổng Kết Bài Học & Thực Hiện Git Commit

- 🎬 **Hành động & Màn hình hiển thị (Screen/Visuals):**
  - Chiếu Sơ đồ tư duy Mindmap tổng kết bài học.
  - Chuyển sang Terminal thực hiện câu lệnh git commit chuẩn mực.
  - Chiếu thông tin bài học tiếp theo: Lesson 4.4.

- 🎙️ **Lời thoại Giảng viên (Instructor Dialogue):**

  > "Hãy nhìn lại toàn bộ hành trình bài học hôm nay trên sơ đồ tư duy:
  >
  > - Chúng ta đã hiểu Guard thực thi `CanActivate`, mang trách nhiệm duy nhất Cho qua hoặc Chặn.
  > - Hiểu vị trí Guard chạy ngay sau Middleware và trước Interceptor / Handler, tạo cơ chế ngắt mạch sớm tiết kiệm CPU.
  > - Phân biệt Guard (có `ExecutionContext`) khác biệt hoàn toàn với Middleware thô.
  > - Tự tay viết `NativeAuthGuard` verify JWT token và kiểm thử thành công cả 3 kịch bản `200 OK` lẫn `401 Unauthorized`.
  >
  > Bây giờ, hãy giữ thói quen chuyên nghiệp của một kỹ sư phần mềm, mở Terminal và lưu lại toàn bộ thành quả này vào Git:
  >
  > ```bash
  > git add .
  > git commit -m "feat: implement native auth guard and add protected user profile route"
  > ```
  >
  > 🎯 **Thử thách nhỏ dành cho bạn:**  
  > Trong `NativeAuthGuard`, chúng ta đã trích xuất được `role: payload.role`. Hãy thử kiểm tra: Nếu `payload.role !== Role.ADMIN` thì ném ra lỗi `ForbiddenException('Bạn không có quyền truy cập!')`. Bạn sẽ thấy việc phân quyền bằng Guard bắt đầu mở ra vô cùng trực quan và thú vị!
  >
  > Cảm ơn tất cả các bạn đã chú ý lắng nghe. Chúc các bạn thực hành thành công và hẹn gặp lại các bạn trong **Lesson 4.4: Chuẩn Hóa Xác Thực Cùng Passport.js & JwtStrategy**!"

---

## 🧠 Sơ Đồ Tư Duy Tổng Kết Bài Học (Recap Mindmap)

```mermaid
mindmap
  root(("Lesson 4.3: NestJS Guards"))
    "Bản Chất & Khái Niệm"
      "Implements CanActivate interface"
      "Hàm duy nhất canActivate context"
      "Single Responsibility: Cho phép hoặc Chặn"
      "Trả về boolean hoặc ném Exception"
    "Vị Trí Request Pipeline"
      "Nằm sau Middleware và trước Interceptor"
      "Ngắt mạch sớm Short-Circuit tiết kiệm CPU"
      "Bảo vệ Route Handler an toàn tuyệt đối"
    "So Sánh Guard vs Middleware"
      "Middleware: Không biết Handler đích"
      "Guard: Nhận ExecutionContext toàn năng"
      "Guard: Chuyên trách Bảo mật & Quyền hạn"
    "Triển Khai NativeAuthGuard"
      "Trích xuất Bearer Token từ header"
      "jwtService.verifyAsync thẩm định chữ ký"
      "Định nghĩa JwtPayload & UserData type-safe"
      "Gán payload đã xác thực vào req user"
      "Bảo vệ Controller qua decorator UseGuards"
    "Kịch Bản Kiểm Thử Thực Chiến"
      "200 OK khi Token hợp lệ"
      "401 Unauthorized khi thiếu Authorization header"
      "401 Unauthorized khi Token fake hoặc hết hạn"
    "Bước Đệm Tương Lai"
      "Nhu cầu Multi-Strategy OAuth2 & Google"
      "Tách rời Guard và Strategy với Passport js"
```

---

## ✅ Checklist Kiểm Tra Chuẩn Bị Trước Khi Bấm Record (Ready to Record Checklist)

- [ ] Nhánh Git hiện tại sạch sẽ, mã nguồn đã build không có lỗi TypeScript.
- [ ] CSDL PostgreSQL và Docker container đang hoạt động ổn định.
- [ ] Cấu hình biến môi trường `.env` có đầy đủ `JWT_SECRET` và `JWT_EXPIRES_IN`.
- [ ] VS Code đã cấu hình giao diện sạch, cỡ chữ 16–18 rõ ràng, bật tab Terminal đôi.
- [ ] Mở sẵn hình ảnh minh họa trong thư mục `assets/` trên tab phụ hoặc ứng dụng xem ảnh để chuyển cảnh tức thì.
- [ ] Lưu sẵn chuỗi cURL đăng nhập và token mẫu vào ghi chú để copy-paste mượt mà trong quá trình quay, tránh gõ sai chính tả gây gián đoạn mạch bài giảng.
- [ ] Giữ giọng nói truyền cảm, hào hứng, tự tin và giải thích cặn kẽ từng nguyên lý kỹ thuật.
