const prisma = require('../config/prisma');
const logger = require('../utils/logger');

// Get active banners (Public)
const getActiveBanners = async (req, res, next) => {
  try {
    const banners = await prisma.bannerPoster.findMany({
      where: { enabled: true },
      include: {
        testSeries: {
          select: {
            id: true,
            title: true,
            image: true
          }
        },
        course: {
          select: {
            id: true,
            board: true,
            standard: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Banners retrieved successfully',
      data: banners
    });
  } catch (error) {
    logger.error('Get active banners error:', error);
    next(error);
  }
};

// Get all banners (Admin)
const getAllBanners = async (req, res, next) => {
  try {
    const banners = await prisma.bannerPoster.findMany({
      include: {
        testSeries: {
          select: {
            id: true,
            title: true
          }
        },
        course: {
          select: {
            id: true,
            board: true,
            standard: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Banners retrieved successfully',
      data: banners
    });
  } catch (error) {
    logger.error('Get all banners error:', error);
    next(error);
  }
};

// Get banner by ID (Admin)
const getBannerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const banner = await prisma.bannerPoster.findUnique({
      where: { id },
      include: {
        testSeries: {
          select: {
            id: true,
            title: true
          }
        },
        course: {
          select: {
            id: true,
            board: true,
            standard: true
          }
        }
      }
    });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Banner retrieved successfully',
      data: banner
    });
  } catch (error) {
    logger.error('Get banner by ID error:', error);
    next(error);
  }
};

// Create banner (Admin)
const createBanner = async (req, res, next) => {
  try {
    const { imageUrl, testSeriesId, courseId, enabled = true } = req.body;

    // Validate required fields
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    // Verify testSeries or course exists if provided
    if (testSeriesId) {
      const testSeries = await prisma.testSeries.findUnique({
        where: { id: testSeriesId, isActive: true }
      });
      if (!testSeries) {
        return res.status(400).json({
          success: false,
          message: 'Test series not found or not active'
        });
      }
    }

    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId, isActive: true }
      });
      if (!course) {
        return res.status(400).json({
          success: false,
          message: 'Course not found or not active'
        });
      }
    }

    // Create banner
    const banner = await prisma.bannerPoster.create({
      data: {
        imageUrl,
        testSeriesId: testSeriesId || null,
        courseId: courseId || null,
        enabled
      }
    });

    logger.info(`Banner created by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: banner
    });
  } catch (error) {
    logger.error('Create banner error:', error);
    next(error);
  }
};

// Update banner (Admin)
const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageUrl, testSeriesId, courseId, enabled } = req.body;

    // Check if banner exists
    const banner = await prisma.bannerPoster.findUnique({
      where: { id }
    });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    // Verify testSeries or course exists if provided
    if (testSeriesId) {
      const testSeries = await prisma.testSeries.findUnique({
        where: { id: testSeriesId, isActive: true }
      });
      if (!testSeries) {
        return res.status(400).json({
          success: false,
          message: 'Test series not found or not active'
        });
      }
    }

    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId, isActive: true }
      });
      if (!course) {
        return res.status(400).json({
          success: false,
          message: 'Course not found or not active'
        });
      }
    }

    // Update banner
    const updatedBanner = await prisma.bannerPoster.update({
      where: { id },
      data: {
        ...(imageUrl && { imageUrl }),
        ...(testSeriesId !== undefined && { testSeriesId: testSeriesId || null }),
        ...(courseId !== undefined && { courseId: courseId || null }),
        ...(enabled !== undefined && { enabled })
      }
    });

    logger.info(`Banner updated by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      data: updatedBanner
    });
  } catch (error) {
    logger.error('Update banner error:', error);
    next(error);
  }
};

// Delete banner (Admin)
const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if banner exists
    const banner = await prisma.bannerPoster.findUnique({
      where: { id }
    });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    // Delete banner
    await prisma.bannerPoster.delete({
      where: { id }
    });

    logger.info(`Banner deleted by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    logger.error('Delete banner error:', error);
    next(error);
  }
};

// Get active feature flags (Public)
const getActiveFeatureFlags = async (req, res, next) => {
  try {
    const featureFlags = await prisma.featureFlag.findMany({
      where: { status: 'ENABLED' }
    });

    // Transform for easy frontend consumption
    const flags = {};
    featureFlags.forEach(flag => {
      flags[flag.name] = {
        enabled: flag.status === 'ENABLED',
        config: flag.config
      };
    });

    res.status(200).json({
      success: true,
      message: 'Feature flags retrieved successfully',
      data: flags
    });
  } catch (error) {
    logger.error('Get active feature flags error:', error);
    next(error);
  }
};

// Get all feature flags (Admin)
const getAllFeatureFlags = async (req, res, next) => {
  try {
    const featureFlags = await prisma.featureFlag.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Feature flags retrieved successfully',
      data: featureFlags
    });
  } catch (error) {
    logger.error('Get all feature flags error:', error);
    next(error);
  }
};

// Create feature flag (Admin)
const createFeatureFlag = async (req, res, next) => {
  try {
    const { name, description, status = 'ENABLED', config = {} } = req.body;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required'
      });
    }

    // Check if feature flag already exists
    const existingFlag = await prisma.featureFlag.findUnique({
      where: { name }
    });

    if (existingFlag) {
      return res.status(400).json({
        success: false,
        message: 'Feature flag with this name already exists'
      });
    }

    // Validate status
    const validStatuses = ['ENABLED', 'DISABLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Create feature flag
    const featureFlag = await prisma.featureFlag.create({
      data: {
        name,
        description,
        status,
        config
      }
    });

    logger.info(`Feature flag created: ${name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Feature flag created successfully',
      data: featureFlag
    });
  } catch (error) {
    logger.error('Create feature flag error:', error);
    next(error);
  }
};

// Update feature flag (Admin)
const updateFeatureFlag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status, config } = req.body;

    // Check if feature flag exists
    const featureFlag = await prisma.featureFlag.findUnique({
      where: { id }
    });

    if (!featureFlag) {
      return res.status(404).json({
        success: false,
        message: 'Feature flag not found'
      });
    }

    // Check if name is being changed and already exists
    if (name && name !== featureFlag.name) {
      const existingFlag = await prisma.featureFlag.findUnique({
        where: { name }
      });
      
      if (existingFlag) {
        return res.status(400).json({
          success: false,
          message: 'Feature flag with this name already exists'
        });
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['ENABLED', 'DISABLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
    }

    // Update feature flag
    const updatedFlag = await prisma.featureFlag.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(status && { status }),
        ...(config !== undefined && { config })
      }
    });

    logger.info(`Feature flag updated: ${featureFlag.name} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Feature flag updated successfully',
      data: updatedFlag
    });
  } catch (error) {
    logger.error('Update feature flag error:', error);
    next(error);
  }
};

// Delete feature flag (Admin)
const deleteFeatureFlag = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if feature flag exists
    const featureFlag = await prisma.featureFlag.findUnique({
      where: { id }
    });

    if (!featureFlag) {
      return res.status(404).json({
        success: false,
        message: 'Feature flag not found'
      });
    }

    // Delete feature flag
    await prisma.featureFlag.delete({
      where: { id }
    });

    logger.info(`Feature flag deleted: ${featureFlag.name} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Feature flag deleted successfully'
    });
  } catch (error) {
    logger.error('Delete feature flag error:', error);
    next(error);
  }
};

// Get popup content (Public)
const getPopupContent = async (req, res, next) => {
  try {
    const popup = await prisma.popupContent.findFirst({
      where: { enabled: true }
    });

    if (!popup) {
      return res.status(200).json({
        success: true,
        message: 'No active popup content',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Popup content retrieved successfully',
      data: popup
    });
  } catch (error) {
    logger.error('Get popup content error:', error);
    next(error);
  }
};

// Get admin popup content
const getAdminPopupContent = async (req, res, next) => {
  try {
    const popup = await prisma.popupContent.findFirst();

    if (!popup) {
      return res.status(200).json({
        success: true,
        message: 'No popup content found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Popup content retrieved successfully',
      data: popup
    });
  } catch (error) {
    logger.error('Get admin popup content error:', error);
    next(error);
  }
};

// Update popup content (Admin)
const updatePopupContent = async (req, res, next) => {
  try {
    const { title, description, ctaText, ctaLink, enabled } = req.body;

    let popup = await prisma.popupContent.findFirst();

    if (popup) {
      // Update existing popup
      popup = await prisma.popupContent.update({
        where: { id: popup.id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(ctaText && { ctaText }),
          ...(ctaLink && { ctaLink }),
          ...(enabled !== undefined && { enabled })
        }
      });
    } else {
      // Create new popup
      popup = await prisma.popupContent.create({
        data: {
          title: title || '',
          description: description || '',
          ctaText: ctaText || '',
          ctaLink: ctaLink || '',
          enabled: enabled !== undefined ? enabled : true
        }
      });
    }

    logger.info(`Popup content updated by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Popup content updated successfully',
      data: popup
    });
  } catch (error) {
    logger.error('Update popup content error:', error);
    next(error);
  }
};

module.exports = {
  getActiveBanners,
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  getActiveFeatureFlags,
  getAllFeatureFlags,
  createFeatureFlag,
  updateFeatureFlag,
  deleteFeatureFlag,
  getPopupContent,
  getAdminPopupContent,
  updatePopupContent
};