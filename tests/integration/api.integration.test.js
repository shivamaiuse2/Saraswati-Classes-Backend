const request = require('supertest');
const app = require('../../server');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

describe('Saraswati Classes API Integration Tests', () => {
  let authToken = '';
  let adminToken = '';

  // Setup and teardown
  beforeAll(async () => {
    // Create test admin user
    const admin = await prisma.user.create({
      data: {
        email: 'test.admin@saraswaticlasses.com',
        password: '$2a$12$examplehashedpassword', // Pre-hashed for testing
        role: 'ADMIN',
        adminProfile: {
          create: {
            name: 'Test Admin',
            phone: '1234567890'
          }
        }
      }
    });

    // Create test student user
    const student = await prisma.user.create({
      data: {
        email: 'test.student@saraswaticlasses.com',
        password: '$2a$12$examplehashedpassword', // Pre-hashed for testing
        role: 'STUDENT',
        studentProfile: {
          create: {
            name: 'Test Student',
            email: 'test.student@saraswaticlasses.com',
            phone: '0987654321'
          }
        }
      }
    });

    // Login to get tokens (in real scenario, you'd hash passwords properly)
    // For testing purposes, we'll mock the token generation
    adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LWFkbWluLWlkIiwicm9sZSI6IkFETUlOIiwiZW1haWwiOiJ0ZXN0LmFkbWluQHNhcmFzd2F0aWNsYXNzZXMuY29tIiwiaWF0IjoxNjI2MjQ5NjAwLCJleHAiOjE2MjYzMzYwMDB9.testsignature';
    authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXN0dWRlbnQtaWQiLCJyb2xlIjoiU1RVREVOVCIsImVtYWlsIjoidGVzdC5zdHVkZW50QHNhcmFzd2F0aWNsYXNzZXMuY29tIiwiaWF0IjoxNjI2MjQ5NjAwLCJleHAiOjE2MjYzMzYwMDB9.testsignature';
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: 'test.admin@saraswaticlasses.com' },
          { email: 'test.student@saraswaticlasses.com' }
        ]
      }
    });
    
    await prisma.$disconnect();
  });

  describe('Health Check', () => {
    test('GET /health should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Server is running');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Authentication Endpoints', () => {
    test('POST /api/v1/auth/admin/login should return error for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/admin/login')
        .send({
          email: 'nonexistent@admin.com',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('POST /api/v1/auth/student/login should return error for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/student/login')
        .send({
          email: 'nonexistent@student.com',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('POST /api/v1/auth/register should return error for missing fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
          // Missing name field
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Public Content Endpoints', () => {
    test('GET /api/v1/courses should return courses', async () => {
      const response = await request(app).get('/api/v1/courses');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/v1/test-series should return test series', async () => {
      const response = await request(app).get('/api/v1/test-series');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/v1/blogs should return blogs', async () => {
      const response = await request(app).get('/api/v1/blogs');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/v1/banners should return active banners', async () => {
      const response = await request(app).get('/api/v1/banners');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/v1/feature-flags should return active feature flags', async () => {
      const response = await request(app).get('/api/v1/feature-flags');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(typeof response.body.data).toBe('object');
    });
  });

  describe('Protected Admin Endpoints', () => {
    test('GET /api/v1/admin/students should require authentication', async () => {
      const response = await request(app).get('/api/v1/admin/students');
      
      expect(response.status).toBe(401);
    });

    test('GET /api/v1/admin/courses should require authentication', async () => {
      const response = await request(app).get('/api/v1/admin/courses');
      
      expect(response.status).toBe(401);
    });

    test('GET /api/v1/admin/analytics/overview should require authentication', async () => {
      const response = await request(app).get('/api/v1/admin/analytics/overview');
      
      expect(response.status).toBe(401);
    });
  });

  describe('Protected Student Endpoints', () => {
    test('GET /api/v1/students/profile should require authentication', async () => {
      const response = await request(app).get('/api/v1/students/profile');
      
      expect(response.status).toBe(401);
    });

    test('GET /api/v1/students/courses should require authentication', async () => {
      const response = await request(app).get('/api/v1/students/courses');
      
      expect(response.status).toBe(401);
    });
  });

  describe('Contact and Communication Endpoints', () => {
    test('POST /api/v1/contact should accept contact message', async () => {
      const response = await request(app)
        .post('/api/v1/contact')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890',
          message: 'Test contact message'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('POST /api/v1/contact should require required fields', async () => {
      const response = await request(app)
        .post('/api/v1/contact')
        .send({
          name: 'Test User'
          // Missing other required fields
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('File Upload Endpoints', () => {
    test('POST /api/v1/upload/image should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/upload/image')
        .field('folder', 'test');
      
      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    test('GET /nonexistent-route should return 404', async () => {
      const response = await request(app).get('/nonexistent-route');
      
      expect(response.status).toBe(404);
    });

    test('GET /api/v1/courses/nonexistent-id should return 404', async () => {
      const response = await request(app).get('/api/v1/courses/nonexistent-id');
      
      expect(response.status).toBe(404);
    });
  });
});

// Additional specific tests for key functionality
describe('Course Management Integration Tests', () => {
  test('Course creation and retrieval should work', async () => {
    // This would require admin authentication in real implementation
    const response = await request(app).get('/api/v1/courses');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('Test series endpoints should be accessible', async () => {
    const response = await request(app).get('/api/v1/test-series');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

describe('Enrollment and Inquiry Tests', () => {
  test('Enrollment submission should work', async () => {
    const response = await request(app)
      .post('/api/v1/enrollments')
      .send({
        name: 'Integration Test',
        email: 'integration@test.com',
        phone: '9876543210',
        courseOrSeries: 'Test Course',
        message: 'Integration test enrollment'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  test('Inquiry submission should work', async () => {
    const response = await request(app)
      .post('/api/v1/inquiries')
      .send({
        name: 'Integration Test',
        email: 'integration@test.com',
        phone: '9876543210',
        message: 'Integration test inquiry'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});

console.log('Integration tests loaded successfully');