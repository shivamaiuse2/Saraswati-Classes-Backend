const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollment.controller');
const { authenticate, authorizeAdmin, authorizeStudent } = require('../utils/auth');

/**
 * @swagger
 * /enrollments:
 *   post:
 *     summary: Submit enrollment request (Public)
 *     tags: [Enrollments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - courseOrSeries
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               message:
 *                 type: string
 *               courseOrSeries:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Enrollment request submitted successfully
 */
router.post('/enrollments', enrollmentController.submitEnrollment);

/**
 * @swagger
 * /admin/enrollments:
 *   get:
 *     summary: Get all enrollments (Admin)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
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
 *         description: Enrollments retrieved successfully
 */
router.get('/admin/enrollments', authenticate, authorizeAdmin, enrollmentController.getAdminEnrollments);

/**
 * @swagger
 * /admin/enrollments/{id}:
 *   get:
 *     summary: Get enrollment by ID (Admin)
 *     tags: [Enrollments]
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
 *         description: Enrollment retrieved successfully
 *       404:
 *         description: Enrollment not found
 */
router.get('/admin/enrollments/:id', authenticate, authorizeAdmin, enrollmentController.getEnrollmentById);

/**
 * @swagger
 * /admin/enrollments/{id}/status:
 *   put:
 *     summary: Update enrollment status (Admin)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Enrollment status updated successfully
 */
router.put('/admin/enrollments/:id/status', authenticate, authorizeAdmin, enrollmentController.updateEnrollmentStatus);

/**
 * @swagger
 * /admin/enrollments/{id}:
 *   delete:
 *     summary: Delete enrollment (Admin)
 *     tags: [Enrollments]
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
 *         description: Enrollment deleted successfully
 */
router.delete('/admin/enrollments/:id', authenticate, authorizeAdmin, enrollmentController.deleteEnrollment);

/**
 * @swagger
 * /inquiries:
 *   post:
 *     summary: Submit inquiry (Public)
 *     tags: [Inquiries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Inquiry submitted successfully
 */
router.post('/inquiries', enrollmentController.submitInquiry);

/**
 * @swagger
 * /admin/inquiries:
 *   get:
 *     summary: Get all inquiries (Admin)
 *     tags: [Inquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, RESOLVED, FOLLOW_UP]
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
 *         description: Inquiries retrieved successfully
 */
router.get('/admin/inquiries', authenticate, authorizeAdmin, enrollmentController.getAdminInquiries);

/**
 * @swagger
 * /admin/inquiries/{id}/status:
 *   put:
 *     summary: Update inquiry status (Admin)
 *     tags: [Inquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [RESOLVED, FOLLOW_UP]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inquiry status updated successfully
 */
router.put('/admin/inquiries/:id/status', authenticate, authorizeAdmin, enrollmentController.updateInquiryStatus);

/**
 * @swagger
 * /students/enrollments:
 *   get:
 *     summary: Get student enrollments (Student)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student enrollments retrieved successfully
 */
router.get('/students/enrollments', authenticate, authorizeStudent, enrollmentController.getStudentEnrollments);

module.exports = router;