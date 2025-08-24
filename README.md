# It Works On My Machine 🧃

A professional Node.js application with Express.js server and comprehensive testing suite.

## 🏗️ Project Structure

This project follows industry-standard organization patterns:

```
src/                    # Source code
├── server.js          # Main Express.js application
└── services/          # Business logic services
    └── s3Client.js    # AWS S3 client wrapper

tests/                  # Test suite (56 tests, 92.3% coverage)
├── unit/              # Unit tests
├── integration/       # Integration tests  
├── utils/             # Test utilities and helpers
└── __mocks__/         # Mock implementations

config/                 # Configuration files
├── jest.config.js     # Test configuration

scripts/                # Utility scripts
├── smoke-test.sh      # Health check script

docs/                   # Documentation
├── PROJECT_STRUCTURE.md   # Architecture guide
└── TEST_DOCUMENTATION.md  # Testing guide
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📋 Available Scripts

- `npm start` - Start the application server
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:watch` - Run tests in watch mode
- `npm run test:verbose` - Run tests with verbose output

## 🧪 Testing

The project includes a comprehensive test suite with:

- **56 total tests** across 6 test suites
- **92.3% code coverage** (exceeds 80% threshold)
- Unit tests for individual components
- Integration tests for component interactions
- Edge case and boundary testing
- Performance and memory validation

### Test Categories

- **Unit Tests**: Server endpoints, S3 client, configuration validation
- **Integration Tests**: Complete workflows, error handling, API interactions
- **Edge Cases**: Boundary conditions, stress testing, memory efficiency

## 🏥 Health Check

The application provides a health endpoint:

```bash
curl http://localhost:3000/health
# Returns: "Still working... on *my* machine 🧃"
```

## 🐳 Docker

The application is containerized and ready for deployment:

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t it-works-on-my-machine .
docker run -p 3000:3000 it-works-on-my-machine
```

## 🔄 CI/CD

Automated testing and deployment via GitHub Actions:

- ✅ Automated testing on push/PR
- ✅ Code coverage reporting
- ✅ Smoke tests
- ✅ Docker image building and publishing
- ✅ Code quality checks with Super-Linter

## 📦 Dependencies

### Production
- **Express.js** - Web framework
- **AWS SDK** - Amazon S3 integration

### Development  
- **Jest** - Testing framework
- **Supertest** - HTTP integration testing

## 🏛️ Architecture

The application follows clean architecture principles:

- **Separation of Concerns**: Clear boundaries between server, services, and tests
- **Service Layer**: Business logic isolated in dedicated services
- **Comprehensive Testing**: Multiple test layers ensuring reliability
- **Configuration Management**: Centralized configuration files
- **Documentation**: Detailed guides and architecture documentation

## 📚 Documentation

- [Project Structure Guide](docs/PROJECT_STRUCTURE.md) - Detailed architecture overview
- [Test Documentation](docs/TEST_DOCUMENTATION.md) - Comprehensive testing guide

---

**Note**: This project demonstrates professional Node.js development practices including proper project organization, comprehensive testing, CI/CD integration, and containerization.
