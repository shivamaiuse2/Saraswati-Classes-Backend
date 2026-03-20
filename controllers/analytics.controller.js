const prisma = require('../config/prisma');
const logger = require('../utils/logger');

// Get dashboard overview (Admin)
const getDashboardOverview = async (req, res, next) => {
  try {
    // Get counts for various entities
    const [
      totalStudents,
      totalCourses,
      totalTestSeries,
      totalEnrollments,
      totalPendingEnrollments,
      totalInquiries,
      totalPendingInquiries
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.course.count({ where: { isActive: true } }),
      prisma.testSeries.count({ where: { isActive: true } }),
      prisma.courseEnrollment.count() + prisma.testSeriesEnrollment.count(),
      prisma.enrollment.count({ where: { status: 'PENDING' } }),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'PENDING' } })
    ]);

    // Get recent activity
    const recentStudents = await prisma.studentProfile.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            createdAt: true
          }
        }
      }
    });

    const recentEnrollments = await prisma.enrollment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            name: true
          }
        }
      }
    });

    const recentInquiries = await prisma.inquiry.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    const overview = {
      totalStudents,
      totalCourses,
      totalTestSeries,
      totalEnrollments,
      pendingEnrollments: totalPendingEnrollments,
      totalInquiries,
      pendingInquiries: totalPendingInquiries,
      recentActivity: {
        recentStudents: recentStudents.map(s => ({
          id: s.id,
          name: s.name,
          email: s.user.email,
          date: s.createdAt
        })),
        recentEnrollments: recentEnrollments.map(e => ({
          id: e.id,
          name: e.name,
          courseOrSeries: e.courseOrSeries,
          date: e.createdAt
        })),
        recentInquiries: recentInquiries.map(i => ({
          id: i.id,
          name: i.name,
          email: i.email,
          date: i.createdAt
        }))
      }
    };

    res.status(200).json({
      success: true,
      message: 'Dashboard overview retrieved successfully',
      data: overview
    });
  } catch (error) {
    logger.error('Get dashboard overview error:', error);
    next(error);
  }
};

// Get student analytics (Admin)
const getStudentAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filters
    const dateFilter = {};
    if (startDate) dateFilter.createdAt = { gte: new Date(startDate) };
    if (endDate) {
      dateFilter.createdAt = {
        ...dateFilter.createdAt,
        lte: new Date(endDate)
      };
    }

    // Get student analytics
    const [
      totalStudents,
      activeStudents,
      blockedStudents,
      studentsByBoard,
      studentsByStandard,
      studentGrowth
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.studentProfile.count({ where: { status: 'ACTIVE', ...dateFilter } }),
      prisma.studentProfile.count({ where: { status: 'BLOCKED', ...dateFilter } }),
      prisma.studentProfile.groupBy({
        by: ['board'],
        where: dateFilter,
        _count: true
      }),
      prisma.studentProfile.groupBy({
        by: ['standard'],
        where: dateFilter,
        _count: true
      }),
      prisma.studentProfile.groupBy({
        by: ['createdAt'],
        where: dateFilter,
        _count: true
      })
    ]);

    const analytics = {
      totalStudents,
      activeStudents,
      blockedStudents,
      studentsByBoard: studentsByBoard.filter(s => s.board),
      studentsByStandard: studentsByStandard.filter(s => s.standard),
      studentGrowth: studentGrowth.map(g => ({
        date: g.createdAt.toISOString().split('T')[0],
        count: g._count
      })),
      growthRate: studentGrowth.length > 1 ? 
        ((studentGrowth[studentGrowth.length - 1]._count - studentGrowth[0]._count) / studentGrowth[0]._count) * 100 : 0
    };

    res.status(200).json({
      success: true,
      message: 'Student analytics retrieved successfully',
      data: analytics
    });
  } catch (error) {
    logger.error('Get student analytics error:', error);
    next(error);
  }
};

// Get course analytics (Admin)
const getCourseAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filters
    const dateFilter = {};
    if (startDate) dateFilter.createdAt = { gte: new Date(startDate) };
    if (endDate) {
      dateFilter.createdAt = {
        ...dateFilter.createdAt,
        lte: new Date(endDate)
      };
    }

    // Get course analytics
    const [
      totalCourses,
      activeCourses,
      coursesByCategory,
      courseEnrollments,
      topCourses
    ] = await Promise.all([
      prisma.course.count({ where: { ...dateFilter } }),
      prisma.course.count({ where: { isActive: true, ...dateFilter } }),
      prisma.course.groupBy({
        by: ['category'],
        where: { ...dateFilter },
        _count: true
      }),
      prisma.courseEnrollment.groupBy({
        by: ['courseId'],
        _count: true
      }),
      prisma.course.findMany({
        where: { isActive: true, ...dateFilter },
        include: {
          _count: {
            select: { courseEnrollments: true }
          }
        },
        orderBy: { courseEnrollments: { _count: 'desc' } },
        take: 10
      })
    ]);

    // Calculate enrollment stats
    const courseStats = courseEnrollments.map(ce => ({
      courseId: ce.courseId,
      enrollmentCount: ce._count
    }));

    const analytics = {
      totalCourses,
      activeCourses,
      coursesByCategory,
      courseStats,
      topCourses: topCourses.map(course => ({
        id: course.id,
        title: course.title,
        category: course.category,
        enrollmentCount: course._count.courseEnrollments
      }))
    };

    res.status(200).json({
      success: true,
      message: 'Course analytics retrieved successfully',
      data: analytics
    });
  } catch (error) {
    logger.error('Get course analytics error:', error);
    next(error);
  }
};

// Get test series analytics (Admin)
const getTestSeriesAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filters
    const dateFilter = {};
    if (startDate) dateFilter.createdAt = { gte: new Date(startDate) };
    if (endDate) {
      dateFilter.createdAt = {
        ...dateFilter.createdAt,
        lte: new Date(endDate)
      };
    }

    // Get test series analytics
    const [
      totalTestSeries,
      activeTestSeries,
      testSeriesByMode,
      testSeriesEnrollments,
      topTestSeries
    ] = await Promise.all([
      prisma.testSeries.count({ where: { ...dateFilter } }),
      prisma.testSeries.count({ where: { isActive: true, ...dateFilter } }),
      prisma.testSeries.groupBy({
        by: ['mode'],
        where: { ...dateFilter },
        _count: true
      }),
      prisma.testSeriesEnrollment.groupBy({
        by: ['testSeriesId'],
        _count: true
      }),
      prisma.testSeries.findMany({
        where: { isActive: true, ...dateFilter },
        include: {
          _count: {
            select: { testSeriesEnrollments: true }
          }
        },
        orderBy: { testSeriesEnrollments: { _count: 'desc' } },
        take: 10
      })
    ]);

    // Calculate enrollment stats
    const testSeriesStats = testSeriesEnrollments.map(tse => ({
      testSeriesId: tse.testSeriesId,
      enrollmentCount: tse._count
    }));

    const analytics = {
      totalTestSeries,
      activeTestSeries,
      testSeriesByMode,
      testSeriesStats,
      topTestSeries: topTestSeries.map(ts => ({
        id: ts.id,
        title: ts.title,
        mode: ts.mode,
        enrollmentCount: ts._count.testSeriesEnrollments
      }))
    };

    res.status(200).json({
      success: true,
      message: 'Test series analytics retrieved successfully',
      data: analytics
    });
  } catch (error) {
    logger.error('Get test series analytics error:', error);
    next(error);
  }
};

// Get enrollment analytics (Admin)
const getEnrollmentAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filters
    const dateFilter = {};
    if (startDate) dateFilter.createdAt = { gte: new Date(startDate) };
    if (endDate) {
      dateFilter.createdAt = {
        ...dateFilter.createdAt,
        lte: new Date(endDate)
      };
    }

    // Get enrollment analytics
    const [
      totalEnrollments,
      pendingEnrollments,
      approvedEnrollments,
      rejectedEnrollments,
      enrollmentByStatus,
      enrollmentByCourse,
      enrollmentTrend
    ] = await Promise.all([
      prisma.enrollment.count({ where: { ...dateFilter } }),
      prisma.enrollment.count({ where: { status: 'PENDING', ...dateFilter } }),
      prisma.enrollment.count({ where: { status: 'APPROVED', ...dateFilter } }),
      prisma.enrollment.count({ where: { status: 'REJECTED', ...dateFilter } }),
      prisma.enrollment.groupBy({
        by: ['status'],
        where: { ...dateFilter },
        _count: true
      }),
      prisma.enrollment.groupBy({
        by: ['courseOrSeries'],
        where: { status: 'APPROVED', ...dateFilter },
        _count: true
      }),
      prisma.enrollment.groupBy({
        by: ['createdAt'],
        where: { ...dateFilter },
        _count: true
      })
    ]);

    const analytics = {
      totalEnrollments,
      statusBreakdown: {
        pending: pendingEnrollments,
        approved: approvedEnrollments,
        rejected: rejectedEnrollments
      },
      enrollmentByStatus,
      enrollmentByCourse: enrollmentByCourse.filter(e => e.courseOrSeries),
      enrollmentTrend: enrollmentTrend.map(t => ({
        date: t.createdAt.toISOString().split('T')[0],
        count: t._count
      })),
      approvalRate: approvedEnrollments > 0 ? 
        (approvedEnrollments / totalEnrollments) * 100 : 0
    };

    res.status(200).json({
      success: true,
      message: 'Enrollment analytics retrieved successfully',
      data: analytics
    });
  } catch (error) {
    logger.error('Get enrollment analytics error:', error);
    next(error);
  }
};

// Get inquiry analytics (Admin)
const getInquiryAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filters
    const dateFilter = {};
    if (startDate) dateFilter.createdAt = { gte: new Date(startDate) };
    if (endDate) {
      dateFilter.createdAt = {
        ...dateFilter.createdAt,
        lte: new Date(endDate)
      };
    }

    // Get inquiry analytics
    const [
      totalInquiries,
      pendingInquiries,
      resolvedInquiries,
      followUpInquiries,
      inquiryByStatus,
      inquiryTrend
    ] = await Promise.all([
      prisma.inquiry.count({ where: { ...dateFilter } }),
      prisma.inquiry.count({ where: { status: 'PENDING', ...dateFilter } }),
      prisma.inquiry.count({ where: { status: 'RESOLVED', ...dateFilter } }),
      prisma.inquiry.count({ where: { status: 'FOLLOW_UP', ...dateFilter } }),
      prisma.inquiry.groupBy({
        by: ['status'],
        where: { ...dateFilter },
        _count: true
      }),
      prisma.inquiry.groupBy({
        by: ['createdAt'],
        where: { ...dateFilter },
        _count: true
      })
    ]);

    const analytics = {
      totalInquiries,
      statusBreakdown: {
        pending: pendingInquiries,
        resolved: resolvedInquiries,
        followUp: followUpInquiries
      },
      inquiryByStatus,
      inquiryTrend: inquiryTrend.map(t => ({
        date: t.createdAt.toISOString().split('T')[0],
        count: t._count
      })),
      resolutionRate: resolvedInquiries > 0 ? 
        (resolvedInquiries / totalInquiries) * 100 : 0
    };

    res.status(200).json({
      success: true,
      message: 'Inquiry analytics retrieved successfully',
      data: analytics
    });
  } catch (error) {
    logger.error('Get inquiry analytics error:', error);
    next(error);
  }
};

const getAdminAnalytics = async (req, res, next) => {
  try {
    // Get counts for various entities
    const [
      totalStudents,
      totalCourses,
      totalTestSeries,
      totalEnrollments,
      totalPendingEnrollments,
      totalInquiries,
      totalPendingInquiries
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.course.count({ where: { isActive: true } }),
      prisma.testSeries.count({ where: { isActive: true } }),
      prisma.courseEnrollment.count() + prisma.testSeriesEnrollment.count(),
      prisma.enrollment.count({ where: { status: 'PENDING' } }),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'PENDING' } })
    ]);

    // Get recent activity
    const recentStudents = await prisma.studentProfile.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            createdAt: true
          }
        }
      }
    });

    const recentEnrollments = await prisma.enrollment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            name: true
          }
        }
      }
    });

    const recentInquiries = await prisma.inquiry.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    const analytics = {
      totalStudents,
      totalCourses,
      totalTestSeries,
      totalEnrollments,
      pendingEnrollments: totalPendingEnrollments,
      totalInquiries,
      pendingInquiries: totalPendingInquiries,
      recentActivity: {
        recentStudents: recentStudents.map(s => ({
          id: s.id,
          name: s.name,
          email: s.user.email,
          date: s.createdAt
        })),
        recentEnrollments: recentEnrollments.map(e => ({
          id: e.id,
          name: e.name,
          courseOrSeries: e.courseOrSeries,
          date: e.createdAt
        })),
        recentInquiries: recentInquiries.map(i => ({
          id: i.id,
          name: i.name,
          email: i.email,
          date: i.createdAt
        }))
      }
    };

    res.status(200).json({
      success: true,
      message: 'Admin analytics retrieved successfully',
      data: analytics
    });
  } catch (error) {
    logger.error('Get admin analytics error:', error);
    next(error);
  }
};

const getUserAnalytics = async (req, res, next) => {
  return getStudentAnalytics(req, res, next);
};

const getRevenueAnalytics = async (req, res, next) => {
  try {
    // This is a simplified revenue calculation
    // In a real application, you would have actual payment records
    const revenueData = {
      totalRevenue: 0, // Placeholder - would need actual payment data
      monthlyRevenue: [],
      topPerformingCourses: [],
      paymentMethods: []
    };

    res.status(200).json({
      success: true,
      message: 'Revenue analytics retrieved successfully',
      data: revenueData
    });
  } catch (error) {
    logger.error('Get revenue analytics error:', error);
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
  getStudentAnalytics,
  getCourseAnalytics,
  getTestSeriesAnalytics,
  getEnrollmentAnalytics,
  getInquiryAnalytics,
  getAdminAnalytics,
  getUserAnalytics,
  getRevenueAnalytics
};