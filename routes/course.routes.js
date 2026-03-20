const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { authenticate, authorizeAdmin, authorizeRoles } = require('../utils/auth');

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or description
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
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
router.post('/:id/chapters', authenticate, authorizeAdmin, courseController.addChapter);
router.put('/chapters/:chapterId', authenticate, authorizeAdmin, courseController.updateChapter);
router.delete('/chapters/:chapterId', authenticate, authorizeAdmin, courseController.deleteChapter);

module.exports = router;