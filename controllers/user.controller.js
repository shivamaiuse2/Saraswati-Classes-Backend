const prisma = require('../config/prisma');
const { hashPassword, comparePassword } = require('../utils/auth');
const logger = require('../utils/logger');

// Get all students (Admin)
const getAllStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    let where = {
      role: 'STUDENT'
    };

    if (search) {
      where.OR = [
        { studentProfile: { name: { contains: search, mode: 'insensitive' } } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.studentProfile = {
        ...where.studentProfile,
        status: status
      };
    }

    // Get students with pagination
    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          studentProfile: {
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
              },
              certificates: true,
              enrollments: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({ where })
    ]);

    // Transform data for response
    const studentsData = students.map(user => {
      const { password, ...userData } = user;
      return {
        ...userData,
        courseCount: user.studentProfile?.courseEnrollments?.length || 0,
        testSeriesCount: user.studentProfile?.testSeriesEnrollments?.length || 0
      };
    });

    res.status(200).json({
      success: true,
      message: 'Students retrieved successfully',
      data: studentsData,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get all students error:', error);
    next(error);
  }
};

// Create student (Admin)
const createStudent = async (req, res, next) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      address, 
      standard, 
      board, 
      status = 'ACTIVE',
      dateOfBirth,
      guardianName,
      guardianPhone,
      profileImage
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and student profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'STUDENT',
        studentProfile: {
          create: {
            name,
            phone: phone || null,
            address: address || null,
            standard: standard || null,
            board: board || null,
            status: status ? status.toUpperCase() : 'ACTIVE',
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            guardianName: guardianName || null,
            guardianPhone: guardianPhone || null,
            profileImage: profileImage || null
          }
        }
      },
      include: {
        studentProfile: true
      }
    });

    // Handle enrollments if provided
    if (req.body.enrolledCourses && Array.isArray(req.body.enrolledCourses)) {
      await Promise.all(req.body.enrolledCourses.map(courseId => 
        prisma.courseEnrollment.create({
          data: {
            studentId: user.studentProfile.id,
            courseId,
            status: 'ACTIVE'
          }
        }).catch(err => logger.error(`Error enrolling student in course ${courseId}:`, err))
      ));
    }

    if (req.body.enrolledTestSeries && Array.isArray(req.body.enrolledTestSeries)) {
      await Promise.all(req.body.enrolledTestSeries.map(testSeriesId => 
        prisma.testSeriesEnrollment.create({
          data: {
            studentId: user.studentProfile.id,
            testSeriesId,
            status: 'ACTIVE'
          }
        }).catch(err => logger.error(`Error enrolling student in test series ${testSeriesId}:`, err))
      ));
    }

    // Refetch user with updated enrollments
    const finalUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        studentProfile: {
          include: {
            courseEnrollments: true,
            testSeriesEnrollments: true
          }
        }
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = finalUser;

    logger.info(`Student created: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    logger.error('Create student error:', error);
    next(error);
  }
};

// Get student by ID (Admin)
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: {
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
            },
            testResults: {
              include: {
                testSeries: true
              }
            },
            certificates: true,
            enrollments: true
          }
        }
      }
    });

    if (!user || user.role !== 'STUDENT') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Student retrieved successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    logger.error('Get student by ID error:', error);
    next(error);
  }
};

// Update student (Admin)
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      phone, 
      address, 
      standard, 
      board, 
      status,
      dateOfBirth,
      guardianName,
      guardianPhone,
      profileImage
    } = req.body;

    // Check if student exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true }
    });

    if (!user || user.role !== 'STUDENT') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if email is being changed and already exists
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Update user and student profile
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(email && { email }),
        studentProfile: {
          update: {
            ...(name && { name }),
            ...(phone !== undefined && { phone }),
            ...(address !== undefined && { address }),
            ...(standard !== undefined && { standard }),
            ...(board !== undefined && { board }),
            ...(status && { status: status.toUpperCase() }),
            ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
            ...(guardianName !== undefined && { guardianName }),
            ...(guardianPhone !== undefined && { guardianPhone }),
            ...(profileImage !== undefined && { profileImage })
          }
        }
      },
      include: {
        studentProfile: true
      }
    });

    // Update enrollments if provided
    if (req.body.enrolledCourses && Array.isArray(req.body.enrolledCourses)) {
      // Simple approach: delete existing and recreate
      // (Better approach would be to diff, but this is easier for now)
      await prisma.courseEnrollment.deleteMany({
        where: { studentId: updatedUser.studentProfile.id }
      });
      
      await Promise.all(req.body.enrolledCourses.map(courseId => 
        prisma.courseEnrollment.create({
          data: {
            studentId: updatedUser.studentProfile.id,
            courseId,
            status: 'ACTIVE'
          }
        }).catch(err => logger.error(`Error enrolling student in course ${courseId}:`, err))
      ));
    }

    if (req.body.enrolledTestSeries && Array.isArray(req.body.enrolledTestSeries)) {
      await prisma.testSeriesEnrollment.deleteMany({
        where: { studentId: updatedUser.studentProfile.id }
      });
      
      await Promise.all(req.body.enrolledTestSeries.map(testSeriesId => 
        prisma.testSeriesEnrollment.create({
          data: {
            studentId: updatedUser.studentProfile.id,
            testSeriesId,
            status: 'ACTIVE'
          }
        }).catch(err => logger.error(`Error enrolling student in test series ${testSeriesId}:`, err))
      ));
    }

    // Refetch user with updated enrollments
    const finalUser = await prisma.user.findUnique({
      where: { id: updatedUser.id },
      include: {
        studentProfile: {
          include: {
            courseEnrollments: {
              include: { course: true }
            },
            testSeriesEnrollments: {
              include: { testSeries: true }
            }
          }
        }
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = finalUser;

    logger.info(`Student updated: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    logger.error('Update student error:', error);
    next(error);
  }
};

// Delete student (Admin)
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if student exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true }
    });

    if (!user || user.role !== 'STUDENT') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Delete user (cascades to studentProfile)
    await prisma.user.delete({
      where: { id }
    });

    logger.info(`Student deleted: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    logger.error('Delete student error:', error);
    next(error);
  }
};

// Update student status (Admin)
const updateStudentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['ACTIVE', 'BLOCKED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be ACTIVE or BLOCKED'
      });
    }

    // Check if student exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true }
    });

    if (!user || user.role !== 'STUDENT') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update student status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        studentProfile: {
          update: {
            status
          }
        }
      },
      include: {
        studentProfile: true
      }
    });

    logger.info(`Student ${status.toLowerCase()}: ${user.email}`);

    res.status(200).json({
      success: true,
      message: `Student ${status.toLowerCase()} successfully`,
      data: updatedUser
    });
  } catch (error) {
    logger.error('Update student status error:', error);
    next(error);
  }
};

// Get student certificates
const getStudentCertificates = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: {
          include: {
            certificates: true
          }
        }
      }
    });

    if (!user || user.role !== 'STUDENT') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student certificates retrieved successfully',
      data: user.studentProfile.certificates
    });
  } catch (error) {
    logger.error('Get student certificates error:', error);
    next(error);
  }
};

// Get student certificate by ID
const getStudentCertificateById = async (req, res, next) => {
  try {
    const { id, certificateId } = req.params;

    const certificate = await prisma.certificate.findFirst({
      where: {
        id: certificateId,
        studentId: id
      },
      include: {
        student: true
      }
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Certificate retrieved successfully',
      data: certificate
    });
  } catch (error) {
    logger.error('Get student certificate by ID error:', error);
    next(error);
  }
};

// Get student dashboard
const getStudentDashboard = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [user, courseCount, testSeriesCount, testResults] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          studentProfile: {
            include: {
              courseEnrollments: {
                include: {
                  course: {
                    include: {
                      chapters: true
                    }
                  }
                }
              },
              testSeriesEnrollments: {
                include: {
                  testSeries: true
                }
              }
            }
          }
        }
      }),
      prisma.courseEnrollment.count({
        where: { studentId: userId }
      }),
      prisma.testSeriesEnrollment.count({
        where: { studentId: userId }
      }),
      prisma.testResult.findMany({
        where: { studentId: userId },
        orderBy: {
          testDate: 'desc'
        },
        take: 5
      })
    ]);

    if (!user || user.role !== 'STUDENT') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Calculate progress
    const completedChapters = user.studentProfile.courseEnrollments.reduce((acc, enrollment) => {
      const completed = enrollment.course.chapters.filter(chapter => 
        chapter.videoUrl && chapter.videoUrl.length > 0
      ).length;
      return acc + completed;
    }, 0);

    const totalChapters = user.studentProfile.courseEnrollments.reduce((acc, enrollment) => {
      return acc + enrollment.course.chapters.length;
    }, 0);

    const overallProgress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

    const dashboardData = {
      profile: user.studentProfile,
      stats: {
        enrolledCourses: courseCount,
        enrolledTestSeries: testSeriesCount,
        overallProgress: Math.round(overallProgress),
        recentTestResults: testResults
      },
      enrolledCourses: user.studentProfile.courseEnrollments.map(enrollment => ({
        ...enrollment.course,
        enrollmentStatus: enrollment.status,
        enrolledAt: enrollment.enrolledAt
      })),
      enrolledTestSeries: user.studentProfile.testSeriesEnrollments.map(enrollment => ({
        ...enrollment.testSeries,
        enrollmentStatus: enrollment.status,
        enrolledAt: enrollment.enrolledAt
      }))
    };

    res.status(200).json({
      success: true,
      message: 'Student dashboard retrieved successfully',
      data: dashboardData
    });
  } catch (error) {
    logger.error('Get student dashboard error:', error);
    next(error);
  }
};

// Get student enrollments (Admin)
const getStudentEnrollments = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: {
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
        }
      }
    });

    if (!user || user.role !== 'STUDENT') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const enrollments = {
      courses: user.studentProfile.courseEnrollments,
      testSeries: user.studentProfile.testSeriesEnrollments
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

// Get current student profile
const getStudentProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
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
            },
            testResults: {
              include: {
                testSeries: true
              }
            },
            certificates: true,
            enrollments: true
          }
        }
      }
    });

    if (!user || user.role !== 'STUDENT') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    logger.error('Get student profile error:', error);
    next(error);
  }
};

// Update current student profile
const updateStudentProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, phone, address, dateOfBirth, guardianName, guardianPhone, profileImage } = req.body;

    // Update student profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        studentProfile: {
          update: {
            ...(name && { name }),
            ...(phone !== undefined && { phone }),
            ...(address !== undefined && { address }),
            ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
            ...(guardianName !== undefined && { guardianName }),
            ...(guardianPhone !== undefined && { guardianPhone }),
            ...(profileImage !== undefined && { profileImage })
          }
        }
      },
      include: {
        studentProfile: true
      }
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    logger.info(`Student profile updated: ${updatedUser.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    logger.error('Update student profile error:', error);
    next(error);
  }
};

// Change student password
const changeStudentPassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    logger.info(`Password changed for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    next(error);
  }
};

// Search students by name (for autocomplete)
const searchStudents = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 1) {
      return res.status(200).json({
        success: true,
        message: 'Students retrieved successfully',
        data: []
      });
    }

    // Search students by name
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        studentProfile: {
          name: { contains: q, mode: 'insensitive' }
        }
      },
      include: {
        studentProfile: true
      },
      take: 10,
      orderBy: {
        studentProfile: {
          name: 'asc'
        }
      }
    });

    // Transform data for autocomplete
    const suggestions = students.map(user => ({
      id: user.id,
      name: user.studentProfile?.name || '',
      email: user.email,
      phone: user.studentProfile?.phone || ''
    }));

    res.status(200).json({
      success: true,
      message: 'Students retrieved successfully',
      data: suggestions
    });
  } catch (error) {
    logger.error('Search students error:', error);
    next(error);
  }
};

module.exports = {
  getAllStudents,
  createStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
  updateStudentStatus,
  getStudentEnrollments,
  getStudentProfile,
  updateStudentProfile,
  changeStudentPassword,
  getStudentCertificates,
  getStudentCertificateById,
  getStudentDashboard,
  searchStudents
};