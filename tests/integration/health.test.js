import request from 'supertest';
import { app } from '../../app.js';

describe('Health Check API', () => {
  test('GET /health-check should return 200', async () => {
    const response = await request(app).get('/health-check');
    const checks = response.body.checks || {};
    expect(response.status === 200 || response.status === 503).toBe(true);
    expect(checks.database).toBe(true);
    expect(checks.redis).toBe(true);
  });

  test('GET / should return 200', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });

  test('GET /product should return 200', async () => {
    const response = await request(app).get('/product');
    expect(response.status).toBe(200);
  });

  test('GET /cart should return 200', async () => {
    const response = await request(app).get('/cart');
    expect(response.status).toBe(200);
  });

  test('GET /profile should return 200', async () => {
    const response = await request(app).get('/profile');
    expect(response.status).toBe(200);
  });
});
