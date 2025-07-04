# Spring Boot + Vaadin + Ollama Application

This is a full-stack application built with Spring Boot backend, Vaadin frontend, and integrated with Ollama for AI capabilities using Mistral model.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Git (optional, for cloning)

### Running the Application

1. **Using Docker Compose (Recommended)**:
   ```bash
   # Create a docker-compose.yml file with the provided configuration
   # Set your Docker Hub username
   export DOCKERHUB_USERNAME=your-dockerhub-username
   
   # Run the application with Ollama
   docker-compose up -d
   ```

2. **Using Docker Run**:
   ```bash
   # Run Ollama first
   docker run -d --name ollama -p 11434:11434 ollama/ollama:latest
   
   # Pull and run Mistral model
   docker exec ollama ollama pull mistral
   
   # Run your application
   docker run -d \
     --name spring-react-vaadin \
     -p 8080:8080 \
     -e OLLAMA_HOST=ollama \
     -e OLLAMA_PORT=11434 \
     -e OLLAMA_MODEL=mistral \
     --link ollama:ollama \
     your-dockerhub-username/spring-react-vaadin:latest
   ```

### Accessing the Application

- **Main Application**: http://localhost:8080
- **H2 Database Console**: http://localhost:8080/h2-console
- **Ollama API**: http://localhost:11434
- **Health Check**: http://localhost:8080/actuator/health

## 🛠️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_HOST` | `localhost` | Ollama server hostname |
| `OLLAMA_PORT` | `11434` | Ollama server port |
| `OLLAMA_MODEL` | `mistral` | Ollama model to use |
| `SPRING_PROFILES_ACTIVE` | `production` | Spring profile |

### Custom Ollama Configuration

If you have your own Ollama instance:

```bash
docker run -d \
  --name spring-react-vaadin \
  -p 8080:8080 \
  -e OLLAMA_HOST=your-ollama-host \
  -e OLLAMA_PORT=your-ollama-port \
  -e OLLAMA_MODEL=your-model \
  your-dockerhub-username/spring-react-vaadin:latest
```

## 🔧 Development

### Local Development Setup

1. **Prerequisites**:
    - Java 21
    - Maven 3.9+
    - Node.js 18+
    - Ollama installed locally

2. **Setup Ollama**:
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Start Ollama
   ollama serve
   
   # Pull Mistral model
   ollama pull mistral
   ```

3. **Run the Application**:
   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/spring-react-vaadin.git
   cd spring-react-vaadin
   
   # Install frontend dependencies (Vaadin will generate package.json)
   npm ci
   
   # Run in development mode
   mvn spring-boot:run
   ```

### Building for Production

```bash
# Build with production profile (includes frontend build)
mvn clean package -Pproduction

# Build Docker image
docker build -t spring-react-vaadin .
```

## 📋 Features

- **Backend**: Spring Boot 3.5.3 with Java 21
- **Frontend**: Vaadin 24.4.10 with Hilla React integration
- **UI Components**: Vaadin React Components with Lumo and Material themes
- **Routing**: Vaadin Hilla File Router with React Router DOM
- **Styling**: Lit CSS with Vaadin themes
- **Code Highlighting**: Highlight.js with React Syntax Highlighter
- **Markdown**: React Markdown with GitHub Flavored Markdown
- **Icons**: Lucide React icons
- **Database**: H2 (in-memory for development)
- **AI Integration**: Ollama with Mistral model
- **Containerization**: Docker with multi-stage builds
- **CI/CD**: GitHub Actions pipeline with Vaadin production builds
- **Health Checks**: Built-in application monitoring

## 🔄 CI/CD Pipeline

The GitHub Actions pipeline:
1. Builds the application with Maven
2. Runs tests
3. Builds Docker image
4. Pushes to Docker Hub
5. Overwrites existing tags (latest/sha)

### Required GitHub Secrets

- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: Your Docker Hub access token

## 🐳 Docker Hub

Pull the latest image:
```bash
docker pull your-dockerhub-username/spring-react-vaadin:latest
```

## 📝 Notes

- The application uses H2 database for simplicity
- Vaadin handles the React frontend generation
- Ollama integration allows for AI-powered features
- Health checks ensure container reliability
- Non-root user in Docker for security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.