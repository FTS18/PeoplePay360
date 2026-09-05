# syntax=docker/dockerfile:1

# ─── Stage 1: Development (hot reload via spring-boot-devtools) ─────────────
#
# How hot reload works in Docker:
#   - Maven source is bind-mounted from host via docker-compose volumes
#   - spring-boot-devtools watches target/classes for changes
#   - Trigger recompile from your IDE (IntelliJ auto-build) or run:
#       docker exec pp360_backend mvn compile -q
#   - Devtools restarts the app automatically within ~1s
FROM eclipse-temurin:21-jdk-alpine AS dev

WORKDIR /app

RUN apk add --no-cache maven bash

# Copy pom.xml first — this layer is cached by Docker.
# Dependencies are re-downloaded ONLY when pom.xml changes.
COPY pom.xml .

RUN mvn dependency:go-offline -B -q

# Copy full source (will be overridden by bind mount in compose)
COPY . .

EXPOSE 8080

CMD ["mvn", "spring-boot:run"]

# ─── Stage 2: Production build ──────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

RUN apk add --no-cache maven

COPY pom.xml .
RUN mvn dependency:go-offline -B -q

COPY src ./src

RUN mvn clean package -DskipTests -B -q

# ─── Stage 3: Production runtime (minimal JRE — no JDK, no Maven) ──────────
FROM eclipse-temurin:21-jre-alpine AS prod

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /build/target/*.jar app.jar

RUN chown appuser:appgroup app.jar
USER appuser

EXPOSE 8080

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]
