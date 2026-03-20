const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const logger = require('../utils/logger');

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: (req, res) => {
    // Different limits based on user role
    if (req.userDetails && req.userDetails.role === 'ADMIN') {
      return parseInt(process.env.RATE_LIMIT_ADMIN_MAX) || 1000;
    } else if (req.userDetails && req.userDetails.role === 'STUDENT') {
      return parseInt(process.env.RATE_LIMIT_STUDENT_MAX) || 200;
    } else {
      // Anonymous users
      return parseInt(process.env.RATE_LIMIT_ANONYMOUS_MAX) || 5000;
    }
  },
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    // Skip rate limiting for health checks and certain endpoints
    return req.path === '/health' || 
           req.path.includes('/api-docs') ||
           req.path.includes('/swagger');
  }
});

// Slow down configuration (for brute force protection)
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // Begin slowing down after 100 requests
  delayMs: 500, // Delay by 500ms
  maxDelayMs: 5000 // Cap the delay at 5 seconds
});

// MongoDB sanitization middleware
const sanitizeMongo = mongoSanitize({
  allowDots: true,
  replaceWith: '_'
});

// XSS protection middleware
const xssProtection = (req, res, next) => {
  // Sanitize query parameters
  if (req.query) {
    for (let key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key]);
      }
    }
  }
  
  // Sanitize body parameters
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  
  next();
};

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com', 'cdn.jsdelivr.net'],
      fontSrc: ["'self'", 'fonts.gstatic.com', 'cdn.jsdelivr.net'],
      imgSrc: ["'self'", 'data:', 'blob:', '*', 'https:'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https:'],
      connectSrc: ["'self'", 'https:'],
      frameAncestors: ["'none'"], // Prevent clickjacking
    },
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  hidePoweredBy: true, // Hide X-Powered-By header
  noSniff: true, // Prevent MIME type sniffing
  xssFilter: true, // Enable XSS filter
  frameguard: {
    action: 'deny' // Prevent framing
  }
});

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'https://saraswati-classes-frontend.vercel.app',
  'http://localhost:5173', // Frontend dev server
  'http://localhost:3000', // Backend server
  'http://localhost:3001', // Alternative frontend
  'http://localhost:8080', // Admin frontend
  'https://saraswaticlasses.com',
  'https://www.saraswaticlasses.com',
  '*'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes('*') || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    logger.warn(`CORS blocked: ${origin}`);
    return callback(new Error(msg), false);
  },
  credentials: true,
  optionsSuccessStatus: 200
};

const corsMiddleware = cors(corsOptions);

// HPP (HTTP Parameter Pollution) protection
const hppProtection = hpp({
  whitelist: [] // Allow all parameters, or specify specific ones
});

// Security middleware function
const securityMiddleware = (app) => {
  // Apply security headers
  app.use(securityHeaders);
  
  // Apply CORS
  app.use(corsMiddleware);
  
  // Apply rate limiting
  app.use(limiter);
  
  // Apply speed limiting
  app.use(speedLimiter);
  
  // Apply MongoDB sanitization
  app.use(sanitizeMongo);
  
  // Apply XSS protection
  app.use(xssProtection);
  
  // Apply HPP protection
  app.use(hppProtection);
  
  // Log security events
  app.use((req, res, next) => {
    logger.info(`Security middleware applied: ${req.method} ${req.path} from ${req.ip}`);
    next();
  });
};

// Middleware for specific endpoints that need enhanced security
const enhancedSecurity = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again later.'
  },
  skipSuccessfulRequests: true // Only count failed requests
});

module.exports = {
  securityMiddleware,
  enhancedSecurity,
  corsMiddleware,
  rateLimit,
  slowDown,
  mongoSanitize,
  xssProtection,
  securityHeaders,
  hppProtection
};