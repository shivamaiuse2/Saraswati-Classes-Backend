const prisma = require('../config/prisma');
const logger = require('../utils/logger');

// Get all courses (Public and Admin)
const getAllCourses = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    let where = { isActive: true };

    if (category) {
      where.category = category.toUpperCase();
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { fullDescription: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get courses with pagination
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          chapters: {
            orderBy: {
              chapterNumber: 'asc'
            }
          },
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
      prisma.course.count({ where })
    ]);

    // Transform data for response
    const coursesData = courses.map(course => {
      const { createdBy, creator, ...courseData } = course;
      return {
        ...courseData,
        creator: creator?.adminProfile?.name || 'Admin'
      };
    });

    res.status(200).json({
      success: true,
      message: 'Courses retrieved successfully',
      data: coursesData,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get all courses error:', error);
    next(error);
  }
};

// Get course by ID (Public and Admin)
const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: {
            chapterNumber: 'asc'
          }
        },
        creator: {
          select: {
            id: true,
            email: true,
            adminProfile: true
          }
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!course || !course.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Transform data for response
    const { createdBy, creator, ...courseData } = course;
    
    res.status(200).json({
      success: true,
      message: 'Course retrieved successfully',
      data: {
        ...courseData,
        creator: creator?.adminProfile?.name || 'Admin',
        enrollmentCount: course.enrollments.length
      }
    });
  } catch (error) {
    logger.error('Get course by ID error:', error);
    next(error);
  }
};

// Create course (Admin)
const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      category: rawCategory,
      description,
      fullDescription,
      mode,
      image: rawImage,
      timing,
      days,
      pricePerSubject,
      subjects,
      duration,
      demoVideoUrl,
      chapters = []
    } = req.body;

    const category = rawCategory ? rawCategory.toUpperCase() : '';
    const image = rawImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60';

    // Validate required fields
    if (!title || !category || !description || !mode || !timing || !days || !pricePerSubject) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate category
    const validCategories = ['FOUNDATION', 'SCIENCE', 'COMPETITIVE'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be FOUNDATION, SCIENCE, or COMPETITIVE'
      });
    }

    // Check if course title already exists
    const existingCourse = await prisma.course.findFirst({
      where: { 
        title: { equals: title, mode: 'insensitive' },
        isActive: true 
      }
    });

    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course with this title already exists'
      });
    }

    // Create course with chapters
    const course = await prisma.course.create({
      data: {
        title,
        category,
        description,
        fullDescription: fullDescription || description,
        mode,
        image,
        timing,
        days,
        pricePerSubject: parseFloat(pricePerSubject),
        subjects: subjects || [],
        duration: duration || null,
        demoVideoUrl: demoVideoUrl || null,
        createdBy: req.user.userId,
        chapters: {
          create: chapters.map((chapter, index) => ({
            title: chapter.title,
            description: chapter.description,
            videoUrl: chapter.videoUrl || null,
            testDescription: chapter.testDescription || null,
            testLink: chapter.testLink || null,
            chapterNumber: index + 1
          }))
        }
      },
      include: {
        chapters: {
          orderBy: {
            chapterNumber: 'asc'
          }
        }
      }
    });

    logger.info(`Course created: ${title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    logger.error('Create course error:', error);
    next(error);
  }
};

// Update course (Admin)
const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      description,
      fullDescription,
      mode,
      image,
      timing,
      days,
      pricePerSubject,
      subjects,
      duration,
      demoVideoUrl,
      isActive
    } = req.body;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id }
    });

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if title is being changed and already exists
    if (title && title !== existingCourse.title) {
      const duplicateCourse = await prisma.course.findFirst({
        where: { 
          title: { equals: title, mode: 'insensitive' },
          isActive: true,
          NOT: { id }
        }
      });
      
      if (duplicateCourse) {
        return res.status(400).json({
          success: false,
          message: 'Course with this title already exists'
        });
      }
    }

    const upperCategory = category ? category.toUpperCase() : undefined;

    // Validate category if provided
    if (upperCategory) {
      const validCategories = ['FOUNDATION', 'SCIENCE', 'COMPETITIVE'];
      if (!validCategories.includes(upperCategory)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Must be FOUNDATION, SCIENCE, or COMPETITIVE'
        });
      }
    }

    // Update course
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(upperCategory && { category: upperCategory }),
        ...(description && { description }),
        ...(fullDescription !== undefined && { fullDescription }),
        ...(mode && { mode }),
        ...(image && { image }),
        ...(timing && { timing }),
        ...(days && { days }),
        ...(pricePerSubject && { pricePerSubject: parseFloat(pricePerSubject) }),
        ...(subjects && { subjects }),
        ...(duration !== undefined && { duration }),
        ...(demoVideoUrl !== undefined && { demoVideoUrl }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        chapters: {
          orderBy: {
            chapterNumber: 'asc'
          }
        }
      }
    });

    logger.info(`Course updated: ${existingCourse.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });
  } catch (error) {
    logger.error('Update course error:', error);
    next(error);
  }
};

// Delete course (Admin)
const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Soft delete - set isActive to false
    await prisma.course.update({
      where: { id },
      data: { isActive: false }
    });

    logger.info(`Course deleted: ${course.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    logger.error('Delete course error:', error);
    next(error);
  }
};

// Add chapter to course (Admin)
const addChapter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl, testDescription, testLink } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get next chapter number
    const chapterCount = await prisma.courseChapter.count({
      where: { courseId: id }
    });

    // Create chapter
    const chapter = await prisma.courseChapter.create({
      data: {
        courseId: id,
        title,
        description,
        videoUrl: videoUrl || null,
        testDescription: testDescription || null,
        testLink: testLink || null,
        chapterNumber: chapterCount + 1
      }
    });

    logger.info(`Chapter added to course ${course.title}: ${title}`);

    res.status(201).json({
      success: true,
      message: 'Chapter added successfully',
      data: chapter
    });
  } catch (error) {
    logger.error('Add chapter error:', error);
    next(error);
  }
};

// Update chapter (Admin)
const updateChapter = async (req, res, next) => {
  try {
    const { chapterId } = req.params;
    const { title, description, videoUrl, testDescription, testLink } = req.body;

    // Check if chapter exists
    const chapter = await prisma.courseChapter.findUnique({
      where: { id: chapterId }
    });

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    // Update chapter
    const updatedChapter = await prisma.courseChapter.update({
      where: { id: chapterId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(testDescription !== undefined && { testDescription }),
        ...(testLink !== undefined && { testLink })
      }
    });

    logger.info(`Chapter updated: ${chapter.title}`);

    res.status(200).json({
      success: true,
      message: 'Chapter updated successfully',
      data: updatedChapter
    });
  } catch (error) {
    logger.error('Update chapter error:', error);
    next(error);
  }
};

// Delete chapter (Admin)
const deleteChapter = async (req, res, next) => {
  try {
    const { chapterId } = req.params;

    // Check if chapter exists
    const chapter = await prisma.courseChapter.findUnique({
      where: { id: chapterId }
    });

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    // Delete chapter
    await prisma.courseChapter.delete({
      where: { id: chapterId }
    });

    // Reorder remaining chapters
    const remainingChapters = await prisma.courseChapter.findMany({
      where: { courseId: chapter.courseId },
      orderBy: { chapterNumber: 'asc' }
    });

    // Update chapter numbers
    for (let i = 0; i < remainingChapters.length; i++) {
      await prisma.courseChapter.update({
        where: { id: remainingChapters[i].id },
        data: { chapterNumber: i + 1 }
      });
    }

    logger.info(`Chapter deleted: ${chapter.title}`);

    res.status(200).json({
      success: true,
      message: 'Chapter deleted successfully'
    });
  } catch (error) {
    logger.error('Delete chapter error:', error);
    next(error);
  }
};

// Get student enrolled courses
const getStudentCourses = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get student profile
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        courseEnrollments: {
          include: {
            course: {
              include: {
                chapters: true
              }
            }
          }
        }
      }
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const courses = studentProfile.courseEnrollments.map(enrollment => ({
      ...enrollment.course,
      enrollmentStatus: enrollment.status,
      enrolledAt: enrollment.enrolledAt
    }));

    res.status(200).json({
      success: true,
      message: 'Enrolled courses retrieved successfully',
      data: courses
    });
  } catch (error) {
    logger.error('Get student courses error:', error);
    next(error);
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addChapter,
  updateChapter,
  deleteChapter,
  getStudentCourses
};