const axios = require('axios');
const prisma = require('../config/prisma');
const logger = require('../utils/logger');

const youtubeOembedCache = new Map();

// Helper to extract YouTube ID and generate URLs
async function getYoutubeDetails(url) {
  if (!url) return null;
  
  const videoRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const videoMatch = url.match(videoRegExp);
  const videoId = (videoMatch && videoMatch[2].length === 11) ? videoMatch[2] : null;

  const playlistRegExp = /[?&]list=([^#\&\?]+)/;
  const playlistMatch = url.match(playlistRegExp);
  const playlistId = playlistMatch ? playlistMatch[1] : null;

  if (!videoId && !playlistId) return null;

  if (videoId && !playlistId) {
    return {
      videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/0.jpg`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`
    };
  }

  const isOnlyPlaylist = playlistId && !videoId;
  let thumbnailUrl = '';
  
  if (isOnlyPlaylist) {
    if (youtubeOembedCache.has(playlistId)) {
      thumbnailUrl = youtubeOembedCache.get(playlistId);
    } else {
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const res = await axios.get(oembedUrl);
        if (res.data && res.data.thumbnail_url) {
          thumbnailUrl = res.data.thumbnail_url;
          youtubeOembedCache.set(playlistId, thumbnailUrl);
        }
      } catch (e) {
        logger.error('Error fetching youtube oembed:', e.message);
      }
    }
  } else {
    thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;
  }

  return {
    videoId: videoId || undefined,
    playlistId: playlistId || undefined,
    thumbnailUrl: thumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : ''),
    embedUrl: videoId 
      ? `https://www.youtube.com/embed/${videoId}?list=${playlistId}`
      : `https://www.youtube.com/embed/videoseries?list=${playlistId}`
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

    const youtubeDetails = await getYoutubeDetails(youtubeLink);
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
      ...youtubeDetails
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

    const transformedRecordings = await Promise.all(recordings.map(async recording => {
      const details = await getYoutubeDetails(recording.youtubeLink);
      return {
        ...recording,
        ...details
      };
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

    const youtubeDetails = await getYoutubeDetails(recording.youtubeLink);
    const response = {
      ...recording,
      ...youtubeDetails
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
      const youtubeDetails = await getYoutubeDetails(youtubeLink);
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

    const responseDetails = await getYoutubeDetails(recording.youtubeLink);
    const response = {
      ...recording,
      ...responseDetails
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
