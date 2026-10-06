# 📚 HRMS (Human Resource Management System) - Backend Documentation

Tài liệu kỹ thuật toàn diện cho hệ thống Backend Quản lý Nhân sự (**HRMS_BE**). Dự án được xây dựng trên nền tảng **Spring Boot 3.2.5** với kiến trúc module hóa theo chuẩn Domain-driven / Feature-based Architecture, tích hợp bảo mật **Spring Security & JWT**, cơ sở dữ liệu **PostgreSQL**, bộ đệm **Redis**, và lưu trữ media qua **Cloudinary**.

---

## 🗂 Cấu Trúc Gói Tài Liệu (`docs/`)

Thư mục `docs` được tổ chức thành 4 phân hệ tài liệu chính tương ứng với các khía cạnh phát triển phần mềm:

```
HRMS_BE/docs/
├── README.md                          # Mục lục và tổng quan hệ thống tài liệu
├── srs/                               # Software Requirements Specification
│   └── README.md                      # Đặc tả yêu cầu phần mềm chi tiết (F01 - F12)
├── database/                          # Thiết kế & Cấu trúc cơ sở dữ liệu
│   └── README.md                      # ERD, từ điển dữ liệu (16 bảng), quan hệ, audit
├── api/                               # Tài liệu & Công cụ kiểm thử API
│   ├── README.md                      # Chi tiết đặc tả tất cả các REST API Endpoints
│   └── HRMS_API_Collection.postman_collection.json # File Collection Postman đầy đủ
└── deployment/                        # Hướng dẫn triển khai & Vận hành
    └── README.md                      # Docker, Docker-compose, biến môi trường, Render, CI/CD
```

---

## 🧭 Tổng Quan Các Gói Tài Liệu

| Phân hệ | Đường dẫn | Nội dung chính |
| :--- | :--- | :--- |
| **SRS (Đặc tả yêu cầu)** | [`docs/srs/README.md`](./srs/README.md) | Phân tích 6 nhóm người dùng (Roles), chi tiết 12 module chức năng (F01–F12), ma trận phân quyền, luồng nghiệp vụ phê duyệt và phi chức năng (NFR). |
| **Database (Cơ sở dữ liệu)** | [`docs/database/README.md`](./database/README.md) | Biểu đồ thực thể liên kết (Mermaid ERD), chi tiết 16 thực thể / bảng dữ liệu, chuẩn hóa dữ liệu, khóa ngoại, chỉ mục (Index) và cơ chế Auditing (`BaseEntity`). |
| **REST API & Postman** | [`docs/api/README.md`](./api/README.md) | Đặc tả 40+ endpoints RESTful, cấu trúc `ApiResponse<T>`, mã lỗi HTTP, tham số request/response, và **File Postman Collection v2.1.0** đính kèm có script tự động lấy JWT token. |
| **Deployment (Triển khai)** | [`docs/deployment/README.md`](./deployment/README.md) | Quy trình build Docker multi-stage (Java 21 JDK Alpine sang JRE Alpine), file docker-compose hoàn chỉnh, bảng biến môi trường, hướng dẫn deploy Render/VPS và sao lưu dữ liệu. |

---

## 🛠 Công Nghệ Sử Dụng Trong Backend (`HRMS_BE`)

- **Ngôn ngữ & Runtime:** Java 21 (Eclipse Temurin)
- **Framework nền tảng:** Spring Boot 3.2.5
- **Quản lý dependencies & Build:** Gradle 8.x
- **Bảo mật & Phân quyền:** Spring Security 6, JWT (io.jsonwebtoken 0.11.5)
- **Persistence & ORM:** Spring Data JPA, Hibernate, PostgreSQL Driver 42.7.3
- **Cache & Session:** Spring Data Redis
- **File & Media Storage:** Cloudinary HTTP44 Client
- **API Documentation:** SpringDoc OpenAPI 2.1.0 (Swagger UI)
- **Containerization:** Docker (Multi-stage build tối ưu kích thước và RAM)
