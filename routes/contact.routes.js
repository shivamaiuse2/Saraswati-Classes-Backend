const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const { authenticate, authorizeAdmin } = require('../utils/auth');
const nodemailer = require('nodemailer');

/**
 * @swagger
 * /:
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
router.post('/', contactController.submitContactMessage);

// Public inquiry endpoint (no authentication required)
/**
 * @swagger
 * /inquiry:
 *   post:
 *     summary: Submit inquiry (Public)
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
 *       201:
 *         description: Inquiry submitted successfully
 */
router.post('/inquiry', contactController.createInquiry);




module.exports = router;