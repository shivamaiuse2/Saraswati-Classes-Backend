const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Create custom format for logs
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'saraswati-classes-api' },
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    
    // Write all logs with level `info` and below to `combined.log`
    new DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level} [${info.service}] ${info.message}`
      )
    )
  }));
}

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
    
    // Log slow requests (over 500ms)
    if (duration > 500) {
      logger.warn('Slow request detected', logData);
    } else {
      logger.http('Request completed', logData);
    }
  });
  
  next();
};

// Error monitoring middleware
const errorMonitor = (err, req, res, next) => {
  const errorLog = {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  };
  
  logger.error('Unhandled error occurred', errorLog);
  
  next(err);
};

// Audit logging middleware
const auditLogger = (action, userId, details = {}) => {
  const auditLog = {
    action,
    userId,
    details,
    timestamp: new Date().toISOString(),
    ip: 'unknown' // Will be set in middleware
  };
  
  logger.info('Audit event', auditLog);
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const logData = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    userId: req.user ? req.user.userId : null
  };
  
  logger.verbose('Request received', logData);
  next();
};

// Custom logger for specific purposes
const customLogger = {
  // Database logging
  db: {
    query: (query, params, duration) => {
      logger.debug('DB Query Executed', {
        query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
        params: params ? params.length : 0,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    },
    error: (error, query) => {
      logger.error('DB Query Error', {
        error: error.message,
        query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
        timestamp: new Date().toISOString()
      });
    }
  },
  
  // Security logging
  security: {
    loginAttempt: (email, success, ip) => {
      logger.info('Login attempt', {
        email,
        success,
        ip,
        timestamp: new Date().toISOString()
      });
    },
    unauthorizedAccess: (url, userId, ip) => {
      logger.warn('Unauthorized access attempt', {
        url,
        userId,
        ip,
        timestamp: new Date().toISOString()
      });
    },
    rateLimit: (ip, endpoint) => {
      logger.warn('Rate limit exceeded', {
        ip,
        endpoint,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  // Business logic logging
  business: {
    enrollment: (action, studentId, courseId, status) => {
      logger.info('Enrollment action', {
        action,
        studentId,
        courseId,
        status,
        timestamp: new Date().toISOString()
      });
    },
    payment: (action, amount, studentId, method) => {
      logger.info('Payment action', {
        action,
        amount,
        studentId,
        method,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// Export monitoring functions
module.exports = {
  logger,
  performanceMonitor,
  errorMonitor,
  auditLogger,
  requestLogger,
  customLogger
};