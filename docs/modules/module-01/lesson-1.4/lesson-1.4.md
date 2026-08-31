# Lesson 1.4: Khởi Tạo Dự Án NestJS Với Nest CLI & Khám Phá Cấu Trúc Mã Nguồn

> **Thời lượng dự kiến:** 12 – 15 phút  
> **Mục tiêu bài học:** Học cách sử dụng `@nestjs/cli` để khởi tạo dự án backend tiêu chuẩn, hiểu rõ mục đích của từng file trong cấu trúc mã nguồn mặc định và chạy ứng dụng thành công.

---

## 1. Khởi Tạo Dự Án Với Nest CLI

### Bước 1: Cài Đặt Nest CLI Toàn Cục (Global)

Nest CLI (Command Line Interface) là công cụ chính thức giúp nhanh chóng tạo project, generate các module, controller, service chuẩn kiến trúc NestJS.

Mở Terminal và chạy lệnh cài đặt:

```bash
npm install -g @nestjs/cli
```

Kiểm tra phiên bản Nest CLI sau khi cài:

```bash
nest --version
```

---

### Bước 2: Tạo Project NestJS Mới

Sử dụng lệnh `nest new` để khởi tạo dự án backend cho ứng dụng Social Chat App:

```bash
nest new nestjs-basic-course
```

Trong quá trình khởi tạo, Nest CLI sẽ hỏi bạn lựa chọn **Package Manager**. Hãy chọn **`pnpm`**:

```text
? Which package manager would you {like} to use?
  npm
  yarn
> pnpm
```

Sau khi quá trình cài đặt hoàn tất, di chuyển vào thư mục dự án:

```bash
cd nestjs-basic-course
```

---

## 2. Giải Mã Cấu Trúc Thư Mục Dự Án (Project Anatomy)

Dưới đây là sơ đồ tổng quan thư mục của dự án NestJS vừa tạo:

```text
nestjs-basic-course/
├── src/
│   ├── main.ts              # Entry point (Điểm khởi chạy ứng dụng)
│   ├── app.module.ts        # Root Module (Module gốc chứa các module khác)
│   ├── app.controller.ts    # Controller mẫu tiếp nhận HTTP request
│   ├── app.controller.spec.ts # File Unit Test cho Controller
│   └── app.service.ts       # Service mẫu chứa xử lý logic
├── test/                    # Thư mục chứa E2E Test (End-to-End Testing)
├── nest-cli.json            # Cấu hình cài đặt cho Nest CLI
├── package.json             # Danh sách dependencies & các npm scripts
├── tsconfig.json            # Cấu hình TypeScript compiler
└── tsconfig.build.json      # Cấu hình TypeScript khi build cho production
```

---

### Chi Tiết Các File Cốt Lõi Trong `src/`

#### 1. `src/main.ts` - Entry Point

Đây là tệp tin đầu tiên được thực thi khi khởi động ứng dụng:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Tạo đối tượng application dựa trên AppModule
  const app = await NestFactory.create(AppModule);
  // Khắng định ứng dụng lắng nghe ở cổng 3000
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

#### 2. `src/app.module.ts` - Root Module

Nơi đăng ký tất cả các Controllers và Providers (Services) của toàn bộ hệ thống:

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

#### 3. `src/app.controller.ts` - Controller

Đảm nhận vai trò tiếp nhận Request từ Client và định tuyến (Routing):

```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

#### 4. `src/app.service.ts` - Service

Nơi thực hiện các thao tác xử lý nghiệp vụ thực sự:

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

---

## 3. Khởi Chạy Ứng Dụng Môi Trường Development

Để bật server ở chế độ Development (tự động reload khi sửa code - Hot Reload), chạy lệnh:

```bash
pnpm start:dev
```

Màn hình Terminal xuất hiện thông báo ứng dụng đã khởi chạy thành công:

```text
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [RoutesResolver] AppController {/}:
[Nest] LOG [RouterExplorer] Mapped {/, GET} route
[Nest] LOG [NestApplication] Nest application successfully started
```

---

## 4. Kiểm Trả Kết Quả API Đang Chạy

Mở trình duyệt web hoặc Postman gửi HTTP GET Request đến đường dẫn:

- **URL:** `http://localhost:3000`
- **Kết quả trả về (Response):** `Hello World!`

---

## 5. Thử Thay Đổi Logic Bài Học

1. Mở file `src/app.service.ts`.
2. Sửa chuỗi ký tự trả về thành: `return 'Welcome to NestJS Social Chat App API!';`
3. Lưu file (`Ctrl+S`).
4. Tải lại trang `http://localhost:3000` để thấy thông báo mới cập nhật tức thì.
