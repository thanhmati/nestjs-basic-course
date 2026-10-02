# AI Agent Rules: Quy Tắc Biên Soạn Bài Giảng NestJS

Tệp này quy định các chuẩn mực bắt buộc cho AI Agent khi tạo mới, chỉnh sửa hoặc làm đẹp các bài giảng (`.md` / slides) trong dự án **nestjs-basic-course**.

---

## 🌟 Nguyên Tắc Cốt Lõi: Đẹp Mắt - Trực Quan - Dễ Hiểu (Core Excellence)

Mọi bài giảng được AI Agent tạo ra hoặc chỉnh sửa **BẮT BUỘC** phải đạt tiêu chuẩn chất lượng cao nhất theo 3 tiêu chí:

1. **🎨 Đẹp mắt (Aesthetic & Professional):** Trình bày chuẩn Markdown cao cấp, trình bày thoáng đãng, màu sắc phối mượt mà, Shields.io badges đồng bộ, hình ảnh minh họa trực quan & chuyên nghiệp tạo bởi AI model (`generate_image`).
2. **💡 Dễ hiểu (Clear & Pedagogical):** Văn phong truyền tải sư phạm thực chiến, giải thích khái niệm phức tạp bằng ví dụ ẩn dụ thực tế, chia nhỏ từng bước (step-by-step), luôn có kịch bản thử nghiệm thành công & bắt lỗi cụ thể.
3. **👁️ Trực quan (Visual-First):** Ưu tiên dùng sơ đồ luồng (Workflow/Architecture), hình ảnh UI Mockup, bảng so sánh trực quan (Comparison Tables) và khối mã nguồn luôn có nhãn file rõ ràng (`📄 path/to/file.ts`).

---

## 1. Cấu Trúc Thư Mục & Tệp Tin (Directory Structure)

- **Bài giảng lưu tại:** `docs/modules/module-0X/lesson-X.Y/`
- **File chính:** `lesson-X.Y.md` (hoặc `lesson-X.Y-slides.md` nếu là slide Marp).
- **Thư mục đồ họa đi kèm:** `docs/modules/module-0X/lesson-X.Y/assets/`
- **Tài liệu Blueprint:** `docs/00-curriculum-blueprint.md` — ⚠️ **LƯU Ý:** Chỉ chèn hyperlink `[Title](./modules/...)` cho những tệp bài giảng **thực sự đã tồn tại trên đĩa**. Các bài học chưa tạo phải giữ dạng plain text.

---

## 2. Quy Tắc Trình Bày & Nhận Diện Thị Giác (Visual & Badges)

### 🔹 Header & Badges

- Dùng thẻ `<p align="center">` cho badges và banner hình ảnh do AI model tạo để đảm bảo hiển thị căn giữa chuẩn mực trên mọi Markdown Reader (VS Code, GitHub, Obsidian).
- **Cấm:** Không dùng code SVG thủ công để vẽ banner hay biểu đồ. Mọi banner và hình ảnh minh họa đều phải sinh bằng AI model (`generate_image`).
- Mỗi bài giảng phải tạo ít nhất **01 AI-Generated Overview Banner** (tỉ lệ 16:9) lưu tại `assets/lesson_overview_banner.png` (hoặc tên tương ứng theo chủ đề) và chèn ngay dưới thanh Badges.

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

<p align="center">
  <img
    src="./assets/lesson_overview_banner.png"
    alt="Lesson Overview Banner"
    width="100%"
  />
</p>
```

### 🔹 Hộp Thông Tin (GitHub Callouts)

Sử dụng chuẩn GitHub Callout Admonitions cho các ghi chú:

- `> [!NOTE]` — Thời lượng (`⏱️ 10 - 12 phút`) & Mục tiêu bài học (`🎯 ...`).
- `> [!TIP]` — Mẹo tối ưu & Thực thi nhanh.
- `> [!WARNING]` — Hậu quả/vấn đề thường gặp trong teamwork.
- `> [!IMPORTANT]` — Kiến thức/cấu hình cốt lõi không được bỏ qua.
- `> [!CAUTION]` — Cảnh báo lỗi runtime / exit code hỏng build.

---

## 3. Quy Tắc Đồ Họa, Sơ Đồ & AI Image Generation (Assets & Visuals)

1. **Tuyệt đối KHÔNG sử dụng SVG thủ công (No Custom SVG Code):**
   - **Cấm:** Không tự viết mã nguồn XML SVG hoặc tạo file `.svg` thủ công cho banner và hình vẽ minh họa.
   - Toàn bộ hình ảnh đồ họa, banner tổng quan, concept art hay minh họa hệ thống **BẮT BUỘC phải được tạo bằng AI model** thông qua công cụ `generate_image`.

2. **Quy trình Tạo & Quản lý Ảnh AI (`generate_image` Tool):**
   - **Các trường hợp sử dụng ảnh AI:**
     - **Overview Banner:** Bắt buộc cho mỗi bài học (tỉ lệ `16:9`), phối màu nhận diện công nghệ hiện đại (NestJS Red `#E0234E`, Dark Slate/Navy `#0f172a`, đồ họa 3D isometric / tech minimalism / clean raster).
     - **Minh họa Khái niệm & Kiến trúc (Architecture & Concept Visuals):** Trực quan hóa các khái niệm trừu tượng (Dependency Injection, Middleware, Interceptors, Guards, Microservices, Caching, Event-driven,...).
     - **UI/UX Mockups:** Giao diện web app, mobile screen, REST client hoặc dashboard minh họa trực quan khi bài học đề cập đến client/frontend.
   - **Quy trình triển khai:**
     1. Gọi tool `generate_image` với `AspectRatio` (`16:9` cho banner/landscape, `4:3` hoặc `1:1` cho mockup/concept), đặt `ImageName` rõ nghĩa và viết `Prompt` chi tiết về bối cảnh kỹ thuật, tông màu, phong cách đồ họa.
     2. Sau khi ảnh được sinh vào thư mục artifact của phiên làm việc, sao chép/di chuyển file ảnh vào thư mục `assets/` của bài học tương ứng (VD: `cp <artifact_image_path> docs/modules/module-01/lesson-1.6/assets/lesson_overview_banner.png`).
     3. Nhúng vào file Markdown bằng thẻ `<p align="center"><img src="./assets/<filename>.png" alt="..." width="100%" /></p>` hoặc cú pháp Markdown image.
   - **Vị trí lưu trữ:** Toàn bộ file ảnh (`.png`, `.jpg`, `.webp`) phải nằm trong thư mục `assets/` của bài học tương ứng (VD: `docs/modules/module-01/lesson-1.6/assets/`).

3. **Sơ Đồ Kỹ Thuật Bằng Mermaid (Mermaid Diagrams):**
   - Mermaid là định dạng chuẩn dùng cho các sơ đồ kỹ thuật dạng văn bản (text-based): flowchart, sequence, ERD, state diagram, timeline, mindmap.
   - **Tuyệt đối KHÔNG trùng lặp sơ đồ (No Diagram Duplication):** Không đặt cả ảnh AI và sơ đồ Mermaid cùng minh họa cho cùng một workflow trong cùng một mục. Hãy chọn 1 định dạng biểu diễn trực quan và hiệu quả nhất.
   - **Quy tắc cú pháp Mermaid chuẩn mực (Strict Mermaid Rules):**
     - **Tài liệu tham khảo chính thức:** [Creating diagrams - GitHub Docs](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams)
     - Tất cả các nhãn (labels), tên node chứa ký tự đặc biệt như `&`, `:`, `()`, `.`, `/` **BẮT BUỘC phải bọc trong dấu ngoặc kép `"..."`**.
     - **Ví dụ đúng:** `Dev2 -->|"git clone & pnpm install"| Husky2`
     - **Ví dụ sai (gây lỗi Lexical error):** `Husky2 <-- git clone & pnpm install -- Dev2`
     - Sử dụng đúng chiều mũi tên chuẩn (`-->`, `-->|label|`, `---`).

---

## 4. Bố Cục Bài Học Linh Hoạt (Flexible Lesson Layout)

AI Agent không rập khuôn tiêu đề các mục, mà linh hoạt tùy chỉnh bố cục các phần thân bài dựa trên **thể loại bài học** (Overview, Setup & Tools, Core Concept, API Implementation, Real-time Chat, Security, v.v.), đảm bảo luôn bao phủ đủ 4 thành phần nền tảng:

### 📌 Khung Cấu Trúc Tổng Thể:

````markdown
# Lesson X.Y: Tên Bài Học Sinh Động & Thu Hút

<p align="center">...Shields Badges...</p>
<p align="center"><img src="./assets/lesson_overview_banner.png" alt="Lesson Overview Banner" width="100%" /></p>

---

> [!NOTE]
> ⏱️ **Thời lượng dự kiến:** 10 – 15 phút  
> 🎯 **Mục tiêu bài học:** ...

---

<!-- NỘI DUNG CHÍNH (Linh hoạt từ 2 - 4 mục tùy thể loại bài học) -->

## 1. [Tên Mục Lý Thuyết / Đặt Vấn Đề / Tổng Quan]

...Khái niệm, bảng so sánh, sơ đồ Mermaid / Hình ảnh AI minh họa...

## 2. [Tên Mục Quy Trình / Kiến Trúc / Cấu Hình Cốt Lõi]

...Giải thích workflow, kiến trúc, sơ đồ hoặc kịch bản chi tiết...

## 3. [Tên Mục Hướng Dẫn Thực Hành Step-by-Step]

...Các bước triển khai code rõ ràng...
...Luôn gán nhãn file phía trên khối code: 📄 **`path/to/file.ts`**...

## 4. [Tên Mục Kịch Bản Kiểm Tra & Thử Nghiệm (Hands-on Lab)]

### 🟢 Kịch Bản 1: Thành Công (Success Flow)

### 🔴 Kịch Bản 2: Kiểm Thử Lỗi & Ngăn Chặn (Blocked/Error Flow)

---

<!-- KẾT THÚC BÀI HỌC (Chuẩn hóa cố định) -->

## 5. Tổng Kết Bài Học & Checklist Ghi Nhớ

```mermaid
mindmap
  root((Tên bài học))
    ...
```
````

### ✅ Checklist Ghi Nhớ Bài Học:

- [x] Đã hiểu...
- [x] Đã thực hành...

---

👉 **Bài tiếp theo:** [Lesson X.Z: Tên bài tiếp](../lesson-X.Z/lesson-X.Z.md)

````

---

## 5. Gán Nhãn Code Block & Lệnh Terminal

- Mỗi khối code block phải có nhãn tên file in đậm rõ ràng phía trên:
  📄 **`package.json`**
  ```json
  ...
````

- Mọi lệnh terminal phải ghi rõ package manager đang dùng trong dự án (`pnpm` thay vì `npm` mặc định, ngoại trừ lệnh toàn cục `npm i -g`).
