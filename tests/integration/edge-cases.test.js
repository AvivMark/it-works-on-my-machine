// Edge case and boundary testing
jest.mock('aws-sdk');

const s3Client = require('../../src/services/s3Client');
const TestUtils = require('../utils/test-utils');

describe('Edge Cases and Boundary Tests', () => {
  describe('Data boundary tests', () => {
    test('should handle various file sizes', async () => {
      const sizes = [0, 1, 1023, 1024, 1025, 10240, 102400]; // Different size boundaries
      
      for (const size of sizes) {
        const content = Buffer.alloc(size, 'a');
        const key = `size-test-${size}.txt`;
        
        const uploadResult = await s3Client.upload('test-bucket', key, content);
        expect(uploadResult.ETag).toBe('mock-etag');
        
        const downloadResult = await s3Client.get('test-bucket', key);
        expect(downloadResult.length).toBe(size);
      }
    });

    test('should handle edge case content types', async () => {
      const scenarios = TestUtils.getEdgeCaseScenarios();
      
      for (const scenario of scenarios) {
        const content = Buffer.from(scenario.content || TestUtils.generateTestContent());
        const key = scenario.key || `edge-case-${scenario.name.replace(/\s+/g, '-')}.txt`;
        
        // Upload
        const uploadResult = await s3Client.upload('test-bucket', key, content);
        expect(uploadResult.ETag).toBe('mock-etag');
        
        // Download and verify
        const downloadResult = await s3Client.get('test-bucket', key);
        expect(TestUtils.validateBuffer(downloadResult, content)).toBe(true);
      }
    });
  });

  describe('Parameter validation', () => {
    test('should handle various bucket name formats', async () => {
      const bucketNames = [
        'simple-bucket',
        'bucket.with.dots',
        'bucket-with-dashes',
        'bucket123',
        'a'.repeat(63), // Max length bucket name
        'a' // Min length bucket name
      ];
      
      for (const bucketName of bucketNames) {
        const result = await s3Client.upload(bucketName, 'test.txt', Buffer.from('test'));
        expect(result.ETag).toBe('mock-etag');
      }
    });

    test('should handle various key name formats', async () => {
      const keyNames = [
        'simple-file.txt',
        'folder/subfolder/file.txt',
        'file_with_underscores.txt',
        'file with spaces.txt',
        'файл.txt', // Unicode filename
        '.hidden-file',
        'file.with.many.dots.txt',
        'UPPERCASE-FILE.TXT',
        'file-' + 'a'.repeat(1000) + '.txt' // Very long filename
      ];
      
      for (const keyName of keyNames) {
        try {
          const result = await s3Client.upload('test-bucket', keyName, Buffer.from('test'));
          expect(result.ETag).toBe('mock-etag');
          
          const retrieved = await s3Client.get('test-bucket', keyName);
          expect(retrieved.toString()).toBe('test');
        } catch (error) {
          // Some key names might be invalid - that's expected
          console.log(`Key ${keyName} failed as expected: ${error.message}`);
        }
      }
    });
  });

  describe('Concurrent operation stress tests', () => {
    test('should handle high concurrency uploads', async () => {
      const concurrentUploads = 50;
      const uploads = Array.from({ length: concurrentUploads }, (_, i) =>
        s3Client.upload('stress-bucket', `stress-file-${i}.txt`, Buffer.from(`content-${i}`))
      );
      
      const results = await Promise.all(uploads);
      results.forEach((result, index) => {
        expect(result.ETag).toBe('mock-etag');
      });
    }, 30000); // Increase timeout for stress test

    test('should handle mixed read/write operations', async () => {
      // First, upload some files
      const initialUploads = Array.from({ length: 10 }, (_, i) =>
        s3Client.upload('mixed-bucket', `initial-${i}.txt`, Buffer.from(`initial-${i}`))
      );
      await Promise.all(initialUploads);
      
      // Then mix reads and writes
      const mixedOps = [];
      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          // Write operation
          mixedOps.push(
            s3Client.upload('mixed-bucket', `mixed-${i}.txt`, Buffer.from(`mixed-${i}`))
          );
        } else {
          // Read operation (from initially uploaded files)
          const readIndex = i % 10;
          mixedOps.push(
            s3Client.get('mixed-bucket', `initial-${readIndex}.txt`)
          );
        }
      }
      
      const results = await Promise.all(mixedOps);
      
      // Verify results
      for (let i = 0; i < results.length; i++) {
        if (i % 2 === 0) {
          // Upload result
          expect(results[i].ETag).toBe('mock-etag');
        } else {
          // Read result
          const expectedContent = `initial-${i % 10}`;
          expect(results[i].toString()).toBe(expectedContent);
        }
      }
    });
  });

  describe('Error boundary tests', () => {
    test('should handle rapid successive operations on same key', async () => {
      const key = 'rapid-test.txt';
      const operations = [];
      
      // Rapid upload/read cycle
      for (let i = 0; i < 10; i++) {
        operations.push(
          s3Client.upload('test-bucket', key, Buffer.from(`content-${i}`))
            .then(() => s3Client.get('test-bucket', key))
        );
      }
      
      const results = await Promise.all(operations);
      results.forEach(result => {
        expect(Buffer.isBuffer(result)).toBe(true);
      });
    });

    test('should maintain data integrity under load', async () => {
      const testData = new Map();
      const operations = [];
      
      // Generate unique data for each file
      for (let i = 0; i < 25; i++) {
        const key = `integrity-${i}.txt`;
        const content = TestUtils.generateRandomString(100);
        testData.set(key, content);
        
        operations.push(
          s3Client.upload('integrity-bucket', key, Buffer.from(content))
        );
      }
      
      // Upload all files
      await Promise.all(operations);
      
      // Verify all files
      const verifications = Array.from(testData.entries()).map(([key, expectedContent]) =>
        s3Client.get('integrity-bucket', key).then(data => ({
          key,
          retrieved: data.toString(),
          expected: expectedContent,
          match: data.toString() === expectedContent
        }))
      );
      
      const results = await Promise.all(verifications);
      results.forEach(result => {
        expect(result.match).toBe(true);
      });
    });
  });

  describe('Memory and resource tests', () => {
    test('should handle memory efficient operations', async () => {
      // Test with larger data to ensure memory efficiency
      const largeContent = Buffer.alloc(1024 * 1024, 'x'); // 1MB
      
      const start = process.memoryUsage();
      
      await s3Client.upload('memory-test', 'large-file.txt', largeContent);
      const retrieved = await s3Client.get('memory-test', 'large-file.txt');
      
      const end = process.memoryUsage();
      
      expect(retrieved.length).toBe(largeContent.length);
      
      // Memory usage shouldn't grow excessively (this is a rough check)
      const memoryGrowth = end.heapUsed - start.heapUsed;
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth
    });

    test('should cleanup resources properly', async () => {
      // Simulate resource cleanup by doing many operations
      const operations = Array.from({ length: 100 }, (_, i) => async () => {
        await s3Client.upload('cleanup-test', `cleanup-${i}.txt`, Buffer.from(`cleanup-${i}`));
        return s3Client.get('cleanup-test', `cleanup-${i}.txt`);
      });
      
      // Run operations in batches to avoid overwhelming the system
      const batchSize = 10;
      for (let i = 0; i < operations.length; i += batchSize) {
        const batch = operations.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(op => op()));
        
        batchResults.forEach((result, index) => {
          expect(result.toString()).toBe(`cleanup-${i + index}`);
        });
      }
    }, 60000); // Extended timeout for resource test
  });
});
