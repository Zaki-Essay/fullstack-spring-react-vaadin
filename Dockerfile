# ---- Multi-stage build ----
# Build stage (optional - we build in GitHub Actions)
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Uncomment the following line if you want to build inside Docker
# RUN mvn -B clean package -Pproduction -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre-alpine

# Create app directory and user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Set working directory
WORKDIR /app

# Copy the JAR file from target directory (built by GitHub Actions)
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar

# Create logs directory
RUN mkdir -p /app/logs && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Environment variables for configuration
ENV SPRING_PROFILES_ACTIVE=production
ENV OLLAMA_HOST=localhost
ENV OLLAMA_PORT=11434
ENV OLLAMA_MODEL=mistral

# Expose the application port
EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Set JVM options for better performance in containers
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
