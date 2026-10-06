# 📡 REST API Specification & Postman Collection - HRMS Backend

Tài liệu Đặc tả Chi tiết Giao diện Lập trình Ứng dụng (**RESTful API Specification**) và Hướng dẫn Kiểm thử tự động với **Postman Collection** cho hệ thống HRMS Backend.

---

## 1. Quy Chuẩn Kỹ Thuật Chung

### 1.1 Base URL
- **Môi trường phát triển cục bộ (Local):** `http://localhost:8080`
- **Tiền tố API tiêu chuẩn (Prefix):** `/api/v1`
- **Ví dụ Endpoint đầy đủ:** `http://localhost:8080/api/v1/auth/login`

### 1.2 Cơ Chế Xác Thực & Phân Quyền (Authentication)
- Sử dụng chuẩn **Bearer Token** trong HTTP Request Header:
  ```http
  Authorization: Bearer <your_jwt_access_token>
  ```
- Định dạng Access Token: JWT mã hóa chữ ký HMAC-SHA256 (`HS256`), thời hạn sống 15 phút.
- Hệ thống hỗ trợ cấp mới tự động qua endpoint `/api/v1/auth/refresh-token` với thời hạn Refresh Token 7 ngày.

### 1.3 Cấu Trúc Phản Hồi Tiêu Chuẩn (`ApiResponse<T>`)
Mọi phản hồi từ hệ thống đều được bọc bởi đối tượng chuẩn `ApiResponse`:

```json
{
  "success": true,
  "message": "Thông báo kết quả thao tác",
  "data": { ... }
}
```

Trong trường hợp xảy ra lỗi:
```json
{
  "success": false,
  "message": "Nội dung thông báo lỗi cụ thể",
  "data": null
}
```
Hoặc khi vi phạm ràng buộc dữ liệu đầu vào (Validation Error - HTTP 400):
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "email": "Định dạng email không hợp lệ",
    "password": "Mật khẩu không được để trống"
  }
}
```

---

## 2. Danh Mục Các Endpoint Theo Module

### 🔐 1. Xác thực & Quản lý phiên (`/api/v1/auth`)

| Phương Thức | Đường Dẫn | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/v1/auth/login` | Public | Đăng nhập hệ thống bằng email và mật khẩu |
| `POST` | `/api/v1/auth/register` | Public | Đăng ký tài khoản ứng viên mới (`CANDIDATE`) |
| `POST` | `/api/v1/auth/refresh-token` | Public | Gia hạn access token khi token cũ hết hạn |
| `POST` | `/api/v1/auth/change-password` | Authenticated | Đổi mật khẩu cá nhân |
| `POST` | `/api/v1/auth/logout` | Authenticated | Đăng xuất và thu hồi refresh token |

---

### 👤 2. Quản lý Tài khoản & Quyền hạn (`/api/v1/accounts`)

| Phương Thức | Đường Dẫn | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/accounts` | `ADMIN` | Lấy danh sách tất cả tài khoản trong hệ thống |
| `GET` | `/api/v1/accounts/unassigned` | `ADMIN` | Lấy danh sách tài khoản chưa gắn với nhân viên nào |
| `GET` | `/api/v1/accounts/{id}` | `ADMIN` | Xem thông tin chi tiết một tài khoản |
| `PUT` | `/api/v1/accounts/{id}` | `ADMIN` | Cập nhật thông tin tài khoản (role, email, bank) |
| `PATCH`| `/api/v1/accounts/{id}/toggle-status`| `ADMIN` | Bật/tắt trạng thái hoạt động (`ACTIVE`/`INACTIVE`) |
| `DELETE`| `/api/v1/accounts/{id}` | `ADMIN` | Xóa tài khoản người dùng |

---

### 💼 3. Quản lý Hồ sơ Nhân viên (`/api/v1/employees`)

| Phương Thức | Đường Dẫn | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/employees` | `ADMIN, HR, EMPLOYEE` | Lấy danh sách toàn bộ cán bộ nhân viên |
| `GET` | `/api/v1/employees/{id}` | `ADMIN, HR, EMPLOYEE` | Xem thông tin hồ sơ chi tiết một nhân viên |
| `POST` | `/api/v1/employees` | `ADMIN, HR` | Thêm mới hồ sơ nhân sự |
| `PUT` | `/api/v1/employees/{id}` | `ADMIN, HR` | Cập nhật thông tin hồ sơ nhân sự |
| `DELETE`| `/api/v1/employees/{id}` | `ADMIN, HR` | Xóa hồ sơ nhân sự |

---

### 🏢 4. Quản lý Phòng ban & Chức vụ (`/api/v1/departments`, `/api/v1/positions`)

| Phương Thức | Đường Dẫn | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/departments` | `ADMIN, HR` | Lấy danh sách tất cả phòng ban |
| `GET` | `/api/v1/departments/{id}` | `ADMIN, HR` | Xem chi tiết phòng ban |
| `POST` | `/api/v1/departments` | `ADMIN, HR` | Tạo mới phòng ban |
| `PUT` | `/api/v1/departments/{id}` | `ADMIN, HR` | Cập nhật phòng ban |
| `DELETE`| `/api/v1/departments/{id}` | `ADMIN, HR` | Xóa phòng ban |
| `GET` | `/api/v1/positions` | `ADMIN, HR` | Lấy danh sách tất cả chức vụ |
| `GET` | `/api/v1/positions/{id}` | `ADMIN, HR` | Xem chi tiết chức vụ |
| `POST` | `/api/v1/positions` | `ADMIN, HR` | Tạo mới chức vụ |
| `PUT` | `/api/v1/positions/{id}` | `ADMIN, HR` | Cập nhật chức vụ |
| `DELETE`| `/api/v1/positions/{id}` | `ADMIN, HR` | Xóa chức vụ |

---

### ⏰ 5. Chấm công & Ghi nhận Thời gian (`/api/v1/attendance`)

| Phương Thức | Đường Dẫn | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/attendance/my` | `Authenticated` | Lấy lịch sử chấm công của nhân viên đang đăng nhập |
| `GET` | `/api/v1/attendance/all` | `ADMIN, HR` | Lọc dữ liệu chấm công toàn công ty theo `startDate`, `endDate` |
| `POST` | `/api/v1/attendance/check-in` | `Authenticated` | Check-in chấm công kèm `shiftCode` và ảnh khuôn mặt (multipart) |
| `POST` | `/api/v1/attendance/check-out` | `Authenticated` | Check-out chấm công kèm `shiftCode` và ảnh khuôn mặt (multipart) |

---

### 🗓 6. Quản lý Ca & Phân ca Làm việc (`/api/v1/shifts`, `/api/v1/shift-assignments`)

| Phương Thức | Đường Dẫn | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/shifts` | `ADMIN, HR, MANAGER` | Lấy danh sách các khuôn mẫu ca làm việc |
| `GET` | `/api/v1/shifts/today` | `ADMIN, HR, MANAGER` | Lấy danh sách ca làm việc trong ngày hôm nay |
| `POST` | `/api/v1/shifts` | `ADMIN, HR, MANAGER` | Thêm mới khuôn mẫu ca làm việc |
| `PUT` | `/api/v1/shifts/{code}` | `ADMIN, HR, MANAGER` | Cập nhật khuôn mẫu ca làm việc |
| `DELETE`| `/api/v1/shifts/{code}` | `ADMIN, HR, MANAGER` | Xóa khuôn mẫu ca làm việc |
| `GET` | `/api/v1/shift-assignments` | `ADMIN, HR, MANAGER` | Lấy danh sách phân ca theo dải ngày (`startDate`, `endDate`) |
| `POST` | `/api/v1/shift-assignments` | `ADMIN, HR, MANAGER` | Phân ca làm việc hàng loạt cho danh sách nhân viên |
| `GET` | `/api/v1/shift-assignments/my-today` | `Authenticated` | Lấy thông tin ca làm việc được phân của cá nhân hôm nay |
| `DELETE`| `/api/v1/shift-assignments/{id}` | `ADMIN, HR, MANAGER` | Xóa phân ca làm việc |

---

### 🏖 7. Quản lý Đơn Nghỉ phép (`/api/v1/leave-requests`)

| Phương Thức | Đường Dẫn | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/leave-requests` | `Authenticated` | Lấy danh sách đơn xin nghỉ phép |
| `POST` | `/api/v1/leave-requests` | `Authenticated` | Tạo mới đơn xin nghỉ phép |
| `PUT` | `/api/v1/leave-requests/{id}` | `Authenticated` | Cập nhật đơn xin nghỉ phép |
| `PATCH`| `/api/v1/leave-requests/{id}/status`| `ADMIN, HR, MANAGER` | Phê duyệt hoặc từ chối đơn (`APPROVED` / `REJECTED`) |
| `DELETE`| `/api/v1/leave-requests/{id}` | `Authenticated` | Xóa đơn xin nghỉ phép |

---

### ⏳ 8. Quản lý Làm thêm giờ - OT (`/api/v1/overtime-requests`)

| Phương Thức | Đường Dẫn | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/overtime-requests` | `Authenticated` | Lấy danh sách đơn đăng ký làm thêm giờ |
| `POST` | `/api/v1/overtime-requests` | `Authenticated` | Tạo mới đơn đăng ký làm thêm giờ |
| `PUT` | `/api/v1/overtime-requests/{id}` | `Authenticated` | Cập nhật thông tin đơn OT |
| `PATCH`| `/api/v1/overtime-requests/{id}/status`| `ADMIN, HR, MANAGER` | Duyệt đơn OT và xác nhận số giờ làm thêm thực tế |
| `DELETE`| `/api/v1/overtime-requests/{id}` | `Authenticated` | Xóa đơn đăng ký làm thêm giờ |

---

### 💰 9. Quản lý & Tính toán Bảng lương (`/api/v1/payroll`)

| Phương Thức | Đường Dẫn | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/payroll` | `ADMIN, PAYROLL` | Lấy danh sách bảng lương toàn bộ nhân viên |
| `POST` | `/api/v1/payroll/calculate` | `ADMIN, PAYROLL` | Chạy tiến trình tính lương tự động cho kỳ (`period: "yyyy-MM"`) |
| `PATCH`| `/api/v1/payroll/{id}/status` | `ADMIN, PAYROLL` | Cập nhật trạng thái chi trả bảng lương (`PAID`, `PENDING`) |

---

### 🎯 10. Quản lý Tuyển dụng & Ứng viên (`/api/v1/recruitment`, `/api/v1/candidates`)

| Phương Thức | Đường Dẫn | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/recruitment` | `ADMIN, HR` | Lấy danh sách chiến dịch tuyển dụng |
| `POST` | `/api/v1/recruitment` | `ADMIN, HR` | Tạo mới chiến dịch tuyển dụng |
| `PUT` | `/api/v1/recruitment/{id}` | `ADMIN, HR` | Cập nhật thông tin chiến dịch tuyển dụng |
| `DELETE`| `/api/v1/recruitment/{id}` | `ADMIN, HR` | Xóa chiến dịch tuyển dụng |
| `GET` | `/api/v1/candidates` | `ADMIN, HR` | Lấy danh sách hồ sơ ứng viên nộp vào hệ thống |
| `POST` | `/api/v1/candidates` | Public/HR | Nộp mới hồ sơ ứng viên (kèm link CV) |
| `POST` | `/api/v1/candidates/{id}/approve` | `ADMIN, HR` | Phê duyệt trúng tuyển và tự động chuyển đổi thành nhân viên |

---

### 💻 11. Quản lý Tài sản Doanh nghiệp (`/api/v1/assets`)

| Phương Thức | Đường Dẫn | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/assets` | `ADMIN, HR` | Lấy danh mục tài sản và trang thiết bị công ty |
| `POST` | `/api/v1/assets` | `ADMIN, HR` | Thêm mới tài sản vào hệ thống |
| `PUT` | `/api/v1/assets/{id}` | `ADMIN, HR` | Cập nhật thông tin tài sản |
| `DELETE`| `/api/v1/assets/{id}` | `ADMIN, HR` | Xóa tài sản |

---

### 📊 12. Bảng điều khiển Quản trị (`/api/v1/dashboard`)

| Phương Thức | Đường Dẫn | Quyền Hạn | Mô Tả |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/dashboard/stats` | `Authenticated` | Lấy các chỉ số thống kê nhân sự tổng quan (nhân viên, nghỉ phép, chờ duyệt) |

---

## 3. Hướng Dẫn Sử Dụng Postman Collection

File Postman Collection v2.1.0 được lưu cùng thư mục tại đường dẫn:
👉 [`HRMS_API_Collection.postman_collection.json`](./HRMS_API_Collection.postman_collection.json)

### Các Tính Năng Được Cấu Hình Sẵn Trong File:
1. **Biến môi trường toàn cục (Collection Variables):**
   - `{{baseUrl}}`: Mặc định là `http://localhost:8080`
   - `{{token}}`: Lưu Access Token JWT tự động sau khi gọi API Login
   - `{{refreshToken}}`: Lưu Refresh Token tự động sau khi gọi API Login
2. **Kịch bản tự động lưu JWT Token (Postman Test Script):**
   Khi gửi request `POST /api/v1/auth/login`, script kiểm tra phản hồi HTTP 200 và tự động ghi đè token vào biến `{{token}}` cho tất cả các request tiếp theo:
   ```javascript
   if (pm.response.code === 200) {
       var jsonData = pm.response.json();
       if (jsonData.data && jsonData.data.token) {
           pm.collectionVariables.set("token", jsonData.data.token);
           pm.collectionVariables.set("refreshToken", jsonData.data.refreshToken);
           console.log("JWT Token and Refresh Token auto-saved successfully!");
       }
   }
   ```
3. **Cơ chế Kế thừa Xác thực (Inherited Auth):**
   Tất cả các thư mục module đều kế thừa cấu hình `Bearer Token: {{token}}` từ gốc Collection, người dùng chỉ cần đăng nhập 1 lần là có thể gọi mọi API khác ngay lập tức.
