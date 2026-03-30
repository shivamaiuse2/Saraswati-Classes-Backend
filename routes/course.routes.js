const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const chapterController = require('../controllers/chapter.controller');
const { authenticate, authorizeAdmin, authorizeRoles } = require('../utils/auth');
// const { cacheMiddleware } = require('../utils/cache');

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses (grouped by board)
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: board
 *         schema:
 *           type: string
 *           enum: [CBSE, SSC, STATE]
 *         description: Filter by board
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by standard or subjects
 *     responses:
 *       200:
 *         description: Courses retrieved successfully (grouped if no board filter)
 */
router.get('/', courseController.getAllCourses);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *       404:
 *         description: Course not found
 */
router.get('/:id', courseController.getCourseById);

// Admin routes
router.post('/', authenticate, authorizeAdmin, courseController.createCourse);
router.put('/:id', authenticate, authorizeAdmin, courseController.updateCourse);
router.delete('/:id', authenticate, authorizeAdmin, courseController.deleteCourse);
// Chapters sub-resource
router.post('/:courseId/chapters', authenticate, authorizeAdmin, chapterController.createChapter);
router.get('/:courseId/chapters', authenticate, chapterController.getCourseChapters);

module.exports = router;