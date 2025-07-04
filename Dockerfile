# ---- Build stage (optional) ----
# We build the application JAR outside the container in GitHub Actions to keep the image small.
# Uncomment the following lines if you prefer building inside Docker instead.
# FROM maven:3.9.6-eclipse-temurin-21 AS builder
# COPY pom.xml mvnw mvnw.cmd .
# COPY . .
# RUN mvn -B clean package -DskipTests
#test

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre

# ARG allows us to copy the JAR produced by the GitHub Actions build step.
ARG JAR_FILE=target/*-SNAPSHOT.jar

# Copy the packaged jar file into the container.
COPY ${JAR_FILE} /app.jar

# Spring Boot will listen on port 8080 by default; expose it.
EXPOSE 8080

# Run the jar file
ENTRYPOINT ["java","-jar","/app.jar"]
