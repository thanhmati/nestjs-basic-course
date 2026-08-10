# NestJS Practical Masterclass: Zero to Hero

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Tài liệu chuẩn Enterprise dành cho Instructor giảng dạy khóa học NestJS trên Udemy**  
_Dự án thực chiến: Real-Time Social Chat Application (Authentication, REST API, WebSockets, Events & Healthchecks)_

</div>

---

## 1. Thống Kê Nhanh Về Khóa Học (Course Metrics)

| Chỉ số                 | Chi tiết                                                            |
| :--------------------- | :------------------------------------------------------------------ |
| **Đối tượng mục tiêu** | Người mới bắt đầu làm Backend (Đã biết cơ bản JS/TS)                |
| **Thời lượng dự kiến** | 10 – 14 Giờ học (7 Modules tinh gọn)                                |
| **Dự án tốt nghiệp**   | Real-Time Social Media & Chat Room Application                      |
| **Chuẩn Kiến Thức**    | RESTful API, OWASP Security, Event-Driven, WebSockets, Healthchecks |

---

## 2. Mô Hình Kiến Trúc Dự Án (System Architecture Diagram)

```mermaid
graph TD
    Client["Client App (React/Next.js UI Starter)"]

    subgraph NestJS ["NestJS Backend Framework"]
        Middleware["Logger Middleware"]
        Pipe["Validation Pipe (DTOs)"]
        Guard["JwtAuthGuard & RolesGuard"]

        Controller["REST Controllers & Sockets Gateway"]
        Service["Business Logic Services"]
        Events["Event Emitter"]
        Cache["Cache Manager"]
        Terminus["Terminus Healthcheck"]

        Middleware --> Pipe --> Guard --> Controller
        Controller --> Service
        Service --> Events
        Service --> Cache
    end

    Database[("PostgreSQL DB")]
    Prisma["Prisma ORM"]

    Service --> Prisma --> Database
    Client <-->|"HTTP / REST API"| NestJS
    Client <-->|"WebSockets (Socket.io)"| Controller
```

---

## 3. Danh Mục Tài Liệu Chi Tiết (`docs/`)

> [!NOTE]
> Tất cả các tài liệu bên dưới được biên soạn chi tiết từng bước, giúp Instructor dễ dàng chuẩn bị slide và kịch bản quay video.

| Tài liệu                      | Mô tả nội dung                                                            |                        Link nhanh                        |
| :---------------------------- | :------------------------------------------------------------------------ | :------------------------------------------------------: |
| **00. Curriculum Blueprint**  | Khung 7 Modules bài học sắp xếp chuẩn theo tiến trình phát triển sản phẩm |    [Xem tài liệu](./docs/00-curriculum-blueprint.md)     |
| **01. Pedagogical Strategy**  | Hướng dẫn kịch bản quay video, quy tắc giải thích code & debug thực tế    |    [Xem tài liệu](./docs/01-pedagogical-strategy.md)     |
| **02. Capstone Project Spec** | Bản thiết kế CSDL (ERD Diagram) và bảng đồ API endpoints chi tiết         |    [Xem tài liệu](./docs/02-capstone-project-spec.md)    |
| **03. Course Resources**      | Bộ tài nguyên đi kèm (Postman Collection, React UI Kit, PDF Slides)       | [Xem tài liệu](./docs/03-course-resources-and-assets.md) |
| **Module Materials**          | Kịch bản bài học & Slide Marp lưu theo cấu trúc chuẩn từng Module          |    [Xem Modules](./docs/modules/)                        |
