const express = require('express');
const router = express.Router();
const BackupManager = require('../utils/backup.manager');
const { authenticate, authorizeAdmin } = require('../utils/auth');
const logger = require('../utils/logger');

const backupManager = new BackupManager();

/**
 * @swagger
 * /admin/backups/create:
 *   post:
 *     summary: Create manual backup (Admin)
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup created successfully
 */
router.post('/admin/backups/create', authenticate, authorizeAdmin, async (req, res, next) => {
  try {
    const result = await backupManager.createFullBackup();
    
    res.status(200).json({
      success: true,
      message: 'Backup created successfully',
      data: result
    });
  } catch (error) {
    logger.error('Manual backup creation failed:', error);
    next(error);
  }
});

/**
 * @swagger
 * /admin/backups:
 *   get:
 *     summary: Get available backups (Admin)
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available backups retrieved successfully
 */
router.get('/admin/backups', authenticate, authorizeAdmin, async (req, res, next) => {
  try {
    const result = await backupManager.getAvailableBackups();
    
    res.status(200).json({
      success: true,
      message: 'Available backups retrieved successfully',
      data: result.backups
    });
  } catch (error) {
    logger.error('Get backups failed:', error);
    next(error);
  }
});

/**
 * @swagger
 * /admin/backups/health:
 *   get:
 *     summary: Get backup system health (Admin)
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup system health retrieved successfully
 */
router.get('/admin/backups/health', authenticate, authorizeAdmin, async (req, res, next) => {
  try {
    const result = await backupManager.healthCheck();
    
    res.status(200).json({
      success: true,
      message: 'Backup system health retrieved successfully',
      data: result.health
    });
  } catch (error) {
    logger.error('Backup health check failed:', error);
    next(error);
  }
});

module.exports = router;