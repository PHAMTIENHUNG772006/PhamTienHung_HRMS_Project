# ==========================================
# Stage 1: Build JAR b?ng Java 21 JDK
# ==========================================
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

# Copy ton b? code v c?u hnh
COPY . .

# Fix k t? xu?ng dng Windows (CRLF -> LF) v c?p quy?n th?c thi cho gradlew
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

# Build JAR b? qua test
ENV GRADLE_OPTS="-Dorg.gradle.jvmargs=-Xmx512m -Dorg.gradle.daemon=false"
RUN ./gradlew bootJar -x test --no-daemon

# ==========================================
# Stage 2: Ch?y ?ng d?ng b?ng Java 21 JRE
# ==========================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy file jar t? stage build
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
