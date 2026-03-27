const prisma = require('../config/prisma');
const { 
  generateToken, 
  generateRefreshToken, 
  hashPassword, 
  comparePassword 
} = require('../utils/auth');
const logger = require('../utils/logger');

// Admin login
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('Admin login attempt for email:', email); // Add server-side logging

    // Validate input
    if (!email || !password) {
      console.log('Admin login validation failed: Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find admin user
    console.log('Searching for admin user with email:', email);
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        adminProfile: true
      }
    });

    if (!user || user.role !== 'ADMIN') {
      console.log('Admin login failed: User not found or not an admin');
      return res.status(401).json({
        success: false,
        message: 'Account not found or unauthorized access'
      });
    }

    console.log('Admin user found, checking password...');
    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      console.log('Admin login failed: Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password'
      });
    }

    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`Admin login successful: ${email}`);

    console.log('Admin login successful for user:', email);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    logger.error('Admin login error:', error);
    next(error);
  }
};

// Student login
const studentLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find student user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: {
          include: {
            courseEnrollments: true,
            testSeriesEnrollments: true,
            testResults: true
          }
        }
      }
    });

    if (!user || user.role !== 'STUDENT') {
      return res.status(401).json({
        success: false,
        message: 'Student account not found'
      });
    }

    // Check if student is blocked
    if (user.studentProfile && user.studentProfile.status === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact admin.'
      });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password'
      });
    }

    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`Student login successful: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Student login error:', error);
    next(error);
  }
};

// Student registration
const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, phone, standard, board, address, dateOfBirth, guardianName, guardianPhone, username } = req.body;

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
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and student profile in transaction
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
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            guardianName: guardianName || null,
            guardianPhone: guardianPhone || null,
            username: username || email, // Use provided username or default to email
            plainPassword: password
          }
        }
      },
      include: {
        studentProfile: {
          include: {
            courseEnrollments: true,
            testSeriesEnrollments: true,
            testResults: true
          }
        }
      }
    });

    // Generate tokens for automatic login
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`New student registered and logged in: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registration and login successful',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Student registration error:', error);
    next(error);
  }
};

// Admin registration
const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

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
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and admin profile in transaction
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        adminProfile: {
          create: {
            name,
            phone: phone || null
          }
        }
      },
      include: {
        adminProfile: true
      }
    });

    // Generate tokens for automatic login
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`New admin registered and logged in: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Admin registration and login successful',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Admin registration error:', error);
    next(error);
  }
};

// Refresh token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = require('../utils/auth').verifyRefreshToken(refreshToken);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const newAccessToken = generateToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// Logout
const logout = async (req, res, next) => {
  try {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return success
    logger.info(`User logged out: ${req.userDetails.email}`);
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

// Get profile
const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        adminProfile: true,
        studentProfile: {
          include: {
            courseEnrollments: true,
            testSeriesEnrollments: true,
            testResults: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Profile retrieved',
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};

// Update profile (Student only)
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, phone, address, dateOfBirth, guardianName, guardianPhone, profileImage, username } = req.body;

    // Get current user to check role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true }
    });

    if (!user || user.role !== 'STUDENT') {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

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
            ...(profileImage !== undefined && { profileImage }),
            ...(username !== undefined && { username })
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
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error) {
    logger.error('Update student profile error:', error);
    next(error);
  }
};

module.exports = {
  adminLogin,
  studentLogin,
  registerStudent,
  registerAdmin,
  refreshToken,
  logout,
  getProfile,
  updateProfile
};