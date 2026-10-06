# ==========================================
# Stage 1: Build JAR bằng Java 21 JDK
# ==========================================
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

# Copy toàn bộ code và cấu hình
COPY . .

# Fix ký tự xuống dòng Windows và cấp quyền thực thi cho gradlew
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

# Build JAR bỏ qua test, giới hạn RAM để tránh crash trên Render gói Free
ENV GRADLE_OPTS="-Dorg.gradle.jvmargs=-Xmx256m -Dorg.gradle.daemon=false"
RUN ./gradlew bootJar -x test --no-daemon

# ==========================================
# Stage 2: Chạy ứng dụng bằng Java 21 JRE
# ==========================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy file jar từ stage build
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]