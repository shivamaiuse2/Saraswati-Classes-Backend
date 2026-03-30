const prisma = require('../config/prisma');
const logger = require('../utils/logger');

// Create Chapter
const createChapter = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, youtubeLink, formLink } = req.body;

    if (!title || !description || !youtubeLink) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and youtubeLink are required'
      });
    }

    // Simple URL validation
    // const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    // if (!urlRegex.test(youtubeLink)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Invalid youtubeLink format'
    //   });
    // }

    // if (formLink && !urlRegex.test(formLink)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Invalid formLink format'
    //   });
    // }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const chapter = await prisma.chapter.create({
      data: {
        courseId,
        title,
        description,
        youtubeLink,
        formLink: formLink || null
      }
    });

    logger.info(`Chapter created for course ${courseId}: ${title}`);

    res.status(201).json({
      success: true,
      message: 'Chapter created successfully',
      data: chapter
    });
  } catch (error) {
    logger.error('Create chapter error:', error);
    next(error);
  }
};

// Get All Chapters of a Course
const getCourseChapters = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const chapters = await prisma.chapter.findMany({
      where: { courseId },
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: chapters
    });
  } catch (error) {
    logger.error('Get course chapters error:', error);
    next(error);
  }
};

// Get Single Chapter
const getChapterById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: { course: true }
    });

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    res.status(200).json({
      success: true,
      data: chapter
    });
  } catch (error) {
    logger.error('Get chapter by ID error:', error);
    next(error);
  }
};

// Update Chapter
const updateChapter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, youtubeLink, formLink } = req.body;

    const existingChapter = await prisma.chapter.findUnique({
      where: { id }
    });

    if (!existingChapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    // const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    // if (youtubeLink && !urlRegex.test(youtubeLink)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Invalid youtubeLink format'
    //   });
    // }

    // if (formLink && !urlRegex.test(formLink)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Invalid formLink format'
    //   });
    // }

    const chapter = await prisma.chapter.update({
      where: { id },
      data: {
        title: title || existingChapter.title,
        description: description || existingChapter.description,
        youtubeLink: youtubeLink !== undefined ? youtubeLink : existingChapter.youtubeLink,
        formLink: formLink !== undefined ? formLink : existingChapter.formLink
      }
    });

    logger.info(`Chapter updated: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Chapter updated successfully',
      data: chapter
    });
  } catch (error) {
    logger.error('Update chapter error:', error);
    next(error);
  }
};

// Delete Chapter
const deleteChapter = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingChapter = await prisma.chapter.findUnique({
      where: { id }
    });

    if (!existingChapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    await prisma.chapter.delete({
      where: { id }
    });

    logger.info(`Chapter deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Chapter deleted successfully'
    });
  } catch (error) {
    logger.error('Delete chapter error:', error);
    next(error);
  }
};

module.exports = {
  createChapter,
  getCourseChapters,
  getChapterById,
  updateChapter,
  deleteChapter
};
