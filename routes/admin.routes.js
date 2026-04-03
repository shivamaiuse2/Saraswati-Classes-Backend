const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../utils/auth');
const adminController = require('../controllers/user.controller'); // Using user controller for admin functions
const courseController = require('../controllers/course.controller');
const testSeriesController = require('../controllers/testSeries.controller');
const enrollmentController = require('../controllers/enrollment.controller');
const analyticsController = require('../controllers/analytics.controller');
const contentController = require('../controllers/content.controller');
const contactController = require('../controllers/contact.controller');
const bannerController = require('../controllers/banner.controller');

// Student management routes
router.get('/students', authenticate, authorizeAdmin, adminController.getAllStudents);
router.get('/students/search', authenticate, authorizeAdmin, adminController.searchStudents);
router.post('/students', authenticate, authorizeAdmin, adminController.createStudent);
router.get('/students/:id', authenticate, authorizeAdmin, adminController.getStudentById);
router.put('/students/:id', authenticate, authorizeAdmin, adminController.updateStudent);
router.delete('/students/:id', authenticate, authorizeAdmin, adminController.deleteStudent);
router.put('/students/:id/status', authenticate, authorizeAdmin, adminController.updateStudentStatus);
router.get('/students/:id/certificates', authenticate, authorizeAdmin, adminController.getStudentCertificates);
router.get('/students/:id/certificates/:certificateId', authenticate, authorizeAdmin, adminController.getStudentCertificateById);
router.get('/students/:id/dashboard', authenticate, authorizeAdmin, adminController.getStudentDashboard);
router.get('/students/:id/enrollments', authenticate, authorizeAdmin, adminController.getStudentEnrollments);

// Course management routes
router.get('/courses', authenticate, authorizeAdmin, courseController.getAllCourses);
router.get('/courses/:id', authenticate, authorizeAdmin, courseController.getCourseById);
router.post('/courses', authenticate, authorizeAdmin, courseController.createCourse);
router.put('/courses/:id', authenticate, authorizeAdmin, courseController.updateCourse);
router.delete('/courses/:id', authenticate, authorizeAdmin, courseController.deleteCourse);
router.post('/courses/:id/chapters', authenticate, authorizeAdmin, courseController.addChapter);
router.put('/courses/chapters/:chapterId', authenticate, authorizeAdmin, courseController.updateChapter);
router.delete('/courses/chapters/:chapterId', authenticate, authorizeAdmin, courseController.deleteChapter);
// Test Series management routes
router.get('/test-series', authenticate, authorizeAdmin, testSeriesController.getAdminTestSeries);
router.get('/test-series/:id', authenticate, authorizeAdmin, testSeriesController.getTestSeriesById);
router.post('/test-series', authenticate, authorizeAdmin, testSeriesController.createTestSeries);
router.put('/test-series/:id', authenticate, authorizeAdmin, testSeriesController.updateTestSeries);
router.delete('/test-series/:id', authenticate, authorizeAdmin, testSeriesController.deleteTestSeries);
router.post('/test-series/:id/tests', authenticate, authorizeAdmin, testSeriesController.addTestToSeries);
router.put('/test-series/tests/:id', authenticate, authorizeAdmin, testSeriesController.updateTest);
router.delete('/test-series/tests/:id', authenticate, authorizeAdmin, testSeriesController.deleteTest);

// Test results management routes
router.get('/test-series/results', authenticate, authorizeAdmin, testSeriesController.getAllTestResults);
router.post('/test-series/results', authenticate, authorizeAdmin, testSeriesController.createTestResult);
router.put('/test-series/results/:id', authenticate, authorizeAdmin, testSeriesController.updateTestResult);
router.delete('/test-series/results/:id', authenticate, authorizeAdmin, testSeriesController.deleteTestResult);


// Enrollment management routes
router.get('/enrollments', authenticate, authorizeAdmin, enrollmentController.getAllEnrollments);
router.get('/enrollments/:id', authenticate, authorizeAdmin, enrollmentController.getEnrollmentById);
router.put('/enrollments/:id', authenticate, authorizeAdmin, enrollmentController.updateEnrollmentStatus);
router.delete('/enrollments/:id', authenticate, authorizeAdmin, enrollmentController.deleteEnrollment);

// Analytics routes
router.get('/analytics', authenticate, authorizeAdmin, analyticsController.getAdminAnalytics);
router.get('/analytics/users', authenticate, authorizeAdmin, analyticsController.getUserAnalytics);
router.get('/analytics/courses', authenticate, authorizeAdmin, analyticsController.getCourseAnalytics);
router.get('/analytics/test-series', authenticate, authorizeAdmin, analyticsController.getTestSeriesAnalytics);
router.get('/analytics/revenue', authenticate, authorizeAdmin, analyticsController.getRevenueAnalytics);

// Content management routes
router.get('/blogs', authenticate, authorizeAdmin, contentController.getAllBlogs);
router.get('/blogs/:id', authenticate, authorizeAdmin, contentController.getBlogById);
router.post('/blogs', authenticate, authorizeAdmin, contentController.createBlog);
router.put('/blogs/:id', authenticate, authorizeAdmin, contentController.updateBlog);
router.delete('/blogs/:id', authenticate, authorizeAdmin, contentController.deleteBlog);

router.get('/gallery', authenticate, authorizeAdmin, contentController.getGalleryItems);
router.get('/gallery/:id', authenticate, authorizeAdmin, contentController.getGalleryItemById);
router.post('/gallery', authenticate, authorizeAdmin, contentController.createGalleryItem);
router.put('/gallery/:id', authenticate, authorizeAdmin, contentController.updateGalleryItem);
router.delete('/gallery/:id', authenticate, authorizeAdmin, contentController.deleteGalleryItem);

router.get('/results', authenticate, authorizeAdmin, contentController.getAllResults);
router.get('/results/:id', authenticate, authorizeAdmin, contentController.getResultById);
router.post('/results', authenticate, authorizeAdmin, contentController.createResult);
router.put('/results/:id', authenticate, authorizeAdmin, contentController.updateResult);
router.delete('/results/:id', authenticate, authorizeAdmin, contentController.deleteResult);

router.get('/banner-posters', authenticate, authorizeAdmin, contentController.getAllBannerPosters);
router.get('/banner-posters/:id', authenticate, authorizeAdmin, contentController.getBannerPosterById);
router.post('/banner-posters', authenticate, authorizeAdmin, contentController.createBannerPoster);
router.put('/banner-posters/:id', authenticate, authorizeAdmin, contentController.updateBannerPoster);
router.delete('/banner-posters/:id', authenticate, authorizeAdmin, contentController.deleteBannerPoster);

// Contact and inquiry management
router.get('/contact-messages', authenticate, authorizeAdmin, contactController.getAllContactMessages);
router.get('/contact-messages/:id', authenticate, authorizeAdmin, contactController.getContactMessageById);
router.put('/contact-messages/:id', authenticate, authorizeAdmin, contactController.updateContactMessageStatus);
router.delete('/contact-messages/:id', authenticate, authorizeAdmin, contactController.deleteContactMessage);

router.get('/inquiries', authenticate, authorizeAdmin, contactController.getAllInquiries);
router.get('/inquiries/:id', authenticate, authorizeAdmin, contactController.getInquiryById);
router.put('/inquiries/:id', authenticate, authorizeAdmin, contactController.updateInquiryStatus);
router.delete('/inquiries/:id', authenticate, authorizeAdmin, contactController.deleteInquiry);

// Banner management
router.get('/banners', authenticate, authorizeAdmin, bannerController.getAllBanners);
router.get('/banners/:id', authenticate, authorizeAdmin, bannerController.getBannerById);
router.post('/banners', authenticate, authorizeAdmin, bannerController.createBanner);
router.put('/banners/:id', authenticate, authorizeAdmin, bannerController.updateBanner);
router.delete('/banners/:id', authenticate, authorizeAdmin, bannerController.deleteBanner);

// Feature Flag management
router.get('/feature-flags', authenticate, authorizeAdmin, bannerController.getAllFeatureFlags);
router.post('/feature-flags', authenticate, authorizeAdmin, bannerController.createFeatureFlag);
router.put('/feature-flags/:id', authenticate, authorizeAdmin, bannerController.updateFeatureFlag);
router.delete('/feature-flags/:id', authenticate, authorizeAdmin, bannerController.deleteFeatureFlag);

// Popup management
router.get('/popup', authenticate, authorizeAdmin, bannerController.getAdminPopupContent);
router.put('/popup', authenticate, authorizeAdmin, bannerController.updatePopupContent);

module.exports = router;