const express = require('express');
const router = express.Router();
const testSeriesController = require('../controllers/testSeries.controller');
const { authenticate, authorizeAdmin, authorizeStudent } = require('../utils/auth');
const { cacheMiddleware } = require('../utils/cache');

/**
 * @swagger
 * /test-series:
 *   get:
 *     summary: Get all test series (Public)
 *     tags: [Test Series]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Test series retrieved successfully
 */
// Admin and public routes
router.get('/', cacheMiddleware(60), testSeriesController.getAllTestSeries);
router.get('/admin', authenticate, authorizeAdmin, testSeriesController.getAdminTestSeries);

// Test results management - MUST be before /:id to avoid route collision
router.post('/results', authenticate, authorizeAdmin, testSeriesController.createTestResult);
router.get('/results', authenticate, authorizeAdmin, testSeriesController.getAllTestResults);
router.put('/results/:id', authenticate, authorizeAdmin, testSeriesController.updateTestResult);
router.delete('/results/:id', authenticate, authorizeAdmin, testSeriesController.deleteTestResult);

// Test Series by ID - must come after specific routes
router.get('/:id', cacheMiddleware(60), testSeriesController.getTestSeriesById);

// Admin operations
router.post('/', authenticate, authorizeAdmin, testSeriesController.createTestSeries);
router.put('/:id', authenticate, authorizeAdmin, testSeriesController.updateTestSeries);
router.delete('/:id', authenticate, authorizeAdmin, testSeriesController.deleteTestSeries);

// Test Series - Test management
router.post('/:id/tests', authenticate, authorizeAdmin, testSeriesController.addTestToSeries);
router.put('/tests/:id', authenticate, authorizeAdmin, testSeriesController.updateTest);
router.delete('/tests/:id', authenticate, authorizeAdmin, testSeriesController.deleteTest);

// Student routes
/**
 * @swagger
 * /students/test-series:
 *   get:
 *     summary: Get enrolled test series (Student)
 *     tags: [Test Series]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Enrolled test series retrieved successfully
 */
router.get('/students/test-series', authenticate, authorizeStudent, testSeriesController.getStudentTestSeries);

/**
 * @swagger
 * /students/test-series/{id}/enroll:
 *   post:
 *     summary: Enroll in test series (Student)
 *     tags: [Test Series]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enrolled successfully
 */
router.post('/students/test-series/:id/enroll', authenticate, authorizeStudent, testSeriesController.enrollInTestSeries);

/**
 * @swagger
 * /students/test-series/{id}/results:
 *   get:
 *     summary: Get test series results (Student)
 *     tags: [Test Series]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test results retrieved successfully
 */
router.get('/students/test-series/:id/results', authenticate, authorizeStudent, testSeriesController.getTestSeriesResults);

module.exports = router;
