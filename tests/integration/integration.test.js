// Integration tests that test the interaction between different components
const request = require('supertest');
const express = require('express');
const s3Client = require('../../src/services/s3Client');

// Mock the S3 client for integration tests
jest.mock('../../src/services/s3Client');

describe('Integration Tests', () => {
  let app;
  
  beforeEach(() => {
    // Create a more comprehensive app for integration testing
    app = express();
    app.use(express.json());
    
    // Health endpoint
    app.get('/health', (req, res) => res.send('Still working... on *my* machine 🧃'));
    
    // Simulated file upload endpoint (for testing integration)
    app.post('/upload', async (req, res) => {
      try {
        const { filename, content } = req.body;
        if (!filename || !content) {
          return res.status(400).json({ error: 'filename and content are required' });
        }
        
        const result = await s3Client.upload('test-bucket', filename, Buffer.from(content));
        res.status(201).json({ success: true, etag: result.ETag });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Simulated file download endpoint
    app.get('/download/:filename', async (req, res) => {
      try {
        const { filename } = req.params;
        const data = await s3Client.get('test-bucket', filename);
        res.set('Content-Type', 'text/plain');
        res.send(data.toString());
      } catch (error) {
        if (error.code === 'NoSuchKey') {
          res.status(404).json({ error: 'File not found' });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check Integration', () => {
    test('should integrate health check with different server states', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.text).toContain('Still working');
    });

    test('should maintain health endpoint availability during load', async () => {
      // Simulate load with multiple concurrent requests
      const healthChecks = Array.from({ length: 10 }, () =>
        request(app).get('/health')
      );
      
      const responses = await Promise.all(healthChecks);
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.text).toContain('Still working');
      });
    });
  });

  describe('File Upload/Download Integration', () => {
    test('should handle complete upload-download cycle', async () => {
      const testData = {
        filename: 'integration-test.txt',
        content: 'Integration test content'
      };
      
      // Mock the S3 client methods
      s3Client.upload.mockResolvedValue({ ETag: 'mock-etag-123' });
      s3Client.get.mockResolvedValue(Buffer.from(testData.content));
      
      // Upload file
      const uploadResponse = await request(app)
        .post('/upload')
        .send(testData)
        .expect(201);
      
      expect(uploadResponse.body).toEqual({
        success: true,
        etag: 'mock-etag-123'
      });
      
      // Download file
      const downloadResponse = await request(app)
        .get(`/download/${testData.filename}`)
        .expect(200);
      
      expect(downloadResponse.text).toBe(testData.content);
      
      // Verify S3 client was called correctly
      expect(s3Client.upload).toHaveBeenCalledWith(
        'test-bucket', 
        testData.filename, 
        expect.any(Buffer)
      );
      expect(s3Client.get).toHaveBeenCalledWith('test-bucket', testData.filename);
    });

    test('should handle upload validation errors', async () => {
      // Test missing filename
      await request(app)
        .post('/upload')
        .send({ content: 'test content' })
        .expect(400, { error: 'filename and content are required' });
      
      // Test missing content
      await request(app)
        .post('/upload')
        .send({ filename: 'test.txt' })
        .expect(400, { error: 'filename and content are required' });
      
      // Test empty request
      await request(app)
        .post('/upload')
        .send({})
        .expect(400, { error: 'filename and content are required' });
    });

    test('should handle S3 upload errors', async () => {
      s3Client.upload.mockRejectedValue(new Error('S3 upload failed'));
      
      await request(app)
        .post('/upload')
        .send({ filename: 'test.txt', content: 'test content' })
        .expect(500, { error: 'S3 upload failed' });
    });

    test('should handle file not found during download', async () => {
      const error = new Error('NoSuchKey');
      error.code = 'NoSuchKey';
      s3Client.get.mockRejectedValue(error);
      
      await request(app)
        .get('/download/nonexistent.txt')
        .expect(404, { error: 'File not found' });
    });

    test('should handle S3 download errors', async () => {
      s3Client.get.mockRejectedValue(new Error('S3 connection error'));
      
      await request(app)
        .get('/download/test.txt')
        .expect(500, { error: 'S3 connection error' });
    });
  });

  describe('API Endpoint Combinations', () => {
    test('should handle multiple API calls in sequence', async () => {
      s3Client.upload.mockResolvedValue({ ETag: 'mock-etag' });
      s3Client.get.mockResolvedValue(Buffer.from('file content'));
      
      // Health check
      await request(app).get('/health').expect(200);
      
      // Upload
      await request(app)
        .post('/upload')
        .send({ filename: 'test.txt', content: 'file content' })
        .expect(201);
      
      // Download
      await request(app)
        .get('/download/test.txt')
        .expect(200);
      
      // Another health check
      await request(app).get('/health').expect(200);
    });

    test('should handle concurrent API operations', async () => {
      s3Client.upload.mockResolvedValue({ ETag: 'mock-etag' });
      s3Client.get.mockResolvedValue(Buffer.from('concurrent content'));
      
      const operations = [
        request(app).get('/health'),
        request(app).post('/upload').send({ filename: 'concurrent1.txt', content: 'content1' }),
        request(app).post('/upload').send({ filename: 'concurrent2.txt', content: 'content2' }),
        request(app).get('/health')
      ];
      
      const responses = await Promise.all(operations);
      
      expect(responses[0].status).toBe(200); // health
      expect(responses[1].status).toBe(201); // upload 1
      expect(responses[2].status).toBe(201); // upload 2
      expect(responses[3].status).toBe(200); // health
    });
  });

  describe('Error Handling Integration', () => {
    test('should maintain service availability during S3 outages', async () => {
      // Even if S3 is down, health endpoint should work
      s3Client.upload.mockRejectedValue(new Error('S3 service unavailable'));
      
      // Health check should still work
      await request(app).get('/health').expect(200);
      
      // Upload should fail gracefully
      await request(app)
        .post('/upload')
        .send({ filename: 'test.txt', content: 'test' })
        .expect(500, { error: 'S3 service unavailable' });
      
      // Health check should still work after error
      await request(app).get('/health').expect(200);
    });

    test('should handle malformed requests gracefully', async () => {
      // Invalid JSON should be handled by Express
      const response = await request(app)
        .post('/upload')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
      
      // Health endpoint should still work
      await request(app).get('/health').expect(200);
    });
  });
});
