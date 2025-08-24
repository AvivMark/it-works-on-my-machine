# Test Documentation

This document describes the comprehensive test suite that has been added to the "it-works-on-my-machine" project.

## Test Overview

The project now includes **56 tests** across **6 test suites** with **92.3% code coverage**.

## Test Structure

### 1. Unit Tests
- **`lib/s3Client.test.js`** - Original S3 client tests (3 tests)
- **`lib/s3Client.enhanced.test.js`** - Enhanced S3 client tests (13 tests)
- **`server.test.js`** - Server API endpoint tests (5 tests)
- **`config.test.js`** - Configuration and environment tests (14 tests)

### 2. Integration Tests
- **`integration.test.js`** - Integration tests between components (11 tests)

### 3. Edge Case & Stress Tests
- **`edge-cases.test.js`** - Boundary conditions and stress tests (10 tests)

## Test Categories

### Unit Tests (`npm run test:unit`)
- **S3 Client Tests**: File uploads, downloads, error handling, concurrent operations
- **Server API Tests**: Health endpoint, 404 handling, concurrent requests
- **Configuration Tests**: Environment variables, module loading, performance validation

### Integration Tests (`npm run test:integration`) 
- **Health Check Integration**: Service availability during various conditions
- **File Upload/Download Integration**: Complete workflow testing with mocked S3
- **API Endpoint Combinations**: Multiple API calls in sequence and concurrently
- **Error Handling Integration**: Service resilience during failures

### Edge Case Tests (`npm run test:edge`)
- **Data Boundary Tests**: Various file sizes, content types, edge cases
- **Parameter Validation**: Different bucket names, key formats, invalid inputs
- **Concurrent Operation Stress Tests**: High concurrency uploads and mixed operations
- **Memory and Resource Tests**: Memory efficiency and resource cleanup

## Test Utilities

### `test-utils.js`
Provides helper functions for:
- Generating random test data
- Creating various file content types
- Environment variable management
- S3 parameter creation
- Edge case scenario generation

### `test-setup.js` 
Global Jest configuration for:
- Console output management during tests
- Test timeout configuration
- Mock cleanup between tests

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests  
npm run test:integration

# Run only edge case tests
npm run test:edge

# Run tests in watch mode
npm run test:watch

# Run tests with verbose output
npm run test:verbose
```

## Coverage Report

The test suite achieves:
- **92.3% Statement Coverage**
- **83.33% Branch Coverage** 
- **100% Function Coverage**
- **100% Line Coverage**

## Test Features

### Comprehensive Scenarios
- ✅ File upload/download workflows
- ✅ Error handling and edge cases
- ✅ Concurrent operations and stress testing
- ✅ Environment configuration validation
- ✅ API endpoint testing with various HTTP methods
- ✅ Memory efficiency and resource management
- ✅ Integration between different components

### Mock Strategy
- Uses manual AWS SDK mocks in `__mocks__/aws-sdk.js`
- Provides realistic S3 behavior simulation
- Maintains state between test operations
- Supports concurrent operations testing

### Quality Assurance
- All tests use proper async/await patterns
- Tests are isolated and independent
- Comprehensive error scenario coverage
- Performance and memory validation
- Cross-environment compatibility testing

## CI/CD Integration

Tests are integrated with the GitHub Actions workflow:
- Runs on every push and pull request
- Enforces 80% coverage threshold
- Includes smoke tests in addition to unit/integration tests
- Generates coverage reports for analysis

This comprehensive test suite ensures high code quality, reliability, and maintainability of the application.
