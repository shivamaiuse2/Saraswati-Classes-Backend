const express = require('express');
const router = express.Router();
const recordingController = require('../controllers/recording.controller');
const { authenticate, authorizeAdmin } = require('../utils/auth');

/**
 * @swagger
 * /recordings:
 *   get:
 *     summary: Get all recordings
 *     tags: [Recordings]
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter by course ID
 *     responses:
 *       200:
 *         description: List of recordings retrieved successfully
 */
router.get('/', recordingController.getAllRecordings);

/**
 * @swagger
 * /recordings/{id}:
 *   get:
 *     summary: Get recording by ID
 *     tags: [Recordings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recording retrieved successfully
 */
router.get('/:id', recordingController.getRecordingById);

/**
 * @swagger
 * /recordings:
 *   post:
 *     summary: Create a new recording (Admin)
 *     tags: [Recordings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, youtubeLink]
 *             properties:
 *               title: {type: string}
 *               description: {type: string}
 *               youtubeLink: {type: string}
 *               courseId: {type: string}
 *     responses:
 *       201:
 *         description: Recording created successfully
 */
router.post('/', authenticate, authorizeAdmin, recordingController.createRecording);

/**
 * @swagger
 * /recordings/{id}:
 *   put:
 *     summary: Update a recording (Admin)
 *     tags: [Recordings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: {type: string}
 *               description: {type: string}
 *               youtubeLink: {type: string}
 *               courseId: {type: string}
 *     responses:
 *       200:
 *         description: Recording updated successfully
 */
router.put('/:id', authenticate, authorizeAdmin, recordingController.updateRecording);

/**
 * @swagger
 * /recordings/{id}:
 *   delete:
 *     summary: Delete a recording (Admin)
 *     tags: [Recordings]
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
 *         description: Recording deleted successfully
 */
router.delete('/:id', authenticate, authorizeAdmin, recordingController.deleteRecording);

module.exports = router;
