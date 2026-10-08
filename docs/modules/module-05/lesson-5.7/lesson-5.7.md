# Lesson 5.7: Cấu Hình Gửi Mail Trong Production — SmtpTransport & Factory Pattern

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-Framework-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-Language-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/@nestjs/mail-Production_Ready-EA4335?style=for-the-badge&logo=gmail&logoColor=white" alt="@nestjs/mail" />
  <img src="https://img.shields.io/badge/SMTP-Connection_Pool-4A90D9?style=for-the-badge&logo=minutemailer&logoColor=white" alt="SMTP" />
  <img src="https://img.shields.io/badge/STARTTLS-Security-10B981?style=for-the-badge&logo=shield&logoColor=white" alt="STARTTLS" />
  <img src="https://img.shields.io/badge/Docker-Production_Container-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

<p align="center">
  <img src="./assets/lesson_overview_banner.png" alt="Lesson Overview Banner — Production Email Transport in NestJS" width="100%" />
</p>

---

> [!NOTE]
> ⏱️ **Thời lượng:** 15 phút thực hành súc tích  
> 🎯 **Mục tiêu bài học:**
> Sau khi hoàn thành bài học này, bạn có thể:
>
> - **Giải thích (Explain)** tại sao `FileMailTransport` không phù hợp cho môi trường container/production và sự cần thiết của Factory Pattern.
> - **Cấu hình (Configure)** chuyển đổi linh hoạt giữa `FileMailTransport` (dev) và `SmtpTransport` (production) qua biến môi trường.
> - **Áp dụng (Apply)** Connection Pooling (`pool: true`) và cơ chế Fail-Fast validation khi khởi động ứng dụng.
> - **Kiểm thử (Verify)** luồng gửi email thật tới hộp thư cá nhân an toàn và bảo mật.

> [!IMPORTANT]
> **Prerequisites:**
>
> - Đã hoàn thành [Lesson 5.6: Gửi Welcome Email với @nestjs/mail](../lesson-5.6/lesson-5.6.md).
> - Đã hiểu cách nạp biến môi trường với `@nestjs/config` và `Joi` validation.

---

## 1. Tại Sao Cần Đổi Transport Trong Production? (Why?)

Trong **Lesson 5.6**, chúng ta dùng `FileMailTransport`: mỗi email xuất ra file `.eml` trong thư mục `var/mail/`.

Khi deploy ứng dụng lên môi trường Production (Docker, Kubernetes, AWS ECS, Cloud Run):

```text
❌ Vấn Đề Với FileMailTransport Trong Container:

User đăng ký ──> Backend ghi file var/mail/xxx.eml
                        │
                        ▼ (Container bị restart hoặc scale out)
                  💥 Toàn bộ file email bị mất!
                  📧 Người dùng thật KHÔNG NHẬN ĐƯỢC email nào!
```

**Nguyên tắc "Build Once, Run Anywhere":**  
Chúng ta **không viết code riêng** cho dev và production. Cùng một bản build, ứng dụng phải tự quyết định Transport dựa trên **biến môi trường**:

| Môi trường             | `MAIL_TRANSPORT`  | Transport sử dụng   | Hành vi                                                          |
| ---------------------- | ----------------- | ------------------- | ---------------------------------------------------------------- |
| **Development / Test** | `file` (mặc định) | `FileMailTransport` | Ghi `.eml` cục bộ, siêu nhanh (~2ms), không tốn quota.           |
| **Production**         | `smtp`            | `SmtpTransport`     | Gửi email thật qua SMTP Relay (Gmail, Brevo, AWS SES, SendGrid). |

---

## 2. Kiến Trúc Factory Pattern Cho Mail Transport (Mental Model)

Thay vì cấu hình cứng trong `AppModule`, ta xây dựng một **Transport Factory** độc lập:

```mermaid
flowchart TD
    Env["⚙️ Biến môi trường\nMAIL_TRANSPORT"] --> Factory["🏭 createMailTransport()"]

    Factory -->|"'file'"| FileTr["📁 FileMailTransport\n(var/mail/*.eml)"]
    Factory -->|"'smtp'"| SmtpTr["📮 SmtpTransport\n(STARTTLS + Connection Pool)"]

    FileTr --> MailModule["MailModule.forRootAsync()"]
    SmtpTr --> MailModule
```

### ✅ Best Practice: Fail-Fast Lúc Khởi Động

Nếu `MAIL_TRANSPORT=smtp` nhưng thiếu `SMTP_URL`, ứng dụng phải **dừng ngay lập tức lúc khởi động (Fail-Fast)** và báo rõ tên biến bị thiếu, thay vì âm thầm lỗi khi người dùng đầu tiên đăng ký tài khoản.

---

## 3. Triển Khai Từng Bước (Implementation)

### Bước 1: Khai báo biến môi trường & Validation Schema

📄 **`.env`**

```env
# Môi trường dev (mặc định ghi file)
MAIL_TRANSPORT=file
MAIL_DIRECTORY=var/mail
MAIL_FROM="Social Chat App <noreply@socialchat.example.com>"

# Cấu hình khi chuyển sang SMTP thật (uncomment khi muốn gửi thật)
# SMTP_URL=smtp://your_email%40gmail.com:your_app_password@smtp.gmail.com:587
```

📄 **`src/config/env.validation.ts`**

Bổ sung validation bằng `Joi`:

```typescript
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // ... các config hiện tại

  // Mail Transport Configuration
  MAIL_TRANSPORT: Joi.string().valid('file', 'smtp').default('file'),

  MAIL_DIRECTORY: Joi.string().default('var/mail'),

  MAIL_FROM: Joi.string().default(
    'Social Chat App <noreply@socialchat.example.com>',
  ),

  // Bắt buộc có SMTP_URL nếu chọn transport là smtp
  SMTP_URL: Joi.string().when('MAIL_TRANSPORT', {
    is: 'smtp',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});
```

---

### Bước 2: Tạo Transport Factory

Tạo file riêng biệt chuyên trách việc khởi tạo Transport theo chuẩn của `@nestjs/mail`:

📄 **`src/mail/transports/mail-transport.factory.ts`**

```typescript
import {
  FileMailTransport,
  SmtpTransport,
  type MailTransport,
} from '@nestjs/mail';
import { ConfigService } from '@nestjs/config';

/**
 * Factory chọn Transport phù hợp theo cấu hình môi trường.
 * - 'file': Development cục bộ (mặc định)
 * - 'smtp': Production qua giao thức SMTP (Gmail, Brevo, AWS SES...)
 */
export function createMailTransport(
  configService: ConfigService,
): MailTransport {
  const transportType = configService.get<string>('MAIL_TRANSPORT', 'file');

  switch (transportType) {
    case 'file':
      return new FileMailTransport({
        directory: configService.get<string>('MAIL_DIRECTORY', 'var/mail'),
      });

    case 'smtp':
      return new SmtpTransport({
        url: configService.getOrThrow<string>('SMTP_URL'),
        // Bật Connection Pooling để tái sử dụng kết nối TCP/TLS
        pool: true,
      });

    default:
      throw new Error(
        `MAIL_TRANSPORT không hợp lệ: "${transportType}". Chỉ chấp nhận "file" hoặc "smtp".`,
      );
  }
}
```

---

### Bước 3: Đăng ký Transport vào AppModule

Cập nhật `MailModule.forRootAsync()` trong `AppModule` để sử dụng hàm Factory vừa tạo:

📄 **`src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FileTemplateEngine, MailModule } from '@nestjs/mail';
import { join } from 'path';
import { createMailTransport } from './mail/transports/mail-transport.factory';
import { AppMailModule } from './mail/mail.module';

@Module({
  imports: [
    // ... các module khác (ConfigModule, EventEmitterModule, ...)

    MailModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        // 1. Khởi tạo transport động theo môi trường
        transport: createMailTransport(configService),

        // 2. Template engine render HTML
        templates: new FileTemplateEngine({
          dir: join(__dirname, 'mail/templates'),
          layout: 'layout',
          cache: configService.get<string>('NODE_ENV') === 'production',
        }),

        // 3. Email người gửi mặc định
        from: configService.get<string>(
          'MAIL_FROM',
          'Social Chat App <noreply@socialchat.example.com>',
        ),
      }),
    }),

    AppMailModule,
  ],
})
export class AppModule {}
```

---

## 4. Tối Ưu Hóa SmtpTransport Trong Production (Deep Dive)

`SmtpTransport` của `@nestjs/mail` chạy trực tiếp trên các module cốt lõi `node:net` và `node:tls` của Node.js:

- **Bảo mật (Encryption):**
  - Cổng `587`: Tự động nâng cấp mã hóa qua `STARTTLS`. Nếu server không hỗ trợ STARTTLS, transport sẽ từ chối gửi để bảo vệ mật khẩu.
  - Cổng `465`: Sử dụng kết nối bảo mật `TLS` ngay từ byte đầu tiên.
- **Connection Pooling (`pool: true`):**
  - Mặc định giữ tối đa **5 kết nối** và tái sử dụng cho tối đa **100 email/kết nối**.
  - Tránh chi phí bắt tay TCP và trao đổi TLS handshake tốn kém cho từng email. Tự động ngắt kết nối rảnh sau 30 giây.
- **Format URL:**
  ```text
  smtp://[username]:[password]@[host]:[port]
  ```
  _(Lưu ý: Nếu username/password chứa ký tự đặc biệt như `@` hay `:`, cần URL-encode, ví dụ `@` đổi thành `%40`)._

---

## 5. Kiểm Thử Gửi Thật (Verification)

### Thử nghiệm với Gmail SMTP (Dành cho kiểm thử cá nhân):

1. Mở [Google Account Security](https://myaccount.google.com/security) → Bật **2-Step Verification** → Tạo **App Password** (16 ký tự).
2. Cập nhật file `.env`:
   ```env
   MAIL_TRANSPORT=smtp
   SMTP_URL=smtp://your_email%40gmail.com:abcdefghijklmnop@smtp.gmail.com:587
   MAIL_FROM="Social Chat App <your_email@gmail.com>"
   ```
3. Gửi request đăng ký tài khoản:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "your_personal_email@gmail.com",
       "password": "Password123@",
       "name": "Alex Nguyen"
     }'
   ```
4. **Kiểm tra kết quả:**
   - Terminal log: `[UserMailHandler] ✅ Đã gửi Welcome Email thành công cho your_personal_email@gmail.com`
   - Mở hòm thư cá nhân: Nhận được email chào mừng đẹp mắt được bọc trong `layout.html` với thông tin cá nhân hóa!

---

## 6. Bảng Checklist Production (Best Practice)

| Hạng mục                | Khuyến nghị Production                                 | Lý do                                                           |
| ----------------------- | ------------------------------------------------------ | --------------------------------------------------------------- |
| **Transport Selection** | Dùng `smtp` trong production                           | Tránh mất email khi container restart.                          |
| **Connection Pooling**  | Luôn bật `pool: true` cho `SmtpTransport`              | Tăng throughput gửi mail gấp 5–10 lần, giảm tải server.         |
| **Authentication**      | Tuyệt đối dùng biến môi trường (không commit password) | Bảo mật thông tin đăng nhập SMTP.                               |
| **Template Cache**      | Bật `cache: true` trong production                     | Đọc template từ bộ nhớ RAM thay vì đọc ổ đĩa mỗi lần gửi.       |
| **Sender Verification** | Xác thực tên miền với SPF & DKIM record                | Đảm bảo email vào thẳng hộp thư Inbox, không rơi vào Spam/Junk. |

---

## 7. Tổng Kết Bài Học (Summary)

```mermaid
mindmap
  root(("🚀 Production Mail\nSmtpTransport"))
    Vấn đề
      Container mất file eml
      User không nhận được mail
    Factory Pattern
      file cho Dev
      smtp cho Production
    SmtpTransport Tối Ưu
      STARTTLS bảo mật
      pool: true tiết kiệm kết nối
      Fail-Fast lúc startup
    Deploy An Toàn
      Cấu hình qua .env
      Bật template cache
      SPF / DKIM chuẩn hóa
```

---

👈 **Bài trước:** [Lesson 5.6: Gửi Mail Trong NestJS — Welcome Email Khi Đăng Ký Tài Khoản Với @nestjs/mail](../lesson-5.6/lesson-5.6.md)  
👉 **Bài tiếp theo:** [Lesson 6.1: WebSockets Gateway — Khởi Tạo WebSocket Gateway Với @WebSocketGateway() (Socket.IO)](../../module-06/lesson-6.1/lesson-6.1.md)
