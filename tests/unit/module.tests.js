const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Mock user data for testing
const mockUserData = {
  email: 'test@example.com',
  password: 'password123',
  role: 'STUDENT'
};

const mockStudentData = {
  name: 'Test Student',
  email: 'test@example.com',
  phone: '1234567890',
  address: 'Test Address',
  standard: '10th',
  board: 'CBSE'
};

const mockCourseData = {
  board: 'CBSE',
  standard: 'X',
  timing_start: '4:00 PM',
  timing_end: '5:15 PM',
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  fees: 10500,
  subjects: ['Maths', 'Science'],
  isActive: true
};

const mockTestSeriesData = {
  title: 'Test Test Series',
  overview: 'Test overview',
  features: ['Feature 1', 'Feature 2'],
  testPattern: 'MCQ Pattern',
  benefits: ['Benefit 1', 'Benefit 2'],
  image: 'https://example.com/image.jpg',
  ctaLabel: 'Enroll Now',
  demoTestLink: 'https://example.com/demo',
  heroPosterThumbnail: 'https://example.com/thumbnail.jpg',
  showInHeroPoster: true,
  testsCount: 10,
  mode: 'ONLINE',
  price: '₹5000'
};

// User Management Tests
const testUserCreation = async () => {
  console.log('Testing User Creation...');
  
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(mockUserData.password, 12);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        ...mockUserData,
        password: hashedPassword,
        studentProfile: {
          create: mockStudentData
        }
      },
      include: {
        studentProfile: true
      }
    });
    
    console.log('✓ User created successfully:', user.email);
    return user;
  } catch (error) {
    console.error('✗ User creation failed:', error.message);
    throw error;
  }
};

const testCourseManagement = async () => {
  console.log('Testing Course Management...');
  
  try {
    const course = await prisma.course.create({
      data: {
        ...mockCourseData,
        createdBy: 'test-admin-id'
      }
    });
    
    console.log('✓ Course created successfully:', `${course.board} ${course.standard}`);
    
    // Test adding chapters
    const chapter = await prisma.courseChapter.create({
      data: {
        courseId: course.id,
        title: 'Test Chapter',
        description: 'Test Chapter Description',
        videoUrl: 'https://youtube.com/test',
        chapterNumber: 1
      }
    });
    
    console.log('✓ Chapter added successfully:', chapter.title);
    
    return course;
  } catch (error) {
    console.error('✗ Course management failed:', error.message);
    throw error;
  }
};

const testTestSeriesManagement = async () => {
  console.log('Testing Test Series Management...');
  
  try {
    const testSeries = await prisma.testSeries.create({
      data: {
        ...mockTestSeriesData,
        createdBy: 'test-admin-id'
      }
    });
    
    console.log('✓ Test series created successfully:', testSeries.title);
    return testSeries;
  } catch (error) {
    console.error('✗ Test series management failed:', error.message);
    throw error;
  }
};

const testEnrollmentSystem = async () => {
  console.log('Testing Enrollment System...');
  
  try {
    const enrollment = await prisma.enrollment.create({
      data: {
        name: 'Test Enroller',
        email: 'enroller@example.com',
        phone: '0987654321',
        message: 'Test enrollment message',
        courseOrSeries: 'CBSE - X',
        status: 'PENDING'
      }
    });
    
    console.log('✓ Enrollment created successfully:', enrollment.name);
    return enrollment;
  } catch (error) {
    console.error('✗ Enrollment system failed:', error.message);
    throw error;
  }
};

const testContentManagement = async () => {
  console.log('Testing Content Management...');
  
  try {
    const blog = await prisma.blog.create({
      data: {
        title: 'Test Blog',
        content: 'Test blog content',
        image: 'https://example.com/blog-image.jpg',
        createdBy: 'test-admin-id'
      }
    });
    
    console.log('✓ Blog created successfully:', blog.title);
    
    const resource = await prisma.resource.create({
      data: {
        title: 'Test Resource',
        description: 'Test resource description',
        price: '₹1000',
        createdBy: 'test-admin-id'
      }
    });
    
    console.log('✓ Resource created successfully:', resource.title);
    
    return { blog, resource };
  } catch (error) {
    console.error('✗ Content management failed:', error.message);
    throw error;
  }
};

const testBannerAndFeatureFlags = async () => {
  console.log('Testing Banner and Feature Flags...');
  
  try {
    const banner = await prisma.bannerPoster.create({
      data: {
        imageUrl: 'https://example.com/banner.jpg',
        enabled: true
      }
    });
    
    console.log('✓ Banner created successfully');
    
    const featureFlag = await prisma.featureFlag.create({
      data: {
        name: 'TEST_FEATURE',
        description: 'Test feature flag',
        status: 'ENABLED',
        config: {}
      }
    });
    
    console.log('✓ Feature flag created successfully:', featureFlag.name);
    
    return { banner, featureFlag };
  } catch (error) {
    console.error('✗ Banner and feature flags failed:', error.message);
    throw error;
  }
};

const testContactSystem = async () => {
  console.log('Testing Contact System...');
  
  try {
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: 'Test Contact',
        email: 'contact@example.com',
        phone: '1122334455',
        message: 'Test contact message'
      }
    });
    
    console.log('✓ Contact message created successfully:', contactMessage.name);
    return contactMessage;
  } catch (error) {
    console.error('✗ Contact system failed:', error.message);
    throw error;
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('🧪 Starting Unit Tests...\n');
  
  try {
    await testUserCreation();
    await testCourseManagement();
    await testTestSeriesManagement();
    await testEnrollmentSystem();
    await testContentManagement();
    await testBannerAndFeatureFlags();
    await testContactSystem();
    
    console.log('\n🎉 All unit tests passed successfully!');
  } catch (error) {
    console.error('\n❌ Some tests failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testUserCreation,
  testCourseManagement,
  testTestSeriesManagement,
  testEnrollmentSystem,
  testContentManagement,
  testBannerAndFeatureFlags,
  testContactSystem,
  runAllTests
};