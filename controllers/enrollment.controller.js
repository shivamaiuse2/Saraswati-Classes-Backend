const prisma = require('../config/prisma');
const { hashPassword } = require('../utils/auth');
const logger = require('../utils/logger');

// Submit enrollment request (Public)
const submitEnrollment = async (req, res, next) => {
  try {
    const { name, email, phone, message, courseOrSeries, username, password } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !courseOrSeries) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and course/test series are required'
      });
    }

    let studentId = null;

    // If username and password provided, create student account
    if (username && password) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (!existingUser) {
        // Create student user
        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            role: 'STUDENT',
            studentProfile: {
              create: {
                name,
                phone,
                ...(message && { address: message })
              }
            }
          }
        });
        studentId = user.studentProfile.id;
      } else if (existingUser.role === 'STUDENT') {
        studentId = existingUser.studentProfile?.id || null;
      }
    }

    // Create enrollment request
    const enrollment = await prisma.enrollment.create({
      data: {
        name,
        email,
        phone,
        message: message || '',
        courseOrSeries,
        studentId,
        username: username || null,
        password: password || null,
        status: 'PENDING'
      }
    });

    logger.info(`Enrollment request submitted: ${name} for ${courseOrSeries}`);

    res.status(201).json({
      success: true,
      message: 'Enrollment request submitted successfully',
      data: enrollment
    });
  } catch (error) {
    logger.error('Submit enrollment error:', error);
    next(error);
  }
};

// Get all enrollments (Admin)
const getAdminEnrollments = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    let where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { courseOrSeries: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get enrollments with pagination
    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              name: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.enrollment.count({ where })
    ]);

    res.status(200).json({
      success: true,
      message: 'Enrollments retrieved successfully',
      data: enrollments,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get admin enrollments error:', error);
    next(error);
  }
};

// Get enrollment by ID (Admin)
const getEnrollmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phone: true,
            standard: true,
            board: true
          }
        }
      }
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Enrollment retrieved successfully',
      data: enrollment
    });
  } catch (error) {
    logger.error('Get enrollment by ID error:', error);
    next(error);
  }
};

// Update enrollment status (Admin)
const updateEnrollmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be APPROVED or REJECTED'
      });
    }

    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id }
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Update enrollment status
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id },
      data: {
        status,
        ...(notes && { message: `${enrollment.message}\n\nAdmin Notes: ${notes}` })
      }
    });

    // If approved and student exists, create proper enrollment
    if (status === 'APPROVED' && enrollment.studentId) {
      // Check if it's a course or test series
      const isCourse = await prisma.course.findFirst({
        where: { 
          title: { equals: enrollment.courseOrSeries, mode: 'insensitive' },
          isActive: true 
        }
      });

      const isTestSeries = await prisma.testSeries.findFirst({
        where: { 
          title: { equals: enrollment.courseOrSeries, mode: 'insensitive' },
          isActive: true 
        }
      });

      if (isCourse) {
        // Create course enrollment
        await prisma.courseEnrollment.create({
          data: {
            studentId: enrollment.studentId,
            courseId: isCourse.id,
            status: 'ACTIVE'
          }
        });
      } else if (isTestSeries) {
        // Create test series enrollment
        await prisma.testSeriesEnrollment.create({
          data: {
            studentId: enrollment.studentId,
            testSeriesId: isTestSeries.id,
            status: 'ACTIVE'
          }
        });
      }
    }

    logger.info(`Enrollment ${status.toLowerCase()}: ${enrollment.name} for ${enrollment.courseOrSeries}`);

    res.status(200).json({
      success: true,
      message: `Enrollment ${status.toLowerCase()} successfully`,
      data: updatedEnrollment
    });
  } catch (error) {
    logger.error('Update enrollment status error:', error);
    next(error);
  }
};

// Delete enrollment (Admin)
const deleteEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id }
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Delete enrollment
    await prisma.enrollment.delete({
      where: { id }
    });

    logger.info(`Enrollment deleted: ${enrollment.name} for ${enrollment.courseOrSeries}`);

    res.status(200).json({
      success: true,
      message: 'Enrollment deleted successfully'
    });
  } catch (error) {
    logger.error('Delete enrollment error:', error);
    next(error);
  }
};

// Submit inquiry (Public)
const submitInquiry = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and message are required'
      });
    }

    // Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        email,
        phone,
        message,
        status: 'PENDING'
      }
    });

    logger.info(`Inquiry submitted: ${name}`);

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: inquiry
    });
  } catch (error) {
    logger.error('Submit inquiry error:', error);
    next(error);
  }
};

// Get all inquiries (Admin)
const getAdminInquiries = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    let where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get inquiries with pagination
    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.inquiry.count({ where })
    ]);

    res.status(200).json({
      success: true,
      message: 'Inquiries retrieved successfully',
      data: inquiries,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get admin inquiries error:', error);
    next(error);
  }
};

// Update inquiry status (Admin)
const updateInquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['RESOLVED', 'FOLLOW_UP'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be RESOLVED or FOLLOW_UP'
      });
    }

    // Check if inquiry exists
    const inquiry = await prisma.inquiry.findUnique({
      where: { id }
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Update inquiry status
    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: {
        status,
        ...(notes && { message: `${inquiry.message}\n\nAdmin Notes: ${notes}` })
      }
    });

    logger.info(`Inquiry ${status.toLowerCase()}: ${inquiry.name}`);

    res.status(200).json({
      success: true,
      message: `Inquiry ${status.toLowerCase()} successfully`,
      data: updatedInquiry
    });
  } catch (error) {
    logger.error('Update inquiry status error:', error);
    next(error);
  }
};

// Create enrollment (Student)
const createEnrollment = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { courseId, testSeriesId, courseTitle, testSeriesTitle } = req.body;

    // Validate required fields
    if (!courseId && !testSeriesId && !courseTitle && !testSeriesTitle) {
      return res.status(400).json({
        success: false,
        message: 'Either courseId/testSeriesId or courseTitle/testSeriesTitle must be provided'
      });
    }

    // Get student profile
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    let enrollment;

    if (courseId || courseTitle) {
      // Find course by ID or title
      const course = courseId 
        ? await prisma.course.findUnique({ where: { id: courseId, isActive: true } })
        : await prisma.course.findFirst({ 
            where: { 
              title: { equals: courseTitle, mode: 'insensitive' }, 
              isActive: true 
            } 
          });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Check if already enrolled
      const existingEnrollment = await prisma.courseEnrollment.findFirst({
        where: {
          studentId: studentProfile.id,
          courseId: course.id
        }
      });

      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          message: 'Already enrolled in this course'
        });
      }

      // Create course enrollment
      enrollment = await prisma.courseEnrollment.create({
        data: {
          studentId: studentProfile.id,
          courseId: course.id,
          status: 'ACTIVE'
        },
        include: {
          course: true
        }
      });
    } else if (testSeriesId || testSeriesTitle) {
      // Find test series by ID or title
      const testSeries = testSeriesId 
        ? await prisma.testSeries.findUnique({ where: { id: testSeriesId, isActive: true } })
        : await prisma.testSeries.findFirst({ 
            where: { 
              title: { equals: testSeriesTitle, mode: 'insensitive' }, 
              isActive: true 
            } 
          });

      if (!testSeries) {
        return res.status(404).json({
          success: false,
          message: 'Test series not found'
        });
      }

      // Check if already enrolled
      const existingEnrollment = await prisma.testSeriesEnrollment.findFirst({
        where: {
          studentId: studentProfile.id,
          testSeriesId: testSeries.id
        }
      });

      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          message: 'Already enrolled in this test series'
        });
      }

      // Create test series enrollment
      enrollment = await prisma.testSeriesEnrollment.create({
        data: {
          studentId: studentProfile.id,
          testSeriesId: testSeries.id,
          status: 'ACTIVE'
        },
        include: {
          testSeries: true
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Enrollment created successfully',
      data: enrollment
    });
  } catch (error) {
    logger.error('Create enrollment error:', error);
    next(error);
  }
};

// Get student enrollments (Student)
const getStudentEnrollments = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get student profile
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        courseEnrollments: {
          include: {
            course: true
          }
        },
        testSeriesEnrollments: {
          include: {
            testSeries: true
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

    const enrollments = {
      courses: studentProfile.courseEnrollments,
      testSeries: studentProfile.testSeriesEnrollments
    };

    res.status(200).json({
      success: true,
      message: 'Student enrollments retrieved successfully',
      data: enrollments
    });
  } catch (error) {
    logger.error('Get student enrollments error:', error);
    next(error);
  }
};

// Get all enrollments (Admin alias)
const getAllEnrollments = async (req, res, next) => {
  return getAdminEnrollments(req, res, next);
};

// Delete inquiry (Admin)
const deleteInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if inquiry exists
    const inquiry = await prisma.inquiry.findUnique({
      where: { id }
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Delete inquiry
    await prisma.inquiry.delete({
      where: { id }
    });

    logger.info(`Inquiry deleted: ${inquiry.name}`);

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    logger.error('Delete inquiry error:', error);
    next(error);
  }
};

module.exports = {
  submitEnrollment,
  getAdminEnrollments,
  getEnrollmentById,
  updateEnrollmentStatus,
  deleteEnrollment,
  submitInquiry,
  getAdminInquiries,
  updateInquiryStatus,
  createEnrollment,
  getStudentEnrollments,
  getAllEnrollments,
  deleteInquiry
};