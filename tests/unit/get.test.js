// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(403));

  test('authenticated requests return the available fragments', async () => {
    const response = await request(app)
      .get('/v1/fragments')
      .set('Authorization', process.env.VALID_TOKEN || 'Bearer demo-token');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.fragments).toBeDefined();
    expect(Array.isArray(response.body.fragments)).toBe(true);
    expect(response.body.fragments.length).toBeGreaterThan(0);
  });

  // TODO: we'll need to add tests to check the contents of the fragments array later
});
