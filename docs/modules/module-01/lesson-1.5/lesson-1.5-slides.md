---
marp: true
theme: default
paginate: true
header: 'NestJS Thực Chiến | Module 1 - Lesson 1.5: Teamwork Standards'
footer: '© Udemy Masterclass'
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
  .text-problem {
    color: #f43f5e;
  }
  .text-solution {
    color: #38bdf8;
  }
---

<!-- slide 1: Title -->

# Lesson 1.5: Teamwork Standards

### Vấn Đề Thường Gặp Trong Teamwork & Chuẩn Hóa Code Quality

- **Khóa học:** NestJS Thực Chiến: Xây Dựng API Từ Cơ Bản Đến Nâng Cao
- **Subtitle:** NestJS & TypeScript Thực Chiến: Xây Dựng Real-time Chat App với PostgreSQL, Prisma, WebSockets & Docker
- **Thời lượng:** ~3 - 5 phút

---

<!-- slide 2: Common Problems -->

# 3 Thách Thức Khi Làm Việc Nhóm

<div class="grid-2">
  <div>
    <ul>
      <li><strong>Code Style Không Thống Nhất</strong>:<br/>Mỗi dev một kiểu format (tab/space, dấu phẩy).</li>
      <br/>
      <li><strong>Cảnh Báo Lint Bị Ngó Lơ</strong>:<br/>Để lọt kiểu <code>any</code>, thừa biến, rò rỉ <code>console.log</code>.</li>
      <br/>
      <li><strong>Commit Message Tùy Tiện</strong>:<br/>Đặt tên commit vô nghĩa như <code>"fix bug"</code>, <code>"update"</code>.</li>
    </ul>
  </div>

  <div style="text-anchor: center;">
    <img src="./assets/teamwork_problems.svg" width="100%" />
  </div>
</div>

<!--
Speaker Notes:
Xin chào các bạn! Khi làm việc một mình, bạn có thể viết code tùy ý. Tuy nhiên khi làm việc nhóm từ 3-10 người trở lên, nếu không có quy chuẩn tự động thì dự án sẽ rất nhanh chóng trở nên hỗn loạn.
-->

---

<!-- slide 3: Impacts -->

# Hậu Quả Của Việc Thiếu Chuẩn Hóa

<div class="grid-2">
  <div class="card">
    <div class="card-title text-problem">Lãng Phí Nỗ Lực Code Review</div>
    <ul>
      <li>Tech Lead phải bắt từng lỗi thụt lề, dấu chấm phẩy.</li>
      <li>Giảm 50% hiệu suất review logic nghiệp vụ thực tế.</li>
    </ul>
  </div>

  <div class="card">
    <div class="card-title text-problem">Git Diff Bị Nhiễu Sạn</div>
    <ul>
      <li>Sửa 1 dòng code nhưng Git ghi nhận thay đổi 500 dòng do auto-format lệch nhau.</li>
      <li>Khó truy vết lịch sử commit khi cần Rollback.</li>
    </ul>
  </div>
</div>

> **Thực tế ngành:** 80% thời gian của lập trình viên là đọc & bảo trì mã nguồn của đồng nghiệp.

<!--
Speaker Notes:
Hãy hình dung khi bạn review một Pull Request, thay vì xem logic đúng hay sai, bạn phải soi từng dấu chấm phẩy. Điều này làm giảm hiệu suất làm việc của cả tập thể.
-->

---

<!-- slide 4: Automated Solution -->

# Giải Pháp Tự Động Hóa (Automation First)

<div class="grid-2">
  <div>
    <ul>
      <li><strong>Ngăn chặn từ gốc (Pre-commit Hook)</strong>:<br/>Chặn đứng code không chuẩn ngay trên máy dev trước khi gõ lệnh commit.</li>
      <br/>
      <li><strong>3 Lớp Kiểm Soát</strong>:
        <ol>
          <li><strong>ESLint</strong>: Quét lỗi cú pháp & code smells.</li>
          <li><strong>Prettier</strong>: Tự động định dạng code thống nhất.</li>
          <li><strong>Commitlint</strong>: Ép tuân thủ Conventional Commits.</li>
        </ol>
      </li>
    </ul>
  </div>

  <div>
    <img src="./assets/teamwork_code_quality.svg" width="100%" />
  </div>
</div>

<!--
Speaker Notes:
Giải pháp tối ưu nhất là cài đặt công cụ tự động kiểm tra và chặn lại ngay tại máy cá nhân nếu code chưa đạt tiêu chuẩn.
-->

---

<!-- slide 5: Tooling Stack -->

# Bộ Công Cụ Triển Khai Trong Module 1

<div class="grid-2">
  <div class="card">
    <div class="card-title text-solution">Code Formatter & Linter</div>
    <ul>
      <li><strong>ESLint:</strong> Phân tích tĩnh mã nguồn TypeScript.</li>
      <li><strong>Prettier:</strong> Tự động định dạng code nhất quán khi lưu.</li>
    </ul>
  </div>

  <div class="card">
    <div class="card-title text-solution">Git Automation & Commit Rules</div>
    <ul>
      <li><strong>Husky:</strong> Tự động kích hoạt script khi chạy lệnh Git.</li>
      <li><strong>Lint-staged:</strong> Chỉ quét lint trên các tệp tin đang được commit.</li>
      <li><strong>Commitlint:</strong> Kiểm tra định dạng commit message.</li>
    </ul>
  </div>
</div>

<!--
Speaker Notes:
Trong các bài học tiếp theo của Module 1, chúng ta sẽ lần lượt thiết lập trọn bộ 5 công cụ này cho dự án backend NestJS.
-->

---

<!-- slide 6: Summary & Next Step -->

# Tổng Kết & Bước Tiếp Theo

### Key Takeaways:

1. **Chuẩn hóa Code Quality** là bắt buộc cho dự án Enterprise & Teamwork.
2. Tự động hóa quá trình kiểm tra format & linting thông qua **Git Hooks**.
3. Đảm bảo mã nguồn luôn sạch trước khi đẩy (push) lên Git repository.

---

### Bài học tiếp theo: **Lesson 1.6 - Git Hooks & Husky**

> Chúng ta sẽ bắt tay vào **cấu hình Husky để tự động kiểm tra code** mỗi khi gõ lệnh `git commit`!

<!--
Speaker Notes:
Hẹn gặp lại các bạn trong Lesson 1.6, nơi chúng ta sẽ cài đặt và cấu hình thành công Husky cho dự án!
-->
