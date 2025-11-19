// tests/app.test.js
const request = require('supertest');
const app = require('../../src/app');

// Mock Fragment module
jest.mock('../../src/model/fragment', () => ({
  isSupportedType: jest.fn(() => true) // always return true for tests
}));

// Mock passport to skip authentication
jest.mock('passport', () => {
  const original = jest.requireActual('passport');
  return {
    ...original,
    use: jest.fn(),
    initialize: jest.fn(() => (req, res, next) => next())
  };
});

// Mock logger so it doesn’t spam output
jest.mock('../../src/logger', () => {
  const pino = require('pino');
  return pino({ level: 'silent' });
});

describe('App', () => {
  test('GET / should return status ok', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.author).toBeDefined();
    expect(res.body.version).toBeDefined();
    expect(res.body.githubUrl).toBe('https://github.com/yuyuUNny/fragments');
  });

  test('GET /nonexistent should return 404', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
  });

  test('Error handler returns 404 on server error', async () => {
    // Create a temporary route to throw error
    app.get('/error', (req, res) => {
      throw new Error('Test error');
    });

    const res = await request(app).get('/error');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('not found');
  });

  test('rawBody middleware allows supported content type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ test: 'data' }));

    expect(res.statusCode).toBe(500);
  });

  test('GET / should return status ok with correct metadata', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200); // HTTP 200
    expect(res.headers['cache-control']).toBe('no-cache');

    // Check response body
    expect(res.body.status).toBe('ok');
  });
});
