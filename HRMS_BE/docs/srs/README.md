# 📋 Software Requirements Specification (SRS) - HRMS Backend

Tài liệu Đặc tả Yêu cầu Phần mềm (Software Requirements Specification - SRS) cho hệ thống **HRMS (Human Resource Management System) Backend**. Tài liệu này mô tả chi tiết các tác nhân (Actors), ma trận phân quyền, đặc tả 12 phân hệ nghiệp vụ chức năng (F01 - F12) và các yêu cầu phi chức năng của hệ thống.

---

## 1. Tổng Quan Hệ Thống (System Overview)

Hệ thống **HRMS** là giải pháp phần mềm quản trị nguồn nhân lực toàn diện cho doanh nghiệp vừa và lớn, số hóa toàn bộ vòng đời của nhân viên (Employee Lifecycle): từ tuyển dụng, tiếp nhận hồ sơ, quản lý nhân sự, chấm công khuôn mặt/hình ảnh, xếp ca, duyệt đơn nghỉ phép/tăng ca, tính lương tự động, quản lý tài sản đến báo cáo thống kê cho ban giám đốc.

### Mục Tiêu Chính
- **Tập trung hóa dữ liệu nhân sự:** Đồng bộ tài khoản người dùng, hồ sơ nhân sự, phòng ban và chức danh.
- **Tự động hóa chấm công & xếp ca:** Hỗ trợ ca linh hoạt, tính thời gian đi muộn/về sớm, lưu ảnh minh chứng qua cloud.
- **Quy trình phê duyệt số:** Số hóa quy trình duyệt đơn nghỉ phép, đơn làm thêm giờ (OT) không cần giấy tờ.
- **Chính xác hóa tính lương (Payroll):** Tính lương theo chu kỳ tự động kết hợp lương cơ bản, giờ OT, phụ cấp và giảm trừ.
- **Bảo mật & Phân quyền:** Triển khai cơ chế kiểm soát truy cập dựa trên vai trò (Role-Based Access Control - RBAC) qua JWT Bearer Token.

---

## 2. Đối Tượng Người Dùng & Phân Quyền (Actors & Roles)

Hệ thống định nghĩa 6 nhóm người dùng chính (Roles) được lưu trong bảng `roles`:

| Mã Role | Tên vai trò | Mô tả phạm vi quyền hạn |
| :--- | :--- | :--- |
| **`ADMIN`** | Quản trị viên hệ thống | Toàn quyền kiểm soát hệ thống: quản lý tài khoản người dùng, phân quyền, quản lý tổ chức, cấu hình hệ thống, phê duyệt cấp cao. |
| **`HR`** | Chuyên viên Nhân sự | Quản lý hồ sơ nhân viên, tổ chức phòng ban/chức vụ, chiến dịch tuyển dụng, duyệt hồ sơ ứng viên, phân bổ tài sản, theo dõi chấm công toàn công ty. |
| **`MANAGER`** | Trưởng bộ phận / Quản lý | Xem danh sách ca làm việc của bộ phận, duyệt/từ chối đơn xin nghỉ phép và đơn làm thêm giờ (OT) của nhân viên cấp dưới. |
| **`PAYROLL`** | Kế toán tiền lương | Khởi chạy tiến trình tính toán bảng lương theo chu kỳ, cập nhật trạng thái chi trả lương (PAID/PENDING). |
| **`EMPLOYEE`** | Nhân viên | Thực hiện check-in/check-out chấm công cá nhân kèm ảnh chụp, xem lịch sử chấm công, gửi đơn nghỉ phép, gửi đơn OT, xem ca làm việc hôm nay. |
| **`CANDIDATE`** | Ứng viên tuyển dụng | Tài khoản khởi tạo tự do qua màn hình đăng ký bên ngoài, theo dõi trạng thái ứng tuyển vào các chiến dịch tuyển dụng. |

---

## 3. Ma Trận Phân Quyền Hệ Thống (Role-Permission Matrix)

Ký hiệu: 
- `✔`: Có toàn quyền truy cập / thực thi (CRUD)
- `R`: Chỉ đọc (View / Read-only)
- `P`: Quyền hạn theo phạm vi cá nhân (Personal / Self-service)
- `A`: Quyền duyệt / cập nhật trạng thái (Approval / Status change)
- `-`: Không có quyền truy cập

| Mã Module | Tên Module / Phân Hệ | ADMIN | HR | MANAGER | PAYROLL | EMPLOYEE | CANDIDATE |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **F01** | Xác thực & Phiên (Auth) | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| **F02** | Quản lý Tài khoản (Accounts) | ✔ | - | - | - | - | - |
| **F03** | Hồ sơ Nhân viên (Employees) | ✔ | ✔ | R | R | R (Xem) | - |
| **F04** | Phòng ban & Chức vụ (Dept & Pos) | ✔ | ✔ | R | R | - | - |
| **F05** | Chấm công cá nhân (Attendance Self) | ✔ | ✔ | ✔ | ✔ | P (Check-in/out) | - |
| **F05** | Quản lý Chấm công (Attendance Mgmt) | ✔ | ✔ | R | R | - | - |
| **F06** | Quản lý Ca làm việc (Shifts) | ✔ | ✔ | ✔ | - | R (Hôm nay) | - |
| **F06** | Phân ca làm việc (Shift Assignment)| ✔ | ✔ | ✔ | - | P (Xem ca) | - |
| **F07** | Đơn Nghỉ phép (Leave Requests) | ✔ | ✔ | A (Duyệt) | - | P (Gửi đơn) | - |
| **F08** | Đơn Tăng ca OT (Overtime Requests) | ✔ | ✔ | A (Duyệt) | - | P (Gửi đơn) | - |
| **F09** | Bảng lương (Payroll Calculation) | ✔ | - | - | ✔ | P (Phiếu lương)| - |
| **F10** | Chiến dịch Tuyển dụng (Recruitment)| ✔ | ✔ | R | - | - | - |
| **F10** | Hồ sơ Ứng viên (Candidates) | ✔ | ✔ | R | - | - | P (Hồ sơ) |
| **F11** | Quản lý Tài sản (Assets) | ✔ | ✔ | R | - | P (Tài sản nhận)| - |
| **F12** | Bảng điều khiển (Dashboard & Stats)| ✔ | ✔ | ✔ | ✔ | - | - |

---

## 4. Đặc Tả Chi Tiết Yêu Cầu Chức Năng (Functional Requirements)

### 📌 F01: Xác thực & Quản lý Phiên (Authentication & Session Management)
- **Mục tiêu:** Cung cấp cơ chế định danh và bảo vệ tài nguyên hệ thống thông qua chuẩn JSON Web Token (JWT).
- **Yêu cầu chi tiết:**
  - **F01.1 Đăng nhập (Login):** Người dùng nhập Email và Mật khẩu. Hệ thống kiểm tra mật mã (BCrypt), xác minh trạng thái tài khoản `ACTIVE`. Trả về `accessToken` (thời hạn 15 phút), `refreshToken` (thời hạn 7 ngày) và thông tin cá nhân.
  - **F01.2 Đăng ký (Register):** Cho phép người dùng mới tạo tài khoản với vai trò mặc định `CANDIDATE`. Kiểm tra trùng lặp email và username.
  - **F01.3 Gia hạn Token (Refresh Token):** Khi `accessToken` hết hạn, client gửi `refreshToken` hợp lệ để nhận một `accessToken` mới mà không cần đăng nhập lại.
  - **F01.4 Đổi mật khẩu (Change Password):** Người dùng đã đăng nhập có thể đổi mật khẩu cá nhân bằng cách cung cấp mật khẩu cũ và mật khẩu mới.
  - **F01.5 Đăng xuất (Logout):** Thu hồi và xóa `refreshToken` khỏi cơ sở dữ liệu để vô hiệu hóa phiên làm việc.

---

### 📌 F02: Quản lý Tài khoản & Phân quyền (Account Management)
- **Mục tiêu:** Dành riêng cho `ADMIN` để kiểm soát tất cả tài khoản người dùng trong hệ thống.
- **Yêu cầu chi tiết:**
  - **F02.1 Danh sách tài khoản:** Liệt kê toàn bộ người dùng kèm theo quyền hạn (`Role`) và trạng thái (`ACTIVE` / `INACTIVE`).
  - **F02.2 Danh sách tài khoản chưa gán (`unassigned`):** Lọc các tài khoản hệ thống chưa được liên kết với hồ sơ nhân viên (`Employee`), phục vụ việc tạo hồ sơ nhân viên mới.
  - **F02.3 Xem chi tiết & Cập nhật:** Chỉnh sửa thông tin email, gán lại vai trò (Role), số tài khoản ngân hàng.
  - **F02.4 Bật/Tắt trạng thái tài khoản (`toggle-status`):** Khóa hoặc mở khóa tài khoản người dùng ngay lập tức.
  - **F02.5 Xóa tài khoản:** Xóa tài khoản khi không còn nhu cầu sử dụng.

---

### 📌 F03: Quản lý Hồ sơ Nhân viên (Employee Records Management)
- **Mục tiêu:** Quản trị hồ sơ lý lịch, dữ liệu pháp lý và quan hệ công tác của nhân sự.
- **Yêu cầu chi tiết:**
  - **F03.1 Tạo mới hồ sơ nhân viên:** Liên kết tài khoản `User`, lưu trữ Họ tên, Số Căn cước công dân (CCCD - duy nhất), Phòng ban, Chức vụ, Ngày vào làm việc, Mức lương cơ bản và Số tài khoản thanh toán lương.
  - **F03.2 Danh sách & Tìm kiếm nhân viên:** Hiển thị danh sách toàn bộ cán bộ nhân viên với đầy đủ thông tin phòng ban, chức vụ hiện tại.
  - **F03.3 Cập nhật thông tin nhân viên:** Cập nhật thông tin công tác, điều chuyển phòng ban, thăng tiến chức vụ hoặc điều chỉnh mức lương.
  - **F03.4 Xóa hồ sơ:** Hỗ trợ xóa hồ sơ nhân viên (ràng buộc toàn vẹn khóa ngoại với dữ liệu liên quan).

---

### 📌 F04: Quản lý Cơ cấu Tổ chức: Phòng ban & Chức vụ (Organization Structure)
- **Mục tiêu:** Thiết lập sơ đồ tổ chức doanh nghiệp gồm các phòng ban và thang bậc chức danh.
- **Yêu cầu chi tiết:**
  - **F04.1 Quản lý Phòng ban (Departments):**
    - Thêm/sửa/xóa phòng ban với Mã phòng ban (`department_code` - duy nhất), Tên phòng ban, Mô tả.
    - Bổ nhiệm Trưởng phòng (`manager_id` liên kết đến `Employee`).
    - Bật/tắt trạng thái hoạt động của phòng ban (`is_active`).
  - **F04.2 Quản lý Chức vụ (Positions):**
    - Thiết lập danh mục chức vụ (Tên chức vụ, Ngạch/Bậc lương `salary_grade`, Trạng thái `active`).

---

### 📌 F05: Chấm công & Ghi nhận Thời gian (Time & Attendance Tracking)
- **Mục tiêu:** Ghi nhận thời gian bắt đầu và kết thúc làm việc của nhân viên, xác thực bằng hình ảnh thực tế.
- **Yêu cầu chi tiết:**
  - **F05.1 Check-in:**
    - Nhân viên gửi yêu cầu check-in cùng mã ca làm việc (`shiftCode`) và ảnh chụp khuôn mặt (`image`).
    - Ảnh chụp được tải trực tiếp lên kho lưu trữ **Cloudinary** và lưu URL vào cơ sở dữ liệu.
    - Hệ thống so khớp thời gian check-in với giờ bắt đầu ca làm việc (`startTime`) để tự động tính số phút đi muộn (`late_minutes`).
  - **F05.2 Check-out:**
    - Nhân viên gửi yêu cầu check-out kèm mã ca và ảnh chụp.
    - Hệ thống so khớp với giờ kết thúc ca làm việc (`endTime`) để tính số phút về sớm (`early_minutes`).
  - **F05.3 Lịch sử cá nhân (`/my`):** Nhân viên theo dõi toàn bộ lịch sử chấm công, số phút muộn/sớm và ảnh minh chứng của chính mình.
  - **F05.4 Báo cáo Chấm công toàn công ty (`/all`):** Quản trị viên và HR lọc dữ liệu chấm công theo dải ngày (`startDate`, `endDate`).

---

### 📌 F06: Quản lý Ca & Phân ca Làm việc (Shifts & Scheduling)
- **Mục tiêu:** Linh hoạt định nghĩa các ca làm việc và phân bổ lịch làm việc cho từng nhân viên.
- **Yêu cầu chi tiết:**
  - **F06.1 Danh mục Ca làm việc (Shifts):** Tạo và cấu hình ca (Mã ca `shiftCode`, Tên ca, Giờ bắt đầu, Giờ kết thúc, Thời gian nghỉ giữa ca `breakDuration`).
  - **F06.2 Xem ca làm việc hôm nay (`/today`):** Tra cứu nhanh các ca làm việc hoạt động trong ngày hiện tại.
  - **F06.3 Phân ca làm việc (Shift Assignment):**
    - Phân ca hàng loạt: Chọn danh sách nhân viên (`employeeIds`), chọn mã ca (`shiftCode`) và dải ngày áp dụng (`fromDate` đến `toDate`).
    - Hệ thống tự động tạo các bản ghi phân ca cho từng ngày trong khoảng thời gian đã chọn.
  - **F06.4 Tra cứu ca cá nhân trong ngày (`/my-today`):** Nhân viên kiểm tra ca làm việc mà mình được phân bổ trong ngày hôm nay.

---

### 📌 F07: Quản lý Nghỉ phép (Leave Request Management)
- **Mục tiêu:** Quy trình gửi và phê duyệt đơn xin nghỉ phép trực tuyến.
- **Yêu cầu chi tiết:**
  - **F07.1 Gửi đơn nghỉ phép:** Nhân viên tạo đơn chọn loại nghỉ phép (Phép năm, Nghỉ ốm, Việc riêng...), ngày bắt đầu, ngày kết thúc và tổng số ngày nghỉ (`totalDays`). Trạng thái ban đầu: `PENDING`.
  - **F07.2 Phê duyệt / Từ chối đơn:** Quản lý hoặc HR cập nhật trạng thái đơn thành `APPROVED` hoặc `REJECTED`.
  - **F07.3 Quản lý đơn:** Chỉnh sửa thông tin đơn khi chưa duyệt hoặc xóa đơn nghỉ phép.

---

### 📌 F08: Quản lý Làm thêm giờ (Overtime Management)
- **Mục tiêu:** Quản lý quy trình đăng ký và xét duyệt giờ làm thêm (OT) nhằm làm cơ sở tính tiền làm thêm giờ trong bảng lương.
- **Yêu cầu chi tiết:**
  - **F08.1 Đăng ký OT:** Nhân viên gửi yêu cầu làm thêm giờ gồm ngày làm thêm (`otDate`), giờ bắt đầu (`startTime`), giờ kết thúc (`endTime`). Trạng thái ban đầu: `PENDING`.
  - **F08.2 Phê duyệt OT:** Quản lý xem xét, cập nhật trạng thái (`APPROVED` / `REJECTED`) và nhập số giờ làm thêm thực tế được duyệt (`approvedHours`).

---

### 📌 F09: Quản lý & Tính toán Bảng lương (Payroll Management)
- **Mục tiêu:** Tự động hóa tính toán lương hàng tháng cho toàn bộ nhân viên công ty.
- **Yêu cầu chi tiết:**
  - **F09.1 Tính toán bảng lương theo chu kỳ (`/calculate`):**
    - Nhập kỳ lương theo định dạng `yyyy-MM` (Ví dụ: `2026-10`).
    - Hệ thống tự động lấy mức lương cơ bản (`basicSalary`) của nhân viên.
    - Tổng hợp số giờ OT được duyệt trong kỳ để tính tiền làm thêm (`overtimePay`).
    - Tính toán phụ cấp (`allowance`), các khoản giảm trừ phạt đi muộn/nghỉ không phép (`deductions`).
    - Tính mức lương thực nhận: `netSalary = basicSalary + allowance + overtimePay - deductions`.
  - **F09.2 Cập nhật trạng thái thanh toán:** Cho phép `ADMIN` hoặc `PAYROLL` đổi trạng thái bảng lương (`PENDING`, `CONFIRMED`, `PAID`).
  - **F09.3 Xem danh sách bảng lương:** Báo cáo chi tiết bảng lương từng nhân viên theo kỳ.

---

### 📌 F10: Tuyển dụng & Tiếp nhận Ứng viên (Recruitment & Onboarding)
- **Mục tiêu:** Quản lý các chiến dịch tuyển dụng và quy trình chuyển đổi ứng viên trúng tuyển thành nhân viên.
- **Yêu cầu chi tiết:**
  - **F10.1 Chiến dịch Tuyển dụng (Recruitment Campaigns):** Tạo chiến dịch gắn liền với vị trí/chức vụ cần tuyển, số lượng cần tuyển (`quantityNeeded`), hạn chót nộp hồ sơ (`deadline`) và mô tả công việc.
  - **F10.2 Tiếp nhận Hồ sơ Ứng viên (Candidates):** Ghi nhận thông tin ứng viên (Họ tên, Email, Link file CV `cvFileUrl`, Nguồn tuyển dụng, Trạng thái: `APPLIED`, `INTERVIEWING`, `PASSED`, `REJECTED`).
  - **F10.3 Phê duyệt & Chuyển đổi Nhân viên (Approve & Onboard):**
    - Khi ứng viên trúng tuyển, HR thực hiện chức năng `approveCandidate`.
    - Hệ thống tự động kích hoạt tài khoản nhân viên, gán Mã nhân viên (`employeeCode`), Phòng ban, Chức vụ, Quyền hạn (`Role`), số CCCD và tạo mới bản ghi `Employee` hoàn chỉnh.

---

### 📌 F11: Quản lý Cấp phát Tài sản (Asset Management)
- **Mục tiêu:** Kiểm kê và quản lý việc bàn giao trang thiết bị làm việc cho nhân viên.
- **Yêu cầu chi tiết:**
  - **F11.1 Danh mục Tài sản:** Quản lý danh sách tài sản công ty (Tên tài sản, Loại tài sản: Laptop, Màn hình, Xe máy..., Trạng thái: `AVAILABLE`, `ASSIGNED`, `BROKEN`).
  - **F11.2 Cấp phát & Thu hồi:** Ghi nhận việc bàn giao tài sản cho nhân viên cụ thể theo ngày (`allocatedDate`) và ngày hoàn trả (`returnedDate`).

---

### 📌 F12: Bảng điều khiển & Thống kê Quản trị (Dashboard & Analytics)
- **Mục tiêu:** Cung cấp báo cáo trực quan nhanh cho ban lãnh đạo và bộ phận nhân sự.
- **Yêu cầu chi tiết:**
  - **F12.1 Chỉ số thống kê (`/stats`):** Tổng số lượng nhân viên hiện tại (`totalEmployees`), số lượng nhân sự đang trong chế độ nghỉ phép hôm nay (`onLeave`), tổng số yêu cầu chờ duyệt (`pendingRequests`).

---

## 5. Yêu Cầu Phi Chức Năng (Non-Functional Requirements)

| Mã Yêu Cầu | Hạng mục | Chi tiết đặc tả |
| :--- | :--- | :--- |
| **NFR-01** | **Bảo mật (Security)** | Mật khẩu được mã hóa an toàn bằng thuật toán **BCrypt**. Toàn bộ các API nghiệp vụ đều được bảo vệ bằng cơ chế Stateless **JWT Bearer Token** với chữ ký thuật toán HMAC-SHA256 (`HS256`). Phân quyền phương thức với `@PreAuthorize` và cấu hình `SecurityFilterChain`. |
| **NFR-02** | **Hiệu năng & Bộ đệm** | Tích hợp **Redis Cache** nhằm giảm tải truy vấn lặp lại đến cơ sở dữ liệu PostgreSQL cho các dữ liệu ít biến động. Giới hạn bộ nhớ JVM `-Xmx256m` khi triển khai trên môi trường container giới hạn tài nguyên. |
| **NFR-03** | **Kiểm toán dữ liệu (Auditing)** | Kế thừa từ `BaseEntity` với Spring Data JPA Auditing, mọi thao tác tạo mới và cập nhật bản ghi đều tự động lưu vết chính xác: `created_at`, `created_by`, `updated_at`, `updated_by`. |
| **NFR-04** | **Toàn vẹn dữ liệu** | Ràng buộc khóa ngoại (Foreign Keys), chỉ mục (Indexes) và ràng buộc duy nhất (Unique Constraints) cho các trường nhạy cảm (`email`, `username`, `id_card_number`, `department_code`, `shift_code`). Thực thi `@Transactional` trên các thao tác nghiệp vụ nhiều bước. |
| **NFR-05** | **Khả năng mở rộng (Scalability)** | Kiến trúc ứng dụng không lưu trạng thái (Stateless), phiên làm việc được duy trì qua JWT và Redis, cho phép scale-out nhiều instance phía sau Load Balancer. |
| **NFR-06** | **Tài liệu hóa API** | Hệ thống tích hợp sẵn OpenAPI 3.0 (Swagger UI) tại đường dẫn `/swagger-ui/**` và cung cấp bộ Postman Collection hoàn chỉnh phục vụ kiểm thử tích hợp. |
