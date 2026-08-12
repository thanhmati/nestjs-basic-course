# Kịch Bản Giảng Dạy (Teaching Script) - Lesson 1.9 (Section 1 & Section 2)

> **Bài học:** Lesson 1.9: Controller, Service, Module & Dependency Injection (DI) cơ bản  
> **Thời lượng phần này:** ~5 - 7 phút  
> **Phong cách giảng dạy:** Thực chiến, cuốn hút, lấy ẩn dụ đời sống thực tế, phân tích hình ảnh trực quan.

---

## 🎬 Phân Cảnh 1: Lời Mở Đầu & Mục Tiêu (Intro)

- **[Hình ảnh slide/Visual]:** Màn hình hiển thị Slide 1 (Lesson 1.9 Title) & Banner Overview (`lesson_overview_banner.svg`).
- **[Hành động GIẢNG VIÊN]:** Xuất hiện góc webcam (hoặc giọng đọc Voiceover ấm áp, hào hứng).

🎙️ **Lời thoại Giảng viên:**

> "Xin chào tất cả các bạn! Chào mừng các bạn quay trở lại với khóa học **NestJS Thực Chiến: Xây Dựng API Từ Cơ Bản Đến Nâng Cao**."
>
> "Ở các bài học trước, chúng ta đã cùng nhau làm chủ bộ công cụ chuẩn hóa code quality từ ESLint, Prettier cho đến Husky và Commitlint. Đó là phần nền móng giúp team của bạn làm việc mượt mà."
>
> "Bắt đầu từ bài học hôm nay, chúng ta sẽ chính thức bước vào **trái tim kiến trúc của NestJS**! Các bạn sẽ cùng tôi thấu hiểu **Bộ ba nguyên tử: Module - Controller - Service** và giải mã một trong những khái niệm 'quyền lực' nhất trong phát triển phần mềm hiện đại — đó chính là **Dependency Injection (DI)**."
>
> "Hãy cùng tôi khám phá ngay bây giờ nhé!"

---

## 🎬 Phân Cảnh 2: Section 1 - Bộ Ba Kiến Trúc Cốt Lõi (Module, Controller, Service)

- **[Hình ảnh slide/Visual]:** Chuyển sang Slide 2 (Bộ Ba Kiến Trúc Cốt Lõi) với 3 thẻ màu đại diện cho Controller (Xanh dương), Service (Xanh lá) và Module (Vàng).

🎙️ **Lời thoại Giảng viên:**

> "Các bạn thân mến, khi nhìn vào một ứng dụng NestJS, bạn sẽ thấy nó không viết tất cả code gom chung vào một file bộc phát như ExpressJS cơ bản. NestJS áp dụng triệt để nguyên lý **Separation of Concerns** — nghĩa là _tách biệt trách nhiệm_."
>
> "Hãy hình dung hệ thống của chúng ta giống như một **Nhà Hàng Sang Trọng**:"
>
> 1. **Thành phần thứ nhất - Controller (`@Controller`):**  
>    _"Controller giống như người **Bồi bàn / Tiếp tân** đứng ở sảnh. Khi thực khách (tức là HTTP Client) đến và đưa ra yêu cầu (Request) như GET hay POST, Controller sẽ tiếp nhận, kiểm tra xem khách đi mấy người, yêu cầu món gì (Validate DTO). Tuy nhiên, Bồi bàn **không bao giờ tự mình xuống bếp nấu ăn**! Họ chỉ nhận đơn và chuyển tiếp xuống cho nhà bếp."_
>
> 2. **Thành phần thứ hai - Service / Provider (`@Injectable`):**  
>    _"Service chính là **Đầu bếp trưởng** trong nhà bếp. Đây là nơi chứa toàn bộ **Business Logic** — nơi chế biến món ăn, truy vấn CSDL PostgreSQL, mã hóa mật khẩu hay kết nối dịch vụ thanh toán. Đầu bếp chế biến xong sẽ chuyển món ăn lại cho Bồi bàn để mang ra cho khách."_
>
> 3. **Thành phần thứ ba - Module (`@Module`):**  
>    _"Module chính là **Khung gian bếp hay Tòa nhà** bao bọc toàn bộ tiếp tân và đầu bếp của một khu vực. Module có nhiệm vụ đóng gói tất cả các thành phần liên quan lại thành một khối độc lập."_

- **[Hình ảnh slide/Visual]:** Làm nổi bật dòng cảnh báo **Quy Tắc Vàng (Golden Rule)** trên màn hình.

🎙️ **Lời thoại Giảng viên:**

> ⚠️ _"Hãy ghi nhớ **Quy tắc vàng** này giúp tôi: **Controller tuyệt đối không được xử lý logic nghiệp vụ nặng**! Nếu các bạn viết câu lệnh truy vấn Database hay tính toán tiền hàng trực tiếp trong Controller, code của bạn sẽ nhanh chóng trở thành một 'nồi lẩu thập cẩm' vô cùng khó bảo trì. Controller chỉ đóng vai trò điều hướng!"_

---

## 🎬 Phân Cảnh 3: Section 2 - Giải Mã Dependency Injection (DI) & IoC Container

- **[Hình ảnh slide/Visual]:** Chuyển sang Slide 3 & Hiển thị sơ đồ kiến trúc `nestjs_di_architecture.svg`.
- **[Hành động GIẢNG VIÊN]:** Zoom cận cảnh đoạn mã so sánh `new UsersService()` vs `Constructor Injection`.

🎙️ **Lời thoại Giảng viên:**

> "Bây giờ, câu hỏi đặt ra là: _Bồi bàn (Controller) muốn dùng Đầu bếp (Service) thì làm thế nào?_"
>
> "Theo cách lập trình hướng đối tượng truyền thống, các bạn sẽ nghĩ ngay đến việc khởi tạo:  
> `private usersService = new UsersService();`"
>
> "Nhưng cách làm này mang lại **hậu quả cực kỳ nghiêm trọng**! Nó tạo ra sự **Tight Coupling** (phụ thuộc chặt chẽ). Hãy tưởng tượng mỗi lần Bồi bàn đi ca làm việc lại phải _tự sinh ra một đầu bếp mới_, điều này gây lãng phí bộ nhớ khủng khiếp và sau này bạn **không thể nào viết Unit Test** để giả lập (Mock) dữ liệu được."

- **[Hình ảnh slide/Visual]:** Đổi sang sơ đồ luồng 3 bước của NestJS IoC Container.

🎙️ **Lời thoại Giảng viên:**

> "Và đây chính là lúc **NestJS Dependency Injection (DI)** tỏa sáng thông qua **IoC Container** (Inversion of Control - Đảo ngược điều khiển)!"
>
> "Hãy nhìn vào sơ đồ 3 bước trên màn hình:"
>
> "📌 **Bước 1 - Đăng ký:** Khi chúng ta gắn decorator `@Injectable()` lên `UsersService` và đưa nó vào danh sách `providers: [UsersService]` của `UsersModule`, chúng ta đang nói với NestJS rằng: _'Hãy quản lý Service này giúp tôi!'_"
>
> "📌 **Bước 2 - Khởi tạo Singleton:** Khi ứng dụng khởi chạy, NestJS IoC Container sẽ tự động tạo duy nhất **01 Instance (bản thể)** của `UsersService` trong bộ nhớ RAM."
>
> "📌 **Bước 3 - Tiêm phụ thuộc (Inject):** Khi `UsersController` khai báo nhu cầu ở hàm khởi tạo:  
> `constructor(private readonly usersService: UsersService) {}`  
> NestJS sẽ tự động tìm bản thể `UsersService` đã tạo sẵn và **'tiêm' (inject)** vào cho Controller dùng."
>
> "Lập trình viên chúng ta **hoàn toàn không dùng từ khóa `new`** nữa! Mọi việc quản lý vòng đời đã có NestJS IoC Container lo liệu từ A đến Z."

---

## 🎬 Phân Cảnh 4: Chuyển Tiếp Sang Thực Hành (Transition to Section 3)

- **[Hình ảnh slide/Visual]:** Màn hình chuyển sang giao diện VS Code & Terminal chuẩn bị gõ lệnh Nest CLI.

🎙️ **Lời thoại Giảng viên:**

> "Lý thuyết nghe thật tuyệt vời phải không nào? Nhưng 'Nói có sách, mách có chứng' — ngay sau đây, ở Section 3, tôi và các bạn sẽ mở Terminal lên, sử dụng **Nest CLI** để tự tay khởi tạo một Module `Users` hoàn chỉnh và kiểm chứng luồng hoạt động của Dependency Injection nhé!"
>
> "Hãy cùng bước sang phần thực hành ngay thôi nào!"

---
