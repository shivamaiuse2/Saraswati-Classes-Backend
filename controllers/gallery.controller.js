const prisma = require('../config/prisma');
const { uploadHighQualityImage, deleteFile } = require('../utils/cloudinary');

/**
 * @desc    Get all gallery items
 * @route   GET /api/v1/gallery
 * @access  Public
 */
const getAllGalleryItems = async (req, res, next) => {
  try {
    const galleryItems = await prisma.gallery.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: galleryItems.length,
      data: galleryItems
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single gallery item
 * @route   GET /api/v1/gallery/:id
 * @access  Public
 */
const getGalleryItem = async (req, res, next) => {
  try {
    const galleryItem = await prisma.gallery.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: galleryItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a gallery item
 * @route   POST /api/v1/gallery
 * @access  Private/Admin
 */
const createGalleryItem = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Upload to cloudinary with high quality
    const uploadResult = await uploadHighQualityImage(req.file.buffer, 'gallery');

    const galleryItem = await prisma.gallery.create({
      data: {
        imageUrl: uploadResult.url,
        title: title || null,
        description: description || null
      }
    });

    res.status(201).json({
      success: true,
      data: galleryItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update gallery item
 * @route   PUT /api/v1/gallery/:id
 * @access  Private/Admin
 */
const updateGalleryItem = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    let galleryItem = await prisma.gallery.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    let imageUrl = galleryItem.imageUrl;

    // Check if new image is uploaded
    if (req.file) {
      // 1. Delete old image from cloudinary
      if (galleryItem.imageUrl) {
        // Extract public ID from cloudinary URL
        // Example URL: https://res.cloudinary.com/.../upload/v.../gallery/filename.jpg
        const parts = galleryItem.imageUrl.split('/');
        const fileWithExtension = parts[parts.length - 1];
        const folder = parts[parts.length - 2];
        const filename = fileWithExtension.split('.')[0];
        
        if (folder === 'gallery') {
          const publicId = `gallery/${filename}`;
          try {
            await deleteFile(publicId);
          } catch(err) {
            console.error('Error deleting old image:', err);
            // Continue even if delete fails
          }
        }
      }

      // 2. Upload new image
      const uploadResult = await uploadHighQualityImage(req.file.buffer, 'gallery');
      imageUrl = uploadResult.url;
    }

    galleryItem = await prisma.gallery.update({
      where: {
        id: req.params.id
      },
      data: {
        title: title !== undefined ? title : galleryItem.title,
        description: description !== undefined ? description : galleryItem.description,
        imageUrl: imageUrl
      }
    });

    res.status(200).json({
      success: true,
      data: galleryItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete gallery item
 * @route   DELETE /api/v1/gallery/:id
 * @access  Private/Admin
 */
const deleteGalleryItem = async (req, res, next) => {
  try {
    const galleryItem = await prisma.gallery.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    // Delete image from cloudinary
    if (galleryItem.imageUrl) {
      const parts = galleryItem.imageUrl.split('/');
      const fileWithExtension = parts[parts.length - 1];
      const folder = parts[parts.length - 2];
      const filename = fileWithExtension.split('.')[0];
      
      if (folder === 'gallery') {
        const publicId = `gallery/${filename}`;
        try {
          await deleteFile(publicId);
        } catch(err) {
          console.error('Error deleting old image:', err);
        }
      }
    }

    await prisma.gallery.delete({
      where: {
        id: req.params.id
      }
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllGalleryItems,
  getGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
};
