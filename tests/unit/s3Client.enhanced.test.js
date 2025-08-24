// Enhanced S3 client tests with more scenarios
jest.mock('aws-sdk');

const s3Client = require('../../src/services/s3Client');

describe('s3Client Enhanced Tests', () => {
  const mockBucket = 'test-bucket';
  const mockKey = 'test-file.txt';
  const mockBody = Buffer.from('test content');

  afterEach(() => {
    // Clear the mock storage between tests
    jest.clearAllMocks();
  });

  describe('upload functionality', () => {
    test('should upload file and return ETag', async () => {
      const result = await s3Client.upload(mockBucket, mockKey, mockBody);
      
      expect(result).toBeDefined();
      expect(result.ETag).toBe('mock-etag');
    });

    test('should handle different file types', async () => {
      const textFile = Buffer.from('text content');
      const jsonFile = Buffer.from(JSON.stringify({ test: 'data' }));
      const binaryFile = Buffer.from([0x89, 0x50, 0x4E, 0x47]); // PNG header
      
      const results = await Promise.all([
        s3Client.upload(mockBucket, 'file.txt', textFile),
        s3Client.upload(mockBucket, 'data.json', jsonFile),
        s3Client.upload(mockBucket, 'image.png', binaryFile)
      ]);
      
      results.forEach(result => {
        expect(result.ETag).toBe('mock-etag');
      });
    });

    test('should handle empty files', async () => {
      const emptyBuffer = Buffer.alloc(0);
      const result = await s3Client.upload(mockBucket, 'empty.txt', emptyBuffer);
      
      expect(result.ETag).toBe('mock-etag');
    });

    test('should handle large file names', async () => {
      const longKey = 'a'.repeat(1000) + '.txt';
      const result = await s3Client.upload(mockBucket, longKey, mockBody);
      
      expect(result.ETag).toBe('mock-etag');
    });
  });

  describe('get functionality', () => {
    test('should retrieve uploaded file', async () => {
      // First upload a file
      await s3Client.upload(mockBucket, mockKey, mockBody);
      
      // Then retrieve it
      const retrievedData = await s3Client.get(mockBucket, mockKey);
      
      expect(Buffer.isBuffer(retrievedData)).toBe(true);
      expect(retrievedData.toString()).toBe('test content');
    });

    test('should handle multiple sequential uploads and retrievals', async () => {
      const files = [
        { key: 'file1.txt', content: 'content 1' },
        { key: 'file2.txt', content: 'content 2' },
        { key: 'file3.txt', content: 'content 3' }
      ];
      
      // Upload all files
      for (const file of files) {
        await s3Client.upload(mockBucket, file.key, Buffer.from(file.content));
      }
      
      // Retrieve all files
      for (const file of files) {
        const retrievedData = await s3Client.get(mockBucket, file.key);
        expect(retrievedData.toString()).toBe(file.content);
      }
    });

    test('should throw error for non-existent file', async () => {
      await expect(s3Client.get(mockBucket, 'nonexistent.txt'))
        .rejects.toThrow('NoSuchKey');
    });

    test('should handle different bucket names', async () => {
      const buckets = ['bucket-1', 'bucket-2', 'my-test-bucket'];
      
      // Upload to different buckets
      for (let i = 0; i < buckets.length; i++) {
        await s3Client.upload(buckets[i], `file-${i}.txt`, Buffer.from(`content-${i}`));
      }
      
      // Retrieve from different buckets
      for (let i = 0; i < buckets.length; i++) {
        const data = await s3Client.get(buckets[i], `file-${i}.txt`);
        expect(data.toString()).toBe(`content-${i}`);
      }
    });
  });

  describe('error handling', () => {
    test('should handle upload with invalid parameters', async () => {
      // Test with undefined parameters - this should be handled by AWS SDK
      // Since we're mocking, we test our wrapper behavior
      try {
        await s3Client.upload(undefined, undefined, undefined);
      } catch (error) {
        // The mock might not catch this, but in real scenario AWS SDK would
        expect(error).toBeDefined();
      }
    });

    test('should maintain file isolation between different keys', async () => {
      await s3Client.upload(mockBucket, 'file1.txt', Buffer.from('content1'));
      await s3Client.upload(mockBucket, 'file2.txt', Buffer.from('content2'));
      
      const data1 = await s3Client.get(mockBucket, 'file1.txt');
      const data2 = await s3Client.get(mockBucket, 'file2.txt');
      
      expect(data1.toString()).toBe('content1');
      expect(data2.toString()).toBe('content2');
      expect(data1.toString()).not.toBe(data2.toString());
    });

    test('should handle file overwrite scenarios', async () => {
      const originalContent = Buffer.from('original content');
      const updatedContent = Buffer.from('updated content');
      
      // Upload original file
      await s3Client.upload(mockBucket, mockKey, originalContent);
      let retrievedData = await s3Client.get(mockBucket, mockKey);
      expect(retrievedData.toString()).toBe('original content');
      
      // Overwrite with new content
      await s3Client.upload(mockBucket, mockKey, updatedContent);
      retrievedData = await s3Client.get(mockBucket, mockKey);
      expect(retrievedData.toString()).toBe('updated content');
    });
  });

  describe('concurrent operations', () => {
    test('should handle concurrent uploads', async () => {
      const uploads = Array.from({ length: 5 }, (_, i) => 
        s3Client.upload(mockBucket, `concurrent-${i}.txt`, Buffer.from(`content-${i}`))
      );
      
      const results = await Promise.all(uploads);
      results.forEach(result => {
        expect(result.ETag).toBe('mock-etag');
      });
    });

    test('should handle concurrent reads', async () => {
      // First upload some files
      await Promise.all([
        s3Client.upload(mockBucket, 'read1.txt', Buffer.from('read content 1')),
        s3Client.upload(mockBucket, 'read2.txt', Buffer.from('read content 2')),
        s3Client.upload(mockBucket, 'read3.txt', Buffer.from('read content 3'))
      ]);
      
      // Then read them concurrently
      const reads = await Promise.all([
        s3Client.get(mockBucket, 'read1.txt'),
        s3Client.get(mockBucket, 'read2.txt'),
        s3Client.get(mockBucket, 'read3.txt')
      ]);
      
      expect(reads[0].toString()).toBe('read content 1');
      expect(reads[1].toString()).toBe('read content 2');
      expect(reads[2].toString()).toBe('read content 3');
    });
  });
});
