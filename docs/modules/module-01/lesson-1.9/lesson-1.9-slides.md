---
marp: true
theme: default
paginate: true
header: 'NestJS Zero to Hero | Module 1 - Lesson 1.9: Core Concepts'
footer: '© NestJS Basic Course'
style: |
  section {
    background-color: #0f172a;
    color: #f8fafc;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    padding: 40px 60px;
  }
  h1 {
    color: #e0234e;
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
    border-left: 6px solid #e0234e;
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
  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 15px;
    margin-top: 15px;
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
  .text-controller { color: #38bdf8; }
  .text-service { color: #34d399; }
  .text-module { color: #fbbf24; }
---

<!-- slide 1: Title -->

# Lesson 1.9: Core Concepts

### Controller, Service, Module & Dependency Injection (DI)

- **Khóa học:** NestJS Practical Masterclass: Zero to Hero
- **Dự án thực chiến:** Real-Time Social Chat Application
- **Thời lượng dự kiến:** ~12 - 15 phút

---

<!-- slide 2: Separation of Concerns -->

# 🏗️ Bộ Ba Kiến Trúc Cốt Lõi

<div class="grid-3">
  <div class="card">
    <div class="card-title text-controller">🎮 Controller</div>
    <p>Đón nhận HTTP Requests (GET, POST), validate dữ liệu &amp; điều hướng đường dẫn API.</p>
  </div>
  <div class="card">
    <div class="card-title text-service">⚡ Service (Provider)</div>
    <p>Chứa toàn bộ Business Logic, tính toán nghiệp vụ &amp; truy vấn CSDL.</p>
  </div>
  <div class="card">
    <div class="card-title text-module">📦 Module</div>
    <p>Đóng gói và gom nhóm các Controllers &amp; Services thành khối tính năng độc lập.</p>
  </div>
</div>

---

<!-- slide 3: Traditional vs DI -->

# 💡 Dependency Injection (DI) Là Gì?

<div class="grid-2">
  <div class="card">
    <div class="card-title" style="color: #f43f5e;">❌ Lập Trình Truyền Thống</div>
    <p>Controller tự khởi tạo Service với từ khóa <code>new</code>:</p>
    <pre><code class="language-typescript">class UsersController {
  private service = new UsersService();
}</code></pre>
    <p style="font-size:0.85em; color:#cbd5e1;">⚠️ Khó unit test, phụ thuộc chặt chẽ (Tight Coupling).</p>
  </div>
  <div class="card">
    <div class="card-title" style="color: #34d399;">✅ NestJS Dependency Injection</div>
    <p>Nhận Service từ IoC Container qua <code>Constructor</code>:</p>
    <pre><code class="language-typescript">class UsersController {
  constructor(
    private service: UsersService
  ) {}
}</code></pre>
    <p style="font-size:0.85em; color:#cbd5e1;">⚡ Dễ dàng Mock test, quản lý Singleton tự động.</p>
  </div>
</div>

---

<!-- slide 4: CLI Commands -->

# 🚀 Khởi Tạo Nhanh Với Nest CLI

Sử dụng **Nest CLI** để sinh cấu trúc chuẩn trong 1 click:

```bash
# 1. Tạo Users Module
pnpm nest g module users

# 2. Tạo Users Service (bỏ file test .spec)
pnpm nest g service users --no-spec

# 3. Tạo Users Controller (bỏ file test .spec)
pnpm nest g controller users --no-spec
```

> 💡 **Mẹo:** Nest CLI tự động khai báo Controller &amp; Service vào mảng <code>controllers</code> và <code>providers</code> của <code>UsersModule</code>.

---

<!-- slide 5: Code Example - Service -->

# 📄 UsersService (`@Injectable`)

Chứa logic nghiệp vụ và truy vấn dữ liệu:

```typescript
import { Injectable } from '@nestjs/common';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable()
export class UsersService {
  private users: User[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
  ];

  findAll(): User[] {
    return this.users;
  }
}
```

---

<!-- slide 6: Code Example - Controller -->

# 📄 UsersController (`@Controller`)

Tiêm `UsersService` qua Constructor và khai báo Route:

```typescript
import { Controller, Get } from '@nestjs/common';
import { User, UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllUsers(): User[] {
    return this.usersService.findAll();
  }
}
```

---

<!-- slide 7: Common Pitfalls -->

# 🔴 Lỗi Thường Gặp: UnknownElementException

```text
ERROR [ExceptionHandler] Nest can't resolve dependencies of UsersController (?).
Please make sure that the argument UsersService at index [0] is available in UsersModule context.
```

### 🔍 Nguyên Nhân &amp; Khắc Phục:

- **Nguyên nhân:** Quên khai báo `UsersService` vào mảng `providers` trong `UsersModule`.
- **Khắc phục:** Thêm `UsersService` vào `providers: [UsersService]` của tệp `users.module.ts`.

---

<!-- slide 8: Summary -->

# 🎯 Tổng Kết Bài Học

- 🟢 **Controller:** Đón nhận &amp; phản hồi HTTP Request (`@Controller`).
- 🟢 **Service:** Xử lý toàn bộ logic nghiệp vụ (`@Injectable`).
- 🟢 **Module:** Khối gom nhóm tính năng (`@Module`).
- 🟢 **DI &amp; IoC:** NestJS tự tạo Singleton Instance và tiêm vào Constructor.

👉 **Bài tiếp theo:** Lesson 1.10 - Configuration &amp; Environment Variables (`@nestjs/config`)
