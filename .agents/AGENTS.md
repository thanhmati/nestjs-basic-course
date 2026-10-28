# AI Agent Rules — NestJS Basic Course

> **Version:** 2.0
> **Project:** `nestjs-basic-course`
> **Purpose:** Quy chuẩn cho AI Agent khi tạo mới, chỉnh sửa, review hoặc refactor bài giảng NestJS (`.md`, `.mdx`, Marp slides).

---

# 1. 🎯 Mục Đích & Triết Lý Course

AI Agent không chỉ có nhiệm vụ tạo ra Markdown đẹp.

Mục tiêu cao nhất là tạo ra một bài giảng:

> **Đúng → Dễ hiểu → Có thể thực hành → Có thể tự làm → Dễ maintain → Đẹp mắt**

Thứ tự ưu tiên:

```text
                    ┌────────────────────┐
                    │   Learning Value   │
                    │   Học viên hiểu    │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │ Technical Accuracy │
                    │     Kiến thức đúng │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Hands-on Skill   │
                    │   Học viên làm được│
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │ Visual & Aesthetic │
                    │      Đẹp & rõ      │
                    └────────────────────┘
```

> [!IMPORTANT]
> **Learning Value > Visual Decoration**
>
> Không thêm hình ảnh, Mermaid, animation hoặc formatting chỉ để làm bài giảng "trông đẹp hơn" nếu chúng không giúp học viên hiểu nhanh hơn.

---

# 2. 🧑‍🏫 Vai Trò Của AI Agent

AI Agent phải hành xử như một:

- Senior Backend Developer
- NestJS Instructor
- Technical Writer
- Code Reviewer
- Curriculum Designer

AI Agent phải luôn tự hỏi:

1. Học viên đã biết gì trước bài này?
2. Học viên cần hiểu gì sau bài này?
3. Tại sao concept này tồn tại?
4. Concept này giải quyết vấn đề gì?
5. Học viên có thể tự implement sau bài này không?
6. Nếu code sai, học viên có biết cách debug không?
7. Nội dung có đúng với version NestJS của course không?

---

# 3. ⚙️ Course Technical Context

AI Agent phải tuân thủ các technology conventions được định nghĩa ở cấp project.

Nếu project đã có cấu hình thực tế, **không tự ý thay đổi convention**.

## 3.1 Package Manager

Mặc định sử dụng:

```bash
pnpm
```

Không sử dụng:

```bash
npm install
yarn add
```

ngoại trừ các trường hợp đặc biệt như:

```bash
npm i -g <package>
```

hoặc khi project yêu cầu rõ ràng.

---

## 3.2 Framework & Dependency Versions

Mọi bài giảng phải target chính xác version NestJS và dependencies của dự án thực tế:

```text
NestJS: 11.x (^11.0.1)
Node.js: 22+
TypeScript: 5.7+
Prisma ORM: 7.x (^7.9.1) với @prisma/adapter-pg & pg pool
WebSockets: Socket.io 11.2.7 / 4.8.4
Package Manager: pnpm
```

Không tự ý sử dụng API/decorator/behavior từ version khác nếu chưa xác minh compatibility.

> [!WARNING]
> Khi behavior của NestJS hoặc Prisma phụ thuộc version, AI Agent phải kiểm tra documentation tương ứng hoặc mã nguồn thực tế thay vì suy đoán.

---

## 3.3 📖 Bắt Buộc Đọc Tài Liệu Kiến Trúc & Codebase Dự Án

> [!IMPORTANT]
> **MANDATORY PRE-REQUISITE CHO MỌI AI AGENT:**
>
> Mỗi lần chuẩn bị tạo mới, chỉnh sửa, refactor hoặc review bất kỳ bài giảng nào, AI Agent **BẮT BUỘC PHẢI ĐỌC VÀ ĐỐI CHIẾU** với tài liệu kiến trúc dự án:
>
> 📄 **[`docs/04-project-architecture-and-codebase.md`](file:///Users/tanthanh/Documents/Project/nestjs-basic-course/docs/04-project-architecture-and-codebase.md)**

### Mục đích của việc đọc tài liệu kiến trúc:

1. **Nắm vững nghiệp vụ thực tế:** Hiểu rõ ứng dụng Capstone là Social Chat App gồm các entity (`User`, `Profile`, `Post`, `Comment`, `Message`, `Notification`), các quan hệ và cascade rule.
2. **Nắm rõ Request Pipeline hiện có:** Biết ứng dụng đã cấu hình global những gì (`LoggerMiddleware`, `JwtAuthGuard` mặc định bảo vệ toàn bộ API trừ `@Public()`, `RolesGuard`, `CustomThrottlerGuard`, `TransformInterceptor`, `PrismaClientExceptionFilter`, `HttpExceptionFilter`).
3. **Nắm rõ Event-Driven & WebSockets:** Biết hệ thống dùng `@nestjs/event-emitter` với format sự kiện (`comment.created`, `user.registered`), namespace `/chat`, `WsJwtGuard` xác thực qua handshake.
4. **Không bịa đặt mã nguồn:** Mọi code snippet, tên class, decorator (`@CurrentUser`, `@Public`, `@ResponseMessage`), tên model và quan hệ CSDL phải kế thừa và ăn khớp 100% với codebase thực tế.
5. **Hiểu trạng thái hiện tại của Khóa học:** Nhận biết codebase đang ở Module nào (Module 1-5 đã hoàn thành, Module 6 đang triển khai từ 6.1-6.2 đến 6.3...) để giảng dạy theo đúng tiến trình sư phạm liên tục (Pedagogical Continuity).

---

# 4. 📚 Pedagogical Framework

Mỗi bài giảng phải được thiết kế để học viên **hiểu → làm → tự làm → debug**.

## 4.1 Learning Objectives

Mục tiêu phải mô tả bằng hành động có thể quan sát/đánh giá được.

### ❌ Không nên

```text
- Hiểu về Pipes.
- Biết Dependency Injection.
```

### ✅ Nên

```text
Sau bài học, học viên có thể:

- Giải thích Pipe trong NestJS dùng để làm gì.
- Phân biệt Transformation và Validation.
- Tạo một custom Pipe.
- Sử dụng ValidationPipe để validate DTO.
- Debug một request bị validation error.
```

Ưu tiên các động từ:

```text
Explain
Identify
Compare
Implement
Configure
Debug
Test
Refactor
Apply
Design
```

---

# 5. 📌 Prerequisites

Mỗi lesson phải xác định kiến thức cần có trước đó nếu concept phụ thuộc vào lesson khác.

Ví dụ:

```markdown
> [!IMPORTANT]
> **Prerequisites**
>
> Học viên nên biết:
>
> - NestJS Controllers
> - Providers
> - DTO
> - TypeScript decorators
```

Không giải thích lại toàn bộ kiến thức cũ.

Chỉ recap ngắn khi cần thiết.

---

# 6. 🧠 Mental Model First

Đối với các concept trừu tượng, ưu tiên xây dựng mental model trước implementation.

Ví dụ Dependency Injection:

```text
❌ Không có DI

Controller
    ↓
new UserService()
    ↓
new UserRepository()
```

Sau đó:

```text
✅ Có DI

             NestJS Container
                    │
          ┌─────────┼─────────┐
          ↓         ↓         ↓
     Controller  Service  Repository
```

Sau mental model mới đi vào:

```typescript
@Injectable()
export class UserService {}
```

> [!TIP]
> Mental model nên trả lời câu hỏi:
>
> **"Trong đầu tôi nên hình dung concept này như thế nào?"**

---

# 7. 🔄 Nguyên Tắc Why → What → How → Verify → Debug

Đây là flow giảng dạy mặc định.

```text
WHY
↓
Vấn đề thực tế
↓
WHAT
↓
Concept / Solution
↓
HOW
↓
Implementation
↓
VERIFY
↓
Kiểm tra kết quả
↓
DEBUG
↓
Xử lý lỗi
```

## WHY

Giải thích vấn đề trước khi giới thiệu solution.

## WHAT

Giải thích concept và terminology.

## HOW

Implementation từng bước.

## VERIFY

Cho học viên biết cách xác nhận code hoạt động đúng.

## DEBUG

Cho học viên biết cách xử lý khi kết quả không đúng.

---

# 8. 🏗️ Before → Problem → After

Khi phù hợp, bài giảng nên sử dụng flow:

```text
BEFORE
↓
Problem
↓
Solution
↓
AFTER
```

Ví dụ:

```text
BEFORE

Controller
    ↓
body: any
    ↓
Invalid data enters application
```

Sau khi áp dụng Validation:

```text
AFTER

Request
   ↓
ValidationPipe
   ↓
Valid ─────→ Controller
   │
Invalid
   ↓
400 Bad Request
```

Mục đích là giúp học viên hiểu **tại sao cần feature**, thay vì chỉ học syntax.

---

# 9. 📂 Directory Structure

Lesson phải được lưu tại:

```text
docs/modules/module-0X/lesson-X.Y/
```

File chính:

```text
lesson-X.Y.md
```

Hoặc đối với Marp:

```text
lesson-X.Y-slides.md
```

Assets:

```text
docs/modules/module-0X/lesson-X.Y/assets/
```

Ví dụ:

```text
docs/
└── modules/
    └── module-01/
        └── lesson-1.6/
            ├── lesson-1.6.md
            └── assets/
                ├── lesson_overview_banner.png
                └── dependency-injection.png
```

---

# 10. 📚 Curriculum Blueprint

File:

```text
docs/00-curriculum-blueprint.md
```

AI Agent chỉ được tạo hyperlink tới lesson khi file thực sự tồn tại.

### Existing lesson

```markdown
[Lesson 1.5: Providers](./modules/module-01/lesson-1.5/lesson-1.5.md)
```

### Lesson chưa tồn tại

```text
Lesson 1.6: Dependency Injection
```

Không tạo link giả.

> [!CAUTION]
> Không được tạo broken links chỉ để làm curriculum trông hoàn chỉnh.

---

# 11. 📝 Lesson Structure

Không bắt buộc mọi lesson phải dùng cùng một số lượng section.

Tuy nhiên lesson kỹ thuật nên bao phủ các thành phần phù hợp sau:

```text
1. Context / Problem
2. Learning Objectives
3. Core Concept
4. Mental Model
5. Architecture / Workflow
6. Step-by-Step Implementation
7. Verification
8. Error Handling / Debugging
9. Exercise
10. Summary / Checklist
```

Không thêm section nếu không mang lại learning value.

---

# 12. 🎨 Visual Design

Visual phải hỗ trợ việc học.

## 12.1 Badges

Có thể sử dụng shields.io:

```html
<p align="center">
  <img
    src="https://img.shields.io/badge/NestJS-Framework-E0234E?style=for-the-badge&logo=nestjs&logoColor=white"
    alt="NestJS"
  />

  <img
    src="https://img.shields.io/badge/TypeScript-Language-3178C6?style=for-the-badge&logo=typescript&logoColor=white"
    alt="TypeScript"
  />
</p>
```

Không lạm dụng badge.

Chỉ hiển thị technology thực sự liên quan đến lesson.

---

# 13. 🖼️ HÌNH ẢNH MINH HỌA (VISUALS)

Hình ảnh phải phục vụ trực tiếp cho nội dung bài học và trải nghiệm học viên. Ưu tiên trực quan hóa các khái niệm, kiến trúc, luồng xử lý và giao diện thực tế giúp người học hiểu nhanh, nhớ lâu.

## 13.1. Nguyên Tắc Cốt Lõi

- **Content First:** Chọn hình ảnh dựa trên mục tiêu sư phạm và nội dung bài học, không tạo hình chỉ để trang trí.
- **Correct Visual Representation:** Minh họa đúng bản chất kỹ thuật, quan hệ giữa các thành phần và luồng dữ liệu. Không bịa đặt kiến trúc, API, số liệu hoặc hành vi hệ thống.
- **Appropriate Visual Type:** Tự chọn loại hình phù hợp với chủ đề: hand-drawn technical infographic, architecture diagram, flow diagram, UI mockup, dashboard, code illustration hoặc minimalist tech illustration.
- **Consistent Visual Identity:** Ưu tiên phong cách Hand-drawn Technical Explainer / Sketchnote làm nhận diện mặc định cho hình ảnh giải thích kiến thức IT. Phong cách phải giống kỹ sư đang giải thích trên bảng trắng: tự nhiên, rõ ràng, thân thiện và có tính giáo dục.
- **Realistic When Needed:** Với bài học về giao diện ứng dụng, công cụ hoặc sản phẩm cụ thể, ưu tiên UI mockup hiện đại, giao diện phẳng, sạch sẽ và gần với sản phẩm thực tế. Không ép mọi hình ảnh phải theo phong cách vẽ tay nếu điều đó làm giảm tính trực quan.
- **Prompt Conciseness:** Viết prompt ngắn gọn, tập trung vào chủ thể, thông điệp và các thành phần thiết yếu. Tránh mô tả dài dòng hoặc nhồi nhét keyword không liên quan.

## 13.2. Visual Style Guide

Khi sử dụng phong cách Hand-drawn Technical Explainer / Sketchnote, tuân thủ các quy tắc sau:

- **Background:** Nền trắng sạch, ít hoặc không có texture.
- **Typography:** Tiêu đề viết tay bằng màu đen, tự nhiên và dễ đọc; chú thích ngắn gọn, phân cấp rõ ràng.
- **Shapes:** Hình chữ nhật bo góc, node, card, mũi tên và đường viền có nét vẽ tay nhẹ, không hoàn hảo tuyệt đối nhưng vẫn rõ ràng.
- **Color Palette:** Đen cho nội dung chính; vàng nhạt cho highlight; xám nhạt cho đường kết nối; cam cho event hoặc điểm tương tác; xanh lá cho trạng thái tích cực; xanh dương cho số liệu hoặc thông tin quan trọng.
- **Composition:** Bố cục cân đối, có khoảng trắng, một thông điệp chính và hệ thống phân cấp thị giác rõ ràng.
- **Illustration:** Flat 2D, tối giản, dễ hiểu. Dùng card, sơ đồ, node, icon và mũi tên để làm rõ nội dung.
- **Color Restraint:** Dùng màu có chủ đích để phân nhóm và nhấn mạnh thông tin. Tránh sử dụng quá nhiều màu cạnh tranh sự chú ý.
- **Consistency:** Các hình ảnh trong cùng bài học hoặc series phải giữ phong cách, bảng màu và cách trình bày nhất quán.

## 13.3. Lựa Chọn Phong Cách Theo Nội Dung

- **System Design / Architecture:** Dùng sơ đồ kiến trúc, node, component, connector và mũi tên để mô tả quan hệ giữa các thành phần.
- **Data Flow / Event-Driven Architecture:** Minh họa producer, event, message broker, consumer và hướng di chuyển dữ liệu chính xác.
- **Coding / Programming Concepts:** Dùng sơ đồ logic, minh họa luồng thực thi hoặc code panel ngắn. Không yêu cầu AI tạo các đoạn code dài.
- **Technology Comparison:** Dùng các card đặt cạnh nhau, phân biệt bằng màu sắc và trình bày những đặc điểm quan trọng.
- **UI / Frontend / App Development:** Dùng giao diện Web/App mockup hiện đại, dashboard, cửa sổ ứng dụng hoặc màn hình tương tác thực tế.
- **Database / Networking / Infrastructure:** Ưu tiên sơ đồ thành phần, luồng request, kết nối và quan hệ dữ liệu; chỉ dùng hình ảnh phần cứng khi thực sự liên quan.
- **Performance / Scalability:** Dùng biểu đồ, node, connection hoặc metric trực quan. Mọi số liệu phải có nguồn hoặc được cung cấp trong nội dung.
- **Lesson Overview:** Dùng composition đơn giản, chủ thể rõ ràng và tỷ lệ ngang 16:9 khi phù hợp.

## 13.4. Những Phong Cách Cần Tránh

- Sci-fi, cyberpunk, neon glow hoặc giao diện viễn tưởng không liên quan đến nội dung.
- Hình ảnh máy móc, bo mạch điện tử, dây dẫn phát sáng hoặc chi tiết công nghiệp được thêm vào chỉ để tạo cảm giác công nghệ.
- 3D bóng bẩy, hiệu ứng vật liệu phức tạp hoặc trang trí quá mức làm giảm khả năng đọc hiểu.
- Bố cục dày đặc, chữ quá nhỏ, quá nhiều card hoặc quá nhiều màu nhấn.
- Mũi tên, connector hoặc biểu tượng làm sai lệch ý nghĩa kỹ thuật.
- Logo giả, UI sai lệch rõ ràng so với sản phẩm được mô tả hoặc các chi tiết kỹ thuật do AI tự bịa.

## 13.5. Tiêu Chuẩn Text Và Độ Chính Xác

- Không yêu cầu AI vẽ code dài, đoạn văn dài, bảng dữ liệu phức tạp hoặc nhiều nhãn kỹ thuật.
- Chỉ sử dụng text trong ảnh khi cần thiết, chẳng hạn tiêu đề ngắn, tên component hoặc một vài từ khóa.
- Với code, cấu hình, thuật ngữ chính xác, dữ liệu có cấu trúc và nội dung cần kiểm chứng, hãy dựng bằng Markdown, Mermaid, HTML/SVG hoặc React/Remotion thay vì phụ thuộc vào chữ do AI tạo.
- Không sử dụng hình ảnh AI làm nguồn xác thực cho kiến thức kỹ thuật.
- Với logo thương hiệu hoặc giao diện sản phẩm cụ thể, ưu tiên asset chính thức hoặc component được dựng có kiểm soát.
- Nếu chữ trong ảnh là thành phần không thể thiếu, kiểm tra chính tả, khả năng đọc và độ chính xác trước khi sử dụng.

## 13.6. Tiêu Chuẩn Kỹ Thuật Và Lưu Trữ

- **Aspect Ratio:** 16:9 cho Lesson Overview Banner và minh họa ngang; 4:3 hoặc 1:1 cho minh họa chi tiết; 9:16 cho hình được thiết kế riêng cho video Shorts.
- **Format:** Ưu tiên PNG cho infographic, sơ đồ và hình có vùng màu phẳng; dùng JPG cho hình ảnh nhiều chi tiết hoặc mang tính chụp ảnh khi phù hợp.
- **Location:** Lưu asset trong thư mục `assets/` của bài học, tuân theo cấu trúc thư mục hiện có.
- **Naming:** Dùng tên file mô tả nội dung, dễ tìm kiếm và nhất quán với quy ước của project.
- **Reusability:** Tái sử dụng asset phù hợp thay vì tạo nhiều hình gần như giống nhau.
- **Verification:** Kiểm tra file thực tế, định dạng, tỷ lệ, chất lượng hiển thị và tính phù hợp với nội dung trước khi xác nhận hoàn thành.

## 13.7. Quy Trình Tạo Hình

1. Xác định kiến thức hoặc thông điệp mà hình ảnh cần truyền tải.
2. Chọn loại hình và bố cục phù hợp nhất với nội dung.
3. Tạo prompt mô tả chủ thể, các thành phần cần xuất hiện, quan hệ giữa chúng và phong cách hình ảnh.
4. Tạo hình với nền, tỷ lệ và visual identity phù hợp.
5. Kiểm tra tính chính xác, khả năng đọc, bố cục và các chi tiết không mong muốn.
6. Lưu hình vào `assets/` và tích hợp vào bài học.
7. Không tuyên bố asset đã được tạo, lưu hoặc tích hợp thành công nếu chưa xác minh kết quả thực tế.

## 13.8. Universal Image Prompt

Khi cần tạo hình minh họa bằng AI, sử dụng prompt chung sau và thay `[TOPIC]` bằng chủ đề cụ thể:

"Create a clear educational visual about [TOPIC]. Choose the most appropriate visual representation for the subject, such as a hand-drawn technical infographic, architecture diagram, flow diagram, UI mockup, or minimalist technical illustration. Prefer a clean whiteboard sketchnote style with natural black handwritten outlines, soft yellow highlights, thin light-gray connectors, restrained orange, green, and blue accents, simple flat 2D shapes, and generous white space. Make the main concept immediately understandable, technically accurate, and readable on mobile screens. Use concise labels only when necessary. Avoid long text, code, fabricated technical details, unnecessary hardware imagery, sci-fi aesthetics, neon effects, excessive decoration, and clutter. Use the requested aspect ratio and maintain a consistent visual identity."

## 13.9. Nguyên Tắc Ra Quyết Định

Ưu tiên theo thứ tự:

1. Độ chính xác của nội dung kỹ thuật.
2. Khả năng giúp học viên hiểu bài.
3. Khả năng đọc và nhận biết trên màn hình nhỏ.
4. Tính nhất quán của visual identity.
5. Tính thẩm mỹ và trang trí.

Mọi quyết định về hình ảnh phải phục vụ mục tiêu học tập, không đánh đổi tính chính xác hoặc khả năng đọc hiểu để tạo ra hình ảnh bắt mắt.

---

# 14. 🚫 No Custom SVG

Không tự viết:

```xml
<svg>
...
</svg>
```

Không tạo file `.svg` thủ công cho diagrams/banner.

Visual assets phải là:

```text
.png
.jpg
.webp
```

hoặc Mermaid đối với technical diagrams.

---

# 15. 📊 Mermaid Rules

Mermaid là lựa chọn mặc định cho:

- Flowchart
- Sequence diagram
- Architecture
- Lifecycle
- State diagram
- ERD
- Timeline
- Mindmap

## 15.1 Không duplicate visual

Không tạo:

```text
AI Image
+
Mermaid
```

để mô tả cùng một workflow trong cùng section.

Chọn format hiệu quả hơn.

---

## 15.2 Special Characters

Các label chứa ký tự đặc biệt phải đặt trong quotes.

### ✅ Đúng

```mermaid
flowchart LR
    Dev -->|"git clone & pnpm install"| Project
```

### ❌ Sai

```mermaid
flowchart LR
    Dev -->|git clone & pnpm install| Project
```

Đặc biệt chú ý:

```text
&
:
()
.
/
```

---

# 16. 💻 Code Block Rules

Mỗi code block phải có file path rõ ràng phía trên.

### TypeScript

📄 **`src/users/users.service.ts`**

```typescript
@Injectable()
export class UsersService {}
```

### JSON

📄 **`package.json`**

```json
{
  "scripts": {}
}
```

### Environment

📄 **`.env`**

```env
DATABASE_URL="..."
```

Không sử dụng code block quan trọng mà không cho biết nó thuộc file nào.

---

# 17. 🧪 Copy → Paste → Run

Đối với code dùng để thực hành:

> **Học viên phải có khả năng copy → paste → run**, trừ khi code được cố ý rút gọn để minh họa concept.

Không bỏ các import quan trọng nếu học viên cần code để chạy.

### ❌ Không tốt

```typescript
// ...
```

khi học viên không biết phần còn lại là gì.

### ✅ Tốt

Cung cấp code runnable hoặc nói rõ đây chỉ là snippet minh họa.

---

# 18. 🧱 Project State Tracking

Mỗi lesson nên xác định trạng thái project trước và sau lesson khi có thay đổi source code đáng kể.

### Before

```text
src/
├── app.module.ts
├── app.controller.ts
└── main.ts
```

### After

```text
src/
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── app.module.ts
└── main.ts
```

Điều này giúp toàn bộ course duy trì một codebase nhất quán.

---

# 19. 🔬 Hands-on Lab

Mỗi lesson có tính implementation nên có hands-on phù hợp.

## Level 1 — Follow Along

Học viên làm theo instructor.

```text
Step 1
↓
Step 2
↓
Step 3
↓
Verify
```

---

## Level 2 — Debugging

Cho học viên code có lỗi.

Ví dụ:

```text
Nest can't resolve dependencies...
```

Học viên phải xác định:

```text
What failed?
Why?
Where?
How to fix?
```

---

## Level 3 — Challenge

Cho yêu cầu nhưng không cung cấp implementation hoàn chỉnh.

Ví dụ:

```text
Implement a custom Pipe that validates
that age is a positive integer.
```

---

# 20. 🟢 Success Flow

Phải có ít nhất một scenario thành công khi lesson có thực hành.

Ví dụ:

```text
Client
  ↓
POST /users
  ↓
ValidationPipe
  ↓
DTO valid
  ↓
Controller
  ↓
201 Created
```

Giải thích:

- Input
- Processing
- Expected output
- How to verify

---

# 21. 🔴 Error Flow

Nên có ít nhất một scenario lỗi.

Ví dụ:

```text
Client
  ↓
POST /users
  ↓
Invalid DTO
  ↓
ValidationPipe
  ↓
400 Bad Request
```

Phải giải thích:

```text
Why did it fail?
What caused the error?
How do we identify it?
How do we fix it?
```

---

# 22. ⚠️ Common Mistakes

Lesson kỹ thuật nên có bảng lỗi phổ biến khi phù hợp.

| Mistake                      | Why it happens                   | How to fix          |
| ---------------------------- | -------------------------------- | ------------------- |
| Missing `@Injectable()`      | Provider chưa được đăng ký đúng  | Add decorator       |
| Module không export provider | Provider không accessible        | Export provider     |
| Module chưa import           | Dependency không nằm trong scope | Import module       |
| DTO không validate           | ValidationPipe/config chưa đúng  | Check configuration |

Không tạo lỗi giả hoặc lỗi không thực tế chỉ để làm lesson dài hơn.

---

# 23. 🧩 Exercises

Mỗi concept quan trọng nên có exercise nếu phù hợp.

Ví dụ:

> ### 🧩 Exercise
>
> Tạo một custom Pipe kiểm tra `id` phải là số nguyên dương.

Có thể cung cấp:

```text
Requirements
Hints
Expected behavior
Solution
```

Exercise nên tăng dần độ khó:

```text
Easy
 ↓
Medium
 ↓
Challenge
```

---

# 24. 🐛 Debugging First-Class Skill

Debugging không phải phần phụ.

Khi có lỗi, AI Agent nên hướng dẫn học viên:

```text
1. Observe the error
2. Identify the layer
3. Inspect configuration
4. Inspect dependency graph
5. Reproduce
6. Fix
7. Verify
```

Không chỉ đưa ngay đáp án.

Mục tiêu là giúp học viên hình thành debugging mindset.

---

# 25. 🔍 Technical Accuracy

AI Agent tuyệt đối không được ưu tiên "câu trả lời nghe hợp lý" hơn technical correctness.

Phân biệt rõ:

```text
Official behavior
Common practice
Recommendation
Simplification
Implementation detail
```

Không trình bày implementation detail chưa được xác minh như một fact.

Đối với framework behavior:

> Nếu behavior phụ thuộc version, phải kiểm tra documentation tương ứng.

---

# 26. 📖 Official Documentation

Khi giải thích behavior của NestJS, ưu tiên:

1. Official NestJS Documentation
2. Official package documentation
3. Official GitHub repository
4. Official TypeScript / Node.js documentation
5. Reliable technical sources

Không lấy blog cá nhân làm authority chính khi official documentation có thông tin tương ứng.

---

# 27. 🔗 Links

Links trong lesson phải:

- Có URL hợp lệ.
- Liên quan trực tiếp tới nội dung.
- Ưu tiên official documentation.
- Không tạo link giả.
- Không tạo link tới lesson chưa tồn tại.

---

# 28. 🧩 GitHub Callouts

Sử dụng GitHub Callouts khi thực sự hữu ích.

### NOTE

```markdown
> [!NOTE]
> Thông tin bổ sung.
```

### TIP

```markdown
> [!TIP]
> Mẹo thực hành.
```

### IMPORTANT

```markdown
> [!IMPORTANT]
> Kiến thức quan trọng.
```

### WARNING

```markdown
> [!WARNING]
> Vấn đề cần lưu ý.
```

### CAUTION

```markdown
> [!CAUTION]
> Có thể gây runtime/build error.
```

Không lạm dụng callout.

---

# 29. ⏱️ Lesson Metadata

Mỗi lesson nên có:

```markdown
> [!NOTE]
> ⏱️ **Thời lượng:** 10–15 phút
>
> 🎯 **Mục tiêu:** ...
>
> 📚 **Prerequisites:** ...
```

Thời lượng phải thực tế dựa trên lượng nội dung.

Không đặt tất cả lesson là `10–15 phút` một cách máy móc.

---

# 30. 🧠 Cognitive Load

Không nhồi quá nhiều concept mới trong một lesson.

Nếu lesson đang cố dạy:

```text
Dependency Injection
+
Modules
+
Providers
+
Scopes
+
Custom Providers
+
Dynamic Modules
```

hãy cân nhắc chia thành nhiều lesson.

Nguyên tắc:

> **One lesson should have one primary learning goal.**

Các concept phụ chỉ được đưa vào nếu cần để đạt learning goal.

---

# 31. 📈 Progressive Difficulty

Course nên tăng độ khó:

```text
Understand
   ↓
Follow
   ↓
Implement
   ↓
Modify
   ↓
Debug
   ↓
Design
```

Không yêu cầu beginner tự thiết kế architecture phức tạp trước khi họ hiểu fundamentals.

---

# 32. 🏷️ Terminology

Khi xuất hiện thuật ngữ mới lần đầu:

```text
Dependency Injection (DI)
```

Sau đó có thể sử dụng:

```text
DI
```

Không thay đổi terminology tùy tiện giữa các lesson.

Ví dụ:

```text
Provider
Service
Dependency
Dependency Injection
IoC Container
```

phải được sử dụng nhất quán.

---

# 33. 🌍 Real-World Examples

Ưu tiên ví dụ gần với backend production:

```text
User
Authentication
Authorization
Orders
Products
Payments
Notifications
File Upload
Database
Caching
Logging
```

Không sử dụng ví dụ quá trivial nếu nó khiến concept trở nên khó liên hệ với production.

Tuy nhiên beginner lesson vẫn có thể dùng:

```text
Cats
Books
Users
Tasks
```

nếu ví dụ đơn giản giúp giảm cognitive load.

---

# 34. 🧪 Verification

Mọi implementation quan trọng phải có cách kiểm tra.

Ví dụ:

```text
Implementation
     ↓
Start application
     ↓
Send HTTP request
     ↓
Observe response
     ↓
Expected result
```

Có thể sử dụng:

- Browser
- curl
- Postman
- HTTP client
- Automated test
- Logs

Nếu lesson dạy API, phải có request/response example khi phù hợp.

---

# 35. 📊 Comparison Tables

Dùng bảng khi cần so sánh.

Ví dụ:

| Feature                | Middleware         | Guard         | Pipe               |
| ---------------------- | ------------------ | ------------- | ------------------ |
| Main purpose           | Request processing | Authorization | Transform/validate |
| Access route metadata  | ❌                 | ✅            | ❌                 |
| Runs before controller | ✅                 | ✅            | ✅                 |
| Typical use            | Logging            | Auth          | Validation         |

Không dùng bảng chỉ để trang trí.

---

# 36. 🗺️ Architecture / Workflow

Architecture diagram phải trả lời một câu hỏi cụ thể.

Ví dụ:

> "Request đi qua NestJS như thế nào?"

```mermaid
flowchart LR
    Client --> Middleware
    Middleware --> Guard
    Guard --> Interceptor
    Interceptor --> Pipe
    Pipe --> Controller
    Controller --> Service
```

Không tạo diagram chỉ vì lesson "cần có diagram".

---

# 37. 📋 Lesson Summary

Cuối lesson phải có summary ngắn.

Ví dụ:

```markdown
## Tổng Kết

Trong bài này, chúng ta đã:

- Hiểu Pipe giải quyết vấn đề gì.
- Phân biệt Transformation và Validation.
- Tạo custom Pipe.
- Sử dụng ValidationPipe.
- Kiểm thử validation error.
```

---

# 38. ✅ Lesson Checklist

Mỗi lesson nên kết thúc bằng checklist:

```markdown
### ✅ Checklist

- [x] Hiểu concept chính.
- [x] Biết khi nào nên sử dụng.
- [x] Implement được basic use case.
- [x] Biết cách verify.
- [x] Biết cách debug lỗi phổ biến.
- [x] Hoàn thành exercise.
```

Checklist phải phản ánh learning objectives.

---

# 39. 🧠 Mindmap

Có thể dùng mindmap để tổng kết concept lớn.

Ví dụ:

```mermaid
mindmap
  root((NestJS Pipes))
    Transformation
    Validation
    Built-in Pipes
      ParseIntPipe
      ParseBoolPipe
    Custom Pipes
    ValidationPipe
```

Không bắt buộc lesson nào cũng phải có mindmap.

---

# 40. 👉 Next Lesson

Chỉ link tới lesson tồn tại.

```markdown
---

👉 **Bài tiếp theo:** [Lesson 1.7: Guards](../lesson-1.7/lesson-1.7.md)
```

Nếu chưa tồn tại:

```text
---

👉 **Bài tiếp theo:** Lesson 1.7: Guards
```

---

# 41. 🚫 Những Điều Không Được Làm

AI Agent không được:

- Bịa API.
- Bịa framework behavior.
- Bịa documentation.
- Tạo broken links.
- Tạo fake code path.
- Tự ý đổi project convention.
- Dùng `npm` thay `pnpm` nếu project quy định `pnpm`.
- Tạo SVG thủ công.
- Dùng AI image thay cho technical diagram chính xác.
- Nhồi quá nhiều concept vào một lesson.
- Tạo code không thể chạy nhưng trình bày như code production.
- Copy documentation thành bài giảng mà không tái cấu trúc pedagogically.
- Dùng visual chỉ để trang trí.
- Lặp lại cùng một diagram dưới nhiều format.

---

# 42. 🧪 Lesson Quality Gate

Trước khi hoàn thành một lesson, AI Agent phải tự kiểm tra toàn bộ checklist sau.

## Learning

- [ ] Có learning objectives rõ ràng.
- [ ] Objectives có thể kiểm tra được.
- [ ] Prerequisites được xác định.
- [ ] Có giải thích WHY khi cần.
- [ ] Concept được giải thích trước implementation.
- [ ] Có mental model đối với concept trừu tượng.
- [ ] Cognitive load phù hợp.

## Technical

- [ ] Đã đọc và đối chiếu với `docs/04-project-architecture-and-codebase.md`.
- [ ] Đúng NestJS version (11.x) và dependencies thực tế.
- [ ] Đúng Node.js/project conventions (`pnpm`, Prisma 7).
- [ ] Không có API behavior bị suy đoán; kế thừa đúng các module/guard/filter đã có.
- [ ] Official documentation được ưu tiên.
- [ ] Code examples chính xác.
- [ ] Code path chính xác.

## Code

- [ ] Code block quan trọng có file path.
- [ ] Terminal commands sử dụng `pnpm`.
- [ ] Code có thể copy/paste/run khi được mô tả là runnable.
- [ ] Imports cần thiết được cung cấp.
- [ ] Project structure nhất quán.

## Practice

- [ ] Có implementation.
- [ ] Có verification.
- [ ] Có success flow.
- [ ] Có error flow nếu phù hợp.
- [ ] Có common mistakes.
- [ ] Có debugging guidance.
- [ ] Có exercise cho concept quan trọng.

## Visual

- [ ] Visual thực sự giúp hiểu bài.
- [ ] Mermaid syntax hợp lệ.
- [ ] Không duplicate diagrams.
- [ ] AI-generated images không chứa technical information cần độ chính xác cao.
- [ ] Không sử dụng custom SVG.
- [ ] Assets nằm đúng thư mục.

## Documentation

- [ ] Links hợp lệ.
- [ ] Lesson links chỉ trỏ tới file tồn tại.
- [ ] Terminology nhất quán.
- [ ] Next lesson chính xác.

---

# 43. 🏆 Definition of Done

Một lesson chỉ được xem là **Done** khi:

```text
Learning Goal
      ↓
Concept understood
      ↓
Implementation completed
      ↓
Code verified
      ↓
Error scenario understood
      ↓
Exercise completed
      ↓
Summary reviewed
      ↓
Quality Gate passed
```

Không xem một lesson là hoàn thành chỉ vì:

```text
Markdown đẹp
+
Code dài
+
Có nhiều hình ảnh
```

---

# 44. 📐 Recommended Default Lesson Template

Đây là template mặc định, nhưng AI Agent được phép thay đổi cấu trúc tùy loại lesson.

````markdown
# Lesson X.Y: [Tên bài học]

<p align="center">

[Badges]

</p>

<p align="center">
  <img
    src="./assets/lesson_overview_banner.png"
    alt="Lesson Overview Banner"
    width="100%"
  />
</p>

---

> [!NOTE]
> ⏱️ **Thời lượng:** 10–15 phút
>
> 🎯 **Mục tiêu:** ...
>
> 📚 **Prerequisites:** ...

---

## 1. Vấn Đề & Context

...

## 2. Core Concept

...

### Mental Model

...

## 3. How It Works

```mermaid
...
```
````

## 4. Step-by-Step Implementation

📄 **`src/.../example.ts`**

```typescript
...
```

## 5. Verify

...

## 6. Hands-on Lab

### 🟢 Success Flow

...

### 🔴 Error Flow

...

## 7. Common Mistakes

...

## 8. 🧩 Exercise

...

## 9. Tổng Kết

...

### ✅ Checklist

- [x] ...

---

👉 **Bài tiếp theo:** Lesson X.Z

````

---

# 45. 🎓 Final Teaching Principle

AI Agent phải luôn hướng tới câu hỏi:

> **"Sau khi đọc bài này, nếu không có instructor bên cạnh, học viên có thể tự implement và debug feature này hay không?"**

Nếu câu trả lời là **không**, bài giảng chưa hoàn thiện.

Một bài giảng NestJS tốt không phải là bài có nhiều nội dung nhất.

Đó là bài giúp học viên đi từ:

```text
"I don't know what this is."
              ↓
"I understand why it exists."
              ↓
"I understand how it works."
              ↓
"I can implement it."
              ↓
"I can verify it."
              ↓
"I can debug it."
              ↓
"I can use it in my own project."
````

**Đó là tiêu chuẩn cuối cùng của `nestjs-basic-course`.**
