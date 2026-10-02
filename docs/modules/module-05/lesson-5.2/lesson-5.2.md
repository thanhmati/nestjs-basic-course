# Lesson 5.2: Posts API — CRUD Quản Lý Bài Viết & Phân Trang Cursor/Offset Tối Ưu Với Prisma

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-Framework-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma ORM" />
  <img src="https://img.shields.io/badge/REST_API-Posts_CRUD-3178C6?style=for-the-badge&logo=express&logoColor=white" alt="REST API" />
  <img src="https://img.shields.io/badge/OpenAPI-Swagger_UI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger UI" />
  <img src="https://img.shields.io/badge/Pagination-Offset_vs_Cursor-06B6D4?style=for-the-badge&logo=postgresql&logoColor=white" alt="Pagination" />
  <img src="https://img.shields.io/badge/pnpm-Package_Manager-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
</p>

<p align="center">
  <img src="./assets/lesson_overview_banner.png" alt="Lesson Overview Banner" width="100%" />
</p>

---

> [!NOTE]
> ⏱️ **Thời lượng dự kiến:** 12 – 15 phút  
> 🎯 **Mục tiêu bài học:** Xây dựng module CRUD quản lý Bài viết (`Post`) liên kết với Tác giả (`User`) bằng Prisma ORM; nắm vững bản chất toán học và hiệu năng cơ sở dữ liệu của hai kỹ thuật phân trang kinh điển: **Offset-based Pagination** (Trang/Giới hạn cho Web Admin) và **Cursor-based Pagination** (Con trỏ/Cuộn vô tận cho Mobile Social Feed); tích hợp đồng bộ với Request Pipeline Enterprise hiện đại (Global Guard, `@Public()`, Custom Decorator `@CurrentUser('userId')`, `@ResponseMessage()`); làm chủ kỹ thuật tối ưu hóa mã nguồn: tận dụng **Global URI Versioning** (`defaultVersion: '1'`) và **Global Swagger Security** (`.addSecurityRequirements('JWT-auth')` kết hợp `@Public()` tích hợp `ApiSecurity({})`) giúp loại bỏ hoàn toàn các decorator lặp lại `@Version` và `@ApiBearerAuth` ở từng API; hoàn thiện tài liệu OpenAPI bằng Decorators `@nestjs/swagger` và thực hiện kiểm thử tương tác trực tiếp trên Swagger UI.

---

## 1. Thách Thức Hiệu Năng & Bài Toán Phân Trang Dữ Liệu Lớn (Big Data Pagination)

### 1.1 Cơn Ác Mộng Khi Truy Vấn Toàn Bộ Dữ Liệu (`SELECT * FROM posts`)

Trong môi trường phát triển (Development) với vài chục bài viết mẫu, câu lệnh `prisma.post.findMany()` thực thi trong chưa đầy 5ms. Tuy nhiên, khi hệ thống bước vào giai đoạn Production với hàng trăm nghìn hoặc hàng triệu bài đăng, việc trả về toàn bộ dữ liệu trong một request duy nhất sẽ lập tức kích hoạt chuỗi thảm họa hệ thống:

<p align="center">
  <img src="./assets/big_data_pagination_challenge.png" alt="Big Data Pagination Challenge - OOM vs Pagination" width="95%" />
</p>

1. **Tràn bộ nhớ Node.js Process (Out Of Memory - OOM):**  
   V8 Engine của Node.js cấp phát giới hạn heap memory mặc định (thường khoảng 1.4GB – 2GB). Khi nạp đồng thời hàng trăm nghìn bản ghi JSON vào RAM để serialize, bộ thu gom rác (Garbage Collector) bị quá tải khiến Event Loop tê liệt, dẫn đến sập ứng dụng với mã lỗi `exit code 137 (OOM Killed)`.
2. **Nghẽn Băng Thông CSDL & Mạng (Database I/O & Network Bottleneck):**  
   Hàng trăm megabyte dữ liệu phải chuyển qua kết nối mạng giữa PostgreSQL và NestJS Server, làm tiêu tốn dung lượng I/O và làm nghẽn các truy vấn nghiệp vụ khác.
3. **Độ Trễ Phản Hồi Cao & Trải Nghiệm Người Dùng Kém (High Latency & Bad UX):**  
   Time-To-First-Byte (TTFB) tăng vọt lên hàng chục giây. Khách hàng trên ứng dụng di động phải nhìn màn hình chờ (loading spinner) vô tận chỉ để đọc vài tin tức mới nhất.

Để giải quyết bài toán này, phân chia dữ liệu thành từng tập nhỏ (**Pagination**) là yêu cầu kiến trúc bắt buộc cho mọi REST API chuyên nghiệp.

---

## 2. Bản Chất Kỹ Thuật & Cách Triển Khai 2 Kỹ Thuật Phân Trang (Offset vs Cursor)

Hiện nay trong kỹ thuật phần mềm có hai chiến lược phân trang cốt lõi phục vụ hai mục đích sử dụng khác nhau:

<p align="center">
  <img src="./assets/pagination_offset_vs_cursor_mockup.jpg" alt="Offset vs Cursor Pagination Comparison Mockup" width="95%" />
</p>

---

### 2.1 Kỹ Thuật Phân Trang Theo Trang (Offset-based Pagination)

#### 🔹 Nguyên lý hoạt động & Công thức tính toán

Offset-based Pagination là phương pháp truyền thống, chia tập dữ liệu thành các trang rời rạc dựa trên 2 tham số đầu vào do Client cung cấp:

- `page`: Số thứ tự trang hiện tại (bắt đầu từ `1`).
- `limit`: Số lượng bản ghi tối đa trên một trang.

Để xác định vị trí bản ghi cần lấy, Database phải tính toán số bản ghi cần bỏ qua (**Skip / Offset**) theo công thức toán học:
$$\text{skip} = (\text{page} - 1) \times \text{limit}$$

_Ví dụ:_ Với `page = 3` và `limit = 10`, hệ thống cần bỏ qua: $\text{skip} = (3 - 1) \times 10 = 20$ bản ghi đầu tiên và lấy tiếp 10 bản ghi từ vị trí thứ 21 đến 30.

Câu lệnh SQL tương đương sinh ra bởi Prisma:

```sql
SELECT * FROM "Post"
WHERE "published" = true
ORDER BY "createdAt" DESC
OFFSET 20 LIMIT 10;
```

#### ⚠️ Điểm yếu cố hữu của Offset-based:

1. **Độ trễ $O(N)$ khi dữ liệu lớn (Deep Pagination Bottleneck):**  
   Khi người dùng xem trang 10,000 (`OFFSET 100000 LIMIT 10`), Database PostgreSQL vẫn phải nạp và duyệt qua đủ $100,010$ bản ghi từ ổ đĩa vào bộ nhớ rồi mới vứt bỏ $100,000$ bản ghi đầu để lấy $10$ bản ghi cuối cùng. Trang càng xa, câu lệnh truy vấn càng chậm chạp!
2. **Hiện tượng trôi lệch dữ liệu (Data Drift / Phantom Reads):**  
   Giả sử User đang ở Page 1 (`ID: 10, 9, 8`). Trong lúc đó có một bài viết mới (`ID: 11`) vừa được người khác đăng lên đầu. Toàn bộ các bài viết cũ sẽ bị đẩy lùi một vị trí: bài viết `ID: 8` bị đẩy từ cuối Page 1 sang đầu Page 2. Khi User bấm chuyển sang Page 2, họ sẽ bị **trùng lặp bài viết `ID: 8`** mà họ vừa mới đọc xong!

---

### 2.2 Kỹ Thuật Phân Trang Theo Con Trỏ (Cursor-based Pagination)

#### 🔹 Nguyên lý hoạt động & Sức mạnh của B-Tree Index $O(1)$

Khác hoàn toàn với Offset, Cursor-based Pagination không quan tâm đến "số trang" hay "bỏ qua bao nhiêu dòng". Thay vào đó, nó sử dụng một **con trỏ (Cursor)** — chính là giá trị của một trường dữ liệu tuần hoàn duy nhất có đánh chỉ mục (**Indexed Column**, phổ biến nhất là trường khóa chính `id`).

Client gửi lên `cursor` (ID của bài viết cuối cùng trong danh sách mà Client đã nhận được) và `take` (số lượng bài viết tiếp theo muốn nạp).

Câu lệnh SQL tương đương:

```sql
SELECT * FROM "Post"
WHERE "published" = true AND "id" < 105 -- Nhảy thẳng đến vị trí sau con trỏ!
ORDER BY "id" DESC
LIMIT 10;
```

Nhờ tận dụng trực tiếp cấu trúc cây chỉ mục **B-Tree Index** trên cột `id`, Database có thể **nhảy trực tiếp ($O(1)$)** đến vị trí con trỏ và đọc ngay 10 bản ghi tiếp theo mà **không phải duyệt qua bất kỳ bản ghi nào phía trước**, bất kể bảng dữ liệu có $10$ hay $10,000,000$ bản ghi!

#### 🔹 Kỹ thuật "Peek Ahead" (Lấy Dư 1 Bản Ghi)

Trong ứng dụng cuộn vô tận (Infinite Scroll Feed), Client chỉ cần biết:

1. Danh sách bài viết tiếp theo.
2. Có còn bài viết nào nữa không (`hasNextPage = true/false`) để tiếp tục kích hoạt sự kiện kéo cuộn.
3. ID con trỏ tiếp theo (`nextCursor`) để gửi trong request kế tiếp.

Nếu gọi thêm hàm `count()` để kiểm tra thì sẽ làm mất đi ưu thế tốc độ $O(1)$. Thay vào đó, ta áp dụng kỹ thuật **Peek Ahead (Nhìn trước một bước)**:

- Yêu cầu Database lấy **`take + 1`** bản ghi (ví dụ: Client muốn lấy 10 bài, ta truy vấn 11 bài).
- **Nếu kết quả trả về đúng 11 bài:** Chắc chắn vẫn còn dữ liệu phía sau $\rightarrow$ gán `hasNextPage = true`, sau đó dùng `items.pop()` loại bỏ bài viết thứ 11 ra khỏi mảng trả về cho Client.
- **Nếu kết quả trả về $\le 10$ bài:** Đã chạm tới đáy của cơ sở dữ liệu $\rightarrow$ gán `hasNextPage = false`.
- Giá trị `nextCursor` chính là ID của phần tử cuối cùng còn lại trong mảng `items`.

---

## 3. Hướng Dẫn Thực Hành Step-by-Step — Triển Khai Posts Module

### 📌 Bước 1: Khởi Tạo Các DTOs Với OpenAPI Decorators

Tạo các tệp DTO quy định dữ liệu đầu vào trong thư mục `src/posts/dto/`. Lưu ý sử dụng `@nestjs/swagger` để vừa xác thực runtime bằng `class-validator`, vừa tự động sinh lược đồ schema trên Swagger UI:

📄 **`src/posts/dto/create-post.dto.ts`**

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'Tiêu đề bài viết (tối thiểu 5 ký tự)',
    example: 'Xây dựng REST API hoàn chỉnh với NestJS & Prisma',
  })
  @IsString({ message: 'Tiêu đề bài viết phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tiêu đề bài viết không được để trống' })
  @MinLength(5, { message: 'Tiêu đề bài viết phải có ít nhất 5 ký tự' })
  title: string;

  @ApiProperty({
    description: 'Nội dung chi tiết của bài viết',
    example:
      'Bài viết này hướng dẫn chi tiết cách thiết kế schema và kỹ thuật phân trang tối ưu...',
  })
  @IsString({ message: 'Nội dung bài viết phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Nội dung bài viết không được để trống' })
  content: string;

  @ApiPropertyOptional({
    description: 'Trạng thái xuất bản bài viết công khai',
    default: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái xuất bản phải là kiểu boolean' })
  published?: boolean;
}
```

📄 **`src/posts/dto/update-post.dto.ts`**

```typescript
// 💡 Sử dụng PartialType từ '@nestjs/swagger' thay vì '@nestjs/mapped-types'
// để tự động kế thừa toàn bộ Swagger schema metadata và Validation rules từ CreatePostDto!
import { PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {}
```

📄 **`src/posts/dto/query-post.dto.ts`**

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryPostDto {
  // --- Các tham số cho Offset-based Pagination ---
  @ApiPropertyOptional({
    description: 'Số thứ tự trang (bắt đầu từ 1)',
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số trang (page) phải là số nguyên' })
  @Min(1, { message: 'Số trang tối thiểu là 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng bài viết trên 1 trang (tối đa 100)',
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Giới hạn bản ghi (limit) phải là số nguyên' })
  @Min(1, { message: 'Giới hạn bản ghi tối thiểu là 1' })
  @Max(100, { message: 'Tối đa 100 bản ghi trên 1 trang' })
  limit?: number = 10;

  // --- Các tham số cho Cursor-based Pagination ---
  @ApiPropertyOptional({
    description: 'Con trỏ (ID bài viết cuối cùng đã tải) cho infinite scroll',
    example: 105,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Cursor phải là ID của bài viết dạng số nguyên' })
  cursor?: number;

  @ApiPropertyOptional({
    description: 'Số lượng bài viết muốn lấy tiếp theo (Cursor pagination)',
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Take phải là số nguyên' })
  @Min(1, { message: 'Take tối thiểu là 1' })
  @Max(100, { message: 'Take tối đa là 100' })
  take?: number = 10;

  // --- Bộ lọc tìm kiếm ---
  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm theo tiêu đề hoặc nội dung',
    example: 'NestJS',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
```

---

### 📌 Bước 2: Triển Khai `PostsService` Tương Tác CSDL Qua Prisma

Tạo tệp service xử lý toàn bộ nghiệp vụ CRUD, tối ưu câu lệnh truy vấn với `Promise.all()` và hiện thực hóa hai thuật toán phân trang:

📄 **`src/posts/posts.service.ts`**

```typescript
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Tạo bài viết mới và gắn tác giả
  async create(authorId: number, createPostDto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        ...createPostDto,
        author: {
          connect: { id: authorId },
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        author: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  // 2. Phân trang dạng Offset-based (Phù hợp Web Admin / Data Table)
  async findAllOffset(query: QueryPostDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Thực thi song song findMany và count để tối ưu thời gian phản hồi I/O
    const [items, totalItems] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          published: true,
          createdAt: true,
          author: {
            select: { id: true, email: true, name: true },
          },
          _count: {
            select: { comments: true }, // Tối ưu: Đếm số lượng comments mà không nạp toàn bộ mảng!
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // 3. Phân trang dạng Cursor-based (Phù hợp Mobile Feed / Infinite Scroll)
  async findAllCursor(query: QueryPostDto) {
    const { cursor, take = 10, search } = query;

    const where: Prisma.PostWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Kỹ thuật Peek Ahead: Lấy dư 1 phần tử (take + 1) để xác định hasNextPage mà không cần gọi count()
    const items = await this.prisma.post.findMany({
      where,
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { id: 'desc' },
      select: {
        id: true,
        title: true,
        published: true,
        createdAt: true,
        author: {
          select: { id: true, email: true, name: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    let hasNextPage = false;
    if (items.length > take) {
      hasNextPage = true;
      items.pop(); // Loại bỏ phần tử dư thừa sau khi đã xác nhận còn trang tiếp
    }

    const nextCursor = items.length > 0 ? items[items.length - 1].id : null;

    return {
      items,
      meta: {
        take,
        nextCursor,
        hasNextPage,
      },
    };
  }

  // 4. Lấy chi tiết bài viết theo ID
  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, email: true, name: true } },
        comments: {
          select: { id: true, content: true, createdAt: true, authorId: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Không tìm thấy bài viết với ID #${id}`);
    }

    return post;
  }

  // 5. Cập nhật bài viết (Chỉ chính chủ tác giả mới được cập nhật)
  async update(id: number, userId: number, updatePostDto: UpdatePostDto) {
    const post = await this.findOne(id);

    if (post.authorId !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa bài viết này');
    }

    return this.prisma.post.update({
      where: { id },
      data: updatePostDto,
      include: {
        author: { select: { id: true, email: true, name: true } },
      },
    });
  }

  // 6. Xóa bài viết (Chỉ chính chủ tác giả mới được xóa)
  async remove(id: number, userId: number) {
    const post = await this.findOne(id);

    if (post.authorId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa bài viết này');
    }

    await this.prisma.post.delete({ where: { id } });

    return { id };
  }
}
```

> [!TIP]
> **Tại sao phải dùng `skip: 1` khi phân trang Cursor trong Prisma?**  
> Mặc định trong Prisma ORM, khi khai báo `cursor: { id: cursor }`, bản ghi mang ID đó sẽ **nằm trong tập kết quả trả về**. Do bản ghi đó đã hiển thị trên màn hình của người dùng ở trang trước, ta phải gắn thêm `skip: 1` để Prisma bỏ qua chính con trỏ đó và chỉ lấy các bản ghi tiếp theo!

---

### 📌 Bước 3: Triển Khai `PostsController` Đồng Bộ Decorators & OpenAPI Swagger

> [!IMPORTANT]
> **Điểm cải tiến kiến trúc cốt lõi trong phiên bản mới:**
>
> - **Không còn gắn `@Version('1')` ở từng API:** Nhờ cấu hình `defaultVersion: versionApi` trong `main.ts`, toàn bộ endpoint tự động nhận tiền tố `/api/v1/posts`.
> - **Không còn gắn `@ApiBearerAuth('JWT-auth')` ở từng API:** Swagger đã được kích hoạt `.addSecurityRequirements('JWT-auth')` toàn cục. Các route công khai sử dụng `@Public()` (đã tích hợp `ApiSecurity({})`) sẽ tự động gỡ bỏ yêu cầu bảo mật trên Swagger UI!

Tạo tệp controller áp dụng chuẩn mực `@ResponseMessage()`, `@Public()`, `@CurrentUser('userId')` kết hợp với các Decorators OpenAPI Swagger (`@ApiTags`, `@ApiOperation`, `@ApiParam`, `@ApiResponse`):

📄 **`src/posts/posts.controller.ts`**

```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Public } from '@/shared/decorators/public.decorator';
import { ResponseMessage } from '@/shared/decorators/response-message.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1. POST /api/v1/posts — Tạo bài viết mới (Tự động yêu cầu JWT Bearer Token)
  @ApiOperation({
    summary: 'Tạo bài viết mới',
    description:
      'Yêu cầu Bearer Token của người dùng đang đăng nhập để gắn quyền tác giả',
  })
  @ApiResponse({ status: 201, description: 'Tạo bài viết mới thành công' })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ (Validation Error)',
  })
  @ApiResponse({ status: 401, description: 'Chưa xác thực JWT Bearer Token' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Tạo bài viết mới thành công!')
  create(
    @CurrentUser('userId') userId: number,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(userId, createPostDto);
  }

  // 2. GET /api/v1/posts — Lấy danh sách bài viết phân trang Offset (Public API)
  @Public()
  @ApiOperation({
    summary: 'Lấy danh sách bài viết (Offset-based Pagination)',
    description:
      'Phù hợp cho Web Admin / Data Table với số trang (page) và giới hạn (limit)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách bài viết phân trang thành công',
  })
  @Get()
  @ResponseMessage('Lấy danh sách bài viết phân trang thành công!')
  findAllOffset(@Query() query: QueryPostDto) {
    return this.postsService.findAllOffset(query);
  }

  // 3. GET /api/v1/posts/feed — Lấy newsfeed cuộn vô tận phân trang Cursor (Public API)
  @Public()
  @ApiOperation({
    summary: 'Lấy Newsfeed bài viết (Cursor-based Pagination)',
    description:
      'Phù hợp cho bảng tin di động, cuộn vô tận (Infinite Scroll Feed)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy newsfeed cuộn vô tận thành công',
  })
  @Get('feed')
  @ResponseMessage('Lấy newsfeed cuộn vô tận thành công!')
  findAllCursor(@Query() query: QueryPostDto) {
    return this.postsService.findAllCursor(query);
  }

  // 4. GET /api/v1/posts/:id — Xem chi tiết bài viết (Public API)
  @Public()
  @ApiOperation({
    summary: 'Xem chi tiết bài viết theo ID',
    description:
      'Trả về thông tin bài viết kèm tác giả và danh sách bình luận mới nhất',
  })
  @ApiParam({
    name: 'id',
    description: 'ID số nguyên của bài viết cần xem',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin chi tiết bài viết thành công',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  @Get(':id')
  @ResponseMessage('Lấy thông tin chi tiết bài viết thành công!')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  // 5. PATCH /api/v1/posts/:id — Chỉnh sửa bài viết (Yêu cầu chính chủ tác giả)
  @ApiOperation({
    summary: 'Chỉnh sửa bài viết',
    description:
      'Chỉ chính chủ tác giả (authorId khớp với userId trong Token) mới có quyền chỉnh sửa',
  })
  @ApiParam({
    name: 'id',
    description: 'ID bài viết cần chỉnh sửa',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Cập nhật bài viết thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực JWT Bearer Token' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền chỉnh sửa bài viết của người khác',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  @Patch(':id')
  @ResponseMessage('Cập nhật bài viết thành công!')
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, userId, updatePostDto);
  }

  // 6. DELETE /api/v1/posts/:id — Xóa bài viết (Yêu cầu chính chủ tác giả)
  @ApiOperation({
    summary: 'Xóa bài viết',
    description: 'Chỉ chính chủ tác giả mới có quyền xóa bài viết này',
  })
  @ApiParam({ name: 'id', description: 'ID bài viết cần xóa', example: 1 })
  @ApiResponse({ status: 200, description: 'Xóa bài viết thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực JWT Bearer Token' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền xóa bài viết của người khác',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  @Delete(':id')
  @ResponseMessage('Xóa bài viết thành công!')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.postsService.remove(id, userId);
  }
}
```

---

### 📌 Bước 4: Đăng Ký `PostsModule` & Khai Báo Trong `AppModule`

Đóng gói các thành phần vào `PostsModule`:

📄 **`src/posts/posts.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
```

Và khai báo vào mảng `imports` của `AppModule`:

📄 **`src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    // các module khác...
    PostsModule,
  ],
})
export class AppModule {}
```

---

## 4. Kịch Bản Kiểm Tra & Thử Nghiệm (Hands-on Lab)

> [!TIP]
> Đảm bảo rằng cơ sở dữ liệu PostgreSQL đang chạy (`docker compose up -d`) và ứng dụng NestJS đang hoạt động ở chế độ theo dõi (`pnpm start:dev`).

### 🟢 Kịch Bản 1: Thành Công (Success Flow)

#### 1. Tạo bài viết mới có xác thực JWT (`POST /api/v1/posts`)

Gửi HTTP POST request kèm Header `Authorization: Bearer <TOKEN>`:

```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Kỹ thuật phân trang Cursor-based tối ưu trong NestJS",
    "content": "Phân trang con trỏ tận dụng triệt để B-Tree Index giúp loại bỏ độ trễ O(N) của OFFSET...",
    "published": true
  }'
```

**Kết quả kỳ vọng (HTTP 201 Created — Định dạng chuẩn qua `TransformInterceptor`):**

```json
{
  "statusCode": 201,
  "message": "Tạo bài viết mới thành công!",
  "data": {
    "id": 1,
    "title": "Kỹ thuật phân trang Cursor-based tối ưu trong NestJS",
    "content": "Phân trang con trỏ tận dụng triệt để B-Tree Index giúp loại bỏ độ trễ O(N) của OFFSET...",
    "published": true,
    "createdAt": "2026-09-24T15:30:00.000Z",
    "updatedAt": "2026-09-24T15:30:00.000Z",
    "authorId": 1,
    "author": {
      "id": 1,
      "email": "dev@nestjs.com",
      "name": "Alex Developer"
    }
  },
  "timestamp": "2026-09-24T15:30:00.000Z",
  "path": "/api/v1/posts"
}
```

---

#### 2. Phân trang Offset-based (`GET /api/v1/posts?page=1&limit=2`)

Truy vấn danh sách bài viết theo trang và giới hạn:

```bash
curl -X GET "http://localhost:3000/api/v1/posts?page=1&limit=2"
```

**Kết quả kỳ vọng (HTTP 200 OK — Bao gồm cấu trúc `items` và `meta` đầy đủ):**

```json
{
  "statusCode": 200,
  "message": "Lấy danh sách bài viết phân trang thành công!",
  "data": {
    "items": [
      {
        "id": 2,
        "title": "Kiến trúc Clean Architecture trong dự án NestJS",
        "published": true,
        "createdAt": "2026-09-24T15:35:00.000Z",
        "author": {
          "id": 1,
          "email": "dev@nestjs.com",
          "name": "Alex Developer"
        },
        "_count": {
          "comments": 5
        }
      },
      {
        "id": 1,
        "title": "Kỹ thuật phân trang Cursor-based tối ưu trong NestJS",
        "published": true,
        "createdAt": "2026-09-24T15:30:00.000Z",
        "author": {
          "id": 1,
          "email": "dev@nestjs.com",
          "name": "Alex Developer"
        },
        "_count": {
          "comments": 0
        }
      }
    ],
    "meta": {
      "page": 1,
      "limit": 2,
      "totalItems": 2,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  },
  "timestamp": "2026-09-24T15:36:00.000Z",
  "path": "/api/v1/posts"
}
```

---

#### 3. Phân trang Cursor-based Feed (`GET /api/v1/posts/feed?take=1`)

Truy vấn bảng tin cuộn vô tận với kích thước `take = 1`:

```bash
curl -X GET "http://localhost:3000/api/v1/posts/feed?take=1"
```

**Kết quả kỳ vọng trang đầu:**

```json
{
  "statusCode": 200,
  "message": "Lấy newsfeed cuộn vô tận thành công!",
  "data": {
    "items": [
      {
        "id": 2,
        "title": "Kiến trúc Clean Architecture trong dự án NestJS",
        "published": true,
        "createdAt": "2026-09-24T15:35:00.000Z",
        "author": {
          "id": 1,
          "email": "dev@nestjs.com",
          "name": "Alex Developer"
        },
        "_count": {
          "comments": 5
        }
      }
    ],
    "meta": {
      "take": 1,
      "nextCursor": 2,
      "hasNextPage": true
    }
  },
  "timestamp": "2026-09-24T15:37:00.000Z",
  "path": "/api/v1/posts/feed"
}
```

**Truy vấn trang kế tiếp bằng `cursor = 2`:**

```bash
curl -X GET "http://localhost:3000/api/v1/posts/feed?cursor=2&take=1"
```

Ứng dụng sẽ lập tức trả về bài viết ID 1 với `hasNextPage = false` và `nextCursor = 1` mà không tốn công quét lại bản ghi ID 2!

---

### 🔴 Kịch Bản 2: Kiểm Thử Lỗi & Ngăn Chặn (Blocked / Error Flow)

#### 1. Lỗi Validation DTO (Tiêu đề quá ngắn & nội dung rỗng)

Gửi body thiếu trường hoặc vi phạm `@MinLength(5)`:

```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nest",
    "content": ""
  }'
```

**Kết quả kỳ vọng (HTTP 400 Bad Request — Chặn đứng tại ValidationPipe):**

```json
{
  "statusCode": 400,
  "message": [
    "Tiêu đề bài viết phải có ít nhất 5 ký tự",
    "Nội dung bài viết không được để trống"
  ],
  "error": "Bad Request",
  "timestamp": "2026-09-24T15:38:00.000Z",
  "path": "/api/v1/posts"
}
```

---

#### 2. Lỗi Chưa Đăng Nhập Gọi API Bảo Vệ (`401 Unauthorized`)

Gửi request sửa bài viết mà không gửi kèm Header Authorization:

```bash
curl -X PATCH http://localhost:3000/api/v1/posts/1 \
  -H "Content-Type: application/json" \
  -d '{ "title": "Tiêu đề mới" }'
```

**Kết quả kỳ vọng (HTTP 401 Unauthorized — Chặn đứng tại JwtAuthGuard):**

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "timestamp": "2026-09-24T15:38:30.000Z",
  "path": "/api/v1/posts/1"
}
```

---

#### 3. Lỗi Forbidden 403 Khi Sửa/Xóa Bài Viết Của Người Khác

Người dùng B (`userId = 2`) cố tình gửi request xóa bài viết `#1` của tác giả A (`userId = 1`):

```bash
curl -X DELETE http://localhost:3000/api/v1/posts/1 \
  -H "Authorization: Bearer <TOKEN_USER_B>"
```

**Kết quả kỳ vọng (HTTP 403 Forbidden — Ngăn chặn hành vi leo thang đặc quyền):**

```json
{
  "statusCode": 403,
  "message": "Bạn không có quyền xóa bài viết này",
  "error": "Forbidden",
  "timestamp": "2026-09-24T15:39:00.000Z",
  "path": "/api/v1/posts/1"
}
```

---

### 🖥️ Kịch Bản 3: Thử Nghiệm Tương Tác Trực Quan Trên Swagger UI (`/api/docs`)

<p align="center">
  <img src="./assets/posts_api_swagger_crud_mockup.jpg" alt="Posts API Swagger UI Mockup" width="90%" />
</p>

Nhờ đã cài đặt `@nestjs/swagger` từ **Lesson 5.1** kết hợp cùng cấu hình bảo mật thông minh `.addSecurityRequirements('JWT-auth')` và decorator `@Public()` tích hợp `ApiSecurity({})`, bạn có thể trải nghiệm toàn diện luồng CRUD và phân trang trực tiếp trên trình duyệt:

1. **Mở Swagger Portal:** Truy cập trình duyệt tại địa chỉ `http://localhost:3000/api/docs`.
2. **Nhận diện trạng thái bảo mật trực quan:**
   - **Các route yêu cầu xác thực (`POST /posts`, `PATCH /posts/:id`, `DELETE /posts/:id`):** Tự động có biểu tượng ổ khóa 🔒 bên cạnh endpoint (nhờ `addSecurityRequirements('JWT-auth')` toàn cục mà không cần gắn `@ApiBearerAuth`).
   - **Các route công khai (`GET /posts`, `GET /posts/feed`, `GET /posts/:id`):** Hiển thị không có ổ khóa bảo mật (nhờ decorator `@Public()` kích hoạt `ApiSecurity({})`), cho phép nhấn **Try it out** và **Execute** ngay lập tức mà không cần Token!
3. **Authorize Bearer Token một lần duy nhất:**
   - Nhấn nút **Authorize 🔓** màu xanh lá ở góc trên bên phải giao diện Swagger UI.
   - Dán chuỗi Bearer Token nhận được từ API đăng nhập (Module 4) theo định dạng: `Bearer <YOUR_ACCESS_TOKEN>`.
   - Nhấn **Authorize** rồi nhấn **Close**. Biểu tượng ổ khóa sẽ đóng lại thành **🔒**. Toàn bộ request gọi đến các API bảo vệ sẽ tự động được đính kèm Header Authorization!
4. **Thực thi `POST /api/v1/posts`:**
   - Mở rộng tag `posts`, chọn endpoint `POST /api/v1/posts`.
   - Nhấn **Try it out**, Swagger UI sẽ tự động điền sẵn JSON mẫu lấy từ `@ApiProperty()` trong `CreatePostDto`.
   - Nhấn **Execute** và quan sát kết quả phản hồi `201 Created` kèm `TransformInterceptor` đóng gói trực quan!
5. **Thực thi `GET /api/v1/posts` & `GET /api/v1/posts/feed`:**
   - Nhập giá trị thử nghiệm cho `page`, `limit` hoặc `cursor`, `take` vào giao diện form trực quan.
   - Nhấn **Execute** để xem dữ liệu JSON bài viết phân trang chuẩn Enterprise.

---

## 5. Tổng Kết Bài Học & Checklist Ghi Nhớ

```mermaid
mindmap
  root(("Posts API & Phân Trang"))
    "Thao Tác CRUD"
      "Create: Gán tác giả tự động qua @CurrentUser userId"
      "Read: Phân chia Offset vs Cursor Pagination"
      "Update và Delete: Kiểm soát phân quyền chính chủ bài viết"
    "Kỹ Thuật Phân Trang"
      "Offset-based: page và limit - Phù hợp Web Admin O(N)"
      "Cursor-based: cursor và take - Phù hợp Infinite Feed O(1)"
      "Tối ưu Prisma: Promise.all và select _count"
    "Đồng Bộ Architecture"
      "Global JwtAuthGuard kết hợp @Public decorator"
      "Tự động hóa URI Versioning v1 qua defaultVersion"
      "Tối ưu Swagger Security: addSecurityRequirements và ApiSecurity"
      "@ResponseMessage và TransformInterceptor format JSON"
    "OpenAPI Swagger Docs"
      "@ApiTags posts gộp nhóm tài liệu controller"
      "@ApiOperation và @ApiResponse mô tả rõ ràng"
      "@ApiProperty và PartialType từ @nestjs/swagger"
```

### ✅ Checklist Ghi Nhớ Bài Học:

- [x] Hiểu rõ bản chất kỹ thuật và điểm yếu O(N) cùng hiện tượng Data Drift của **Offset-based Pagination**.
- [x] Làm chủ thuật toán **Cursor-based Pagination** O(1) với kỹ thuật lấy dư 1 phần tử (Peek Ahead) để xác định `hasNextPage`.
- [x] Thiết kế DTOs validation chuẩn mực cho Create, Update và Query params (`page`, `limit`, `cursor`, `take`).
- [x] Kế thừa `PartialType` từ `@nestjs/swagger` để giữ nguyên toàn bộ OpenAPI schema metadata.
- [x] Đã đồng bộ kiến trúc Request Pipeline: `@Public()` cho Public API, `@CurrentUser('userId')` cho Protected API.
- [x] Tận dụng `defaultVersion` trong cấu hình `enableVersioning` để quản lý phiên bản URI `/api/v1/` tập trung, loại bỏ boilerplate `@Version('1')` ở từng API.
- [x] Tận dụng `addSecurityRequirements('JWT-auth')` toàn cục và decorator `@Public()` tích hợp `ApiSecurity({})`, loại bỏ hoàn toàn `@ApiBearerAuth` ở từng API.
- [x] Tối ưu hóa truy vấn CSDL Prisma bằng cách kết hợp `Promise.all()` và `_count: { select: { comments: true } }`.
- [x] Kiểm soát phân quyền chính chủ bài viết, chặn đứng hành vi sửa/xóa trái phép với `ForbiddenException` (`403 Forbidden`).
- [x] Tích hợp OpenAPI Swagger decorators cho DTOs và Controller, kiểm thử tương tác thành công trên Swagger UI.

---

👈 **Bài trước:** [Lesson 5.1: OpenAPI (Swagger) — Tự Động Hóa Tài Liệu API & Kiểm Thử Tương Tác Với @nestjs/swagger](../lesson-5.1/lesson-5.1.md)  
👉 **Bài tiếp theo:** [Lesson 5.3: File Upload — Upload Ảnh Đại Diện / Bài Viết Với Multer](../lesson-5.3/lesson-5.3.md)
