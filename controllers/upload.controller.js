const { uploadImage, uploadDocument, deleteFile, deleteDocument } = require('../utils/cloudinary');
const logger = require('../utils/logger');

// Upload image to Cloudinary
const uploadImageToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const folder = req.body.folder || 'uploads';
    
    // Upload to Cloudinary
    const result = await uploadImage(req.file.buffer, folder);

    logger.info(`Image uploaded: ${result.publicId}`);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId,
        format: result.format,
        dimensions: {
          width: result.width,
          height: result.height
        }
      }
    });
  } catch (error) {
    logger.error('Image upload error:', error);
    next(error);
  }
};

// Upload document to Cloudinary
const uploadDocumentToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document file provided'
      });
    }

    const folder = req.body.folder || 'documents';
    
    // Upload to Cloudinary
    const result = await uploadDocument(req.file.buffer, folder);

    logger.info(`Document uploaded: ${result.publicId}`);

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    logger.error('Document upload error:', error);
    next(error);
  }
};

// Delete file from Cloudinary
const deleteFileFromCloudinary = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    // Delete from Cloudinary
    const result = await deleteFile(publicId);

    logger.info(`File deleted: ${publicId}`);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      data: result
    });
  } catch (error) {
    logger.error('File deletion error:', error);
    next(error);
  }
};

module.exports = {
  uploadImage: uploadImageToCloudinary,
  uploadDocument: uploadDocumentToCloudinary,
  deleteFile: deleteFileFromCloudinary
};