const request = require('supertest');
const app = require('../server');

describe('Health Check Endpoint', () => {
  test('GET /health should return server status', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });
});

describe('Auth Routes', () => {
  test('POST /api/v1/auth/admin/login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/admin/login')
      .send({
        email: 'invalid@admin.com',
        password: 'wrongpassword'
      });
    
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });

  test('POST /api/v1/auth/student/login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/student/login')
      .send({
        email: 'invalid@student.com',
        password: 'wrongpassword'
      });
    
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });

  test('POST /api/v1/auth/register with missing fields', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
        // Missing name field
      });
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });
});

describe('Public Routes', () => {
  test('GET /api/v1/courses should return courses list', async () => {
    const response = await request(app).get('/api/v1/courses');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success');
  });

  test('GET /api/v1/test-series should return test series list', async () => {
    const response = await request(app).get('/api/v1/test-series');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success');
  });
});

describe('Protected Routes', () => {
  test('GET /api/v1/auth/profile without token should fail', async () => {
    const response = await request(app).get('/api/v1/auth/profile');
    
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });

  test('GET /api/v1/admin/students without token should fail', async () => {
    const response = await request(app).get('/api/v1/admin/students');
    
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });
});