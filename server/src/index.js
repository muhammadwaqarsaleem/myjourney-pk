/**
 * @fileoverview Application entry point for the myjourney.pk backend server.
 * Bootstraps the Express application, configures security/parsing middlewares,
 * establishes database connectivity, and binds central routing and error handling.
 * @module index
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import blogRoutes from './routes/blogRoutes.js';

// Load environment variables from .env file into process.env early in bootstrap lifecycle
dotenv.config();

/**
 * Express application instance.
 * @type {import('express').Express}
 */
const app = express();

/**
 * Server listener port. Defaults to 5000 if not specified in environment.
 * @constant {number|string}
 */
const PORT = process.env.PORT || 5000;

/**
 * Allowed Client URL for Cross-Origin Resource Sharing.
 * @constant {string}
 */
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ==========================================
// Middleware Configuration
// ==========================================

/**
 * CORS Configuration:
 * - `origin`: Specifies allowed domain to prevent unauthorized external access.
 * - `credentials: true`: Necessary for exchanging HTTP-only cookies and authorization headers.
 */
const corsOptions = {
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

/**
 * Built-in body parser for incoming JSON payloads.
 * Parses Content-Type: application/json into req.body.
 */
app.use(express.json());

/**
 * Built-in body parser for URL-encoded form submissions.
 * `extended: true` allows parsing rich objects and arrays using the 'qs' library.
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Cookie parsing middleware.
 * Parses Cookie header and populates `req.cookies` with an object keyed by cookie names.
 */
app.use(cookieParser());

// ==========================================
// Route Handlers
// ==========================================

/**
 * Health Check Endpoint.
 * Used by monitoring tools, load balancers, or frontend pingers to check service availability.
 *
 * @name GET/api/health
 * @function
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {void}
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'active',
    message: 'myjourney.pk backend running smoothly',
  });
});

/**
 * Authentication and User Routes
 */
app.use('/api/auth', authRoutes);

/**
 * Destinations and Regional Cuisine Routes
 */
app.use('/api/destinations', destinationRoutes);

/**
 * Community Travelogues and Blog Routes
 */
app.use('/api/blogs', blogRoutes);

// ==========================================
// 404 & Centralized Error Handling
// ==========================================

/**
 * Catch-all 404 handler for requests that did not match any registered routes.
 *
 * @function
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware callback.
 */
app.use((req, res, next) => {
  const error = new Error(`Cannot ${req.method} ${req.originalUrl} - Route Not Found`);
  res.status(404);
  next(error);
});

/**
 * Central Error-Handling Middleware.
 * Intercepts all unhandled errors passed through next(err) or thrown in async handlers.
 *
 * @function
 * @param {Error & { statusCode?: number }} err - Error instance.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware callback.
 */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 || !res.statusCode ? (err.statusCode || 500) : res.statusCode;

  console.error(`💥 [Error] ${req.method} ${req.originalUrl}:`, err.message);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ==========================================
// Bootstrap Server & Database
// ==========================================

// Initialize MongoDB connection
connectDB();

/**
 * Start Express HTTP server listener.
 */
const server = app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 myjourney.pk server listening on port: ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS allowed origin: ${CLIENT_URL}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log('====================================================');
});

export default app;
