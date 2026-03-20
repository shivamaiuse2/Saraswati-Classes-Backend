const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const { authenticate, authorizeAdmin } = require('../utils/auth');
const nodemailer = require('nodemailer');

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Submit contact message (Public)
 *     tags: [Contact]
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
 *       200:
 *         description: Message submitted successfully
 */
router.post('/contact', contactController.submitContactMessage);

/**
 * @swagger
 * /admin/contacts:
 *   get:
 *     summary: Get all contact messages (Admin)
 *     tags: [Contact]
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
 *     responses:
 *       200:
 *         description: Contact messages retrieved successfully
 */
router.get('/admin/contacts', authenticate, authorizeAdmin, contactController.getAllContactMessages);

/**
 * @swagger
 * /admin/contacts/{id}:
 *   delete:
 *     summary: Delete contact message (Admin)
 *     tags: [Contact]
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
 *         description: Contact message deleted successfully
 */
router.delete('/admin/contacts/:id', authenticate, authorizeAdmin, contactController.deleteContactMessage);

/**
 * @swagger
 * /admin/notifications:
 *   get:
 *     summary: Get all notifications (Admin)
 *     tags: [Notifications]
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
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
router.get('/admin/notifications', authenticate, authorizeAdmin, contactController.getAllNotifications);

/**
 * @swagger
 * /admin/notifications:
 *   post:
 *     summary: Create notification (Admin)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *               userId:
 *                 type: string
 *               sendEmail:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Notification created successfully
 */
router.post('/admin/notifications', authenticate, authorizeAdmin, contactController.createNotification);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get user notifications (User)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User notifications retrieved successfully
 */
router.get('/notifications', authenticate, contactController.getUserNotifications);

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read (User)
 *     tags: [Notifications]
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
 *         description: Notification marked as read successfully
 */
router.put('/notifications/:id/read', authenticate, contactController.markNotificationAsRead);

module.exports = router;