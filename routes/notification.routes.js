const express = require('express');
const router = express.Router();
const { authenticate } = require('../utils/auth');

// Placeholder routes
router.get('/', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Notifications - to be implemented',
    data: []
  });
});

router.put('/:id/read', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Notification marked as read - to be implemented'
  });
});

module.exports = router;