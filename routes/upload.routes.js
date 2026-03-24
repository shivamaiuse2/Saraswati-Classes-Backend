const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authenticate, authorizeAdmin, authorizeRoles } = require('../utils/auth');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const documentUpload = multer({ 
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit for documents
  }
});

/**
 * @swagger
 * /upload/image:
 *   post:
 *     summary: Upload image to Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 */
router.post('/image', authenticate, authorizeRoles('ADMIN', 'STUDENT'), upload.single('image'), uploadController.uploadImage);

/**
 * @swagger
 * /upload/document:
 *   post:
 *     summary: Upload document to Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 */
router.post('/document', authenticate, authorizeRoles('ADMIN', 'STUDENT'), documentUpload.single('document'), uploadController.uploadDocument);

/**
 * @swagger
 * /upload/{publicId}:
 *   delete:
 *     summary: Delete file from Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 */
router.delete('/:publicId', authenticate, authorizeRoles('ADMIN', 'STUDENT'), uploadController.deleteFile);

module.exports = router;