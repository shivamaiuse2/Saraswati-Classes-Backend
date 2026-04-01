const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner.controller');
const { authenticate, authorizeAdmin } = require('../utils/auth');

/**
 * @swagger
 * /banners:
 *   get:
 *     summary: Get all banners (Public)
 *     tags: [Banners]
 *     responses:
 *       200:
 *         description: Banners retrieved successfully
 */
router.get('/', bannerController.getAllBanners);

/**
 * @swagger
 * /banners/{id}:
 *   get:
 *     summary: Get banner by ID
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Banner retrieved successfully
 */
router.get('/:id', bannerController.getBannerById);

/**
 * @swagger
 * /banners:
 *   post:
 *     summary: Create banner (Admin)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *               - title
 *               - subtitle
 *               - category
 *               - referenceId
 *             properties:
 *               imageUrl:
 *                 type: string
 *               title:
 *                 type: string
 *               subtitle:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [COURSE, TEST_SERIES]
 *               referenceId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Banner created successfully
 */
router.post('/', authenticate, authorizeAdmin, bannerController.createBanner);

/**
 * @swagger
 * /banners/{id}:
 *   put:
 *     summary: Update banner (Admin)
 *     tags: [Banners]
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
 *               imageUrl:
 *                 type: string
 *               title:
 *                 type: string
 *               subtitle:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [COURSE, TEST_SERIES]
 *               referenceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Banner updated successfully
 */
router.put('/:id', authenticate, authorizeAdmin, bannerController.updateBanner);

/**
 * @swagger
 * /banners/{id}:
 *   delete:
 *     summary: Delete banner (Admin)
 *     tags: [Banners]
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
 *         description: Banner deleted successfully
 */
router.delete('/:id', authenticate, authorizeAdmin, bannerController.deleteBanner);

/**
 * @swagger
 * /banners/feature-flags:
 *   get:
 *     summary: Get all active feature flags (Public)
 *     tags: [Feature Flags]
 *     responses:
 *       200:
 *         description: Feature flags retrieved successfully
 */
router.get('/feature-flags', bannerController.getActiveFeatureFlags);

/**
 * @swagger
 * /banners/admin/feature-flags:
 *   get:
 *     summary: Get all feature flags (Admin)
 *     tags: [Feature Flags]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feature flags retrieved successfully
 */
router.get('/admin/feature-flags', authenticate, authorizeAdmin, bannerController.getAllFeatureFlags);

/**
 * @swagger
 * /banners/admin/feature-flags:
 *   post:
 *     summary: Create feature flag (Admin)
 *     tags: [Feature Flags]
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
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ENABLED, DISABLED]
 *               config:
 *                 type: object
 *     responses:
 *       201:
 *         description: Feature flag created successfully
 */
router.post('/admin/feature-flags', authenticate, authorizeAdmin, bannerController.createFeatureFlag);

/**
 * @swagger
 * /banners/admin/feature-flags/{id}:
 *   put:
 *     summary: Update feature flag (Admin)
 *     tags: [Feature Flags]
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
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ENABLED, DISABLED]
 *               config:
 *                 type: object
 *     responses:
 *       200:
 *         description: Feature flag updated successfully
 */
router.put('/admin/feature-flags/:id', authenticate, authorizeAdmin, bannerController.updateFeatureFlag);

/**
 * @swagger
 * /banners/admin/feature-flags/{id}:
 *   delete:
 *     summary: Delete feature flag (Admin)
 *     tags: [Feature Flags]
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
 *         description: Feature flag deleted successfully
 */
router.delete('/admin/feature-flags/:id', authenticate, authorizeAdmin, bannerController.deleteFeatureFlag);

/**
 * @swagger
 * /banners/popup:
 *   get:
 *     summary: Get popup content (Public)
 *     tags: [Popup]
 *     responses:
 *       200:
 *         description: Popup content retrieved successfully
 */
router.get('/popup', bannerController.getPopupContent);

/**
 * @swagger
 * /banners/admin/popup:
 *   get:
 *     summary: Get popup content (Admin)
 *     tags: [Popup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Popup content retrieved successfully
 */
router.get('/admin/popup', authenticate, authorizeAdmin, bannerController.getAdminPopupContent);

/**
 * @swagger
 * /banners/admin/popup:
 *   put:
 *     summary: Update popup content (Admin)
 *     tags: [Popup]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               ctaText:
 *                 type: string
 *               ctaLink:
 *                 type: string
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Popup content updated successfully
 */
router.put('/admin/popup', authenticate, authorizeAdmin, bannerController.updatePopupContent);

module.exports = router;