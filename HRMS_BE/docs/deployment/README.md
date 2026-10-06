# 🚀 Deployment & DevOps Documentation - HRMS Backend

Tài liệu Hướng dẫn Triển khai, Đóng gói Container và Vận hành Hệ thống cho **HRMS Backend**. Hệ thống hỗ trợ triển khai linh hoạt từ môi trường phát triển cục bộ (Local Development), môi trường Containerized Docker/Docker Compose đến các nền tảng đám mây (Render, Railway, VPS Linux).

---

## 1. Kiến Trúc Hạ Tầng Triển Khai

- **Ứng dụng chính:** Spring Boot 3.2.5 (Java 21 LTS)
- **Container Runtime:** Docker Multi-stage build (Dựa trên Eclipse Temurin Alpine Linux)
- **Cơ sở dữ liệu:** PostgreSQL 16
- **Bộ nhớ đệm (Cache):** Redis 7
- **Lưu trữ tệp đa phương tiện:** Cloudinary CDN
- **Cổng dịch vụ mặc định:** `8080`

---

## 2. Bảng Biến Môi Trường (Environment Variables)

Các biến môi trường có thể truyền vào qua file `.env`, cờ `-e` của Docker hoặc cấu hình trực tiếp trên Dashboard của Cloud Provider:

| Tên Biến Môi Trường | Giá Trị Mặc Định | Bắt Buộc | Mô Tả Chức Năng |
| :--- | :--- | :---: | :--- |
| `PORT` | `8080` | Không | Cổng HTTP mà dịch vụ Spring Boot lắng nghe |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/hrms_db` | **Có** | Chuỗi JDBC kết nối đến PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | **Có** | Tên đăng nhập cơ sở dữ liệu PostgreSQL |
| `SPRING_DATASOURCE_PASSWORD` | `postgres` | **Có** | Mật khẩu truy cập cơ sở dữ liệu PostgreSQL |
| `SPRING_DATA_REDIS_HOST` | `localhost` | **Có** | Địa chỉ máy chủ Redis Cache |
| `SPRING_DATA_REDIS_PORT` | `6379` | Không | Cổng kết nối Redis |
| `SPRING_DATA_REDIS_PASSWORD` | *(trống)* | Tùy chọn | Mật khẩu bảo mật Redis (nếu có yêu cầu xác thực) |
| `CLOUDINARY_CLOUD_NAME` | `deyuvrsv9` | **Có** | Tên cloud bucket trên Cloudinary |
| `CLOUDINARY_API_KEY` | `294582536614528` | **Có** | Khóa API Cloudinary để upload ảnh chấm công |
| `CLOUDINARY_API_SECRET`| `z43Jx3bzpyBQjijteSB9RzLO8cU` | **Có** | Secret API Cloudinary |
| `JWT_SECRET_KEY` | *(Secret 256-bit chuẩn)* | **Có** | Khóa bí mật dùng để ký và giải mã JWT token |
| `JWT_EXPIRATION` | `900000` (15 phút) | Không | Thời gian sống của Access Token (mili giây) |
| `JWT_REFRESH_EXPIRATION` | `604800000` (7 ngày) | Không | Thời gian sống của Refresh Token (mili giây) |

---

## 3. Phân Tích & Tối Ưu Hóa Dockerfile

Hệ thống sử dụng kỹ thuật **Multi-stage Build** trong `HRMS_BE/Dockerfile` để giảm thiểu kích thước image và tối ưu hóa tài nguyên RAM khi chạy trên gói miễn phí của các nền tảng đám mây (như Render gói Free 512MB RAM):

```dockerfile
# ==========================================
# Stage 1: Build JAR bằng Java 21 JDK Alpine
# ==========================================
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Sao chép mã nguồn và thiết lập thực thi cho Gradle wrapper
COPY . .
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

# Giới hạn RAM tối đa 256MB cho tiến trình Gradle daemon để tránh crash OOM
ENV GRADLE_OPTS="-Dorg.gradle.jvmargs=-Xmx256m -Dorg.gradle.daemon=false"
RUN ./gradlew bootJar -x test --no-daemon

# ==========================================
# Stage 2: Runtime siêu nhẹ bằng Java 21 JRE Alpine
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Chỉ copy file artifact JAR hoàn chỉnh (~40-60MB)
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

> **Ưu điểm kiến trúc:**
> - Kích thước Image cuối cùng chỉ ~160MB (thay vì >800MB nếu giữ nguyên JDK).
> - Giữ an toàn mã nguồn: Không chứa source code trong image chạy production.
> - Xử lý triệt để lỗi ký tự xuống dòng Windows (`CRLF`) bằng lệnh `sed`.

---

## 4. Triển Khai Toàn Diện Với Docker Compose

Để chạy trọn gói hệ thống gồm **HRMS Backend**, **PostgreSQL** và **Redis** chỉ bằng một câu lệnh, tạo file `docker-compose.yml` tại thư mục gốc:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: hrms-postgres
    restart: always
    environment:
      POSTGRES_DB: hrms_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - hrms-network

  redis:
    image: redis:7-alpine
    container_name: hrms-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - hrms-network

  hrms-backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: hrms-backend
    restart: always
    depends_on:
      - postgres
      - redis
    ports:
      - "8080:8080"
    environment:
      PORT: 8080
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/hrms_db
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgrespassword
      SPRING_DATA_REDIS_HOST: redis
      SPRING_DATA_REDIS_PORT: 6379
    networks:
      - hrms-network

volumes:
  postgres_data:
  redis_data:

networks:
  hrms-network:
    driver: bridge
```

### Các lệnh vận hành Docker Compose:
```bash
# Khởi động toàn bộ cụm dịch vụ dưới nền
docker-compose up -d

# Xem log thời gian thực của backend
docker-compose logs -f hrms-backend

# Dừng cụm dịch vụ
docker-compose down
```

---

## 5. Hướng Dẫn Chạy Cục Bộ (Local Development)

### Yêu Cầu Tiên Quyết
- **JDK 21** trở lên đã cài đặt (`java -version`).
- PostgreSQL và Redis đang hoạt động tại cổng `5432` và `6379`.

### Các Bước Thực Hiện
1. Tạo cơ sở dữ liệu trên PostgreSQL:
   ```sql
   CREATE DATABASE hrms_db;
   ```
2. Mở terminal tại thư mục `HRMS_BE`:
   ```bash
   # Cấp quyền thực thi trên Linux/macOS (nếu có)
   chmod +x gradlew

   # Chạy ứng dụng qua Gradle Wrapper
   # Trên Windows:
   gradlew.bat bootRun
   
   # Trên Linux/macOS:
   ./gradlew bootRun
   ```
3. Truy cập Swagger UI kiểm tra:
   - URL: `http://localhost:8080/swagger-ui/index.html`
   - Tài khoản Admin mặc định: `admin@company.com` / `admin123`

---

## 6. Hướng Dẫn Triển Khai Lên Nền Tảng Đám Mây (Render.com)

1. **Chuẩn bị Database & Redis:**
   - Tạo PostgreSQL Instance trên Render hoặc [Neon.tech](https://neon.tech) / [Supabase](https://supabase.com).
   - Tạo Redis Instance trên Render hoặc [Upstash](https://upstash.com).
2. **Tạo Web Service trên Render:**
   - Kết nối với Git Repository chứa dự án.
   - **Root Directory:** Chọn `HRMS_BE`.
   - **Environment:** Chọn `Docker`.
3. **Cấu hình Biến Môi Trường (Environment Variables):**
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<host>:<port>/<dbname>`
   - `SPRING_DATASOURCE_USERNAME`: `<username>`
   - `SPRING_DATASOURCE_PASSWORD`: `<password>`
   - `SPRING_DATA_REDIS_HOST`: `<redis_host>`
   - `SPRING_DATA_REDIS_PORT`: `<redis_port>`
   - `SPRING_DATA_REDIS_PASSWORD`: `<redis_password>`
4. Nhấn **Deploy** và theo dõi tiến trình build trong tab Logs.

---

## 7. Các Script Quản Trị & Sao Lưu (Scripts)

Thư mục `HRMS_BE/scripts` cung cấp các tiện ích dòng lệnh cho DevOps:

- **Migration (`scripts/migration/run_migration.sh`):** Thực thi các câu lệnh SQL nâng cấp cơ sở dữ liệu.
- **Data Seeding (`scripts/seed/run_seed.sh`):** Bơm dữ liệu mẫu cho môi trường kiểm thử.
- **Sao lưu cơ sở dữ liệu (`scripts/backup/db_backup.sh`):**
  ```bash
  # Lệnh tạo bản sao lưu dữ liệu tự động với pg_dump:
  pg_dump -U postgres -d hrms_db -F c -b -v -f "./backup_hrms_$(date +%Y%m%d_%H%M%S).dump"
  ```
