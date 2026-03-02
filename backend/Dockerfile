# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build the WAR file, skipping tests to speed up the process
RUN mvn clean package -DskipTests

# Run stage (using Jetty Runner for deploying a WAR file)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Download jetty-runner (a lightweight way to run standard WAR files in Java)
ADD https://repo1.maven.org/maven2/org/eclipse/jetty/jetty-runner/9.4.53.v20231009/jetty-runner-9.4.53.v20231009.jar jetty-runner.jar

# Copy the built WAR file from the build stage
COPY --from=build /app/target/student-management.war app.war

# Expose the port Render expects
EXPOSE 8080

# Run the backend
CMD ["java", "-jar", "jetty-runner.jar", "--port", "8080", "app.war"]
