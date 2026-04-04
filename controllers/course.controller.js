const prisma = require('../config/prisma');
const logger = require('../utils/logger');

// Get all courses (Public and Admin)
const getAllCourses = async (req, res, next) => {
  try {
    const { board, search } = req.query;

    // Build where clause
    let where = { isActive: true };

    if (board) {
      where.board = board.toUpperCase();
    }

    if (search) {
      where.OR = [
        { standard: { contains: search, mode: 'insensitive' } },
        { subjects: { hasSome: [search] } }
      ];
    }

    // Get all courses
    const courses = await prisma.course.findMany({
      where,
      include: {
        chapters: {
          select: {
            id: true,
            title: true,
            description: true,
            youtubeLink: true,
            formLink: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            createdAt: 'asc'
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
      orderBy: [
        { board: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    // Helper for sorting standards
    const standardOrder = ['VIII', 'IX', 'X', 'XI', 'XII'];
    const sortCourses = (a, b) => {
      const indexA = standardOrder.indexOf(a.standard);
      const indexB = standardOrder.indexOf(b.standard);
      return indexA - indexB;
    };

    // Transform and sort
    const transformedCourses = courses.map(course => {
      const { creator, ...courseData } = course;
      return {
        ...courseData,
        creator: creator?.adminProfile?.name || 'Admin'
      };
    }).sort(sortCourses);

    // Add chapter counts to ALL transformed courses first
    for (const course of transformedCourses) {
      course.chapterCount = await prisma.chapter.count({
        where: { courseId: course.id }
      });
    }
    console.log('TRANSFORMED COURSE SAMPLE:', transformedCourses[0]);

    if (board) {
      return res.status(200).json({
        success: true,
        message: `${board} courses retrieved successfully`,
        data: transformedCourses
      });
    }

    // Group by board for general request
    const groupedCourses = {
      CBSE: transformedCourses.filter(c => c.board === 'CBSE'),
      SSC: transformedCourses.filter(c => c.board === 'SSC'),
      HSC: transformedCourses.filter(c => c.board === 'HSC')
    };

    res.status(200).json({
      success: true,
      message: 'Courses with counts retrieved successfully',
      data: groupedCourses
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
          select: {
            id: true,
            title: true,
            description: true,
            youtubeLink: true,
            formLink: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            createdAt: 'asc'
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
      board: rawBoard,
      standard,
      timing_start,
      timing_end,
      days,
      subjects,
      fees,
      isActive = true
    } = req.body;

    const board = rawBoard ? rawBoard.toUpperCase() : '';

    // Validate required fields
    if (!board || !standard || !timing_start || !timing_end || !days || !subjects || fees === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate board
    const validBoards = ['CBSE', 'SSC', 'HSC'];
    if (!validBoards.includes(board)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid board. Must be CBSE, SSC, or HSC'
      });
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        board,
        standard,
        timing_start,
        timing_end,
        days: Array.isArray(days) ? days : [days],
        subjects: Array.isArray(subjects) ? subjects : [subjects],
        fees: parseFloat(fees),
        isActive: Boolean(isActive),
        createdBy: req.user.userId
      }
    });

    logger.info(`Course created: ${board} ${standard} by ${req.user.email}`);

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
      board,
      standard,
      timing_start,
      timing_end,
      days,
      subjects,
      fees,
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

    const upperBoard = board ? board.toUpperCase() : undefined;

    // Validate board if provided
    if (upperBoard) {
      const validBoards = ['CBSE', 'SSC', 'HSC'];
      if (!validBoards.includes(upperBoard)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid board. Must be CBSE, SSC, or HSC'
        });
      }
    }

    // Update course
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        ...(upperBoard && { board: upperBoard }),
        ...(standard && { standard }),
        ...(timing_start && { timing_start }),
        ...(timing_end && { timing_end }),
        ...(days && { days: Array.isArray(days) ? days : [days] }),
        ...(subjects && { subjects: Array.isArray(subjects) ? subjects : [subjects] }),
        ...(fees !== undefined && { fees: parseFloat(fees) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) })
      }
    });

    logger.info(`Course updated: ${id} by ${req.user.email}`);

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

    logger.info(`Course deleted: ${course.board} ${course.standard} by ${req.user.email}`);

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
    const { title, description, youtubeLink, formLink } = req.body;

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

    // Get next chapter number (if still using it, but prompt says new fields)
    // Actually, prompt doesn't ask for chapterNumber, but I'll skip it for Chapter model

    // Create chapter
    const chapter = await prisma.chapter.create({
      data: {
        courseId: id,
        title,
        description,
        youtubeLink: youtubeLink || null,
        formLink: formLink || null
      }
    });

    logger.info(`Chapter added to course ${course.board} ${course.standard}: ${title}`);

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
    const { title, description, youtubeLink, formLink } = req.body;

    // Check if chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId }
    });

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    // Update chapter
    const updatedChapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(youtubeLink !== undefined && { youtubeLink }),
        ...(formLink !== undefined && { formLink })
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
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId }
    });

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    // Delete chapter
    await prisma.chapter.delete({
      where: { id: chapterId }
    });

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