const express = require('express');
const router = express.Router();
const { authenticate, authorizeStudent } = require('../utils/auth');
const courseController = require('../controllers/course.controller');
const testSeriesController = require('../controllers/testSeries.controller');
const enrollmentController = require('../controllers/enrollment.controller');
const contentController = require('../controllers/content.controller');
const contactController = require('../controllers/contact.controller');
const userController = require('../controllers/user.controller');

// Student dashboard routes
router.get('/dashboard', authenticate, authorizeStudent, userController.getStudentDashboard);
router.get('/profile', authenticate, authorizeStudent, userController.getStudentProfile);
router.put('/profile', authenticate, authorizeStudent, userController.updateStudentProfile);

// Student course management
router.get('/courses', authenticate, authorizeStudent, courseController.getStudentCourses);
router.get('/courses/:id', authenticate, authorizeStudent, courseController.getCourseById);
// Using getCourseChapters if it exists, otherwise using a different approach
router.get('/courses/:id/chapters', authenticate, authorizeStudent, (req, res, next) => {
  if (courseController.getCourseChapters) {
    courseController.getCourseChapters(req, res, next);
  } else {
    // Fallback: return chapters from getCourseById
    courseController.getCourseById(req, res, next); // This will return course with chapters
  }
});

// Student test series management
router.get('/test-series', authenticate, authorizeStudent, testSeriesController.getStudentTestSeries);
router.get('/test-series/:id', authenticate, authorizeStudent, testSeriesController.getTestSeriesById);
// Note: getTestsForTestSeries not implemented yet, skipping for now
// router.get('/test-series/:id/tests', authenticate, authorizeStudent, testSeriesController.getTestsForTestSeries);

// Student enrollment management
router.get('/enrollments', authenticate, authorizeStudent, enrollmentController.getStudentEnrollments);
router.get('/enrollments/:id', authenticate, authorizeStudent, enrollmentController.getEnrollmentById);
router.post('/enrollments', authenticate, authorizeStudent, enrollmentController.createEnrollment);

// Student test results (from test series)
router.get('/results', authenticate, authorizeStudent, testSeriesController.getTestSeriesResults);

// Student achievement results (added by admin)
router.get('/achievements', authenticate, authorizeStudent, contentController.getStudentResults);

// Content access
router.get('/blogs', authenticate, authorizeStudent, contentController.getAllBlogs);
router.get('/blogs/:id', authenticate, authorizeStudent, contentController.getBlogById);
router.get('/resources', authenticate, authorizeStudent, contentController.getAllResources);
router.get('/resources/:id', authenticate, authorizeStudent, contentController.getResourceById);

// Contact and inquiries
router.post('/contact', authenticate, authorizeStudent, contactController.createContactMessage);
router.post('/inquiry', authenticate, authorizeStudent, contactController.createInquiry);

// Certificates
router.get('/certificates', authenticate, authorizeStudent, userController.getStudentCertificates);
router.get('/certificates/:id', authenticate, authorizeStudent, userController.getStudentCertificateById);

module.exports = router;