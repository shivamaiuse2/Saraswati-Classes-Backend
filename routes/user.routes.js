const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorizeAdmin, authorizeStudent } = require('../utils/auth');

/**
 * @swagger
 * /admin/students:
 *   get:
 *     summary: Get all students (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, BLOCKED]
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 */
router.get('/admin/students', authenticate, authorizeAdmin, userController.getAllStudents);

/**
 * @swagger
 * /admin/students:
 *   post:
 *     summary: Create new student (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               standard:
 *                 type: string
 *               board:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, BLOCKED]
 *     responses:
 *       201:
 *         description: Student created successfully
 */
router.post('/admin/students', authenticate, authorizeAdmin, userController.createStudent);

/**
 * @swagger
 * /admin/students/{id}:
 *   get:
 *     summary: Get student by ID (Admin only)
 *     tags: [User Management]
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
 *         description: Student retrieved successfully
 *       404:
 *         description: Student not found
 */
router.get('/admin/students/:id', authenticate, authorizeAdmin, userController.getStudentById);

/**
 * @swagger
 * /admin/students/{id}:
 *   put:
 *     summary: Update student (Admin only)
 *     tags: [User Management]
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
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               standard:
 *                 type: string
 *               board:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, BLOCKED]
 *     responses:
 *       200:
 *         description: Student updated successfully
 */
router.put('/admin/students/:id', authenticate, authorizeAdmin, userController.updateStudent);

/**
 * @swagger
 * /admin/students/{id}:
 *   delete:
 *     summary: Delete student (Admin only)
 *     tags: [User Management]
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
 *         description: Student deleted successfully
 */
router.delete('/admin/students/:id', authenticate, authorizeAdmin, userController.deleteStudent);

/**
 * @swagger
 * /admin/students/{id}/block:
 *   put:
 *     summary: Block/unblock student (Admin only)
 *     tags: [User Management]
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
 *                 enum: [ACTIVE, BLOCKED]
 *     responses:
 *       200:
 *         description: Student status updated successfully
 */
router.put('/admin/students/:id/block', authenticate, authorizeAdmin, userController.blockStudent);

/**
 * @swagger
 * /admin/students/{id}/enrollments:
 *   get:
 *     summary: Get student enrollments (Admin only)
 *     tags: [User Management]
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
 *         description: Student enrollments retrieved successfully
 */
router.get('/admin/students/:id/enrollments', authenticate, authorizeAdmin, userController.getStudentEnrollments);

/**
 * @swagger
 * /students/profile:
 *   get:
 *     summary: Get current student profile
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 */
router.get('/students/profile', authenticate, authorizeStudent, userController.getStudentProfile);

/**
 * @swagger
 * /students/profile:
 *   put:
 *     summary: Update current student profile
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               guardianName:
 *                 type: string
 *               guardianPhone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/students/profile', authenticate, authorizeStudent, userController.updateStudentProfile);

/**
 * @swagger
 * /students/change-password:
 *   put:
 *     summary: Change student password
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.put('/students/change-password', authenticate, authorizeStudent, userController.changeStudentPassword);

module.exports = router;