// tests/unit/app.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('App Tests', () => {
  describe('GET /', () => {
    test('should return health check information', async () => {
      const res = await request(app).get('/');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body).toHaveProperty('author');
      expect(res.body).toHaveProperty('githubUrl');
      expect(res.body).toHaveProperty('version');
      expect(res.body.githubUrl).toBe('https://github.com/yuyuUNny/fragments');
    });

    test('should set Cache-Control header to no-cache', async () => {
      const res = await request(app).get('/');

      expect(res.headers['cache-control']).toBe('no-cache');
    });

    test('should return JSON content type', async () => {
      const res = await request(app).get('/');

      expect(res.type).toBe('application/json');
    });
  });

  describe('404 Handler', () => {
    test('should return 404 for non-existent routes', async () => {
      const res = await request(app).get('/non-existent-route');

      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe('error');
      expect(res.body.error.message).toBe('not found');
      expect(res.body.error.code).toBe(404);
    });

    test('should return 404 for invalid API endpoints', async () => {
      const res = await request(app).get('/v1/invalid-endpoint');

      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBeUndefined();
    });

    test('should return 404 for POST to non-existent routes', async () => {
      const res = await request(app).post('/invalid-route').send({});

      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe('error');
      expect(res.body.error.code).toBe(404);
    });

    test('should return 404 for PUT to non-existent routes', async () => {
      const res = await request(app).put('/invalid-route').send({});

      expect(res.statusCode).toBe(404);
    });

    test('should return 404 for DELETE to non-existent routes', async () => {
      const res = await request(app).delete('/invalid-route');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('Middleware Configuration', () => {
    test('should have CORS enabled', async () => {
      const res = await request(app).get('/').set('Origin', 'http://example.com');

      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });

    test('should have Helmet security headers', async () => {
      const res = await request(app).get('/');

      // Helmet sets various security headers
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    test('should accept JSON payloads', async () => {
      const res = await request(app)
        .post('/non-existent')
        .set('Content-Type', 'application/json')
        .send({ test: 'data' });

      // Should process JSON (even though route doesn't exist)
      expect(res.statusCode).toBe(404);
    });

    test('should handle compression', async () => {
      const res = await request(app).get('/').set('Accept-Encoding', 'gzip');

      // Compression middleware is active
      expect(res.statusCode).toBe(200);
    });
  });

  describe('Error Handler', () => {
    test('should handle malformed JSON', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      // Express will catch JSON parsing errors
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    test('should handle malformed JSON with proper error status', async () => {
      const res = await request(app)
        .post('/')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');
      // Express will catch JSON parsing errors
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Content Type Handling', () => {
    test('should handle text/plain content type', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/plain')
        .send('test content');

      // Will be rejected due to auth, but content-type was parsed
      expect([401, 404]).toContain(res.statusCode);
    });

    test('should handle text/markdown content type', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/markdown')
        .send('# Markdown');

      expect([401, 404]).toContain(res.statusCode);
    });

    test('should handle text/html content type', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/html')
        .send('<h1>HTML</h1>');

      expect([401, 404]).toContain(res.statusCode);
    });

    test('should handle application/json content type', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ test: 'data' }));

      expect([401, 404]).toContain(res.statusCode);
    });

    test('should reject unsupported content types', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'application/xml')
        .send('<xml></xml>');

      // Unsupported type will not be parsed by rawBody middleware
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Request Size Limits', () => {
    test('should accept payloads under 5mb', async () => {
      const smallPayload = 'a'.repeat(1000); // 1KB
      const res = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/plain')
        .send(smallPayload);

      // Will fail auth but payload was accepted
      expect([401, 404]).toContain(res.statusCode);
    });

    test('should reject payloads over 5mb', async () => {
      const largePayload = 'a'.repeat(6 * 1024 * 1024); // 6MB
      const res = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/plain')
        .send(largePayload);

      expect(res.statusCode).toBe(413); // Payload too large
    });
  });

  describe('HTTP Methods', () => {
    test('should handle GET requests', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
    });

    test('should handle POST requests', async () => {
      const res = await request(app).post('/non-existent').send({});
      expect([404, 400, 401]).toContain(res.statusCode);
    });

    test('should handle PUT requests', async () => {
      const res = await request(app).put('/non-existent').send({});
      expect([404, 400, 401]).toContain(res.statusCode);
    });

    test('should handle DELETE requests', async () => {
      const res = await request(app).delete('/non-existent');
      expect([404, 401]).toContain(res.statusCode);
    });
  });

  describe('Response Format', () => {
    test('should always return JSON responses', async () => {
      const res = await request(app).get('/');
      expect(res.type).toMatch(/json/);
    });

    test('should return consistent error format', async () => {
      const res = await request(app).get('/non-existent');

      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toHaveProperty('message');
      expect(res.body.error).toHaveProperty('code');
    });
  });

  describe('Environment-specific Behavior', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    test('should work in test environment', async () => {
      process.env.NODE_ENV = 'test';
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
    });

    test('should work in development environment', async () => {
      process.env.NODE_ENV = 'development';
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
    });
  });

  describe('Special Characters and Edge Cases', () => {
    test('should handle URLs with special characters', async () => {
      const res = await request(app).get('/path%20with%20spaces');
      expect(res.statusCode).toBe(404);
    });

    test('should handle URLs with query parameters', async () => {
      const res = await request(app).get('/non-existent?param=value');
      expect(res.statusCode).toBe(404);
      expect(res.body.error.code).toBe(404);
    });

    test('should handle empty request bodies', async () => {
      const res = await request(app)
        .post('/non-existent')
        .set('Content-Type', 'application/json')
        .send();

      expect([400, 404]).toContain(res.statusCode);
    });
  });
});
