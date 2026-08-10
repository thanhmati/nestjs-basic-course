---
marp: true
theme: default
paginate: true
header: "NestJS Zero to Hero | Module 1 - Lesson 1.1: Overview"
footer: "© Udemy Masterclass"
style: |
  section {
    background-color: #0f172a;
    color: #f8fafc;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    padding: 40px 60px;
  }
  h1 {
    color: #f43f5e;
    font-size: 2.2em;
    font-weight: 800;
    margin-bottom: 0.3em;
  }
  h2 {
    color: #38bdf8;
    font-size: 1.5em;
    font-weight: 700;
    margin-bottom: 0.5em;
  }
  h3 {
    color: #fbbf24;
    font-weight: 600;
  }
  strong {
    color: #38bdf8;
  }
  blockquote {
    background: #1e293b;
    border-left: 6px solid #f43f5e;
    padding: 14px 20px;
    margin: 15px 0;
    border-radius: 8px;
  }
  code {
    background: #1e293b;
    color: #4ade80;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.88em;
  }
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 15px;
    align-items: center;
  }
  .card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 18px 24px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  }
  .card-title {
    font-weight: 700;
    font-size: 1.1em;
    margin-bottom: 8px;
  }
  .text-express {
    color: #f43f5e;
  }
  .text-nestjs {
    color: #38bdf8;
  }
---

<!-- slide 1: Title -->

<div class="grid-2">
  <div>
    <h1>Lesson 1.1: Tổng Quan Về NestJS</h1>
    <h3>Kiến Trúc Enterprise & Lý Do Lựa Chọn NestJS</h3>
    <ul>
      <li><strong>Khóa học:</strong> NestJS Practical Masterclass</li>
      <li><strong>Dự án thực chiến:</strong> Real-Time Social Chat App</li>
      <li><strong>Thời lượng:</strong> ~3 - 5 phút</li>
    </ul>
  </div>

  <div>
    <img src="./assets/nestjs_overview_banner.svg" width="100%" />
  </div>
</div>

---

<!-- slide 2: What is NestJS -->

# NestJS Là Gì?

- **Progressive Node.js Framework**: Xây dựng dựa trên **TypeScript** chuẩn hóa.
- **Nền tảng bên dưới**: Sử dụng **Express.js** (mặc định) hoặc **Fastify** làm HTTP Engine.
- **Cảm hứng kiến trúc**: Ảnh hưởng bởi **Angular** (Modular, Decorators & Dependency Injection).

> **Mục tiêu cốt lõi:** Mang đến cấu trúc phần mềm chuẩn mực (Architectural Pattern) giúp quản lý ứng dụng Server-side Node.js quy mô lớn.

<!--
Speaker Notes:
Xin chào các bạn! Chào mừng các bạn đến với Lesson 1.1. Trong bài học này, chúng ta sẽ cùng tìm hiểu NestJS là gì và vì sao nó lại trở thành lựa chọn hàng đầu cho các hệ thống Backend Enterprise hiện nay.
NestJS không thay thế Express, mà nó bọc lấy Express để cung cấp một kiến trúc chuẩn mực giúp chúng ta viết code sạch và dễ quản lý.
-->

---

<!-- slide 3: Comparison Cards -->

# Express Spaghetti vs NestJS Architecture

<div class="grid-2">
  <div class="card">
    <div class="card-title text-express">Express.js Thuần</div>
    <ul>
      <li><strong>Cấu trúc:</strong> Tự do quá mức ➔ Dễ thành "Spaghetti Code" khi dự án lớn.</li>
      <li><strong>Type Safety:</strong> Tùy chọn ➔ Dễ phát sinh lỗi Runtime không lường trước.</li>
      <li><strong>DI:</strong> Phải tự quản lý hoặc truyền thủ công.</li>
      <li><strong>Mở rộng:</strong> Khó maintain khi dự án & team phình to.</li>
    </ul>
  </div>

  <div class="card">
    <div class="card-title text-nestjs">NestJS Framework</div>
    <ul>
      <li><strong>Cấu trúc:</strong> Định sẵn (Opinionated) ➔ Thống nhất phong cách code toàn team.</li>
      <li><strong>Type Safety:</strong> TypeScript First ➔ Phát hiện lỗi ngay lúc biên dịch.</li>
      <li><strong>DI:</strong> DI Container tự động ➔ Code loosely-coupled, dễ viết Unit Test.</li>
      <li><strong>Mở rộng:</strong> Dễ chia tách Module & phát triển song song.</li>
    </ul>
  </div>
</div>

<!--
Speaker Notes:
Khi làm việc với Express thuần trong dự án lớn, mỗi lập trình viên lại có một phong cách viết code riêng, dẫn đến "Spaghetti Code". NestJS khắc phục triệt để bằng cách đưa ra bộ quy chuẩn chung: Controller ở đâu, Service ở đâu, Module nhóm thế nào.
-->

---

<!-- slide 4: Core Pillars with Architecture Diagram -->

<div class="grid-2">
  <div>
    <h2>3 Trụ Cột Kiến Trúc Cốt Lõi</h2>
    <ul>
      <li><strong>Module</strong>: Đóng gói các tính năng liên quan.</li>
      <li><strong>Controller</strong>: Xử lý HTTP Request & Routing.</li>
      <li><strong>Service</strong>: Chứa Business Logic & tiêm qua DI.</li>
    </ul>
    <code>Client Request ➔ Controller ➔ Service ➔ Database</code>
  </div>

  <div>
    <img src="./assets/nestjs_architecture_pillars.svg" width="100%" />
  </div>
</div>

<!--
Speaker Notes:
Mọi ứng dụng NestJS đều xoay quanh 3 khái niệm cốt lõi: Module dùng để đóng gói, Controller dùng để tiếp nhận yêu cầu từ client, và Service dùng để thực hiện các thao tác xử lý nghiệp vụ thực sự.
-->

---

<!-- slide 5: Ecosystem -->

# Hệ Sinh Thái Out-of-the-Box Chuẩn Enterprise

<div class="grid-2">
  <div class="card">
    <div class="card-title text-nestjs">Validation & Security</div>
    <ul>
      <li>Validate DTOs tự động với <code>class-validator</code>.</li>
      <li>Bảo mật với Passport, JWT Auth & Rate Limiting (<code>@nestjs/throttler</code>).</li>
    </ul>
  </div>

  <div class="card">
    <div class="card-title text-nestjs">Real-time & Tooling</div>
    <ul>
      <li>WebSocket Gateways (Socket.io) & Event Emitter.</li>
      <li>Tự động sinh Swagger API UI (<code>@nestjs/swagger</code>).</li>
      <li>Cấu hình sẵn Jest cho Unit & E2E Testing.</li>
    </ul>
  </div>
</div>

<!--
Speaker Notes:
Thay vì phải tự vắt óc tìm và ghép nối hàng chục thư viện lẻ tẻ, NestJS đã đóng gói sẵn mọi công cụ cần thiết cho một hệ thống Backend hoàn chỉnh theo tiêu chuẩn sản xuất (Production-Ready).
-->

---

<!-- slide 6: Summary & Next Step -->

# Tổng Kết & Bước Tiếp Theo

### Key Takeaways:

1. **NestJS** = TypeScript + Angular Architecture + Express Engine.
2. Giải quyết triệt để bài toán thiếu cấu trúc của Express trong dự án quy mô lớn.
3. Cung cấp sẵn **DI Container** và Hệ sinh thái đầy đủ cho Enterprise Backend.

---

### Bài học tiếp theo: **Lesson 1.2 - Demo App**

> Chúng ta sẽ cùng nhau **trải nghiệm & khám phá ứng dụng Real-time Social Chat App** hoàn chỉnh trước khi bắt tay vào code!

<!--
Speaker Notes:
Đó là toàn bộ tổng quan về NestJS. Hẹn gặp lại các bạn trong Lesson 1.2, nơi chúng ta sẽ cùng chạy thử ứng dụng Social Chat App thực tế để thấy được sức mạnh của hệ thống mà chúng ta sẽ tự tay xây dựng!
-->
