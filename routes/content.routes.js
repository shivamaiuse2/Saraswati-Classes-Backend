const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { authenticate, authorizeAdmin } = require('../utils/auth');
// const { cacheMiddleware } = require('../utils/cache');

// Public routes
/**
 * @swagger
 * /blogs:
 *   get:
 *     summary: Get all blogs (Public)
 *     tags: [Content]
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
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 */
router.get('/blogs', contentController.getAllBlogs);

/**
 * @swagger
 * /blogs/{id}:
 *   get:
 *     summary: Get blog by ID (Public)
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *       404:
 *         description: Blog not found
 */
router.get('/blogs/:id', contentController.getBlogById);

/**
 * @swagger
 * /gallery:
 *   get:
 *     summary: Get all gallery items (Public)
 *     tags: [Content]
 *     parameters:
 *       - in: query
 *         name: category
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
 *         description: Gallery items retrieved successfully
 */
router.get('/gallery', contentController.getGalleryItems);

/**
 * @swagger
 * /results:
 *   get:
 *     summary: Get all results (Public)
 *     tags: [Content]
 *     parameters:
 *       - in: query
 *         name: exam
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
 *         description: Results retrieved successfully
 */
router.get('/results', contentController.getAllResults);

/**
 * @swagger
 * /banner-posters:
 *   get:
 *     summary: Get all active banner posters (Public)
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: Banner posters retrieved successfully
 */
router.get('/banner-posters', contentController.getAllBannerPosters);

// Admin routes
/**
 * @swagger
 * /admin/blogs:
 *   get:
 *     summary: Get all blogs (Admin)
 *     tags: [Content]
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
 *         description: Blogs retrieved successfully
 */
router.get('/admin/blogs', authenticate, authorizeAdmin, contentController.getAdminBlogs);

/**
 * @swagger
 * /admin/blogs:
 *   post:
 *     summary: Create blog (Admin)
 *     tags: [Content]
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
 *               - content
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Blog created successfully
 */
router.post('/admin/blogs', authenticate, authorizeAdmin, contentController.createBlog);

/**
 * @swagger
 * /admin/blogs/{id}:
 *   put:
 *     summary: Update blog (Admin)
 *     tags: [Content]
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
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Blog updated successfully
 */
router.put('/admin/blogs/:id', authenticate, authorizeAdmin, contentController.updateBlog);

/**
 * @swagger
 * /admin/blogs/{id}:
 *   delete:
 *     summary: Delete blog (Admin)
 *     tags: [Content]
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
 *         description: Blog deleted successfully
 */
router.delete('/admin/blogs/:id', authenticate, authorizeAdmin, contentController.deleteBlog);


// Admin gallery routes
router.get('/admin/gallery', authenticate, authorizeAdmin, contentController.getAdminGallery);
router.post('/admin/gallery', authenticate, authorizeAdmin, contentController.createGalleryItem);
router.put('/admin/gallery/:id', authenticate, authorizeAdmin, contentController.updateGalleryItem);
router.delete('/admin/gallery/:id', authenticate, authorizeAdmin, contentController.deleteGalleryItem);

// Admin results routes
router.get('/admin/results', authenticate, authorizeAdmin, contentController.getAdminResults);
router.post('/admin/results', authenticate, authorizeAdmin, contentController.createResult);
router.put('/admin/results/:id', authenticate, authorizeAdmin, contentController.updateResult);
router.delete('/admin/results/:id', authenticate, authorizeAdmin, contentController.deleteResult);

module.exports = router;