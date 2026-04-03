const prisma = require('../config/prisma');
const logger = require('../utils/logger');

// Get all blogs (Public)
const getAllBlogs = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    let where = { isActive: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get blogs with pagination
    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              adminProfile: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          date: 'desc'
        }
      }),
      prisma.blog.count({ where })
    ]);

    // Transform data for response
    const blogsData = blogs.map(blog => {
      const { createdBy, creator, ...blogData } = blog;
      return {
        ...blogData,
        author: creator?.adminProfile?.name || 'Admin'
      };
    });

    res.status(200).json({
      success: true,
      message: 'Blogs retrieved successfully',
      data: blogsData,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get all blogs error:', error);
    next(error);
  }
};

// Get blog by ID (Public)
const getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await prisma.blog.findUnique({
      where: { id, isActive: true },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            adminProfile: true
          }
        }
      }
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Transform data for response
    const { createdBy, creator, ...blogData } = blog;
    
    res.status(200).json({
      success: true,
      message: 'Blog retrieved successfully',
      data: {
        ...blogData,
        author: creator?.adminProfile?.name || 'Admin'
      }
    });
  } catch (error) {
    logger.error('Get blog by ID error:', error);
    next(error);
  }
};

// Get gallery items (Public)
const getGalleryItems = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    let where = { isActive: true };

    if (category) {
      where.category = category;
    }

    // Get gallery items with pagination
    const [galleryItems, total] = await Promise.all([
      prisma.galleryItem.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              adminProfile: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.galleryItem.count({ where })
    ]);

    // Transform data for response
    const galleryData = galleryItems.map(item => {
      const { createdBy, creator, ...itemData } = item;
      return {
        ...itemData,
        author: creator?.adminProfile?.name || 'Admin'
      };
    });

    res.status(200).json({
      success: true,
      message: 'Gallery items retrieved successfully',
      data: galleryData,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get gallery items error:', error);
    next(error);
  }
};

// Get all results (Public)
const getAllResults = async (req, res, next) => {
  try {
    const { exam, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    let where = { isActive: true };

    if (exam) {
      where.exam = { contains: exam, mode: 'insensitive' };
    }

    // Get results with pagination
    const [results, total] = await Promise.all([
      prisma.result.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              adminProfile: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.result.count({ where })
    ]);

    // Transform data for response
    const resultsData = results.map(result => {
      const { createdBy, creator, ...resultData } = result;
      return {
        ...resultData,
        author: creator?.adminProfile?.name || 'Admin'
      };
    });

    res.status(200).json({
      success: true,
      message: 'Results retrieved successfully',
      data: resultsData,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get all results error:', error);
    next(error);
  }
};

// Student - Get student's own results (achievements added by admin)
const getStudentResults = async (req, res, next) => {
  try {
    const studentId = req.userDetails.studentProfile?.id;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Get results linked to this student
    const results = await prisma.result.findMany({
      where: {
        studentId: studentId,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Student results retrieved successfully',
      data: results
    });
  } catch (error) {
    logger.error('Get student results error:', error);
    next(error);
  }
};

// Admin - Get all blogs
const getAdminBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              adminProfile: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.blog.count()
    ]);

    res.status(200).json({
      success: true,
      message: 'Blogs retrieved successfully',
      data: blogs,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get admin blogs error:', error);
    next(error);
  }
};

// Admin - Create blog
const createBlog = async (req, res, next) => {
  try {
    const { title, content, image } = req.body;

    // Validate required fields
    if (!title || !content || !image) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and image are required'
      });
    }

    // Create blog
    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        image,
        date: req.body.date ? new Date(req.body.date) : new Date(),
        createdBy: req.user.userId,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true
      }
    });

    logger.info(`Blog created: ${title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    });
  } catch (error) {
    logger.error('Create blog error:', error);
    next(error);
  }
};

// Admin - Update blog
const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, image, isActive } = req.body;

    // Check if blog exists
    const blog = await prisma.blog.findUnique({
      where: { id }
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Update blog
    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(image && { image }),
        ...(isActive !== undefined && { isActive }),
        ...(req.body.date && { date: new Date(req.body.date) })
      }
    });

    logger.info(`Blog updated: ${blog.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: updatedBlog
    });
  } catch (error) {
    logger.error('Update blog error:', error);
    next(error);
  }
};

// Admin - Delete blog
const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if blog exists
    const blog = await prisma.blog.findUnique({
      where: { id }
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Delete blog
    await prisma.blog.delete({
      where: { id }
    });

    logger.info(`Blog deleted: ${blog.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    logger.error('Delete blog error:', error);
    next(error);
  }
};

const getAdminGallery = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [galleryItems, total] = await Promise.all([
      prisma.galleryItem.findMany({
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              adminProfile: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.galleryItem.count()
    ]);

    res.status(200).json({
      success: true,
      message: 'Gallery items retrieved successfully',
      data: galleryItems,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get admin gallery items error:', error);
    next(error);
  }
};

const createGalleryItem = async (req, res, next) => {
  try {
    const { title, image, category } = req.body;

    if (!title || !image) {
      return res.status(400).json({
        success: false,
        message: 'Title and image are required'
      });
    }

    const galleryItem = await prisma.galleryItem.create({
      data: {
        title,
        image,
        category: category || 'general',
        createdBy: req.user.userId,
        isActive: true
      }
    });

    logger.info(`Gallery item created: ${title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Gallery item created successfully',
      data: galleryItem
    });
  } catch (error) {
    logger.error('Create gallery item error:', error);
    next(error);
  }
};

const updateGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, image, category, isActive } = req.body;

    // Check if gallery item exists
    const galleryItem = await prisma.galleryItem.findUnique({
      where: { id }
    });

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    // Update gallery item
    const updatedGalleryItem = await prisma.galleryItem.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(image && { image }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive })
      }
    });

    logger.info(`Gallery item updated: ${galleryItem.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Gallery item updated successfully',
      data: updatedGalleryItem
    });
  } catch (error) {
    logger.error('Update gallery item error:', error);
    next(error);
  }
};

const deleteGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if gallery item exists
    const galleryItem = await prisma.galleryItem.findUnique({
      where: { id }
    });

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    // Delete gallery item
    await prisma.galleryItem.delete({
      where: { id }
    });

    logger.info(`Gallery item deleted: ${galleryItem.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    logger.error('Delete gallery item error:', error);
    next(error);
  }
};

const getAdminResults = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [results, total] = await Promise.all([
      prisma.result.findMany({
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              adminProfile: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.result.count()
    ]);

    res.status(200).json({
      success: true,
      message: 'Results retrieved successfully',
      data: results,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get admin results error:', error);
    next(error);
  }
};

const createResult = async (req, res, next) => {
  try {
    const { name, marks, exam, image, studentId } = req.body;

    if (!name || !marks || !exam || !image) {
      return res.status(400).json({
        success: false,
        message: 'Name, marks, exam, and image are required'
      });
    }

    const result = await prisma.result.create({
      data: {
        name,
        marks,
        exam,
        image,
        studentId: studentId || null,
        createdBy: req.user.userId,
        isActive: true
      }
    });

    logger.info(`Result created: ${name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Result created successfully',
      data: result
    });
  } catch (error) {
    logger.error('Create result error:', error);
    next(error);
  }
};

const updateResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, marks, exam, image, isActive } = req.body;

    // Check if result exists
    const result = await prisma.result.findUnique({
      where: { id }
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // Update result
    const updatedResult = await prisma.result.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(marks && { marks }),
        ...(exam && { exam }),
        ...(image && { image }),
        ...(isActive !== undefined && { isActive })
      }
    });

    logger.info(`Result updated: ${result.name} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Result updated successfully',
      data: updatedResult
    });
  } catch (error) {
    logger.error('Update result error:', error);
    next(error);
  }
};

const deleteResult = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if result exists
    const result = await prisma.result.findUnique({
      where: { id }
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // Delete result
    await prisma.result.delete({
      where: { id }
    });

    logger.info(`Result deleted: ${result.name} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Result deleted successfully'
    });
  } catch (error) {
    logger.error('Delete result error:', error);
    next(error);
  }
};

const getGalleryItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const galleryItem = await prisma.galleryItem.findUnique({
      where: { id, isActive: true },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            adminProfile: true
          }
        }
      }
    });

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    // Transform data for response
    const { createdBy, creator, ...galleryItemData } = galleryItem;
    
    res.status(200).json({
      success: true,
      message: 'Gallery item retrieved successfully',
      data: {
        ...galleryItemData,
        author: creator?.adminProfile?.name || 'Admin'
      }
    });
  } catch (error) {
    logger.error('Get gallery item by ID error:', error);
    next(error);
  }
};

const getResultById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await prisma.result.findUnique({
      where: { id, isActive: true },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            adminProfile: true
          }
        }
      }
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // Transform data for response
    const { createdBy, creator, ...resultData } = result;
    
    res.status(200).json({
      success: true,
      message: 'Result retrieved successfully',
      data: {
        ...resultData,
        author: creator?.adminProfile?.name || 'Admin'
      }
    });
  } catch (error) {
    logger.error('Get result by ID error:', error);
    next(error);
  }
};

// Banner poster functions
const getAllBannerPosters = async (req, res, next) => {
  try {
    const { enabled, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    let where = {};

    if (enabled !== undefined) {
      where.enabled = enabled === 'true';
    }

    const [bannerPosters, total] = await Promise.all([
      prisma.bannerPoster.findMany({
        where,
        include: {
          course: true,
          testSeries: true,
          creator: {
            select: {
              id: true,
              email: true,
              adminProfile: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.bannerPoster.count({ where })
    ]);

    // Transform data for response
    const bannersData = bannerPosters.map(banner => {
      const { createdBy, creator, ...bannerData } = banner;
      return {
        ...bannerData,
        author: creator?.adminProfile?.name || 'Admin'
      };
    });

    res.status(200).json({
      success: true,
      message: 'Banner posters retrieved successfully',
      data: bannersData,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get all banner posters error:', error);
    next(error);
  }
};

const getBannerPosterById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const banner = await prisma.bannerPoster.findUnique({
      where: { id },
      include: {
        course: true,
        testSeries: true,
        creator: {
          select: {
            id: true,
            email: true,
            adminProfile: true
          }
        }
      }
    });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner poster not found'
      });
    }

    // Transform data for response
    const { createdBy, creator, ...bannerData } = banner;
    
    res.status(200).json({
      success: true,
      message: 'Banner poster retrieved successfully',
      data: {
        ...bannerData,
        author: creator?.adminProfile?.name || 'Admin'
      }
    });
  } catch (error) {
    logger.error('Get banner poster by ID error:', error);
    next(error);
  }
};

const createBannerPoster = async (req, res, next) => {
  try {
    const { imageUrl, courseId, testSeriesId, enabled = true } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    // Validate that either courseId or testSeriesId is provided
    if (!courseId && !testSeriesId) {
      return res.status(400).json({
        success: false,
        message: 'Either courseId or testSeriesId must be provided'
      });
    }

    // Validate that only one of courseId or testSeriesId is provided
    if (courseId && testSeriesId) {
      return res.status(400).json({
        success: false,
        message: 'Only one of courseId or testSeriesId can be provided'
      });
    }

    // Check if entity exists
    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      });
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
    } else if (testSeriesId) {
      const testSeries = await prisma.testSeries.findUnique({
        where: { id: testSeriesId }
      });
      if (!testSeries) {
        return res.status(404).json({
          success: false,
          message: 'Test series not found'
        });
      }
    }

    const banner = await prisma.bannerPoster.create({
      data: {
        imageUrl,
        courseId: courseId || null,
        testSeriesId: testSeriesId || null,
        enabled,
        createdBy: req.user.userId
      },
      include: {
        course: true,
        testSeries: true
      }
    });

    logger.info(`Banner poster created: ${banner.imageUrl} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Banner poster created successfully',
      data: banner
    });
  } catch (error) {
    logger.error('Create banner poster error:', error);
    next(error);
  }
};

const updateBannerPoster = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageUrl, courseId, testSeriesId, enabled } = req.body;

    // Check if banner exists
    const banner = await prisma.bannerPoster.findUnique({
      where: { id },
      include: {
        course: true,
        testSeries: true
      }
    });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner poster not found'
      });
    }

    // Validate that only one of courseId or testSeriesId is provided
    if (courseId && testSeriesId) {
      return res.status(400).json({
        success: false,
        message: 'Only one of courseId or testSeriesId can be provided'
      });
    }

    // Check if entity exists
    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      });
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
    } else if (testSeriesId) {
      const testSeries = await prisma.testSeries.findUnique({
        where: { id: testSeriesId }
      });
      if (!testSeries) {
        return res.status(404).json({
          success: false,
          message: 'Test series not found'
        });
      }
    }

    // Update banner
    const updatedBanner = await prisma.bannerPoster.update({
      where: { id },
      data: {
        ...(imageUrl && { imageUrl }),
        ...(courseId !== undefined && { courseId: courseId || null }),
        ...(testSeriesId !== undefined && { testSeriesId: testSeriesId || null }),
        ...(enabled !== undefined && { enabled })
      },
      include: {
        course: true,
        testSeries: true
      }
    });

    logger.info(`Banner poster updated: ${banner.imageUrl} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Banner poster updated successfully',
      data: updatedBanner
    });
  } catch (error) {
    logger.error('Update banner poster error:', error);
    next(error);
  }
};

const deleteBannerPoster = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if banner exists
    const banner = await prisma.bannerPoster.findUnique({
      where: { id }
    });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner poster not found'
      });
    }

    // Delete banner
    await prisma.bannerPoster.delete({
      where: { id }
    });

    logger.info(`Banner poster deleted: ${banner.imageUrl} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Banner poster deleted successfully'
    });
  } catch (error) {
    logger.error('Delete banner poster error:', error);
    next(error);
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  getGalleryItems,
  getGalleryItemById,
  getAllResults,
  getResultById,
  getAdminBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getAdminGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getAdminResults,
  createResult,
  updateResult,
  deleteResult,
  getStudentResults,
  getAllBannerPosters,
  getBannerPosterById,
  createBannerPoster,
  updateBannerPoster,
  deleteBannerPoster
};