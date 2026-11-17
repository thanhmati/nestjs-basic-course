# Lesson 7.5: Dockerize & Cloud Deploy — Đóng Gói Container Tối Ưu & Triển Khai Hệ Thống Lên Cloud Platform

<p align="center">
  <img src="https://img.shields.io/badge/Docker-Containerization-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Docker_Compose-Orchestration-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Compose" />
  <img src="https://img.shields.io/badge/Multi--Stage-Build_Optimization-0db7ed?style=for-the-badge&logo=docker&logoColor=white" alt="Multi-stage" />
  <img src="https://img.shields.io/badge/Render-Cloud_Hosting-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render" />
  <img src="https://img.shields.io/badge/Railway-Infrastructure-0B0D0E?style=for-the-badge&logo=railway&logoColor=white" alt="Railway" />
  <img src="https://img.shields.io/badge/pnpm-Package_Manager-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
</p>

<p align="center">
  <img src="./assets/lesson_overview_banner.png" alt="Đóng gói Docker Multi-stage và Triển khai NestJS Social Chat App lên Cloud Platforms" width="90%" />
</p>

---

> [!NOTE]
> ⏱️ **Thời lượng:** 25 phút thực chiến  
> 🎯 **Mục tiêu bài học:**
>
> - **Hiểu sâu sắc (Why):** Thoát khỏi vấn nạn kinh điển _"Code chạy ngon lành trên máy em mà lên server lại lỗi!"_, hiểu lý do **Container Hóa (Containerization)** là tiêu chuẩn bắt buộc của toàn bộ ngành công nghiệp phần mềm hiện đại.
> - **Làm chủ Multi-stage Docker Build:** Thiết kế kiến trúc build tinh gọn cho NestJS với `pnpm` và `Prisma 7`, tách biệt môi trường biên dịch (`builder`) khỏi môi trường thực thi (`runner`), cắt giảm kích thước Docker Image từ **1.2GB xuống dưới ~160MB** (giảm 85%).
> - **Quản lý biến môi trường với `env_file`:** Tách biệt cấu hình khỏi file hạ tầng theo chuẩn 12-Factor App, sử dụng file `.env` nạp biến môi trường cho container một cách an toàn và gọn gàng.
> - **Tự động hóa Migration khi Deploy:** Thiết lập kịch bản chạy `prisma migrate deploy` an toàn trước khi Node.js nhận traffic người dùng.
> - **Triển khai thực tế lên Cloud PaaS:** Làm chủ quy trình Deploy toàn diện lên **Render** và **Railway**, kết nối trơn tru với Managed PostgreSQL, Redis, cấu hình biến môi trường và Healthcheck probe `/api/v1/health`.
> - **Tổng kết toàn bộ Khóa học:** Nhìn lại chặng đường hoàn thành ứng dụng Capstone **Social Chat App** chuẩn Production từ Module 1 đến Module 7!

> [!IMPORTANT]
> **Prerequisites:**
>
> - Đã hoàn thành API Healthcheck với `@nestjs/terminus` ([Lesson 7.3](../lesson-7.3/lesson-7.3.md)).
> - Đã nắm vững cơ chế Prisma Migrations `prisma migrate` ([Lesson 2.4](../../module-02/lesson-2.4/lesson-2.4.md)).
> - Đã cài đặt Docker Desktop và tài khoản GitHub cá nhân.
> - Nắm được cấu trúc Request Pipeline của dự án [Social Chat App Architecture](../../../04-project-architecture-and-codebase.md).

---

## 1. Tại Sao Cần Container Hóa & Đưa Ứng Dụng Lên Cloud? (Why?)

### 1.1 Vấn Nạn Kinh Điển: "It Works on My Machine!"

Trong quá trình phát triển phần mềm, một trong những tình huống gây ức chế nhất cho đội ngũ kỹ thuật là:

```text
Lập trình viên: "Code chạy ngon lành trên máy Mac/Windows của em mà!"
DevOps / SysAdmin: "Nhưng deploy lên server Linux Ubuntu thì crash ngay lập tức!"
```

Sự sai lệch này bắt nguồn từ **sự bất đồng nhất về môi trường**:

1. **Khác biệt hệ điều hành & Thư viện C++ Native:** Bạn phát triển trên macOS (chip Apple Silicon ARM64), nhưng máy chủ Cloud chạy Linux x86_64. Các thư viện native như `bcrypt` hay Prisma Query Engine binary sẽ lập tức báo lỗi `Cannot open shared object file`.
2. **Khác biệt phiên bản Runtime:** Máy cá nhân chạy Node.js 22.10, server lại cài sẵn Node.js 18 hoặc 20, dẫn đến các hàm JavaScript mới không thể thực thi.
3. **Cấu hình phân mảnh giữa nhiều Service:** Ứng dụng Social Chat App của chúng ta cần đồng thời:
   - Ứng dụng Backend NestJS (Port 3000)
   - Cơ sở dữ liệu PostgreSQL (Port 5432)
   - Bộ nhớ đệm Redis Cache (Port 6379)
   - Thư mục lưu trữ file ảnh tĩnh `uploads/`

Nếu cài đặt thủ công từng thứ trên máy chủ Production, bạn sẽ mất hàng ngày để debug cấu hình, firewall, và phân quyền người dùng!

---

### 1.2 Giải Pháp Docker & Containerization

**Docker** giải quyết triệt để bài toán trên bằng cách đóng gói toàn bộ: **Mã nguồn + Node.js Runtime + Thư viện hệ điều hành + Dependencies + Cấu hình** thành một đơn vị duy nhất gọi là **Docker Image (Bản sao bất biến — Immutable Artifact)**.

```mermaid
flowchart LR
    subgraph DEV["💻 Môi trường Local Dev"]
        Mac["macOS ARM64\nNode.js 22"]
    end

    subgraph DOCKER["🐳 Docker Container (Chuẩn hóa)"]
        IMG["Docker Image\nAlpine Linux + Node 22\nPrisma + Dependencies"]
    end

    subgraph CLOUD["☁️ Môi trường Cloud Production"]
        Render["Render / Railway\nAWS ECS / Kubernetes"]
    end

    DEV -->|Build Image| DOCKER
    DOCKER -->|Chạy y hệt 100%| CLOUD
```

> [!TIP]
> **Hình dung trực quan:**
>
> Docker Image giống như một **container hàng hóa tiêu chuẩn quốc tế**: dù bạn chở bằng tàu hỏa, tàu thủy, hay xe tải (Local, Staging hay Cloud), hàng hóa bên trong vẫn được bảo toàn nguyên vẹn, không bị xáo trộn bởi môi trường xung quanh.

---

## 2. Kiến Trúc Multi-stage Build Tinh Gọn Cho NestJS (What?)

### 2.1 Cơn Ác Mộng Của Dockerfile Ngây Thơ (Bloated Image 1.2GB)

Nhiều lập trình viên mới bắt đầu thường viết một Dockerfile đơn giản gồm một bước duy nhất:

```dockerfile
# ❌ DOCKERFILE ĐƠN GIẢN — KHÔNG NÊN DÙNG TRONG PRODUCTION
FROM node:22
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["node", "dist/main"]
```

Hậu quả của cách làm này là:

1. **Dung lượng khổng lồ (~1.2GB đến 1.5GB):** Image chứa toàn bộ `devDependencies` (TypeScript compiler, ESLint, Prettier, Jest, Supertest), mã nguồn `.ts` gốc không cần thiết, và các file rác.
2. **Kéo dài thời gian Deploy:** Mỗi lần merge code lên Cloud, server phải tốn vài phút để kéo (pull) hơn 1GB dữ liệu qua mạng Internet.

---

### 2.2 Kiến Trúc Multi-stage Build Tinh Gọn 2 Tầng (Cắt Giảm Xuống ~160MB)

Kỹ thuật **Multi-stage Build** chia quá trình đóng gói thành 2 tầng độc lập rõ ràng:

- **Tầng 1 (Builder):** Nạp đầy đủ công cụ để cài đặt dependencies, sinh Prisma Client và biên dịch TypeScript sang JavaScript trong thư mục `dist/`.
- **Tầng 2 (Runner):** Khởi tạo một container Alpine hoàn toàn mới, chỉ copy sản phẩm cuối cùng (`dist/` và `node_modules` production). Toàn bộ mã nguồn `.ts`, TypeScript compiler và công cụ linting ở tầng 1 đều bị bỏ lại!

<p align="center">
  <img src="./assets/docker_multistage_architecture.png" alt="Kiến trúc Multi-stage Docker Build tối ưu hóa dung lượng cho NestJS" width="90%" />
</p>

```mermaid
flowchart TD
    subgraph STAGE1["Stage 1: Builder (Biên dịch ứng dụng)"]
        B1["node:22-alpine + pnpm"]
        B2["Copy package.json & pnpm-lock.yaml"]
        B3["pnpm install --frozen-lockfile"]
        B4["Copy toàn bộ source code"]
        B5["pnpm prisma generate && pnpm build"]
        B6["pnpm prune --prod (Dọn sạch devDependencies)"]
    end

    subgraph STAGE2["Stage 2: Runner (Production Runtime siêu nhẹ ~160MB)"]
        R1["node:22-alpine + openssl"]
        R2["Chỉ copy dist/, prod node_modules/, prisma/"]
        R3["EXPOSE 3000"]
        R4["CMD ['node', 'dist/main.js']"]
    end

    STAGE1 -->|Chuyển giao sản phẩm biên dịch| STAGE2
```

---

## 3. Triển Khai Thực Chiến Từng Bước (How?)

### Bước 1: Tạo File `.dockerignore`

Để ngăn chặn việc copy các file rác, file `.env` chứa mật khẩu, hoặc thư mục `node_modules` ở máy local vào build context của Docker, tạo file `.dockerignore` tại thư mục gốc:

📄 **`.dockerignore`**

```text
node_modules
dist
.git
.gitignore
.env
.env.*
coverage
test
docs
*.md
.DS_Store
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
```

> [!WARNING]
> **Tuyệt đối không bỏ sót file `.dockerignore`!**
>
> Nếu quên file này, Docker sẽ nạp cả thư mục `node_modules` từ máy Mac/Windows của bạn vào container Linux, gây xung đột nhị phân (binary architecture mismatch) và làm hỏng toàn bộ quá trình build!

---

### Bước 2: Viết `Dockerfile` Multi-Stage Tinh Gọn

Tạo file `Dockerfile` tại thư mục gốc của dự án:

📄 **`Dockerfile`**

```dockerfile
# ==============================================================================
# STAGE 1: Builder
# Cài đặt dependencies, sinh Prisma Client và biên dịch ứng dụng
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Kích hoạt pnpm thông qua corepack chính thức của Node.js
RUN corepack enable && corepack prepare pnpm@latest --activate

# Tận dụng Docker Layer Cache: copy file package và whitelist script build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy toàn bộ mã nguồn và schema Prisma
COPY . .

# 1. Sinh Prisma Client (truyền placeholder URL vì build image không kết nối DB trực tiếp)
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" pnpm prisma generate

# 2. Biên dịch mã nguồn sang thư mục dist/
RUN pnpm build

# 3. Loại bỏ devDependencies, chỉ giữ lại production dependencies
RUN pnpm prune --prod

# ==============================================================================
# STAGE 2: Runner (Production)
# Chỉ chứa mã nguồn đã biên dịch và production dependencies tối giản
# ==============================================================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Cài đặt openssl cho Prisma Client trên nền Alpine
RUN apk add --no-cache openssl

# Copy artifact cần thiết từ stage builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Mở port lắng nghe
EXPOSE 3000

# Khởi chạy server
CMD ["node", "dist/main.js"]
```

> [!TIP]
> **Hai lưu ý kỹ thuật sống còn trong Dockerfile:**
>
> 1. **Vì sao cần copy `pnpm-workspace.yaml*`?**  
>    Từ các phiên bản pnpm hiện đại (v10+), pnpm áp dụng cơ chế bảo mật nghiêm ngặt chặn các script cài đặt nhị phân tự động (như `bcrypt`, `@prisma/engines`, `esbuild`) nếu chưa được cấp phép, gây lỗi `ERR_PNPM_IGNORED_BUILDS`. Việc copy `pnpm-workspace.yaml` giúp pnpm nhận diện danh sách `allowBuilds` đã được phê duyệt.
>
> 2. **Vì sao cần `DATABASE_URL` placeholder khi chạy `prisma generate`?**  
>    Prisma 7 đọc cấu hình từ file `prisma.config.ts`. Do file `.env` đã được loại trừ qua `.dockerignore` (để tránh lộ thông tin nhạy cảm vào image), lệnh `prisma generate` sẽ báo lỗi thiếu biến môi trường nếu không có giá trị tạm thời. Vì `prisma generate` chỉ sinh code TypeScript chứ không kết nối cơ sở dữ liệu thật, một placeholder URL là hoàn toàn an toàn và hiệu quả.
>
> 3. **Vì sao cần `apk add --no-cache openssl` trong stage Runner?**  
>    Prisma Query Engine tương tác với PostgreSQL qua kết nối mã hóa TLS/crypto. Trên nền Linux Alpine siêu nhẹ, thư viện `openssl` không có sẵn mặc định, nên việc thêm gói này đảm bảo Prisma Client khởi tạo thành công 100%.

---

### Bước 3: Hoàn Thiện `docker-compose.yml` Sử Dụng `env_file`

Thay vì nhồi nhét hàng chục biến môi trường trực tiếp trong cấu hình `api` (vừa dài dòng, vừa dễ lộ thông tin nhạy cảm vào Git), chuẩn mực công nghiệp là **sử dụng `env_file`** để tách bạch hoàn toàn phần hạ tầng và phần cấu hình:

📄 **`docker-compose.yml`**

```yaml
version: '3.8'

services:
  # ============================================================================
  # Service 1: PostgreSQL 16 Database Engine
  # ============================================================================
  postgres_db:
    image: postgres:16-alpine
    container_name: nestjs_postgres_db
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres_secret_password}
      POSTGRES_DB: ${POSTGRES_DB:-social_chat_db}
    ports:
      - '${POSTGRES_PORT:-5432}:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test:
        [
          'CMD-SHELL',
          'pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-social_chat_db}',
        ]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - app_network

  # ============================================================================
  # Service 2: Redis 7 High-Performance Cache
  # ============================================================================
  redis_cache:
    image: redis:7-alpine
    container_name: nestjs_redis_cache
    restart: always
    ports:
      - '6379:6379'
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - app_network

  # ============================================================================
  # Service 3: Adminer Database Web GUI
  # ============================================================================
  adminer:
    image: adminer:latest
    container_name: nestjs_adminer_gui
    restart: always
    ports:
      - '${ADMINER_PORT:-8080}:8080'
    depends_on:
      postgres_db:
        condition: service_healthy
    networks:
      - app_network

  # ============================================================================
  # Service 4: NestJS Backend API (Containerized Application)
  # ============================================================================
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nestjs_social_chat_api
    restart: always
    ports:
      - '3000:3000'
    env_file:
      - .env
    volumes:
      - uploads_data:/app/uploads
    depends_on:
      postgres_db:
        condition: service_healthy
      redis_cache:
        condition: service_healthy
    networks:
      - app_network

# Persistent Data Volumes
volumes:
  postgres_data:
    driver: local
  uploads_data:
    driver: local

# Internal Isolated Bridge Network
networks:
  app_network:
    driver: bridge
```

---

### Bước 4: Chuẩn Bị File Môi Trường Cho Container

Nội dung file `.env` được nạp trực tiếp qua chỉ thị `env_file: - .env`. Lưu ý rằng khi các service chạy trong cùng mạng Docker `app_network`, địa chỉ kết nối Database và Redis sẽ trỏ về tên service (`postgres_db` và `redis_cache`):

📄 **`.env`**

```env
NODE_ENV=prod
PORT=3000
GLOBAL_PREFIX=api
VERSION_PREFIX=v
VERSION_API=1

# Trỏ đến tên service postgres_db trong docker-compose
DATABASE_URL=postgresql://postgres:postgres_secret_password@postgres_db:5432/social_chat_db?schema=public

# Cấu hình bảo mật JWT
JWT_SECRET=super_secret_production_jwt_key_2026
JWT_EXPIRES_IN=1d

# Trỏ đến tên service redis_cache trong docker-compose
REDIS_URL=redis://redis_cache:6379

# Google OAuth (dummy cho môi trường test container)
GOOGLE_CLIENT_ID=dummy_google_client_id
GOOGLE_CLIENT_SECRET=dummy_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# Mail config
MAIL_TRANSPORT=file
MAIL_DIRECTORY=var/mail
```

> [!IMPORTANT]
> **Lợi ích vượt trội khi dùng `env_file`:**
>
> 1. **Gọn gàng & Dễ maintain:** File `docker-compose.yml` không bị biến thành một "bãi rác cấu hình".
> 2. **Bảo mật:** File `.env` được liệt kê trong `.gitignore` và `.dockerignore`, không bao giờ bị lộ lên GitHub.
> 3. **Linh hoạt đa môi trường:** Bạn có thể dễ dàng chuyển đổi giữa `env_file: - .env.local` và `env_file: - .env.production`.

---

## 4. Kiểm Thử Khởi Chạy Local Với Docker Compose (Verify)

Mở Terminal và tiến hành biên dịch và khởi chạy toàn bộ hệ sinh thái:

```bash
docker compose up --build -d
```

Kiểm tra trạng thái các container đang chạy:

```bash
docker compose ps
```

**Kết quả hiển thị trên Terminal:**

```text
NAME                     IMAGE                       STATUS                   PORTS
nestjs_postgres_db       postgres:16-alpine          Up (healthy)             0.0.0.0:5432->5432/tcp
nestjs_redis_cache       redis:7-alpine              Up (healthy)             0.0.0.0:6379->6379/tcp
nestjs_adminer_gui       adminer:latest              Up                       0.0.0.0:8080->8080/tcp
nestjs_social_chat_api   nestjs-basic-course-api     Up                       0.0.0.0:3000->3000/tcp
```

---

### Kiểm Tra Kích Thước Image Tinh Gọn

Kiểm tra kích thước Image đã được build:

```bash
docker images | grep nestjs-basic-course
```

**Kết quả:** Kích thước Image chỉ dao động trong khoảng **~155MB – 170MB** (thay vì 1.2GB như thông thường)!

---

### Kiểm Tra API Healthcheck

Gửi request kiểm tra sức khỏe của container:

```bash
curl -i http://localhost:3000/api/v1/health
```

**Kết quả:**

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" }
  }
}
```

👉 **Kết luận:** Ứng dụng NestJS đã được đóng gói container thành công mỹ mãn, kết nối mượt mà tới PostgreSQL và Redis trong môi trường mạng nội bộ cô lập!

---

## 5. Hướng Dẫn Triển Khai Thực Chiến Lên Cloud (Deploy)

Hiện nay, hai nền tảng Cloud PaaS phổ biến, thân thiện với lập trình viên và hỗ trợ Docker tốt nhất là **Render** và **Railway**.

### 5.1 Triển Khai Lên Render (render.com)

Render cung cấp giải pháp lưu trữ hoàn chỉnh với hạ tầng phân tán trên toàn cầu:

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant Git as GitHub Repository
    participant Render as Render Platform
    participant DB as Managed PostgreSQL (Render)
    participant App as Web Service (Docker)

    Dev->>Git: git push origin main
    Git->>Render: Webhook kích hoạt Deploy
    Render->>Render: Đọc file Dockerfile & Tự động Build Multi-stage
    Render->>DB: Kết nối qua Internal DATABASE_URL
    Render->>App: Khởi chạy container với port 3000
    App-->>Render: Healthcheck GET /api/v1/health -> 200 OK
    Render-->>Dev: Cung cấp URL công khai: https://social-chat-api.onrender.com
```

#### Quy Trình 4 Bước Triển Khai Trên Render:

1. **Khởi tạo Database PostgreSQL:**
   - Trên Dashboard của Render, chọn **New +** → **PostgreSQL**.
   - Đặt tên: `social-chat-db`.
   - Sau khi tạo, copy chuỗi **Internal Database URL** (dành cho các dịch vụ chạy nội bộ trên Render) hoặc **External Database URL**.

2. **Khởi tạo Web Service Kết Nối GitHub:**
   - Chọn **New +** → **Web Service**.
   - Kết nối với kho lưu trữ GitHub của dự án (`nestjs-basic-course`).
   - Chọn nhánh (Branch): `main`.

3. **Cấu hình Môi Trường Docker:**
   - **Language / Runtime:** Chọn **Docker** (Render sẽ tự động phát hiện `Dockerfile` ở thư mục gốc).
   - **Instance Type:** Chọn Free hoặc Starter.

4. **Thiết lập Biến Môi Trường (Environment Variables):**
   Trong tab **Environment**, cấu hình các biến bắt buộc:
   ```env
   NODE_ENV=prod
   PORT=3000
   DATABASE_URL=<Dán chuỗi Internal Database URL từ bước 1>
   JWT_SECRET=production_super_jwt_secret_render_key_2026
   JWT_EXPIRES_IN=1d
   GLOBAL_PREFIX=api
   VERSION_PREFIX=v
   VERSION_API=1
   GOOGLE_CLIENT_ID=dummy_id
   GOOGLE_CLIENT_SECRET=dummy_secret
   GOOGLE_CALLBACK_URL=https://<your-subdomain>.onrender.com/api/v1/auth/google/callback
   ```
   - Trong mục **Health Check Path**, điền: `/api/v1/health`.
   - Bấm **Create Web Service**! Render sẽ tự động kéo code, build Docker Image và cấp phát một tên miền HTTPS miễn phí (ví dụ: `https://social-chat-api.onrender.com`).

---

### 5.2 Triển Khai Lên Railway (railway.app)

Railway là nền tảng đám mây thế hệ mới cực kỳ linh hoạt và có tốc độ deploy siêu tốc:

1. Đăng nhập vào [railway.app](https://railway.app) và chọn **New Project**.
2. Chọn **Provision PostgreSQL** → Railway sẽ tự động tạo một cụm CSDL PostgreSQL chỉ trong 5 giây.
3. Bấm **+ New** → **Database** → **Add Redis** (để bổ sung Redis Cache).
4. Bấm **+ New** → **GitHub Repo** → Chọn repository `nestjs-basic-course`.
5. Railway sẽ tự động quét thấy `Dockerfile` và tiến hành build.
6. **Liên kết Biến Môi Trường:**
   - Trong tab **Variables** của Web Service, bạn có thể tham chiếu trực tiếp biến của PostgreSQL:
     ```env
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     REDIS_HOST=${{Redis.REDISHOST}}
     REDIS_PORT=${{Redis.REDISPORT}}
     NODE_ENV=prod
     PORT=3000
     JWT_SECRET=super_railway_jwt_secret_key_2026
     ```
7. Trong tab **Settings** → **Networking** → Bấm **Generate Domain** để nhận tên miền công khai dạng `https://nestjs-social-chat-production.up.railway.app`.

---

### 5.3 Kỹ Thuật Tự Động Chạy Migration Khi Deploy

Trong môi trường Production, mỗi khi cập nhật schema CSDL mới, chúng ta cần chạy lệnh `prisma migrate deploy` để đồng bộ các bảng mà không làm gián đoạn hệ thống.

Bạn có thể tạo một script khởi động an toàn `docker-entrypoint.sh`:

📄 **`docker-entrypoint.sh`**

```bash
#!/bin/sh
set -e

echo "🚀 Đang kiểm tra và thực thi Prisma Database Migrations..."
npx prisma migrate deploy

echo "✅ Migrations hoàn tất! Khởi chạy NestJS Production Server..."
exec "$@"
```

Cấp quyền thực thi và cấu hình vào `Dockerfile`:

```dockerfile
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
```

---

## 6. Các Lỗi Thường Gặp & Cách Khắc Phục (Common Mistakes)

| Lỗi gặp phải                                                                                 | Nguyên nhân                                                                                                                                           | Cách khắc phục                                                                                                                                                                                                  |
| :------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`Cannot find module '/app/dist/main.js'`**                                                 | Do file `prisma.config.ts` nằm ở thư mục gốc khiến TypeScript coi `rootDir` là `.`, biên dịch ra `/app/dist/src/main.js` thay vì `/app/dist/main.js`. | Thêm `"prisma"` và `"prisma.config.ts"` vào mục `exclude` của `tsconfig.build.json` để TypeScript chỉ biên dịch thư mục `src/`.                                                                                 |
| **`ERR_PNPM_IGNORED_BUILDS: Ignored build scripts: @prisma/engines, bcrypt...`**             | `pnpm` (v10+) chặn tự động chạy lifecycle build scripts của các package C++ native nếu chưa được phê duyệt trong `pnpm-workspace.yaml`.               | Trong `Dockerfile`, bổ sung `pnpm-workspace.yaml*` vào lệnh copy: `COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./`.                                                                                   |
| **`PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL`**                | `prisma generate` chạy trong Docker khi file `.env` đã bị `.dockerignore` bỏ qua.                                                                     | Truyền placeholder URL: `RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" pnpm prisma generate` hoặc dùng fallback `process.env.DATABASE_URL ?? ''` trong `prisma.config.ts`. |
| **`PrismaClientInitializationError: Unable to require('...libquery_engine-linux-musl.so')`** | Alpine Linux dùng thư viện `musl` thay vì `glibc`. Bản base image thiếu các package phụ trợ.                                                          | Bổ sung `RUN apk add --no-cache openssl` vào stage `runner`.                                                                                                                                                    |
| **`connect ECONNREFUSED 127.0.0.1:5432` trong Docker Compose**                               | Trong file `.env` vẫn để `DATABASE_URL` là `localhost:5432`.                                                                                          | Thay thế `localhost` bằng tên service `postgres_db` (ví dụ: `postgresql://postgres:...@postgres_db:5432/...`).                                                                                                  |
| **Docker Build bị chạy lại `pnpm install` mỗi lần sửa 1 dòng code**                          | Copy toàn bộ mã nguồn `COPY . .` trước khi chạy `pnpm install`.                                                                                       | Chỉ copy `package.json`, `pnpm-lock.yaml` và `pnpm-workspace.yaml*` trước lệnh `pnpm install` để tận dụng Docker Layer Cache.                                                                                   |
| **Render/Railway báo `Health check failed on /api/v1/health`**                               | Quên mở route `@Public()` cho `/api/v1/health` khiến bot kiểm tra nhận `401 Unauthorized`.                                                            | Đảm bảo `HealthController` có `@Public()` và `@BypassTransform()` ([Lesson 7.3](../lesson-7.3/lesson-7.3.md)).                                                                                                  |
| **Biến môi trường trong `.env` không được nạp vào container**                                | Quên khai báo chỉ thị `env_file: - .env` trong `docker-compose.yml`.                                                                                  | Khai báo `env_file: - .env` trong service `api`.                                                                                                                                                                |

---

## 7. Bài Tập Thực Hành (Exercises)

### 🧩 Level 1 — Follow Along: Đóng Gói Và Kiểm Tra Dung Lượng Image

- **Yêu cầu:**
  1. Tạo file `.dockerignore` và `Dockerfile` theo đúng chuẩn Multi-stage của bài học.
  2. Thực thi lệnh build: `docker build -t social-chat-api:latest .`
  3. Dùng lệnh `docker images social-chat-api` để xác nhận dung lượng Image thành phẩm nhỏ hơn 200MB.

---

### 🧩 Level 2 — Medium: Thiết Lập Docker Compose Tích Hợp Volume Cho File Ảnh

- **Yêu cầu:**
  1. Cấu hình volume `uploads_data:/app/uploads` trong `docker-compose.yml`.
  2. Khởi chạy hệ thống bằng `docker compose up -d`.
  3. Gửi API upload một hình ảnh avatar mới qua Postman (`POST /api/v1/users/avatar`).
  4. Thực hiện restart container bằng `docker compose restart api` và xác minh file ảnh vừa upload vẫn còn nguyên vẹn, không bị mất đi.

---

### 🧩 Level 3 — Challenge: Tự Động Hóa CI/CD Workflow Với GitHub Actions

- **Yêu cầu:** Tạo file `.github/workflows/deploy.yml` tự động:
  1. Kích hoạt khi có commit mới đẩy lên nhánh `main`.
  2. Chạy bộ kiểm thử tự động: `pnpm test` và `pnpm test:e2e`.
  3. Nếu kiểm thử thành công 100%, tự động build Docker Image và gửi webhook kích hoạt Deploy trên Render hoặc Railway.

---

## 8. Tổng Kết Toàn Bộ Khóa Học (Course Complete Milestone 🎉)

Chúc mừng bạn đã hoàn thành trọn vẹn **Module 7** và toàn bộ **Khóa học NestJS Thực Chiến**!

```text
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                       ║
║   🏆 CHÚC MỪNG BẠN ĐÃ TỐT NGHIỆP KHÓA HỌC NESTJS THỰC CHIẾN XÂY DỰNG RESTFUL API     ║
║                                                                                       ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
```

### 🗺️ Nhìn Lại Hành Trình Đẳng Cấp Chúng Ta Đã Đi Qua:

1. **Module 1 (Foundation):** Làm chủ kiến trúc NestJS, Controller, Service, Dependency Injection và bộ công cụ chuẩn hóa team (Husky, Commitlint, ESLint, ConfigModule).
2. **Module 2 (Database with Prisma):** Thiết kế mô hình CSDL quan hệ chuẩn hóa cho Social App (`User`, `Profile`, `Post`, `Comment`, `Message`, `Notification`), Transactions và Prisma Exception Filter.
3. **Module 3 (API Standards & Request Pipeline):** Xây dựng Request Pipeline chuyên nghiệp: URL Versioning (`/api/v1`), DTO Validation, LoggerMiddleware, HttpExceptionFilter, Custom Param Decorators, và TransformInterceptor.
4. **Module 4 (Security & Authentication):** Bảo mật hệ thống đa tầng với bcrypt, JWT Access Token, Passport.js, Google OAuth2 Social Login, RBAC `@Roles()`, và chống brute-force với Throttler Rate Limiting.
5. **Module 5 (Social & Events):** Tự động sinh tài liệu Swagger UI, CRUD Newsfeed với phân trang Cursor/Offset, Upload file Multer, và kiến trúc tách rời Event-Driven (`@nestjs/event-emitter`, Gửi Mail chào mừng với Factory Pattern).
6. **Module 6 (Real-time WebSockets):** Xây dựng cổng giao tiếp thời gian thực `@WebSocketGateway()` (Socket.IO), xác thực WsJwtGuard qua handshake, tính năng Chat Room 1-1, và đẩy thông báo tức thì khi có bình luận.
7. **Module 7 (Production Ready):** Tối ưu hóa hiệu năng với Redis Cache Manager, Structured JSON Logging (`nestjs-pino`), Healthchecks (`@nestjs/terminus`), Automated Testing (Jest & Supertest 100% Passed), và đóng gói Docker Multi-stage triển khai lên Cloud (Render & Railway)!

Bạn hiện đã sở hữu toàn bộ kỹ năng, tư duy kiến trúc và kinh nghiệm thực chiến của một **Senior Backend Developer** với Framework NestJS. Hãy tự tin áp dụng những chuẩn mực này vào các dự án thực tế của doanh nghiệp và tiếp tục chinh phục những đỉnh cao mới!

---

👈 **Bài trước:** [Lesson 7.4: Automated Testing — Viết Unit Test Cho Service & E2E Test Cho Auth API Với Jest & Supertest](../lesson-7.4/lesson-7.4.md)  
🏁 **Trang chủ Khóa học:** [00-curriculum-blueprint.md](../../../00-curriculum-blueprint.md)
