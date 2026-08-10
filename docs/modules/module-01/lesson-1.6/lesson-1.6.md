# Lesson 1.6: Git Hooks & Tự Động Hóa Kiểm Tra Code Với Husky

> **Thời lượng dự kiến:** 10 – 12 phút  
> **Mục tiêu bài học:** Nắm vững khái niệm Git Hooks, hiểu lý do cần sử dụng Husky v9 và thực hành khởi tạo, cấu hình tệp `.husky/pre-commit` để tự động hóa việc linter/testing trước khi lưu mã nguồn vào Git.

---

## 1. Khái Niệm Git Hooks & Tại Sao Cần Husky?

### Git Hooks Là Gì?

**Git Hooks** là các kịch bản (scripts) được Git tự động kích hoạt khi có một sự kiện quan trọng diễn ra trong tiến trình làm việc với Git, ví dụ:
- `pre-commit`: Kích hoạt trước khi lệnh `git commit` thực thi.
- `commit-msg`: Kích hoạt khi kiểm tra định dạng của thông điệp commit.
- `pre-push`: Kích hoạt trước khi lệnh `git push` đẩy mã nguồn lên kho lưu trữ từ xa.

### Bài Toán Đặt Ra Với Git Hooks Mặc Định

Mặc định, các file hooks của Git nằm trong thư mục ẩn `.git/hooks/`. Tuy nhiên, thư mục `.git/` **không bao giờ được đẩy (push) lên kho lưu trữ từ xa** (Remote Repository).

> ⚠️ **Hậu quả:** Nếu bạn viết kịch bản kiểm tra code trong `.git/hooks/` trên máy cá nhân, các thành viên khác trong team sẽ **không nhận được cấu hình này**, khiến việc chuẩn hóa code quality bị thất bại.

### Giải Pháp: Husky (v9)

**Husky** là thư viện phổ biến nhất trong hệ sinh thái Node.js/TypeScript giúp đồng bộ hóa các Git Hooks dễ dàng:
- Đưa toàn bộ kịch bản kiểm tra vào thư mục `.husky/` nằm ngay trong dự án.
- Thư mục `.husky/` được commit và đẩy lên Git như mã nguồn bình thường.
- Mọi thành viên khi `git clone` dự án và chạy `pnpm install` sẽ tự động có đầy đủ các Git Hooks.

---

## 2. Các Bước Cài Đặt & Khởi Tạo Husky v9

### Bước 1: Kiểm Tra Git Repository

Đảm bảo dự án NestJS của bạn đã được khởi tạo Git. Nếu chưa, hãy mở Terminal tại thư mục `nestjs-basic-course` và chạy:

```bash
git init
```

---

### Bước 2: Cài Đặt Husky Package

Sử dụng `pnpm` để cài đặt Husky vào danh sách `devDependencies`:

```bash
pnpm add --save-dev husky
```

---

### Bước 3: Khởi Tạo Cấu Hình Husky v9

Khởi tạo cấu hình tự động với câu lệnh chuẩn từ tài liệu chính thức của Husky:

```bash
pnpm exec husky init
```

*(Lưu ý: Nếu sử dụng npm/npx, câu lệnh tương đương là `npx husky init`)*.

---

### Tự Động Hóa 3 Tác Vụ Của `husky init`:

Sau khi chạy lệnh trên, Husky sẽ tự động thực hiện 3 công việc:

1. **Tạo thư mục `.husky/`:** Lưu trữ toàn bộ các Git hooks của dự án.
2. **Tạo file mẫu `.husky/pre-commit`:** Chứa câu lệnh mẫu chạy thử nghiệm.
3. **Cập nhật `package.json`:** Tự động thêm script `"prepare": "husky"`.

Kiểm tra file `package.json`, bạn sẽ thấy mục `scripts` xuất hiện dòng lệnh mới:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

> 💡 **Ý nghĩa của script `"prepare": "husky"`:** Khi đồng nghiệp tải dự án về và chạy `pnpm install`, npm/pnpm sẽ tự động chạy script `prepare` này để kích hoạt Git Hooks trên máy của họ mà không cần cấu hình thủ công.

---

## 3. Cấu Hình Hook `.husky/pre-commit`

Mở file `.husky/pre-commit` vừa được tạo trong VS Code. Bạn sẽ thấy câu lệnh mặc định:

```bash
pnpm test
```

Hãy thay đổi nội dung file `.husky/pre-commit` thành lệnh quét linter của NestJS để đảm bảo code sạch trước khi commit:

```bash
pnpm lint
```

*(Giải thích: Lệnh `pnpm lint` sẽ chạy ESLint quét toàn bộ mã nguồn TypeScript trong thư mục `src/`).*

---

## 4. Thực Hành Kiểm Trả Tính Năng Của Husky

### Thử Nghiệm 1: Commit Với Code Sạch (Thành Công)

1. Thêm các file thay đổi vào Staging Area:
   ```bash
   git add .
   ```
2. Thực hiện commit:
   ```bash
   git commit -m "chore: setup husky pre-commit hook"
   ```
3. **Quan sát Terminal:** Bạn sẽ thấy Husky tự động gọi `pnpm lint` chạy trước. Nếu không có lỗi, lệnh commit sẽ hoàn tất thành công.

---

### Thử Nghiệm 2: Commit Khi Có Lỗi Syntax/Lint (Bị Chặn)

Để chứng minh Husky hoạt động, hãy cố tình tạo ra một lỗi linter:

1. Mở file `src/app.controller.ts`.
2. Khai báo một biến thừa không sử dụng ở đầu hàm `getHello()`:
   ```typescript
   @Get()
   getHello(): string {
     const unusedVariable = 'I am a bug'; // Biến thừa không sử dụng
     return this.appService.getHello();
   }
   ```
3. Lưu file và chạy lệnh commit:
   ```bash
   git add .
   git commit -m "test: try committing unused variable"
   ```

4. **Kết quả trên Terminal:**
   ```text
   > nestjs-basic-course@0.0.1 lint /Users/tanthanh/Documents/Project/nestjs-basic-course
   > eslint "{src,apps,libs,test}/**/*.ts" --fix

   /Users/tanthanh/Documents/Project/nestjs-basic-course/src/app.controller.ts
     7:11  error  'unusedVariable' is assigned a value but never used  @typescript-eslint/no-unused-vars

   ✖ 1 problem (1 error, 0 warnings)

   husky - pre-commit script failed (code 1)
   ```

Husky đã phát hiện lỗi ESLint và **lập tức hủy bỏ lệnh commit** (`pre-commit script failed`). Lịch sử Git của bạn hoàn toàn chưa bị ghi nhận commit rác này.

5. **Khắc phục:** Xóa dòng biến thừa `unusedVariable`, lưu file và thực hiện `git commit` lại. Lệnh commit sẽ vượt qua thành công!
