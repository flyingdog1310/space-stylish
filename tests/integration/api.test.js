import request from 'supertest';
import { app } from '../../app.js';

describe('API Endpoints', () => {
  describe('Products API', () => {
    test('GET /api/v1/products should return products', async () => {
      const response = await request(app).get('/api/v1/products');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
    });

    test('GET /api/v1/products?category=women should return women products', async () => {
      const response = await request(app).get('/api/v1/products?category=women');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    test('GET /api/v1/products?category=men should return men products', async () => {
      const response = await request(app).get('/api/v1/products?category=men');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    test('GET /api/v1/products/search?keyword=dress should return search results', async () => {
      const response = await request(app).get('/api/v1/products/search?keyword=dress');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    test('GET /api/v1/products/1 should return product detail', async () => {
      const response = await request(app).get('/api/v1/products/1');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    test('GET /api/v1/products/999 should return 404 for non-existent product', async () => {
      const response = await request(app).get('/api/v1/products/999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Marketing API', () => {
    test('GET /api/v1/marketing/campaigns should return campaigns', async () => {
      const response = await request(app).get('/api/v1/marketing/campaigns');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('User API', () => {
    test('POST /api/v1/user/signup should handle signup', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/user/signup')
        .send(userData);

      // 可能返回 200 (成功) 或 403 (email 已存在)
      expect([200, 403]).toContain(response.status);
    });

    test('POST /api/v1/user/signin should handle signin', async () => {
      const userData = {
        provider: 'native',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/user/signin')
        .send(userData);

      // 可能返回 200 (成功) 或 400/403 (失敗)
      expect([200, 400, 403]).toContain(response.status);
    });

    test('GET /api/v1/user/profile should require authentication', async () => {
      const response = await request(app).get('/api/v1/user/profile');
      expect(response.status).toBe(401); // 沒有 token 應該返回 401
    });
  });

  describe('Health Check API', () => {
    test('GET /health-check should return health status', async () => {
      const response = await request(app).get('/health-check');
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('checks');
    });
  });

  describe('Error Handling', () => {
    test('GET /non-existent-endpoint should return 404', async () => {
      const response = await request(app).get('/non-existent-endpoint');
      expect(response.status).toBe(404);
    });

    test('Invalid product ID should return validation error', async () => {
      const response = await request(app).get('/api/v1/products/invalid');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    test('Missing keyword in search should return validation error', async () => {
      const response = await request(app).get('/api/v1/products/search');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Rate Limiting', () => {
    test('API endpoints should respect rate limiting', async () => {
      // 快速發送多個請求
      const promises = Array(35).fill().map(() =>
        request(app).get('/api/v1/products')
      );

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(r => r.status === 429);

      // 應該有部分請求被限流
      expect(rateLimited).toBe(true);
    });
  });
});
