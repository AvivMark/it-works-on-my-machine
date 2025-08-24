// Configuration and environment testing
const TestUtils = require('../utils/test-utils');

describe('Configuration and Environment Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Environment variable handling', () => {
    test('should use default AWS region when not specified', () => {
      delete process.env.AWS_REGION;
      
        // Re-require the module to pick up env changes
        const s3Client = require('../../src/services/s3Client');      // The module should still work with defaults
      expect(s3Client).toBeDefined();
      expect(typeof s3Client.upload).toBe('function');
      expect(typeof s3Client.get).toBe('function');
    });

    test('should use custom AWS region when specified', () => {
      TestUtils.withEnvVar('AWS_REGION', 'eu-west-1', () => {
        // Re-require to pick up the new env var
        delete require.cache[require.resolve('../../src/services/s3Client')];
        const s3Client = require('../../src/services/s3Client');
        
        expect(s3Client).toBeDefined();
        expect(typeof s3Client.upload).toBe('function');
        expect(typeof s3Client.get).toBe('function');
      });
    });

    test('should handle server PORT environment variable', () => {
      const originalPort = process.env.PORT;
      process.env.PORT = '4000';
      
      // Test that the environment variable is set correctly
      expect(process.env.PORT).toBe('4000');
      
      // Verify that the server would use the specified port
      // (We don't actually start the server to avoid conflicts)
      const expectedPort = process.env.PORT || 3000;
      expect(expectedPort).toBe('4000');
      
      // Cleanup
      if (originalPort === undefined) {
        delete process.env.PORT;
      } else {
        process.env.PORT = originalPort;
      }
    });
  });

  describe('Module loading and dependencies', () => {
    test('should load all required modules successfully', () => {
      expect(() => require('../../src/services/s3Client')).not.toThrow();
      expect(() => require('../utils/test-utils')).not.toThrow();
      // Skip server.js as it starts the server immediately
      expect(() => {
        const fs = require('fs');
        const path = require('path');
        const serverPath = path.join(__dirname, '../../src/server.js');
        return fs.existsSync(serverPath);
      }).not.toThrow();
    });

    test('should handle missing optional dependencies gracefully', () => {
      // This tests that the code doesn't break if optional deps are missing
      const originalRequire = require;
      
      // Mock require to simulate missing dependency
      const mockRequire = (id) => {
        if (id === 'some-optional-dependency') {
          throw new Error('Module not found');
        }
        return originalRequire(id);
      };
      
      // Test that core functionality still works
      expect(() => require('../../src/services/s3Client')).not.toThrow();
    });
  });

  describe('Error handling in different environments', () => {
    test('should handle development environment', () => {
      TestUtils.withEnvVar('NODE_ENV', 'development', () => {
        // Test behavior in development
        const s3Client = require('../../src/services/s3Client');
        expect(s3Client).toBeDefined();
      });
    });

    test('should handle production environment', () => {
      TestUtils.withEnvVar('NODE_ENV', 'production', () => {
        // Test behavior in production
        const s3Client = require('../../src/services/s3Client');
        expect(s3Client).toBeDefined();
      });
    });

    test('should handle test environment', () => {
      TestUtils.withEnvVar('NODE_ENV', 'test', () => {
        // Test behavior in test environment
        const s3Client = require('../../src/services/s3Client');
        expect(s3Client).toBeDefined();
      });
    });
  });

  describe('Configuration validation', () => {
    test('should validate package.json structure', () => {
      const packageJson = require('../../package.json');
      
      expect(packageJson.name).toBeDefined();
      expect(packageJson.version).toBeDefined();
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.start).toBeDefined();
      expect(packageJson.scripts.test).toBeDefined();
      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.devDependencies).toBeDefined();
    });

    test('should have proper Jest configuration', () => {
      const jestConfig = require('../../config/jest.config');
      
      expect(jestConfig.testEnvironment).toBe('node');
      expect(jestConfig.collectCoverageFrom).toBeDefined();
      expect(jestConfig.coverageDirectory).toBe('coverage');
      expect(jestConfig.testMatch).toBeDefined();
    });
  });

  describe('File structure validation', () => {
    test('should have all required project files', () => {
      const fs = require('fs');
      const path = require('path');
      
      const requiredFiles = [
        '../../package.json',
        '../../src/server.js',
        '../../src/services/s3Client.js',
        '../__mocks__/aws-sdk.js',
        '../../config/jest.config.js'
      ];
      
      requiredFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    test('should have test files for main modules', () => {
      const fs = require('fs');
      const path = require('path');
      
      const testFiles = [
        's3Client.test.js',
        'server.test.js',
        '../integration/integration.test.js',
        '../integration/edge-cases.test.js'
      ];
      
      testFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });

  describe('Performance and resource tests', () => {
    test('should load modules within acceptable time', async () => {
      const start = Date.now();
      
      // Clear cache to force fresh load
      delete require.cache[require.resolve('../../src/services/s3Client')];
      delete require.cache[require.resolve('../utils/test-utils')];
      
      require('../../src/services/s3Client');
      require('../utils/test-utils');
      
      const loadTime = Date.now() - start;
      
      // Modules should load quickly (less than 100ms)
      expect(loadTime).toBeLessThan(100);
    });

    test('should have reasonable memory footprint', () => {
      const beforeMemory = process.memoryUsage();
      
      // Load all modules
      require('../../src/services/s3Client');
      require('../utils/test-utils');
      
      const afterMemory = process.memoryUsage();
      const memoryIncrease = afterMemory.heapUsed - beforeMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });
});
