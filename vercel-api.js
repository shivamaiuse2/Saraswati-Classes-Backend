const express = require('express');

const app = express();

// Basic middleware
app.use(express.json());

// Simple health check - no database
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Vercel backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  });
});

// Catch-all route
app.get('*', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Saraswati Classes Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      dbHealth: '/health/db',
      api: '/api/v1/*'
    }
  });
});

module.exports = app;
