# NestJS Thực Chiến: Xây Dựng API Từ Cơ Bản Đến Nâng Cao

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

<p align="center">
  <img src="./assets/course-thumbnail.png" alt="NestJS Course Thumbnail" width="100%" />
</p>

<p align="center">
  <strong>NestJS & TypeScript Thực Chiến: Xây Dựng Real-time Chat App với PostgreSQL, Prisma, WebSockets & Docker</strong><br/>
  <em>Tài liệu chuẩn Enterprise dành cho Instructor giảng dạy khóa học NestJS trên Udemy</em>
</p>

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
| **Module Materials**          | Kịch bản bài học & Slide Marp lưu theo cấu trúc chuẩn từng Module         |              [Xem Modules](./docs/modules/)              |

---

## 4. Kênh Hỗ Trợ & Liên Hệ Giảng Viên (Instructor Contact & Support)

> [!TIP]
> **Hỗ trợ học viên 24/7:** Trong quá trình học nếu gặp khó khăn về cài đặt môi trường, lỗi code hoặc cần giải đáp thắc mắc về kiến thức NestJS, bạn có thể liên hệ trực tiếp với Giảng viên qua các kênh bên dưới.

|                                                                        Kênh liên hệ                                                                        | Thông tin / Liên kết                                                               |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------- |
|           [![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:dotanthanhvlog@gmail.com)            | `dotanthanhvlog@gmail.com`                                                         |
|  [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/thanh270600/)   | [Đỗ Tấn Thành (thanh270600)](https://www.linkedin.com/in/thanh270600/)             |
|           [![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/thanhmati)            | [@thanhmati](https://github.com/thanhmati)                                         |
|   [![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@laptrinhfullstack)   | [Lập Trình Fullstack](https://www.youtube.com/@laptrinhfullstack)                  |
| [![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://www.facebook.com/groups/ltfullstack) | [Group Cộng đồng Lập Trình Fullstack](https://www.facebook.com/groups/ltfullstack) |
|               [![Zalo](https://img.shields.io/badge/Zalo-0068FF?style=for-the-badge&logo=zalo&logoColor=white)](https://zalo.me/0762216048)                | Hotline / Zalo: `0762216048`                                                       |
