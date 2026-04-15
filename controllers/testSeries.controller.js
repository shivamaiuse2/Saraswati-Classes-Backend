const prisma = require('../config/prisma');
const logger = require('../utils/logger');

// Get all test series (Public)
const getAllTestSeries = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    let where = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { overview: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get test series with pagination
    const [testSeries, total] = await Promise.all([
      prisma.testSeries.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              adminProfile: true
            }
          },
          tests: {
            orderBy: {
              testNumber: 'asc'
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.testSeries.count({ where })
    ]);

    // Transform data for response
    const testData = testSeries.map(ts => {
      const { createdBy, creator, ...testData } = ts;
      return {
        ...testData,
        creator: creator?.adminProfile?.name || 'Admin'
      };
    });

    res.status(200).json({
      success: true,
      message: 'Test series retrieved successfully',
      data: testData,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get all test series error:', error);
    next(error);
  }
};

// Get test series by ID (Public)
const getTestSeriesById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const testSeries = await prisma.testSeries.findUnique({
      where: { id },
      include: {
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
        },
        tests: {
          orderBy: {
            testNumber: 'asc'
          }
        }
      }
    });

    if (!testSeries) {
      return res.status(404).json({
        success: false,
        message: 'Test series not found'
      });
    }

    // Transform data for response
    const { createdBy, creator, ...testData } = testSeries;
    
    res.status(200).json({
      success: true,
      message: 'Test series retrieved successfully',
      data: {
        ...testData,
        creator: creator?.adminProfile?.name || 'Admin',
        enrollmentCount: testSeries.enrollments.length
      }
    });
  } catch (error) {
    logger.error('Get test series by ID error:', error);
    next(error);
  }
};

// Get all test series (Admin)
const getAdminTestSeries = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    let where = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { overview: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get test series with pagination
    const [testSeries, total] = await Promise.all([
      prisma.testSeries.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              adminProfile: true
            }
          },
          enrollments: true,
          tests: {
            orderBy: {
              testNumber: 'asc'
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.testSeries.count({ where })
    ]);

    // Transform data for response
    const testData = testSeries.map(ts => {
      const { createdBy, creator, ...testData } = ts;
      return {
        ...testData,
        creator: creator?.adminProfile?.name || 'Admin',
        enrollmentCount: ts.enrollments.length
      };
    });

    res.status(200).json({
      success: true,
      message: 'Test series retrieved successfully',
      data: testData,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get admin test series error:', error);
    next(error);
  }
};

// Create test series (Admin)
const createTestSeries = async (req, res, next) => {
  try {
    const {
      title,
      overview,
      features,
      testPattern,
      benefits,
      image: rawImage,
      ctaLabel,
      demoTestLink,
      heroPosterThumbnail: rawHeroThumbnail,
      showInHeroPoster = false,
      testsCount,
      mode: rawMode,
      price
    } = req.body;

    const mode = rawMode ? rawMode.toUpperCase() : '';
    const image = rawImage || 'https://images.unsplash.com/photo-1434031211128-0c29b692f139?w=800&auto=format&fit=crop&q=60';
    const heroPosterThumbnail = rawHeroThumbnail || image;

    // Validate required fields
    if (!title || !overview || !features || !testPattern || !benefits || 
        !ctaLabel || !demoTestLink || !testsCount || !mode || !price) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate mode
    const validModes = ['ONLINE', 'OFFLINE', 'OMR_BASED', 'BOARD_STYLE'];
    if (!validModes.includes(mode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mode. Must be ONLINE, OFFLINE, OMR_BASED, or BOARD_STYLE'
      });
    }

    // Check if test series title already exists
    const existingTestSeries = await prisma.testSeries.findFirst({
      where: { 
        title: { equals: title, mode: 'insensitive' }
      }
    });

    if (existingTestSeries) {
      return res.status(400).json({
        success: false,
        message: 'Test series with this title already exists'
      });
    }

    // Create test series
    const testSeries = await prisma.testSeries.create({
      data: {
        title,
        overview,
        features,
        testPattern,
        benefits,
        image,
        ctaLabel,
        demoTestLink,
        heroPosterThumbnail,
        showInHeroPoster,
        testsCount: parseInt(testsCount),
        mode,
        price,
        createdBy: req.user?.userId || null
      }
    });

    logger.info(`Test series created: ${title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Test series created successfully',
      data: testSeries
    });
  } catch (error) {
    logger.error('Create test series error:', error);
    next(error);
  }
};

// Update test series (Admin)
const updateTestSeries = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      overview,
      features,
      testPattern,
      benefits,
      image,
      ctaLabel,
      demoTestLink,
      heroPosterThumbnail,
      showInHeroPoster,
      testsCount,
      mode,
      price
    } = req.body;

    // Check if test series exists
    const existingTestSeries = await prisma.testSeries.findUnique({
      where: { id }
    });

    if (!existingTestSeries) {
      return res.status(404).json({
        success: false,
        message: 'Test series not found'
      });
    }

    // Check if title is being changed and already exists
    if (title && title !== existingTestSeries.title) {
      const duplicateTestSeries = await prisma.testSeries.findFirst({
        where: { 
          title: { equals: title, mode: 'insensitive' },
          NOT: { id }
        }
      });
      
      if (duplicateTestSeries) {
        return res.status(400).json({
          success: false,
          message: 'Test series with this title already exists'
        });
      }
    }

    const upperMode = mode ? mode.toUpperCase() : undefined;

    // Validate mode if provided
    if (upperMode) {
      const validModes = ['ONLINE', 'OFFLINE', 'OMR_BASED', 'BOARD_STYLE'];
      if (!validModes.includes(upperMode)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mode. Must be ONLINE, OFFLINE, OMR_BASED, or BOARD_STYLE'
        });
      }
    }

    // Update test series
    const updatedTestSeries = await prisma.testSeries.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(overview && { overview }),
        ...(features && { features }),
        ...(testPattern && { testPattern }),
        ...(benefits && { benefits }),
        ...(image && { image }),
        ...(ctaLabel && { ctaLabel }),
        ...(demoTestLink && { demoTestLink }),
        ...(heroPosterThumbnail && { heroPosterThumbnail }),
        ...(showInHeroPoster !== undefined && { showInHeroPoster }),
        ...(testsCount && { testsCount: parseInt(testsCount) }),
        ...(upperMode && { mode: upperMode }),
        ...(price && { price })
      }
    });

    logger.info(`Test series updated: ${existingTestSeries.title}${req.user ? ` by ${req.user.email}` : ''}`);

    res.status(200).json({
      success: true,
      message: 'Test series updated successfully',
      data: updatedTestSeries
    });
  } catch (error) {
    logger.error('Update test series error:', error);
    next(error);
  }
};

// Delete test series (Admin)
const deleteTestSeries = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if test series exists
    const testSeries = await prisma.testSeries.findUnique({
      where: { id }
    });

    if (!testSeries) {
      return res.status(404).json({
        success: false,
        message: 'Test series not found'
      });
    }

    // Hard delete
    await prisma.testSeries.delete({
      where: { id }
    });

    logger.info(`Test series deleted: ${testSeries.title}${req.user ? ` by ${req.user.email}` : ''}`);

    res.status(200).json({
      success: true,
      message: 'Test series deleted successfully'
    });
  } catch (error) {
    logger.error('Delete test series error:', error);
    next(error);
  }
};

// Get student enrolled test series
const getStudentTestSeries = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(200).json({
        success: true,
        message: 'No user session',
        data: []
      });
    }

    // Get student profile
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        testSeriesEnrollments: {
          include: {
            testSeries: {
              include: {
                tests: {
                  orderBy: {
                    testNumber: 'asc'
                  }
                }
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

    const testSeries = studentProfile.testSeriesEnrollments.map(enrollment => ({
      ...enrollment.testSeries,
      enrollmentStatus: enrollment.status,
      enrolledAt: enrollment.enrolledAt
    }));

    res.status(200).json({
      success: true,
      message: 'Enrolled test series retrieved successfully',
      data: testSeries
    });
  } catch (error) {
    logger.error('Get student test series error:', error);
    next(error);
  }
};

// Enroll in test series (Student)
const enrollInTestSeries = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Login required to enroll (please use the enrollment form)'
      });
    }

    // Check if test series exists and is active
    const testSeries = await prisma.testSeries.findUnique({
      where: { id }
    });

    if (!testSeries) {
      return res.status(404).json({
        success: false,
        message: 'Test series not found or not active'
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

    // Check if already enrolled
    const existingEnrollment = await prisma.testSeriesEnrollment.findUnique({
      where: {
        studentId_testSeriesId: {
          studentId: studentProfile.id,
          testSeriesId: id
        }
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this test series'
      });
    }

    // Create enrollment
    const enrollment = await prisma.testSeriesEnrollment.create({
      data: {
        studentId: studentProfile.id,
        testSeriesId: id,
        status: 'ACTIVE'
      },
      include: {
        testSeries: true
      }
    });

    logger.info(`Student ${req.user?.email || studentProfile.id} enrolled in test series: ${testSeries.title}`);

    res.status(200).json({
      success: true,
      message: 'Enrolled successfully',
      data: enrollment
    });
  } catch (error) {
    logger.error('Enroll in test series error:', error);
    next(error);
  }
};

// Get test series results (Student)
const getTestSeriesResults = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Login required to see results'
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

    // Get test results for this test series
    const results = await prisma.testResult.findMany({
      where: {
        studentId: studentProfile.id,
        testSeriesId: id
      },
      include: {
        testSeries: true
      },
      orderBy: {
        testDate: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Test results retrieved successfully',
      data: results
    });
  } catch (error) {
    logger.error('Get test series results error:', error);
    next(error);
  }
};

// Add a test to a test series
const addTestToSeries = async (req, res, next) => {
  try {
    const { id: testSeriesId } = req.params;
    const { testNumber, title, description, testLink } = req.body;

    if (!testNumber || !title || !testLink) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const test = await prisma.test.create({
      data: {
        testSeriesId,
        testNumber: parseInt(testNumber),
        title,
        description,
        testLink
      }
    });

    res.status(201).json({
      success: true,
      message: 'Test added successfully',
      data: test
    });
  } catch (error) {
    logger.error('Add test error:', error);
    next(error);
  }
};

// Update a test in a test series
const updateTest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { testNumber, title, description, testLink } = req.body;

    const test = await prisma.test.update({
      where: { id },
      data: {
        ...(testNumber && { testNumber: parseInt(testNumber) }),
        ...(title && { title }),
        ...(description && { description }),
        ...(testLink && { testLink })
      }
    });

    res.status(200).json({
      success: true,
      message: 'Test updated successfully',
      data: test
    });
  } catch (error) {
    logger.error('Update test error:', error);
    next(error);
  }
};

// Delete a test from a series
const deleteTest = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.test.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Test deleted successfully'
    });
  } catch (error) {
    logger.error('Delete test error:', error);
    next(error);
  }
};

// Create a test result for a student
const createTestResult = async (req, res, next) => {
  try {
    const { studentId, testSeriesId, testName, marksObtained, totalMarks, testDate } = req.body;

    if (!studentId || !testName || marksObtained === undefined || !totalMarks) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const percentage = (marksObtained / totalMarks) * 100;
    
    // Simple grading
    let grade = 'C';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    
    const result = await prisma.testResult.create({
      data: {
        studentId,
        testSeriesId,
        testName,
        marksObtained: parseInt(marksObtained),
        totalMarks: parseInt(totalMarks),
        percentage,
        grade,
        testDate: testDate ? new Date(testDate) : new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Test result recorded successfully',
      data: result
    });
  } catch (error) {
    logger.error('Create test result error:', error);
    next(error);
  }
};

// Get all test results (Admin)
const getAllTestResults = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, studentId, testSeriesId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    let where = {};
    if (studentId) where.studentId = studentId;
    if (testSeriesId) where.testSeriesId = testSeriesId;

    const [results, total] = await Promise.all([
      prisma.testResult.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              phone: true,
              user: {
                select: {
                  email: true
                }
              }
            }
          },
          testSeries: {
            select: {
              id: true,
              title: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.testResult.count({ where })
    ]);

    res.status(200).json({
      success: true,
      message: 'Test results retrieved successfully',
      data: results,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get all test results error:', error);
    next(error);
  }
};

// Update test result (Admin)
const updateTestResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { testName, marksObtained, totalMarks, testDate, testSeriesId } = req.body;

    // Check if result exists
    const existingResult = await prisma.testResult.findUnique({
      where: { id }
    });

    if (!existingResult) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found'
      });
    }

    // Calculate new percentage and grade if marks changed
    let updateData = {};
    if (testName) updateData.testName = testName;
    if (testSeriesId !== undefined) updateData.testSeriesId = testSeriesId || null;
    if (testDate) updateData.testDate = new Date(testDate);
    
    if (marksObtained !== undefined || totalMarks !== undefined) {
      const marks = marksObtained !== undefined ? parseInt(marksObtained) : existingResult.marksObtained;
      const total = totalMarks !== undefined ? parseInt(totalMarks) : existingResult.totalMarks;
      const percentage = (marks / total) * 100;
      
      let grade = 'C';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      
      updateData.marksObtained = marks;
      updateData.totalMarks = total;
      updateData.percentage = percentage;
      updateData.grade = grade;
    }

    const result = await prisma.testResult.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    logger.info(`Test result updated: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Test result updated successfully',
      data: result
    });
  } catch (error) {
    logger.error('Update test result error:', error);
    next(error);
  }
};

// Delete test result (Admin)
const deleteTestResult = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if result exists
    const result = await prisma.testResult.findUnique({
      where: { id }
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found'
      });
    }

    await prisma.testResult.delete({
      where: { id }
    });

    logger.info(`Test result deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Test result deleted successfully'
    });
  } catch (error) {
    logger.error('Delete test result error:', error);
    next(error);
  }
};

module.exports = {
  getAllTestSeries,
  getTestSeriesById,
  getAdminTestSeries,
  createTestSeries,
  updateTestSeries,
  deleteTestSeries,
  getStudentTestSeries,
  enrollInTestSeries,
  getTestSeriesResults,
  addTestToSeries,
  updateTest,
  deleteTest,
  createTestResult,
  getAllTestResults,
  updateTestResult,
  deleteTestResult
};