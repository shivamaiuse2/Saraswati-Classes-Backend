const request = require('supertest');
const app = require('../../server');

describe('Registration with Auto Login', () => {
  describe('POST /auth/register - Student Registration', () => {
    it('should register student and return auth tokens', async () => {
      const studentData = {
        name: 'Test Student',
        email: 'test.student@example.com',
        password: 'password123',
        phone: '1234567890',
        standard: '12th',
        board: 'CBSE'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(studentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Registration and login successful');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(studentData.email);
      expect(response.body.data.user.role).toBe('STUDENT');
    });

    it('should prevent duplicate registration', async () => {
      const studentData = {
        name: 'Test Student 2',
        email: 'test.student@example.com', // Same email as previous test
        password: 'password123',
        phone: '1234567891',
        standard: '11th',
        board: 'ICSE'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(studentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User with this email already exists');
    });
  });

  describe('POST /auth/admin/register - Admin Registration', () => {
    it('should register admin and return auth tokens', async () => {
      const adminData = {
        name: 'Test Admin',
        email: 'test.admin@example.com',
        password: 'admin123',
        phone: '9876543210'
      };

      const response = await request(app)
        .post('/auth/admin/register')
        .send(adminData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Admin registration and login successful');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(adminData.email);
      expect(response.body.data.user.role).toBe('ADMIN');
    });
  });
});