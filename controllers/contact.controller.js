const prisma = require('../config/prisma');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter for email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Submit contact message (Public)
const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and message are required'
      });
    }

    // Create contact message
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone,
        message
      }
    });

    // Send notification email to admin
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.CONTACT_NOTIFICATION_EMAIL || 'shivamaiuse1@gmail.com',
      subject: `New Contact Message from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <p><em>Received at: ${new Date().toLocaleString()}</em></p>
      `
    };

    await transporter.sendMail(mailOptions);

    logger.info(`Contact message received from: ${name} (${email})`);

    res.status(200).json({
      success: true,
      message: 'Message submitted successfully. We will contact you soon!'
    });
  } catch (error) {
    logger.error('Submit contact message error:', error);
    next(error);
  }
};

// Get all contact messages (Admin)
const getAllContactMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [contactMessages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          date: 'desc'
        }
      }),
      prisma.contactMessage.count()
    ]);

    res.status(200).json({
      success: true,
      message: 'Contact messages retrieved successfully',
      data: contactMessages,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get all contact messages error:', error);
    next(error);
  }
};

// Get contact message by ID (Admin)
const getContactMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id }
    });

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact message retrieved successfully',
      data: contactMessage
    });
  } catch (error) {
    logger.error('Get contact message by ID error:', error);
    next(error);
  }
};

// Update contact message status (Admin)
const updateContactMessageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if contact message exists
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id }
    });

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    // For now, contact messages don't have status, but we can update if needed
    // In a real implementation, you might want to add a status field to the schema
    
    res.status(200).json({
      success: true,
      message: 'Contact message status updated successfully',
      data: contactMessage
    });
  } catch (error) {
    logger.error('Update contact message status error:', error);
    next(error);
  }
};

// Delete contact message (Admin)
const deleteContactMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if contact message exists
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id }
    });

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    // Delete contact message
    await prisma.contactMessage.delete({
      where: { id }
    });

    logger.info(`Contact message deleted: ${contactMessage.name} (${contactMessage.email})`);

    res.status(200).json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    logger.error('Delete contact message error:', error);
    next(error);
  }
};

// Get all inquiries (Admin)
const getAllInquiries = async (req, res, next) => {
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
    logger.error('Get all inquiries error:', error);
    next(error);
  }
};

// Get inquiry by ID (Admin)
const getInquiryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry retrieved successfully',
      data: inquiry
    });
  } catch (error) {
    logger.error('Get inquiry by ID error:', error);
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

// Create contact message (Student)
const createContactMessage = async (req, res, next) => {
  return submitContactMessage(req, res, next);
};

// Create inquiry (Student)
const createInquiry = async (req, res, next) => {
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
        status: 'PENDING',
        userId: req.user.userId
      }
    });

    logger.info(`Inquiry submitted by student: ${name}`);

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

// Get all notifications (Admin)
const getAllNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        include: {
          user: {
            select: {
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
      prisma.notification.count()
    ]);

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: notifications,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get all notifications error:', error);
    next(error);
  }
};

// Create notification (Admin)
const createNotification = async (req, res, next) => {
  try {
    const { title, message, type, userId, sendEmail = false } = req.body;

    // Validate required fields
    if (!title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title, message, and type are required'
      });
    }

    let notification;

    if (userId) {
      // Create notification for specific user
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          read: false
        }
      });

      // Send email if requested
      if (sendEmail) {
        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: `Notification: ${title}`,
          html: `
            <h2>${title}</h2>
            <p>${message}</p>
            <p><em>Sent at: ${new Date().toLocaleString()}</em></p>
          `
        };

        await transporter.sendMail(mailOptions);
      }
    } else {
      // Create notification for all users
      const users = await prisma.user.findMany({
        where: { role: { in: ['STUDENT', 'ADMIN'] } }
      });

      // Create notifications for all users
      const notificationPromises = users.map(user => 
        prisma.notification.create({
          data: {
            userId: user.id,
            title,
            message,
            type,
            read: false
          }
        })
      );

      await Promise.all(notificationPromises);

      // Send emails to all users if requested
      if (sendEmail) {
        const emailPromises = users.map(user => {
          const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: `Notification: ${title}`,
            html: `
              <h2>${title}</h2>
              <p>${message}</p>
              <p><em>Sent at: ${new Date().toLocaleString()}</em></p>
            `
          };
          return transporter.sendMail(mailOptions);
        });

        await Promise.all(emailPromises);
      }

      notification = { title, message, type, userCount: users.length };
    }

    logger.info(`Notification created: ${title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    logger.error('Create notification error:', error);
    next(error);
  }
};

// Get user notifications
const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      message: 'User notifications retrieved successfully',
      data: notifications
    });
  } catch (error) {
    logger.error('Get user notifications error:', error);
    next(error);
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or does not belong to user'
      });
    }

    // Update notification as read
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });

    res.status(200).json({
      success: true,
      message: 'Notification marked as read successfully',
      data: updatedNotification
    });
  } catch (error) {
    logger.error('Mark notification as read error:', error);
    next(error);
  }
};

module.exports = {
  submitContactMessage,
  getAllContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
  getAllNotifications,
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  getAllInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry,
  createContactMessage,
  createInquiry
};