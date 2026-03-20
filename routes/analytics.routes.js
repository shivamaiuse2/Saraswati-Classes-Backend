const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate, authorizeAdmin } = require('../utils/auth');

/**
 * @swagger
 * /admin/analytics/overview:
 *   get:
 *     summary: Get dashboard overview (Admin)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics overview retrieved successfully
 */
router.get('/admin/analytics/overview', authenticate, authorizeAdmin, analyticsController.getDashboardOverview);

/**
 * @swagger
 * /admin/analytics/students:
 *   get:
 *     summary: Get student analytics (Admin)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Student analytics retrieved successfully
 */
router.get('/admin/analytics/students', authenticate, authorizeAdmin, analyticsController.getStudentAnalytics);

/**
 * @swagger
 * /admin/analytics/courses:
 *   get:
 *     summary: Get course analytics (Admin)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Course analytics retrieved successfully
 */
router.get('/admin/analytics/courses', authenticate, authorizeAdmin, analyticsController.getCourseAnalytics);

/**
 * @swagger
 * /admin/analytics/test-series:
 *   get:
 *     summary: Get test series analytics (Admin)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Test series analytics retrieved successfully
 */
router.get('/admin/analytics/test-series', authenticate, authorizeAdmin, analyticsController.getTestSeriesAnalytics);

/**
 * @swagger
 * /admin/analytics/enrollments:
 *   get:
 *     summary: Get enrollment analytics (Admin)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Enrollment analytics retrieved successfully
 */
router.get('/admin/analytics/enrollments', authenticate, authorizeAdmin, analyticsController.getEnrollmentAnalytics);

/**
 * @swagger
 * /admin/analytics/inquiries:
 *   get:
 *     summary: Get inquiry analytics (Admin)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Inquiry analytics retrieved successfully
 */
router.get('/admin/analytics/inquiries', authenticate, authorizeAdmin, analyticsController.getInquiryAnalytics);

module.exports = router;