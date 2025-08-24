// Utility functions and test helpers
const path = require('path');

/**
 * Test utilities for the project
 */
class TestUtils {
  /**
   * Generate random test data
   */
  static generateRandomString(length = 10) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate test file content of various types
   */
  static generateTestContent(type = 'text') {
    switch (type) {
      case 'json':
        return JSON.stringify({
          test: true,
          timestamp: Date.now(),
          data: this.generateRandomString(50)
        });
      case 'xml':
        return `<?xml version="1.0"?><root><test>${this.generateRandomString(20)}</test></root>`;
      case 'csv':
        return `name,value,timestamp\ntest,${this.generateRandomString(10)},${Date.now()}`;
      case 'binary':
        return Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]); // PNG header
      case 'empty':
        return '';
      case 'large':
        return this.generateRandomString(10000);
      default:
        return `Test content: ${this.generateRandomString(20)}`;
    }
  }

  /**
   * Create a delay for testing async operations
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate buffer content
   */
  static validateBuffer(buffer, expectedContent) {
    if (!Buffer.isBuffer(buffer)) {
      throw new Error('Expected buffer but got ' + typeof buffer);
    }
    
    if (Buffer.isBuffer(expectedContent)) {
      return buffer.equals(expectedContent);
    }
    
    return buffer.toString() === expectedContent;
  }

  /**
   * Create mock S3 parameters
   */
  static createS3Params(bucket = 'test-bucket', key = null, body = null) {
    return {
      Bucket: bucket,
      Key: key || `test-${this.generateRandomString(8)}.txt`,
      Body: body || Buffer.from(this.generateTestContent())
    };
  }

  /**
   * Environment variable helpers
   */
  static withEnvVar(name, value, callback) {
    const original = process.env[name];
    process.env[name] = value;
    
    try {
      return callback();
    } finally {
      if (original === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = original;
      }
    }
  }

  /**
   * Create test scenarios for edge cases
   */
  static getEdgeCaseScenarios() {
    return [
      { name: 'empty file', content: '' },
      { name: 'single character', content: 'a' },
      { name: 'unicode content', content: '🚀 Unicode test 中文 🎉' },
      { name: 'newlines and spaces', content: '  \n\n  test  \n\n  ' },
      { name: 'special characters', content: '!@#$%^&*()[]{}|\\:";\'<>?,./' },
      { name: 'long filename', key: 'a'.repeat(200) + '.txt' },
      { name: 'filename with spaces', key: 'file with spaces.txt' },
      { name: 'filename with special chars', key: 'file-name_with.special-chars.txt' }
    ];
  }
}

module.exports = TestUtils;
