const request = require('supertest');
const express = require('express');

// Create a test instance of the server
const createApp = () => {
  const app = express();
  
  app.get('/health', (req, res) => res.send('Still working... on *my* machine 🧃'));
  
  return app;
};

describe('Server API Tests', () => {
  let app;
  
  beforeEach(() => {
    app = createApp();
  });

  describe('GET /health', () => {
    test('should return 200 and success message', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.text).toBe('Still working... on *my* machine 🧃');
    });

    test('should return text/html content type', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.headers['content-type']).toMatch(/text\/html/);
    });
  });

  describe('404 handling', () => {
    test('should return 404 for non-existent endpoints', async () => {
      await request(app)
        .get('/nonexistent')
        .expect(404);
    });

    test('should return 404 for different HTTP methods on /health', async () => {
      await request(app)
        .post('/health')
        .expect(404);
      
      await request(app)
        .put('/health')
        .expect(404);
      
      await request(app)
        .delete('/health')
        .expect(404);
    });
  });

  describe('Server configuration', () => {
    test('should handle multiple requests concurrently', async () => {
      const requests = Array.from({ length: 5 }, () =>
        request(app).get('/health').expect(200)
      );
      
      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.text).toBe('Still working... on *my* machine 🧃');
      });
    });
  });
});
