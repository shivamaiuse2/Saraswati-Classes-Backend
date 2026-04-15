const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/gallery.controller');
const { authenticate, authorizeAdmin } = require('../utils/auth');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit to allow high quality images
  },
  fileFilter: (req, file, cb) => {
    // Accept images only (jpg, jpeg, png, webp)
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.route('/')
  .get(galleryController.getAllGalleryItems)
  .post(
    authenticate, 
    authorizeAdmin, 
    upload.single('image'), 
    galleryController.createGalleryItem
  );

router.route('/:id')
  .get(galleryController.getGalleryItem)
  .put(
    authenticate, 
    authorizeAdmin, 
    upload.single('image'), 
    galleryController.updateGalleryItem
  )
  .delete(
    authenticate, 
    authorizeAdmin, 
    galleryController.deleteGalleryItem
  );

module.exports = router;
