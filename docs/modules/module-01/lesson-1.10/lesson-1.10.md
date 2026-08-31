# Lesson 1.10: Configuration: Đọc .env An Toàn Với @nestjs/config & Joi Validation

<p align="center">
  <img src="https://img.shields.io/badge/@nestjs/config-v3.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="@nestjs/config" />
  <img src="https://img.shields.io/badge/Joi-Validation_Schema-F59E0B?style=for-the-badge&logo=javascript&logoColor=white" alt="Joi" />
  <img src="https://img.shields.io/badge/Type--Safe-Environment-34D399?style=for-the-badge&logo=typescript&logoColor=white" alt="Type-Safe" />
  <img src="https://img.shields.io/badge/pnpm-Package_Manager-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
  <img src="https://img.shields.io/badge/NestJS-Framework-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
</p>

<p align="center">
  <img src="./assets/lesson_overview_banner.svg" alt="Lesson Overview Banner" width="100%" />
</p>

---

> [!NOTE]
> ⏱️ **Thời lượng dự kiến:** 12 – 15 phút  
> 🎯 **Mục tiêu bài học:** Nắm vững nguy cơ khi sử dụng `process.env` trực tiếp, làm chủ package `@nestjs/config`, tích hợp thư viện **Joi** để xác thực kiểu dữ liệu cho biến môi trường, và áp dụng cơ chế **Boot Crash** ngăn ứng dụng khởi chạy khi bị thiếu cấu hình quan trọng.

---

## 1. Đặt Vấn Đề: Tại Sao Đọc `process.env` Trực Tiếp Lại Nguy Hiểm?

Trong các ứng dụng Node.js cơ bản, lập trình viên thường dùng `dotenv` và gọi `process.env.DATABASE_URL` rải rác khắp ứng dụng.

> [!WARNING]
> **3 Rủi Ro Khi Sử Dụng `process.env` Trực Tiếp:**
>
> 1. ❓ **Mọi giá trị đều là `string`:** `process.env.PORT` trả về chuỗi `"3000"` chứ không phải kiểu `number`, dễ dẫn tới lỗi cộng chuỗi `"3000" + 1 = "30001"`.
> 2. 💥 **Lỗi vô hình khi ứng dụng chạy (Runtime Crash):** Nếu ai đó quên tạo biến `DATABASE_URL` trong file `.env`, ứng dụng vẫn khởi động bình thường nhưng sẽ bị crash bất ngờ khi có người dùng truy cập API.
> 3. 🧪 **Khó khăn khi Unit Test:** Rất khó giả lập (mock) các biến môi trường khác nhau giữa môi trường `test`, `development` và `production`.

---

## 2. Nguyên Lý Hoạt Động Của `@nestjs/config` & `Joi` Validation

Theo [tài liệu chính thức của NestJS Techniques - Configuration](https://docs.nestjs.com/techniques/configuration), giải pháp chuẩn cho NestJS là kết hợp `@nestjs/config` và thư viện xác thực dữ liệu **Joi**:

<p align="center">
  <img src="./assets/config_validation_workflow.svg" alt="Config Validation Workflow Diagram" width="100%" />
</p>

### 🛠️ Quy Trình 3 Bước Tự Động:

1. **Nạp & Validate:** Khi NestJS khởi chạy, `ConfigModule` đọc file `.env` và đưa qua bộ lọc **Joi Validation Schema**.
2. **Kiểm tra Boot Safety:**
   - 🟢 **Nếu biến hợp lệ:** Joi tự động ép kiểu dữ liệu (chuyển `"3000"` thành số `3000`) và nạp vào **ConfigService**.
   - 🔴 **Nếu thiếu hoặc sai kiểu:** Joi quăng lỗi ngay lập tức và **ngăn chặn Server khởi động (Boot Crash)**.
3. **Global Injection:** Thiết lập `isGlobal: true` giúp mọi Module trong dự án có thể dùng `ConfigService` mà không cần re-import.

---

## 3. Cài Đặt & Cấu Hình Step-by-Step

### 📌 Bước 1: Cài Đặt Package `@nestjs/config` & `joi`

Mở terminal và cài đặt 2 package cần thiết:

```bash
pnpm add @nestjs/config joi
```

---

### 📌 Bước 2: Tạo Tệp `.env` Mẫu

Tạo tệp `.env` tại thư mục gốc của dự án:

📄 **`.env`**

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chat_db?schema=public
```

---

### 📌 Bước 3: Định Nghĩa Schema Validation Trong Tệp Riêng (`src/config/env.validation.ts`)

> [!TIP]
> **Best Practice (Single Responsibility Principle):** Không nên viết trực tiếp `Joi.object({...})` inline bên trong `AppModule` vì sẽ làm file Module bị phình to và rối rậm khi dự án phát triển. Hãy tách Schema xác thực ra một tệp riêng `src/config/env.validation.ts`.

Tạo tệp `src/config/env.validation.ts` để định nghĩa quy tắc kiểm tra biến môi trường:

📄 **`src/config/env.validation.ts`**

```typescript
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
});
```

> [!NOTE]
>
> - `Joi.string().valid(...)`: Bắt buộc `NODE_ENV` chỉ được nhận 1 trong các giá trị quy định.
> - `Joi.number().default(3000)`: Tự động chuyển chuỗi từ `.env` thành kiểu số `number`.
> - `Joi.string().required()`: Bắt buộc tệp `.env` phải khai báo `DATABASE_URL`, nếu không ứng dụng sẽ lập tức ngưng khởi chạy.

---

### 📌 Bước 4: Cấu Hình `ConfigModule` Tại `AppModule`

Mở tệp `src/app.module.ts`, import `envValidationSchema` và đăng ký vào `ConfigModule.forRoot`:

📄 **`src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Cho phép dùng ConfigService ở mọi nơi
      validationSchema: envValidationSchema,
    }),
  ],
})
export class AppModule {}
```

---

### 📌 Bước 5: Tiêm & Đọc Biến Môi Trường Trong Service / Controller

Sử dụng **ConfigService** thông qua Constructor Injection để đọc biến môi trường một cách Type-Safe:

📄 **`src/app.controller.ts`**

```typescript
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get('config')
  getConfig() {
    const port = this.configService.get<number>('PORT');
    const dbUrl = this.configService.get<string>('DATABASE_URL');

    return {
      port,
      dbUrl,
      nodeEnv: this.configService.get<string>('NODE_ENV'),
    };
  }
}
```

---

## 4. Kịch Bản Thử Nghiệm Thực Tế (Hands-on Lab)

### 🟢 Kịch Bản 1: Đọc Biến Môi Trường Hợp Lệ (Success Flow)

1️⃣ **Khởi chạy ứng dụng:**

```bash
pnpm start:dev
```

2️⃣ **Gửi request thử nghiệm đến endpoint `/config`:**

```bash
curl http://localhost:3000/config
```

3️⃣ **Kết quả trả về:**

```json
{
  "port": 3000,
  "dbUrl": "postgresql://postgres:postgres@localhost:5432/chat_db?schema=public",
  "nodeEnv": "development"
}
```

---

### 🔴 Kịch Bản 2: Phát Hiện Thiếu Biến `.env` Bắt Bộc (Blocked Flow)

Bây giờ, chúng ta cố tình xóa biến `DATABASE_URL` trong tệp `.env` để kiểm chứng khả năng bảo vệ của Joi.

1️⃣ **Mở tệp `.env` và xóa dòng `DATABASE_URL`:**

📄 **`.env`**

```env
NODE_ENV=development
PORT=3000
# DATABASE_URL đã bị cố tình xóa
```

2️⃣ **Khởi chạy lại Server:**

```bash
pnpm start:dev
```

3️⃣ **Kết quả hiển thị trên Terminal:**

```bash
[Nest] 23456  - 08/10/2026, 4:15:00 PM   ERROR [ExceptionHandler] Config validation error: "DATABASE_URL" is required

Error: Config validation error: "DATABASE_URL" is required
    at validate (/path/to/node_modules/@nestjs/config/dist/config.module.js:75:19)
```

> [!CAUTION]
> **Kết quả:** Server lập tức bị ngưng khởi chạy (Exit Code 1) và thông báo rõ biến `DATABASE_URL` bắt buộc phải có. Việc này giúp bảo vệ hệ thống không bao giờ bị lỗi ngầm khi deploy lên Staging hoặc Production!

---

## 5. Tổng Kết Bài Học & Checklist Ghi Nhớ

```mermaid
mindmap
  root(("NestJS Configuration"))
    "Rủi Ro process.env"
      "Giá trị luôn là string"
      "Dễ lỗi runtime ngầm"
      "Khó khăn khi Unit Test"
    "Giải Pháp @nestjs/config"
      "Cấu hình isGlobal: true"
      "Tiêm qua ConfigService"
    "Xác Thực Với Joi"
      "Tự động ép kiểu (Type Casting)"
      "Giá trị mặc định (Default)"
      "Boot Crash khi thiếu biến required"
```

### ✅ Checklist Ghi Nhớ Bài Học:

- [x] Hiểu lý do tại sao không nên truy cập trực tiếp `process.env`.
- [x] Đã cài đặt `@nestjs/config` và `joi` bằng pnpm.
- [x] Tách biệt Joi `validationSchema` ra tệp riêng `src/config/env.validation.ts` chuẩn Best Practice.
- [x] Cấu hình gọn gàng `ConfigModule.forRoot` với `envValidationSchema` tại `AppModule`.
- [x] Đọc biến môi trường an toàn thông qua `ConfigService`.
- [x] Kiểm chứng được tính năng Boot Crash khi thiếu biến môi trường bắt buộc.

---

👉 **Bài tiếp theo:** [Module 2 - Lesson 2.1: Khởi chạy PostgreSQL với Docker Compose trong 1 click](../module-02/lesson-2.1/lesson-2.1.md)
