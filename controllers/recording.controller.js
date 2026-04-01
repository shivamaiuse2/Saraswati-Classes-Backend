const prisma = require('../config/prisma');
const logger = require('../utils/logger');

// Helper to extract YouTube ID and generate URLs
function getYoutubeDetails(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  
  if (!videoId) return null;
  
  return {
    videoId,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/0.jpg`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`
  };
}

// Create Recording
const createRecording = async (req, res, next) => {
  try {
    const { title, description, youtubeLink, courseId } = req.body;

    if (!title || !description || !youtubeLink) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and youtubeLink are required'
      });
    }

    const youtubeDetails = getYoutubeDetails(youtubeLink);
    if (!youtubeDetails) {
      return res.status(400).json({
        success: false,
        message: 'Invalid YouTube URL'
      });
    }

    // Check if course exists if provided
    if (courseId) {
      const courseExists = await prisma.course.findUnique({
        where: { id: courseId }
      });
      if (!courseExists) {
        return res.status(404).json({
          success: false,
          message: 'Specified course not found'
        });
      }
    }

    const recording = await prisma.recording.create({
      data: {
        title,
        description,
        youtubeLink,
        courseId: courseId || null
      },
      include: {
        course: {
          select: {
            id: true,
            board: true,
            standard: true
          }
        }
      }
    });

    const response = {
      ...recording,
      ...getYoutubeDetails(recording.youtubeLink)
    };

    logger.info(`Recording created: ${title}`);

    res.status(201).json({
      success: true,
      message: 'Recording created successfully',
      data: response
    });
  } catch (error) {
    logger.error('Create recording error:', error);
    next(error);
  }
};

// Get All Recordings
const getAllRecordings = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    
    const where = {};
    if (courseId) {
      where.courseId = courseId;
    }

    const recordings = await prisma.recording.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            board: true,
            standard: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const transformedRecordings = recordings.map(recording => ({
      ...recording,
      ...getYoutubeDetails(recording.youtubeLink)
    }));

    res.status(200).json({
      success: true,
      data: transformedRecordings
    });
  } catch (error) {
    logger.error('Get recordings error:', error);
    next(error);
  }
};

// Get Single Recording
const getRecordingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recording = await prisma.recording.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            board: true,
            standard: true
          }
        }
      }
    });

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found'
      });
    }

    const response = {
      ...recording,
      ...getYoutubeDetails(recording.youtubeLink)
    };

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    logger.error('Get recording by ID error:', error);
    next(error);
  }
};

// Update Recording
const updateRecording = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, youtubeLink, courseId } = req.body;

    const existingRecording = await prisma.recording.findUnique({
      where: { id }
    });

    if (!existingRecording) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found'
      });
    }

    if (youtubeLink) {
      const youtubeDetails = getYoutubeDetails(youtubeLink);
      if (!youtubeDetails) {
        return res.status(400).json({
          success: false,
          message: 'Invalid YouTube URL'
        });
      }
    }

    if (courseId) {
      const courseExists = await prisma.course.findUnique({
        where: { id: courseId }
      });
      if (!courseExists) {
        return res.status(404).json({
          success: false,
          message: 'Specified course not found'
        });
      }
    }

    const recording = await prisma.recording.update({
      where: { id },
      data: {
        title: title || existingRecording.title,
        description: description || existingRecording.description,
        youtubeLink: youtubeLink !== undefined ? youtubeLink : existingRecording.youtubeLink,
        courseId: courseId !== undefined ? courseId : existingRecording.courseId
      },
      include: {
        course: {
          select: {
            id: true,
            board: true,
            standard: true
          }
        }
      }
    });

    const response = {
      ...recording,
      ...getYoutubeDetails(recording.youtubeLink)
    };

    logger.info(`Recording updated: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Recording updated successfully',
      data: response
    });
  } catch (error) {
    logger.error('Update recording error:', error);
    next(error);
  }
};

// Delete Recording
const deleteRecording = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingRecording = await prisma.recording.findUnique({
      where: { id }
    });

    if (!existingRecording) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found'
      });
    }

    await prisma.recording.delete({
      where: { id }
    });

    logger.info(`Recording deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Recording deleted successfully'
    });
  } catch (error) {
    logger.error('Delete recording error:', error);
    next(error);
  }
};

module.exports = {
  createRecording,
  getAllRecordings,
  getRecordingById,
  updateRecording,
  deleteRecording
};
