# ============================================================
# Dockerfile for Backend Service (when rootDir is 'backend')
# ============================================================

FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /build

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN mkdir -p /app/data /app/uploads

COPY --from=builder /build/target/lost-found-backend-1.0.0.jar app.jar

ENV PORT=8080
ENV SERVER_ADDRESS=0.0.0.0
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
