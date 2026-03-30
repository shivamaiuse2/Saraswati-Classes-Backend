const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapter.controller');
const { authenticate, authorizeAdmin } = require('../utils/auth');

// Public/Student routes - need auth to see course content
router.get('/:id', authenticate, chapterController.getChapterById);

// Admin routes
router.put('/:id', authenticate, authorizeAdmin, chapterController.updateChapter);
router.delete('/:id', authenticate, authorizeAdmin, chapterController.deleteChapter);

module.exports = router;
