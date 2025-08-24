# Project Structure

This document describes the organized structure of the "it-works-on-my-machine" project.

## Directory Structure

```
it-works-on-my-machine/
├── .github/                    # GitHub Actions workflows
│   └── workflows/
│       └── ci.yaml
├── .dockerignore              # Docker ignore file
├── .gitignore                 # Git ignore file
├── config/                    # Configuration files
│   └── jest.config.js         # Jest test configuration
├── coverage/                  # Test coverage reports (generated)
├── docs/                      # Documentation
│   ├── Before PR.md          # Original documentation
│   └── TEST_DOCUMENTATION.md # Test documentation
├── node_modules/              # Dependencies (generated)
├── scripts/                   # Build and utility scripts
│   └── smoke-test.sh         # Smoke test script
├── src/                       # Source code
│   ├── server.js             # Main application server
│   └── services/             # Business logic services
│       └── s3Client.js       # AWS S3 client wrapper
├── tests/                     # Test files
│   ├── __mocks__/            # Mock files
│   │   └── aws-sdk.js        # AWS SDK mock
│   ├── fixtures/             # Test data and fixtures
│   ├── integration/          # Integration tests
│   │   ├── edge-cases.test.js # Edge case and boundary tests
│   │   └── integration.test.js # Integration tests
│   ├── unit/                 # Unit tests
│   │   ├── config.test.js    # Configuration tests
│   │   ├── s3Client.enhanced.test.js # Enhanced S3 tests
│   │   ├── s3Client.test.js  # Basic S3 tests
│   │   └── server.test.js    # Server endpoint tests
│   └── utils/                # Test utilities
│       ├── test-setup.js     # Jest setup configuration
│       └── test-utils.js     # Test helper functions
├── docker-compose.yaml        # Docker compose configuration
├── Dockerfile                 # Docker container definition
├── index.js                   # Main entry point
├── package.json              # NPM package configuration
├── package-lock.json         # NPM dependency lock
└── README.md                 # Project documentation
```

## Key Directories

### `/src` - Source Code
- **`server.js`**: Main Express.js application server
- **`services/`**: Business logic and service layer modules
  - **`s3Client.js`**: AWS S3 client wrapper with upload/download functionality

### `/tests` - Test Suite
- **`unit/`**: Unit tests for individual components
- **`integration/`**: Integration tests for component interactions
- **`utils/`**: Test utilities and helper functions
- **`__mocks__/`**: Mock implementations for external dependencies
- **`fixtures/`**: Test data and fixtures (ready for use)

### `/config` - Configuration
- **`jest.config.js`**: Jest testing framework configuration

### `/scripts` - Utility Scripts
- **`smoke-test.sh`**: Basic health check script for CI/CD

### `/docs` - Documentation
- Project documentation and guides

## File Naming Conventions

- **Source files**: `camelCase.js`
- **Test files**: `*.test.js`
- **Configuration files**: `kebab-case.config.js`
- **Script files**: `kebab-case.sh`
- **Documentation**: `UPPER_CASE.md` or `Title Case.md`

## Import/Export Patterns

### Relative Imports
```javascript
// From test files to source
const s3Client = require('../../src/services/s3Client');
const TestUtils = require('../utils/test-utils');

// From source files (if needed)
const service = require('./services/someService');
```

### Module Organization
- Each service is a self-contained module in `/src/services/`
- Test utilities are shared across test suites
- Configuration is centralized in `/config/`

## NPM Scripts

```bash
npm start              # Start the application (node src/server.js)
npm test               # Run all tests
npm run test:unit      # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:coverage  # Run tests with coverage report
npm run test:watch     # Run tests in watch mode
```

## Benefits of This Structure

1. **Separation of Concerns**: Clear separation between source code, tests, configuration, and documentation
2. **Scalability**: Easy to add new services, tests, and configurations
3. **Maintainability**: Related files are grouped together
4. **Testing**: Comprehensive test organization with different test types
5. **CI/CD Ready**: Clear structure for automated testing and deployment
6. **Documentation**: Centralized documentation for project knowledge

## Development Workflow

1. **Add new features**: Create files in `/src/services/`
2. **Add tests**: Create corresponding test files in `/tests/unit/` or `/tests/integration/`
3. **Update documentation**: Add or update files in `/docs/`
4. **Configuration changes**: Modify files in `/config/`
5. **Scripts**: Add utility scripts to `/scripts/`

This structure follows Node.js best practices and makes the project professional and maintainable.
