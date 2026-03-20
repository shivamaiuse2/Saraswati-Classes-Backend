const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner.controller');
const { authenticate, authorizeAdmin } = require('../utils/auth');

/**
 * @swagger
 * /banners:
 *   get:
 *     summary: Get all active banners (Public)
 *     tags: [Banners]
 *     responses:
 *       200:
 *         description: Banners retrieved successfully
 */
router.get('/', bannerController.getActiveBanners);

/**
 * @swagger
 * /admin/banners:
 *   get:
 *     summary: Get all banners (Admin)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Banners retrieved successfully
 */
router.get('/admin/banners', authenticate, authorizeAdmin, bannerController.getAllBanners);

/**
 * @swagger
 * /admin/banners:
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
 *             properties:
 *               imageUrl:
 *                 type: string
 *               testSeriesId:
 *                 type: string
 *               courseId:
 *                 type: string
 *               enabled:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Banner created successfully
 */
router.post('/admin/banners', authenticate, authorizeAdmin, bannerController.createBanner);

/**
 * @swagger
 * /admin/banners/{id}:
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
 *               testSeriesId:
 *                 type: string
 *               courseId:
 *                 type: string
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Banner updated successfully
 */
router.put('/admin/banners/:id', authenticate, authorizeAdmin, bannerController.updateBanner);

/**
 * @swagger
 * /admin/banners/{id}:
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
router.delete('/admin/banners/:id', authenticate, authorizeAdmin, bannerController.deleteBanner);

/**
 * @swagger
 * /feature-flags:
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
 * /admin/feature-flags:
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
 * /admin/feature-flags:
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
 * /admin/feature-flags/{id}:
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
 * /admin/feature-flags/{id}:
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
 * /popup:
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
 * /admin/popup:
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
 * /admin/popup:
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