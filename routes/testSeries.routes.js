const express = require('express');
const router = express.Router();
const testSeriesController = require('../controllers/testSeries.controller');
const { authenticate, authorizeAdmin, authorizeStudent } = require('../utils/auth');
// const { cacheMiddleware } = require('../utils/cache');

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
router.get('/', testSeriesController.getAllTestSeries);
router.get('/admin', testSeriesController.getAdminTestSeries);

// Test results management - MUST be before /:id to avoid route collision
router.post('/results', testSeriesController.createTestResult);
router.get('/results', testSeriesController.getAllTestResults);
router.put('/results/:id', testSeriesController.updateTestResult);
router.delete('/results/:id', testSeriesController.deleteTestResult);

// Test Series by ID - must come after specific routes
router.get('/:id', testSeriesController.getTestSeriesById);

// Admin operations
router.post('/', testSeriesController.createTestSeries);
router.put('/:id', testSeriesController.updateTestSeries);
router.delete('/:id', testSeriesController.deleteTestSeries);

// Test Series - Test management
router.post('/:id/tests', testSeriesController.addTestToSeries);
router.put('/tests/:id', testSeriesController.updateTest);
router.delete('/tests/:id', testSeriesController.deleteTest);

// Student routes
router.get('/students/test-series', testSeriesController.getStudentTestSeries);
router.post('/students/test-series/:id/enroll', testSeriesController.enrollInTestSeries);
router.get('/students/test-series/:id/results', testSeriesController.getTestSeriesResults);

module.exports = router;
