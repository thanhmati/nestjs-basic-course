# Lesson 5.6: Gửi Mail Trong NestJS — Welcome Email Khi Đăng Ký Tài Khoản Với @nestjs/mail

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-Framework-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-Language-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/@nestjs/mail-Email_Service-EA4335?style=for-the-badge&logo=gmail&logoColor=white" alt="@nestjs/mail" />
  <img src="https://img.shields.io/badge/SMTP-Protocol-4A90D9?style=for-the-badge&logo=minutemailer&logoColor=white" alt="SMTP" />
  <img src="https://img.shields.io/badge/Event_Driven-Architecture-F59E0B?style=for-the-badge&logo=apachekafka&logoColor=white" alt="Event-Driven" />
  <img src="https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma PostgreSQL" />
  <img src="https://img.shields.io/badge/pnpm-Package_Manager-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
</p>

<p align="center">
  <img src="./assets/lesson_overview_banner.png" alt="Lesson Overview Banner — Gửi Email Với @nestjs/mail Trong NestJS" width="100%" />
</p>

---

> [!NOTE]
> ⏱️ **Thời lượng dự kiến:** 20 – 30 phút thực hành chuyên sâu
> 🎯 **Mục tiêu bài học:**
> Sau khi hoàn thành bài học này, bạn có thể:
>
> - **Giải thích (Explain)** tại sao cần hệ thống gửi email trong ứng dụng backend và vai trò của `@nestjs/mail` trong NestJS.
> - **Cấu hình (Configure)** `MailModule.forRoot()` với SMTP Transport và Template Engine trong `AppModule`.
> - **Thiết kế (Design)** Mail Class kiểu Type-Safe với `Mailable<TData>` để tạo email chuyên nghiệp, tái sử dụng được.
> - **Xây dựng (Implement)** HTML Template cho Welcome Email với cú pháp an toàn (auto-escaping) và Layout dùng chung.
> - **Tích hợp (Apply)** hệ thống Event-Driven từ Lesson 5.5 để gửi Welcome Email tự động khi user đăng ký thành công qua sự kiện `user.registered`.
> - **Debug & Khắc phục lỗi (Debug)** các lỗi phổ biến khi cấu hình SMTP, template engine và mail transport.

> [!IMPORTANT]
> **Prerequisites (Kiến thức tiên quyết):**
> Trước khi bắt đầu bài học này, bạn nên nắm vững:
>
> - NestJS Controllers, Providers & Dependency Injection cơ bản ([Module 1](../../module-01/lesson-1.9/lesson-1.9.md)).
> - Prisma ORM & quan hệ cơ sở dữ liệu PostgreSQL ([Module 2](../../module-02/lesson-2.1/lesson-2.1.md)).
> - JWT Authentication & `AuthService.register()` ([Module 4](../../module-04/lesson-4.2/lesson-4.2.md)).
> - Event-Driven Architecture & `@nestjs/event-emitter` ([Lesson 5.5](../lesson-5.5/lesson-5.5.md)).

---

## 1. Vấn Đề & Bối Cảnh Thực Tế (Why?)

### 📧 Khi Đăng Ký Chỉ Trả Về JSON Là Chưa Đủ

Trong ứng dụng Social Chat App hiện tại, khi người dùng gọi `POST /api/v1/auth/register`, hệ thống:

1. Kiểm tra email trùng lặp.
2. Hash mật khẩu.
3. Lưu user vào PostgreSQL.
4. Phát hành JWT Access Token.
5. Trả về `201 Created` kèm token.

**Kết quả:** Người dùng đăng ký xong, nhận token, và... không có gì thêm. Không email chào mừng, không xác nhận tài khoản, không có cảm giác "chuyên nghiệp" như các nền tảng thực tế.

```mermaid
flowchart LR
    Client["📱 Client"] -->|"POST /auth/register"| Auth["AuthService"]
    Auth -->|"Lưu User"| DB[("PostgreSQL")]
    Auth -->|"201 + Token"| Client
    Auth -.->|"❌ Không có email chào mừng"| Nowhere["???"]
```

### 💡 Ứng Dụng Thực Tế Luôn Gửi Email

Hãy nhìn vào trải nghiệm đăng ký của các nền tảng lớn:

| Nền tảng   | Sau khi đăng ký     | Email nội dung                                 |
| ---------- | ------------------- | ---------------------------------------------- |
| **GitHub** | Gửi email xác minh  | "Please verify your email address"             |
| **Notion** | Gửi email chào mừng | "Welcome to Notion! Here's how to get started" |
| **Vercel** | Gửi email xác nhận  | "Verify your email to start deploying"         |

Tất cả đều gửi email **ngay sau khi user đăng ký thành công**. Đây không phải tính năng "nice-to-have" — đây là **tiêu chuẩn của ứng dụng production**.

<p align="center">
  <img src="./assets/email_notification_mockup.png" alt="Email Notification Mockup — Email Gửi Tới Người Dùng Trong Môi Trường Thực Tế" width="95%" />
</p>

### 🎯 Mục Tiêu Bài Học

Chúng ta sẽ xây dựng hệ thống gửi Welcome Email cho Social Chat App:

```mermaid
flowchart TD
    Client["📱 Client"] -->|"POST /auth/register"| Auth["AuthService"]
    Auth -->|"1. Lưu User"| DB[("PostgreSQL")]
    Auth -->|"2. Emit 'user.registered'"| EventBus["EventEmitter2"]
    Auth -->|"3. 201 + Token"| Client

    EventBus -->|"4. Trigger listener"| MailHandler["MailHandler"]
    MailHandler -->|"5. Render template"| Template["welcome.html"]
    MailHandler -->|"6. Gửi qua SMTP"| SMTP["📮 SMTP Server"]
    SMTP -->|"7. Email tới inbox"| Inbox["📬 User Inbox"]

    style EventBus fill:#F59E0B,color:#000
    style SMTP fill:#EA4335,color:#fff
```

**Luồng hoạt động:**

1. `AuthService.register()` lưu user → emit sự kiện `user.registered`.
2. `MailHandler` lắng nghe sự kiện → render HTML template → gửi email qua SMTP.
3. Response trả về client **ngay lập tức**, không cần đợi email gửi xong.

---

## 2. Mental Model: Email Trong Backend Application (What?)

### 📮 Ba Thành Phần Cốt Lõi Của Hệ Thống Gửi Mail

```mermaid
flowchart TD
    subgraph Application["🏗️ NestJS Application"]
        MailClass["📝 Mail Class\n(Nội dung email)"]
        TemplateEngine["🎨 Template Engine\n(Render HTML)"]
        Transport["🚚 Transport\n(Phương thức gửi)"]
    end

    MailClass -->|"subject + context"| TemplateEngine
    TemplateEngine -->|"HTML hoàn chỉnh"| Transport
    Transport -->|"SMTP / HTTP API"| MailServer["📮 Mail Server\n(Gmail, Mailhog, Resend...)"]
    MailServer -->|"Delivery"| Inbox["📬 User Inbox"]
```

| Thành phần          | Vai trò                                             | Ví dụ trong bài học                                |
| ------------------- | --------------------------------------------------- | -------------------------------------------------- |
| **Mail Class**      | Định nghĩa nội dung email (subject, template, data) | `WelcomeMail`                                      |
| **Template Engine** | Render HTML từ template file + data                 | `FileTemplateEngine`                               |
| **Transport**       | Phương thức vận chuyển email                        | `SmtpTransport` (development: `FileMailTransport`) |

### 🧩 So Sánh: Gửi Email Trực Tiếp vs. Qua Event

Từ Lesson 5.5, chúng ta đã biết rằng gọi tác vụ phụ trợ **trực tiếp bên trong business logic** gây ra nhiều vấn đề. Gửi email cũng không ngoại lệ:

```mermaid
flowchart LR
    subgraph BAD["❌ Gọi trực tiếp trong register()"]
        direction TB
        R1["register()"] --> Save1["Lưu DB (15ms)"]
        Save1 --> Send1["Gửi Email (2000ms)"]
        Send1 --> Return1["Trả response (Tổng: ~2015ms)"]
    end

    subgraph GOOD["✅ Qua Event (Tách rời)"]
        direction TB
        R2["register()"] --> Save2["Lưu DB (15ms)"]
        Save2 --> Emit2["Emit event (< 1ms)"]
        Emit2 --> Return2["Trả response (Tổng: ~16ms)"]
        Emit2 -.->|"async"| Handler2["MailHandler gửi email (2000ms)"]
    end
```

| Tiêu chí               | Gửi trực tiếp                             | Qua Event                            |
| ---------------------- | ----------------------------------------- | ------------------------------------ |
| **Thời gian response** | ~2015ms (chờ SMTP)                        | ~16ms (trả ngay)                     |
| **SMTP lỗi?**          | User nhận 500 Error                       | User vẫn đăng ký thành công          |
| **Coupling**           | `AuthService` phụ thuộc `MailService`     | Tách rời hoàn toàn                   |
| **Mở rộng**            | Thêm push notification = sửa `register()` | Thêm listener mới, không sửa code cũ |

> [!TIP]
> **Nguyên tắc vàng:** Gửi email là **side effect** (tác vụ phụ). Nó không nên làm chậm hay ảnh hưởng đến kết quả của business logic chính (đăng ký tài khoản).

---

## 3. Cài Đặt & Cấu Hình @nestjs/mail (How?)

### 3.1 Cài Đặt Package

📄 **Terminal**

```bash
pnpm add @nestjs/mail
```

### 3.2 Chuẩn Bị SMTP Server Cho Development

Trong môi trường development, chúng ta **không gửi email thật**. Thay vào đó, `@nestjs/mail` cung cấp `FileMailTransport` — mỗi email sẽ được lưu thành file `.eml` trên ổ đĩa để kiểm tra nội dung.

> [!TIP]
> **File `.eml` là gì?**
> Đây là định dạng chuẩn của email (RFC 822). Bạn có thể mở file `.eml` bằng bất kỳ ứng dụng email nào (Outlook, Thunderbird, Apple Mail) để xem email chính xác như người nhận sẽ thấy.

### 3.3 Đăng Ký MailModule Trong AppModule

📄 **`src/app.module.ts`**

```typescript
import {
  FileMailTransport,
  FileTemplateEngine,
  MailModule,
} from '@nestjs/mail';
import { join } from 'node:path';

@Module({
  imports: [
    // ... các module hiện tại (ConfigModule, ThrottlerModule, EventEmitterModule, ...)

    MailModule.forRoot({
      // Development: mỗi email trở thành file .eml trong thư mục var/mail
      transport: new FileMailTransport({ directory: 'var/mail' }),

      // Template engine: render HTML từ file template
      templates: new FileTemplateEngine({
        dir: join(__dirname, 'mail/templates'),
        layout: 'layout',
        // Development: đọc lại file mỗi lần gửi email → thấy thay đổi ngay không cần restart
        cache: process.env.NODE_ENV === 'production',
      }),

      // Địa chỉ gửi mặc định
      from: 'Social Chat App <noreply@socialchat.example.com>',
    }),

    // ... các module khác
  ],
  // ...
})
export class AppModule {
  // ...
}
```

**Giải thích từng option:**

| Option             | Mô tả                                                                               |
| ------------------ | ----------------------------------------------------------------------------------- |
| `transport`        | Cách email rời khỏi ứng dụng. `FileMailTransport` lưu ra file, không gửi thật.      |
| `templates`        | Engine render HTML. `FileTemplateEngine` đọc file `.html` từ thư mục `dir`.         |
| `templates.layout` | Template bao ngoài (wrapper). Mọi email đều được bọc trong `layout.html`.           |
| `templates.cache`  | `true` = cache template (production). `false` = đọc lại file mỗi lần (development). |
| `from`             | Địa chỉ người gửi mặc định. Format: `"Tên hiển thị <email>"`.                       |

### 3.4 Cấu Hình TypeScript Compiler Copy Template Files

TypeScript compiler **không tự động copy file HTML** vào thư mục `dist/`. Cần thêm cấu hình trong `nest-cli.json`:

📄 **`nest-cli.json`**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "assets": [
      {
        "include": "mail/templates/**/*",
        "outDir": "dist/src"
      }
    ],
    "watchAssets": true
  }
}
```

| Option        | Mô tả                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| `include`     | Glob pattern cho các file không phải TypeScript cần copy vào bản build (`mail/templates/**/*`).                       |
| `outDir`      | Thư mục đích nhận assets (`dist/src`). Khi project có file gốc (như `prisma.config.ts`), code build nằm ở `dist/src`. |
| `watchAssets` | `true` = tự động copy lại khi file template thay đổi (trong `nest start --watch`).                                    |

### 3.5 Tạo Thư Mục Cấu Trúc Mail Templates

```text
src/
└── mail/
    └── templates/
        ├── layout.html          ← Template bao ngoài (header + footer dùng chung)
        ├── welcome.html         ← Nội dung email chào mừng
        └── partials/
            └── signature.html   ← Chữ ký cuối email (partial dùng chung)
```

📄 **Terminal**

```bash
mkdir -p src/mail/templates/partials
```

---

## 4. Xây Dựng HTML Template Cho Welcome Email (How?)

### 4.1 Layout Template — Khung Bao Ngoài Dùng Chung

Mỗi email đều cần header và footer nhất quán. Layout template đóng vai trò "khung" bao ngoài:

📄 **`src/mail/templates/layout.html`**

```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body
    style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;"
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background-color: #f4f4f7; padding: 32px 0;"
    >
      <tr>
        <td align="center">
          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);"
          >
            <!-- Header -->
            <tr>
              <td
                style="background-color: #E0234E; padding: 24px; text-align: center;"
              >
                <h1
                  style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;"
                >
                  🚀 Social Chat App
                </h1>
              </td>
            </tr>

            <!-- Body (nội dung email cụ thể) -->
            <tr>
              <td style="padding: 32px 24px;">{{{ body }}} {{> signature}}</td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="background-color: #f4f4f7; padding: 16px 24px; text-align: center; font-size: 12px; color: #888888;"
              >
                <p style="margin: 0;">
                  © 2026 Social Chat App. All rights reserved.
                </p>
                <p style="margin: 4px 0 0;">
                  Email này được gửi tự động, vui lòng không trả lời.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

**Lưu ý quan trọng về cú pháp template:**

| Cú pháp         | Ý nghĩa                                  | Khi nào dùng                                     |
| --------------- | ---------------------------------------- | ------------------------------------------------ |
| `{{ value }}`   | Chèn giá trị **có escape HTML**          | Mọi dữ liệu từ user (name, email, ...)           |
| `{{{ value }}}` | Chèn giá trị **không escape** (raw HTML) | Chỉ cho nội dung HTML bạn tự tạo (ví dụ: `body`) |
| `{{> partial}}` | Include partial template                 | Dùng chung component (signature, header, ...)    |

> [!WARNING]
> **Bảo mật:** Luôn sử dụng `{{ }}` (double braces) cho dữ liệu từ user. Nếu tên user là `<script>alert('xss')</script>`, double braces sẽ escape thành `&lt;script&gt;...` — an toàn. Triple braces `{{{ }}}` chỉ dành cho HTML bạn kiểm soát hoàn toàn.

### 4.2 Signature Partial — Chữ Ký Cuối Email

📄 **`src/mail/templates/partials/signature.html`**

```html
<hr style="border: none; border-top: 1px solid #e8e8e8; margin: 24px 0;" />
<p style="color: #666666; font-size: 14px; margin: 0;">
  Trân trọng,<br />
  <strong>Đội ngũ Social Chat App</strong> 🎉
</p>
```

### 4.3 Welcome Email Template — Nội Dung Chào Mừng

📄 **`src/mail/templates/welcome.html`**

```html
<h2 style="color: #333333; margin: 0 0 16px;">Chào mừng bạn, {{ name }}! 👋</h2>

<p style="color: #555555; font-size: 15px; line-height: 1.6;">
  Cảm ơn bạn đã đăng ký tài khoản trên <strong>Social Chat App</strong>. Chúng
  tôi rất vui khi có bạn là thành viên của cộng đồng!
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
  <tr>
    <td style="background-color: #f9f9fb; border-radius: 6px; padding: 20px;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #888;">
        Thông tin tài khoản của bạn:
      </p>
      <table>
        <tr>
          <td style="padding: 4px 12px 4px 0; font-weight: 600; color: #333;">
            📧 Email:
          </td>
          <td style="color: #555;">{{ email }}</td>
        </tr>
        {{#if name}}
        <tr>
          <td style="padding: 4px 12px 4px 0; font-weight: 600; color: #333;">
            👤 Tên:
          </td>
          <td style="color: #555;">{{ name }}</td>
        </tr>
        {{/if}}
        <tr>
          <td style="padding: 4px 12px 4px 0; font-weight: 600; color: #333;">
            📅 Ngày tham gia:
          </td>
          <td style="color: #555;">{{ joinedAt }}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<p style="color: #555555; font-size: 15px; line-height: 1.6;">
  Bạn có thể bắt đầu bằng cách:
</p>

<ul
  style="color: #555555; font-size: 15px; line-height: 1.8; padding-left: 20px;"
>
  <li>📝 Tạo bài viết đầu tiên trên cộng đồng</li>
  <li>💬 Bình luận và tương tác với các thành viên khác</li>
  <li>🔔 Nhận thông báo khi có ai tương tác bài viết của bạn</li>
</ul>

<p style="text-align: center; margin: 28px 0;">
  <a
    href="{{ appUrl }}"
    style="background-color: #E0234E; color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;"
  >
    🚀 Bắt Đầu Khám Phá
  </a>
</p>
```

**Giải thích cú pháp template:**

- `{{ name }}`, `{{ email }}`: Giá trị được truyền từ Mail Class, tự động escape HTML.
- `{{#if name}} ... {{/if}}`: Conditional block — chỉ hiển thị khi `name` có giá trị (vì `name` là optional trong `RegisterDto`).
- `{{ appUrl }}`: URL đặt trong attribute `href=""` — vì nằm trong dấu ngoặc kép nên an toàn.

---

## 5. Tạo Mail Class — WelcomeMail (How?)

### 5.1 Định Nghĩa Data Interface

📄 **`src/mail/mails/welcome.mail.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import type { Mailable } from '@nestjs/mail';

/**
 * Dữ liệu cần thiết để render Welcome Email.
 * Interface này đảm bảo Type-Safety khi gọi mailer.send().
 */
export interface WelcomeMailData {
  name: string;
  email: string;
  joinedAt: string;
}

const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';

@Injectable()
export class WelcomeMail implements Mailable<WelcomeMailData> {
  render({ name, email, joinedAt }: WelcomeMailData) {
    return {
      // Tiêu đề email hiển thị trong inbox
      subject: `Chào mừng ${name || 'bạn'} đến với Social Chat App! 🎉`,

      // Tên template (không cần extension .html)
      // → Render file src/mail/templates/welcome.html, bọc trong layout.html
      template: 'welcome',

      // Dữ liệu truyền vào template (context)
      context: {
        name: name || 'Thành viên mới',
        email,
        joinedAt,
        appUrl: APP_URL,
      },
    };
  }
}
```

**Phân tích kiến trúc Mail Class:**

```mermaid
flowchart LR
    subgraph WelcomeMail["📝 WelcomeMail"]
        Render["render(data)"]
    end

    subgraph Output["Kết quả render()"]
        Subject["subject: 'Chào mừng...'"]
        Template["template: 'welcome'"]
        Context["context: { name, email, ... }"]
    end

    Data["WelcomeMailData\n{ name, email, joinedAt }"] --> Render
    Render --> Subject
    Render --> Template
    Render --> Context

    Context -->|"Truyền vào"| TemplateFile["welcome.html"]
    TemplateFile -->|"Bọc trong"| Layout["layout.html"]
    Layout -->|"HTML hoàn chỉnh"| Final["📧 Email sẵn sàng gửi"]
```

**Tại sao dùng Mail Class thay vì gửi inline?**

| So sánh         | Gửi inline      | Mail Class                                          |
| --------------- | --------------- | --------------------------------------------------- |
| **Type-Safety** | Không kiểm soát | `Mailable<TData>` — TypeScript kiểm tra lúc compile |
| **Tái sử dụng** | Copy-paste code | Import và gọi lại                                   |
| **Testable**    | Khó test riêng  | `mailer.render()` render mà không gửi               |
| **DI Support**  | Không           | `@Injectable()` — inject được các service khác      |

### 5.2 Đăng Ký WelcomeMail Là Provider

📄 **`src/mail/mail.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { WelcomeMail } from './mails/welcome.mail';

@Module({
  providers: [WelcomeMail],
  exports: [WelcomeMail],
})
export class AppMailModule {}
```

> [!NOTE]
> Đặt tên module là `AppMailModule` (không phải `MailModule`) để tránh trùng với `MailModule` của `@nestjs/mail`.

Đăng ký `AppMailModule` vào `AppModule`:

📄 **`src/app.module.ts`**

```typescript
import { AppMailModule } from './mail/mail.module';

@Module({
  imports: [
    // ... các module hiện tại
    AppMailModule,
  ],
  // ...
})
export class AppModule {
  // ...
}
```

---

## 6. Tích Hợp Event-Driven: Gửi Email Khi User Đăng Ký (How?)

### 6.1 Thêm Event Constant Cho User

Mở rộng file hằng số sự kiện đã có từ Lesson 5.5:

📄 **`src/shared/constants/event.constant.ts`**

```typescript
export const EVENT = {
  COMMENT: {
    CREATED: 'comment.created',
  },
  // ✅ Thêm mới: Sự kiện liên quan đến User
  USER: {
    REGISTERED: 'user.registered',
  },
};
```

### 6.2 Tạo Event Payload Class

📄 **`src/auth/events/user-registered.event.ts`**

```typescript
/**
 * Event payload khi user đăng ký tài khoản thành công.
 * Mang đủ thông tin để gửi Welcome Email mà không cần query lại DB.
 */
export class UserRegisteredEvent {
  constructor(
    public readonly userId: number,
    public readonly email: string,
    public readonly name: string | null,
    public readonly createdAt: Date,
  ) {}
}
```

### 6.3 Emit Sự Kiện Trong AuthService

Thêm emit event vào method `register()` hiện tại:

📄 **`src/auth/auth.service.ts`**

```typescript
import { PrismaService } from '@/prisma/prisma.service';
import { HashService } from '@/shared/services/hash.service';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt.interface';
import { Role } from '@/generated/prisma/enums';
import { GoogleUser } from './interfaces/google-user.interface';
import { EVENT } from '@/shared/constants/event.constant';
import { UserRegisteredEvent } from './events/user-registered.event';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashService: HashService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2, // ✅ Thêm EventEmitter2
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email này đã được sử dụng!');
    }

    const hashedPassword = await this.hashService.hashPassword(password);

    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword, name },
      omit: { password: true },
    });

    const accessToken = await this.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );

    // ✅ Emit sự kiện user.registered SAU KHI lưu DB thành công
    this.eventEmitter.emit(
      EVENT.USER.REGISTERED,
      new UserRegisteredEvent(user.id, user.email, user.name, user.createdAt),
    );

    return { user, accessToken };
  }

  // ... các method khác giữ nguyên (login, socialLogin, generateAccessToken)
}
```

**Phân tích flow:**

```mermaid
sequenceDiagram
    participant C as Client
    participant AC as AuthController
    participant AS as AuthService
    participant DB as PostgreSQL
    participant EE as EventEmitter2
    participant MH as MailHandler

    C->>AC: POST /auth/register
    AC->>AS: register(dto)
    AS->>DB: user.create()
    DB-->>AS: user (saved)
    AS->>AS: generateAccessToken()
    AS->>EE: emit('user.registered', event)
    Note over EE: Fire-and-forget (async)
    AS-->>AC: { user, accessToken }
    AC-->>C: 201 Created ✅

    Note over C,AC: Client nhận response ngay lập tức

    EE->>MH: trigger handleUserRegistered()
    MH->>MH: render welcome.html template
    MH->>MH: mailer.send(WelcomeMail, ...)
    Note over MH: Email gửi bất đồng bộ
```

> [!IMPORTANT]
> **Thứ tự quan trọng:** `emit()` phải nằm **SAU** `prisma.user.create()` thành công. Nếu đặt trước mà DB lỗi, email sẽ gửi cho một user không tồn tại!

### 6.4 Tạo Mail Handler — Lắng Nghe Sự Kiện & Gửi Email

📄 **`src/mail/handlers/user-mail.handler.ts`**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Mailer } from '@nestjs/mail';
import { EVENT } from '@/shared/constants/event.constant';
import { UserRegisteredEvent } from '@/auth/events/user-registered.event';
import { WelcomeMail } from '../mails/welcome.mail';

@Injectable()
export class UserMailHandler {
  private readonly logger = new Logger(UserMailHandler.name);

  constructor(private readonly mailer: Mailer) {}

  /**
   * Lắng nghe sự kiện 'user.registered' và gửi Welcome Email.
   * async: true → Chạy bất đồng bộ, không block luồng chính.
   */
  @OnEvent(EVENT.USER.REGISTERED, { async: true })
  async handleUserRegistered(event: UserRegisteredEvent) {
    this.logger.log(
      `📥 Nhận sự kiện 'user.registered' cho user #${event.userId} (${event.email})`,
    );

    try {
      await this.mailer.send(WelcomeMail, {
        to: {
          name: event.name || 'Thành viên mới',
          address: event.email,
        },
        data: {
          name: event.name || 'Thành viên mới',
          email: event.email,
          joinedAt: event.createdAt.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        },
      });

      this.logger.log(`✅ Đã gửi Welcome Email thành công cho ${event.email}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `❌ Lỗi gửi Welcome Email cho ${event.email}: ${err.message}`,
        err.stack,
      );
      // Không throw lại — lỗi email không nên crash ứng dụng
      // Trong production, đây là nơi bạn sẽ đẩy vào dead-letter queue
    }
  }
}
```

**Giải thích chi tiết:**

| Phần code                                          | Mục đích                                                                    |
| -------------------------------------------------- | --------------------------------------------------------------------------- |
| `@OnEvent(EVENT.USER.REGISTERED, { async: true })` | Lắng nghe sự kiện `user.registered`, chạy bất đồng bộ                       |
| `this.mailer.send(WelcomeMail, { ... })`           | Gọi `Mailer` inject từ `@nestjs/mail` — render template + gửi qua transport |
| `to: { name, address }`                            | Recipient dạng object — tên có ký tự đặc biệt vẫn hiển thị đúng             |
| `data: { ... }`                                    | Dữ liệu truyền vào `WelcomeMail.render()` — TypeScript kiểm tra type        |
| `catch` block + `logger.error`                     | Ghi log lỗi nhưng **không throw** — đảm bảo lỗi email không ảnh hưởng user  |

### 6.5 Đăng Ký Handler Vào Module

📄 **`src/mail/mail.module.ts`** (cập nhật)

```typescript
import { Module } from '@nestjs/common';
import { WelcomeMail } from './mails/welcome.mail';
import { UserMailHandler } from './handlers/user-mail.handler';

@Module({
  providers: [WelcomeMail, UserMailHandler],
  exports: [WelcomeMail],
})
export class AppMailModule {}
```

---

## 7. Kiểm Tra Kết Quả (Verify)

### 7.1 Cấu Trúc Thư Mục Sau Bài Học

**Before (Trước Lesson 5.6):**

```text
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── dto/
│       ├── register.dto.ts
│       └── login.dto.ts
├── shared/
│   └── constants/
│       └── event.constant.ts
└── notifications/
    └── notifications.service.ts
```

**After (Sau Lesson 5.6):**

```text
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts          ← Thêm EventEmitter2 + emit user.registered
│   ├── auth.module.ts
│   ├── dto/
│   │   ├── register.dto.ts
│   │   └── login.dto.ts
│   └── events/
│       └── user-registered.event.ts   ← ✅ MỚI: Event payload class
├── mail/
│   ├── mail.module.ts                 ← ✅ MỚI: AppMailModule
│   ├── mails/
│   │   └── welcome.mail.ts           ← ✅ MỚI: Mail class
│   ├── handlers/
│   │   └── user-mail.handler.ts       ← ✅ MỚI: Event listener gửi email
│   └── templates/
│       ├── layout.html                ← ✅ MỚI: Template bao ngoài
│       ├── welcome.html               ← ✅ MỚI: Welcome email template
│       └── partials/
│           └── signature.html         ← ✅ MỚI: Chữ ký dùng chung
├── shared/
│   └── constants/
│       └── event.constant.ts          ← Cập nhật: thêm USER.REGISTERED
└── notifications/
    └── notifications.service.ts
```

### 7.2 Chạy Ứng Dụng & Kiểm Tra

📄 **Terminal**

```bash
pnpm start:dev
```

### 7.3 Gửi Request Đăng Ký

📄 **Postman / cURL**

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "Password@123",
    "name": "Alice Nguyen"
  }'
```

**Response mong đợi (201 Created):**

```json
{
  "statusCode": 201,
  "message": "Đăng ký tài khoản thành công!",
  "data": {
    "user": {
      "id": 1,
      "email": "alice@example.com",
      "name": "Alice Nguyen",
      "role": "USER",
      "createdAt": "2026-10-08T08:30:00.000Z",
      "updatedAt": "2026-10-08T08:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 7.4 Kiểm Tra Email File

📄 **Terminal**

```bash
# Kiểm tra file .eml được tạo
ls -la var/mail/
```

**Kết quả:**

```text
var/mail/
└── 2026-10-08T08-30-00-123Z.eml
```

Mở file `.eml` bằng ứng dụng email (hoặc text editor) để xem nội dung:

```text
From: Social Chat App <noreply@socialchat.example.com>
To: Alice Nguyen <alice@example.com>
Subject: =?UTF-8?Q?Ch=C3=A0o_m=E1=BB=ABng_Alice_Nguyen_=C4=91=E1=BA=BFn?=
 =?UTF-8?Q?_v=E1=BB=9Bi_Social_Chat_App!_=F0=9F=8E=89?=
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html lang="vi">
...
<h2>Chào mừng bạn, Alice Nguyen! 👋</h2>
...
```

### 7.5 Kiểm Tra Log

Trong terminal chạy `nest start --watch`, bạn sẽ thấy:

```text
[UserMailHandler] 📥 Nhận sự kiện 'user.registered' cho user #1 (alice@example.com)
[UserMailHandler] ✅ Đã gửi Welcome Email thành công cho alice@example.com
```

### 🟢 Flow Thành Công Hoàn Chỉnh

```mermaid
flowchart TD
    A["📱 Client: POST /auth/register"] -->|"Body: email, password, name"| B["AuthService.register()"]
    B -->|"1. Check email trùng"| C{"Email tồn tại?"}
    C -->|"Có"| D["❌ 409 Conflict"]
    C -->|"Không"| E["2. Hash password & Lưu DB"]
    E --> F["3. Generate JWT Token"]
    F --> G["4. Emit 'user.registered'"]
    G --> H["5. Return 201 + Token"]

    G -.->|"async"| I["UserMailHandler"]
    I --> J["6. Render welcome.html"]
    J --> K["7. FileMailTransport → .eml file"]
    K --> L["✅ var/mail/xxx.eml"]

    style G fill:#F59E0B,color:#000
    style K fill:#10B981,color:#fff
    style L fill:#10B981,color:#fff
```

---

## 8. Error Flow & Debugging (Debug)

### 🔴 Các Lỗi Phổ Biến & Cách Xử Lý

#### Lỗi 1: `Cannot find module '@nestjs/mail'`

**Nguyên nhân:** Chưa cài package.

**Fix:**

```bash
pnpm add @nestjs/mail
```

#### Lỗi 2: `Error: No template "welcome" in .../mail/templates`

**Triệu chứng:**

```text
ERROR [UserMailHandler] ❌ Lỗi gửi Welcome Email: No template "welcome" in /.../dist/src/mail/templates (looked for welcome.html)
```

**Nguyên nhân:**

- Khi project có các file TypeScript ở thư mục gốc (như `prisma.config.ts`), TypeScript compiler tự động đặt output của mã nguồn vào `dist/src/` (thay vì `dist/`).
- Do đó `app.module.js` nằm ở `dist/src/`, khiến `join(__dirname, 'mail/templates')` trỏ tới `dist/src/mail/templates`.
- Trong khi đó, `nest-cli.json` mặc định lại copy assets ra `dist/mail/templates`, gây ra lỗi lệch đường dẫn.

**Cách khắc phục:**

1. **Cách 1: Cấu hình `outDir` trong `nest-cli.json`:**

```json
{
  "compilerOptions": {
    "assets": [
      {
        "include": "mail/templates/**/*",
        "outDir": "dist/src"
      }
    ],
    "watchAssets": true
  }
}
```

2. **Cách 2: Giải quyết đường dẫn linh hoạt trong `AppModule` với `existsSync`:**

```typescript
const templatesDir = existsSync(join(__dirname, 'mail/templates'))
  ? join(__dirname, 'mail/templates')
  : existsSync(join(__dirname, '../mail/templates'))
    ? join(__dirname, '../mail/templates')
    : join(process.cwd(), 'src/mail/templates');
```

3. Restart `nest start --watch` để áp dụng cấu hình build mới.

#### Lỗi 3: Template render sai — hiển thị `{{ name }}` thay vì giá trị thực

**Nguyên nhân:** Sai cú pháp template hoặc `context` không chứa key tương ứng.

**Debug:**

```typescript
// Trong mail class, kiểm tra context object
render(data: WelcomeMailData) {
  console.log('📋 Context data:', data);
  return {
    template: 'welcome',
    context: {
      name: data.name,  // ← Key phải khớp với {{ name }} trong template
      // ...
    },
  };
}
```

#### Lỗi 4: Event listener không được gọi

**Nguyên nhân:** Module chưa được import hoặc handler chưa đăng ký.

**Checklist:**

- [x] `EventEmitterModule.forRoot()` đã đăng ký trong `AppModule`.
- [x] `UserMailHandler` đã thêm vào `providers` của `AppMailModule`.
- [x] `AppMailModule` đã import vào `AppModule`.
- [x] `EVENT.USER.REGISTERED` trong emit và `@OnEvent()` trùng nhau.

#### Lỗi 5: Email gửi nhưng layout/header bị thiếu

**Nguyên nhân:** Template `layout.html` không tìm thấy, hoặc option `layout` trong `FileTemplateEngine` sai tên.

**Fix:**

```typescript
// Đảm bảo tên layout khớp với filename (không cần extension)
templates: new FileTemplateEngine({
  dir: join(__dirname, 'mail/templates'),
  layout: 'layout',  // ← Tìm file layout.html trong dir
}),
```

### ⚠️ Bảng Lỗi Phổ Biến Tổng Hợp

| Lỗi                                 | Nguyên nhân                           | Cách khắc phục                             |
| ----------------------------------- | ------------------------------------- | ------------------------------------------ |
| `Cannot find module '@nestjs/mail'` | Chưa cài package                      | `pnpm add @nestjs/mail`                    |
| `No template "welcome"`             | File HTML không copy vào `dist/`      | Cấu hình `assets` trong `nest-cli.json`    |
| Template hiển thị raw `{{ }}`       | Context key không khớp hoặc file sai  | Kiểm tra tên key trong context vs template |
| Listener không trigger              | Module/handler chưa đăng ký           | Kiểm tra imports, providers, event name    |
| Layout/partial missing              | Đường dẫn `dir` hoặc tên `layout` sai | Kiểm tra `FileTemplateEngine` options      |
| `MailModule` trùng tên              | Đặt tên module giống `@nestjs/mail`   | Đổi thành `AppMailModule`                  |

---

## 9. Gửi Email Qua SMTP Trong Production (Nâng Cao)

Trong production, bạn cần gửi email thật. Thay `FileMailTransport` bằng `SmtpTransport`:

### 9.1 Thêm Biến Môi Trường

📄 **`.env`**

```env
# Mail Configuration
MAIL_TRANSPORT=file
# SMTP (Production)
# MAIL_TRANSPORT=smtp
# SMTP_URL=smtp://user:password@smtp.example.com:587
# MAIL_FROM="Social Chat App <noreply@socialchat.example.com>"
```

### 9.2 Factory Function Chọn Transport Theo Môi Trường

📄 **`src/mail/mail-transport.factory.ts`**

```typescript
import {
  FileMailTransport,
  SmtpTransport,
  type MailTransport,
} from '@nestjs/mail';

/**
 * Chọn transport dựa trên biến môi trường MAIL_TRANSPORT.
 * - "file" (mặc định): Lưu email ra file .eml — dùng cho development.
 * - "smtp": Gửi qua SMTP server — dùng cho production.
 */
export function createMailTransport(
  env: NodeJS.ProcessEnv = process.env,
): MailTransport {
  switch (env.MAIL_TRANSPORT ?? 'file') {
    case 'file':
      return new FileMailTransport({
        directory: env.MAIL_DIRECTORY ?? 'var/mail',
      });

    case 'smtp': {
      const url = env.SMTP_URL;
      if (!url) {
        throw new Error(
          'SMTP_URL là bắt buộc khi MAIL_TRANSPORT=smtp. Ví dụ: smtp://user:pass@smtp.gmail.com:587',
        );
      }
      return new SmtpTransport({ url, pool: true });
    }

    default:
      throw new Error(
        `MAIL_TRANSPORT phải là "file" hoặc "smtp" (nhận được: "${env.MAIL_TRANSPORT}")`,
      );
  }
}
```

### 9.3 Sử Dụng Factory Trong AppModule

📄 **`src/app.module.ts`** (cập nhật)

```typescript
import { createMailTransport } from './mail/mail-transport.factory';

@Module({
  imports: [
    // ...
    MailModule.forRoot({
      // Factory chọn transport dựa trên biến môi trường
      transport: createMailTransport(),
      templates: new FileTemplateEngine({
        dir: join(__dirname, 'mail/templates'),
        layout: 'layout',
        cache: process.env.NODE_ENV === 'production',
      }),
      from:
        process.env.MAIL_FROM ??
        'Social Chat App <noreply@socialchat.example.com>',
    }),
    // ...
  ],
})
export class AppModule {}
```

**Ưu điểm:**

- Cùng một codebase chạy mọi nơi: development dùng `file`, production dùng `smtp`.
- Thiếu `SMTP_URL` khi `MAIL_TRANSPORT=smtp` → lỗi **ngay lúc startup**, không phải lúc gửi email đầu tiên.

---

## 10. Bài Tập Thực Hành (Exercise)

### 🧩 Exercise 1: Follow Along (Level 1)

Làm theo từng bước trong bài học để tích hợp Welcome Email vào dự án Social Chat App của bạn.

**Checklist hoàn thành:**

- [ ] Cài đặt `@nestjs/mail`
- [ ] Tạo 3 file template: `layout.html`, `welcome.html`, `partials/signature.html`
- [ ] Tạo `WelcomeMail` class
- [ ] Tạo `UserRegisteredEvent` payload
- [ ] Thêm emit event vào `AuthService.register()`
- [ ] Tạo `UserMailHandler` listener
- [ ] Đăng ký tài khoản mới và xác nhận file `.eml` xuất hiện trong `var/mail/`

### 🧩 Exercise 2: Debugging Challenge (Level 2)

Đoạn code dưới đây có **3 lỗi**. Hãy tìm và sửa:

```typescript
// ❌ Code có lỗi — Tìm và sửa 3 lỗi

// File: src/mail/handlers/user-mail.handler.ts
@Injectable()
export class UserMailHandler {
  constructor(private readonly mailer: Mailer) {}

  @OnEvent('user.register') // Lỗi 1: ???
  handleUserRegistered(event: UserRegisteredEvent) {
    // Lỗi 2: ???
    this.mailer.send(WelcomeMail, {
      to: event.email, // Lỗi 3: ???
      data: {
        name: event.name,
        email: event.email,
        joinedAt: event.createdAt.toLocaleDateString('vi-VN'),
      },
    });
  }
}
```

<details>
<summary>💡 Gợi ý</summary>

1. Event name phải khớp chính xác với constant `EVENT.USER.REGISTERED`.
2. Handler lắng nghe event bất đồng bộ cần keyword nào?
3. `to` nên là object `{ name, address }` thay vì string đơn giản (đảm bảo tên hiển thị đúng).

</details>

<details>
<summary>✅ Đáp án</summary>

```typescript
@Injectable()
export class UserMailHandler {
  constructor(private readonly mailer: Mailer) {}

  @OnEvent(EVENT.USER.REGISTERED, { async: true }) // Fix 1: Dùng constant + async: true
  async handleUserRegistered(event: UserRegisteredEvent) {
    // Fix 2: Thêm async
    await this.mailer.send(WelcomeMail, {
      // Fix 2b: Thêm await
      to: { name: event.name || 'User', address: event.email }, // Fix 3: Object thay vì string
      data: {
        name: event.name,
        email: event.email,
        joinedAt: event.createdAt.toLocaleDateString('vi-VN'),
      },
    });
  }
}
```

**Giải thích:**

1. **Event name sai:** `'user.register'` ≠ `'user.registered'`. Nên dùng constant `EVENT.USER.REGISTERED` để tránh typo.
2. **Thiếu `async`/`await`:** Không có `async: true` → listener chạy đồng bộ, block luồng chính. Không có `await` → lỗi gửi email không bắt được.
3. **`to` dạng string:** Nếu tên user chứa ký tự đặc biệt (dấu phẩy, ngoặc kép), string sẽ parse sai. Object `{ name, address }` an toàn hơn.

</details>

### 🧩 Exercise 3: Mở Rộng — Password Reset Email (Level 3)

**Yêu cầu:** Tạo thêm một `PasswordResetMail` class gửi email khi user yêu cầu đặt lại mật khẩu.

**Gợi ý:**

1. Tạo template `src/mail/templates/password-reset.html` với nút "Đặt lại mật khẩu" link tới URL chứa reset token.
2. Tạo `PasswordResetMail` class implements `Mailable<PasswordResetData>`.
3. Tạo event `user.password-reset-requested` và handler tương ứng.

**Expected behavior:**

```text
User yêu cầu reset password
  ↓
Hệ thống tạo reset token + emit event
  ↓
MailHandler gửi email có link reset
  ↓
User click link → trang đặt lại mật khẩu
```

---

## 11. Tổng Kết Bài Học (Summary)

```mermaid
mindmap
  root(("📧 @nestjs/mail\nTrong NestJS"))
    Vấn đề giải quyết
      Thiếu email chuyên nghiệp
      Gửi email block response
      Khó test email
    Kiến trúc 3 thành phần
      Mail Class "Mailable"
      Template Engine "FileTemplateEngine"
      Transport "SMTP / File"
    Template System
      Layout dùng chung
      Partials tái sử dụng
      Auto-escaping bảo mật
    Event Integration
      Emit "user.registered"
      Handler async gửi email
      Không block business logic
    Production Ready
      FileMailTransport dev
      SmtpTransport production
      Factory pattern chọn transport
```

### 📋 Checklist Tự Đánh Giá Sau Bài Học:

- [x] Hiểu vai trò của `@nestjs/mail` và 3 thành phần cốt lõi: Mail Class, Template Engine, Transport.
- [x] Cấu hình `MailModule.forRoot()` với `FileMailTransport` cho development và `FileTemplateEngine` cho HTML template.
- [x] Cấu hình `nest-cli.json` để copy HTML template files vào `dist/`.
- [x] Xây dựng Layout template (`layout.html`) với header, body placeholder, footer, và partial (`signature.html`).
- [x] Tạo Mail Class (`WelcomeMail`) implements `Mailable<TData>` với Type-Safety.
- [x] Tích hợp Event-Driven: emit `user.registered` trong `AuthService` → handler gửi email bất đồng bộ.
- [x] Kiểm tra email thông qua file `.eml` trong thư mục `var/mail/`.
- [x] Biết cách chuyển sang `SmtpTransport` cho production bằng factory pattern.
- [x] Nắm vững các lỗi phổ biến và cách debug hệ thống email.

---

> [!TIP]
> 🎉 **Chúc mừng!** Bạn đã hoàn thành Lesson 5.6 và tích hợp thành công hệ thống gửi email vào Social Chat App!
> Ở **Module 6 (Real-Time WebSockets Chat & Performance Caching)**, chúng ta sẽ kết hợp sự kiện `comment.created` với **Socket.IO Gateway** để đẩy thông báo tức thì lên màn hình người dùng — không cần refresh trang!

---

👈 **Bài trước:** [Lesson 5.5: Event-Driven Architecture — Tách Rời Nghiệp Vụ & Tự Động Tạo Notification](../lesson-5.5/lesson-5.5.md)
👉 **Bài tiếp theo:** [Lesson 6.1: WebSockets Gateway — Khởi Tạo WebSocket Gateway Với @WebSocketGateway() (Socket.IO)](../../module-06/lesson-6.1/lesson-6.1.md)
