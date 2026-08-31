# Lesson 1.3: Hướng Dẫn Cài Đặt Môi Trường Phát Triển Dự Án

> **Thời lượng dự kiến:** 10 – 12 phút  
> **Mục tiêu bài học:** Chuẩn bị đầy đủ bộ công cụ cần thiết (NodeJS, pnpm, VS Code, Postman, Docker) để sẵn sàng lập trình hệ thống Backend NestJS và khởi chạy các dịch vụ bổ trợ.

---

## 1. Tổng Quan Bộ Công Cụ (Environment Overview)

| Công cụ     | Phiên bản khuyến nghị   | Vai trò trong dự án                                                 |
| :---------- | :---------------------- | :------------------------------------------------------------------ |
| **NodeJS**  | LTS (v20.x trở lên)     | Runtime Environment cho JavaScript / TypeScript                     |
| **pnpm**    | v9.x trở lên            | Package Manager tốc độ cao, tiết kiệm dung lượng ổ đĩa              |
| **VS Code** | Phiên bản mới nhất      | Code Editor chính + Bộ Extensions hỗ trợ NestJS & Prisma            |
| **Postman** | Desktop App             | Công cụ kiểm thử và gửi HTTP Request đến REST APIs                  |
| **Docker**  | Docker Desktop (v24.x+) | Khởi tạo & quản lý cơ sở dữ liệu PostgreSQL trong môi trường cô lập |

---

## 2. Các Bước Cài Đặt Chi Tiết (Step-by-Step Installation)

### Bước 1: Cài Đặt NodeJS (LTS Version)

NodeJS là môi trường thực thi bắt buộc cho mọi dự án NestJS.

- **Trang chủ tải về:** [https://nodejs.org](https://nodejs.org)
- **Lựa chọn phiên bản:** Luôn chọn phiên bản **LTS (Long Term Support)** để đảm bảo tính ổn định.
- **Cách cài đặt:**
  - **Windows / macOS:** Tải file installer (`.msi` hoặc `.pkg`) và bấm _Next_ theo mặc định.
  - **Linux (Ubuntu/Debian):** Khuyên dùng NVM (Node Version Manager) để quản lý phiên bản.

**Kiểm tra sau khi cài:** Mở Terminal / Command Prompt và chạy lệnh:

```bash
node -v
npm -v
```

> _Yêu cầu:_ `node` đạt phiên bản `>= 20.x.x` và `npm` `>= 10.x.x`.

---

### Bước 2: Cài Đặt pnpm (Package Manager)

Khóa học này sử dụng **pnpm** thay cho `npm` hoặc `yarn` nhờ cơ chế Symlink thông minh giúp tiết kiệm dung lượng ổ đĩa và cài đặt package cực nhanh.

- **Cài đặt toàn cục (Global) qua npm:**

```bash
npm install -g pnpm
```

**Kiểm tra sau khi cài:**

```bash
pnpm -v
```

> _Yêu cầu:_ `pnpm` trả về phiên bản `>= 9.x.x`.

---

### Bước 3: Cài Đặt Visual Studio Code & Extensions

VS Code là trình soạn thảo mã nguồn chính được sử dụng trong suốt khóa học.

- **Trang chủ tải về:** [https://code.visualstudio.com](https://code.visualstudio.com)
- **Danh sách Extension khuyến nghị:**
  1. **ESLint** : Cảnh báo lỗi cú pháp & code style theo thời gian thực.
  2. **Prettier - Code formatter** : Tự động format code khi lưu file (Save).
  3. **Prisma** : Highlight cú pháp & gợi ý code cho file `schema.prisma`.
  4. **DotENV** : Highlight cú pháp cho các file biến môi trường `.env`.
  5. **PDF Preview** : Xem trước file PDF trực tiếp trong VS Code.
  6. **Jest / Vitest Runner** : Kiểm thử và debug code.
  7. **Markdown Preview Enhanced** : Xem trước file Markdown trực tiếp trong VS Code.

> **Mẹo cấu hình VS Code (User Settings):** Bật tính năng tự động format code khi bấm `Ctrl+S` (`Cmd+S` trên Mac):
>
> - Vào `Settings` ➔ Tìm `Format On Save` ➔ Đánh dấu tích chọn **Enable**.

---

### Bước 4: Cài Đặt Postman

Postman được sử dụng để kiểm thử các API Endpoints (Đăng ký, Đăng nhập, Tạo bài viết, Upload file) trước khi ghép nối với giao diện Frontend.

- **Trang chủ tải về:** [https://www.postman.com/downloads](https://www.postman.com/downloads)
- **Cài đặt:** Tải bản Desktop App phù hợp với hệ điều hành và tiến hành đăng nhập tài khoản miễn phí.

---

### Bước 5: Cài Đặt Docker & Docker Desktop

Docker giúp khởi chạy cơ sở dữ liệu **PostgreSQL** trong container cô lập chỉ với 1 câu lệnh đơn giản, không cần cài đặt trực tiếp Postgres vào máy tính cá nhân.

- **Trang chủ tải về:** [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- **Lưu ý cài đặt:**
  - **Windows:** Cần đảm bảo đã bật **WSL 2 (Windows Subsystem for Linux)**.
  - **macOS:** Chọn đúng bản tương ứng với chip **Apple Silicon (M1/M2/M3)** hoặc **Intel**.

**Kiểm tra sau khi cài:** Khởi động ứng dụng Docker Desktop, sau đó mở Terminal chạy:

```bash
docker -v
docker compose version
```

> _Yêu cầu:_ Cả 2 câu lệnh đều trả về phiên bản hiện tại mà không báo lỗi "command not found".

---

## 3. Kiểm Tra Toàn Bộ Môi Trường (System Check Script)

Để đảm bảo máy tính đã sẵn sàng cho bài học tiếp theo (Tạo project NestJS với Nest CLI), hãy mở Terminal và chạy đoạn script kiểm tra nhanh dưới đây:

```bash
echo "=== CHECKING ENVIRONMENT ==="
node -v
pnpm -v
docker -v
docker compose version
echo "=== ENVIRONMENT READY ==="
```
