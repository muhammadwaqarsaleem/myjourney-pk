/**
 * @fileoverview Application entry point for the myjourney.pk backend server.
 * Bootstraps the Express application, configures multi-layered security/parsing middlewares,
 * establishes database connectivity, mounts rate-limiting buckets, and binds central routing.
 * 
 * ============================================================================
 * ACADEMIC DEFENSE & ARCHITECTURAL HIGHLIGHTS
 * ============================================================================
 * 1. NoSQL Injection Defense (Express 5 Compatible):
 *    - In MongoDB/Mongoose, unsanitized user JSON payloads can contain MongoDB query
 *      operators (such as `$gt`, `$ne`, `$regex`, or `.` path notation).
 *    - For instance, sending `{ "email": { "$ne": null } }` to an authentication endpoint
 *      could bypass credential verification without knowing the user's password.
 *    - In Express 5, `req.query` is defined with a getter-only property descriptor on
 *      `IncomingMessage.prototype`. The default `express-mongo-sanitize()` middleware
 *      attempts `req.query = target`, which triggers `TypeError: Cannot set property query
 *      of #<IncomingMessage> which has only a getter`.
 *    - To maintain full NoSQL injection defense in Express 5, our middleware executes
 *      `mongoSanitize.sanitize()` directly on `req.body`, `req.params`, and `req.query`,
 *      mutating keys in-place and stripping prohibited `$` and `.` operators without
 *      reassigning the getter.
 * 
 * 2. HTTP Header Hardening (Helmet):
 *    - Mounts Helmet middleware to inject essential security headers:
 *      * `X-Content-Type-Options: nosniff` (prevents MIME-type confusion attacks).
 *      * `X-Frame-Options: SAMEORIGIN` (mitigates clickjacking / UI redressing).
 *      * `Strict-Transport-Security` (enforces HSTS HTTPS communication).
 *      * `Referrer-Policy: no-referrer-when-downgrade` (prevents path leakage).
 * 
 * 3. Rate Limiting Buckets (express-rate-limit):
 *    - Implements distinct token bucket rate limiters tailored to resource sensitivity:
 *      * `/api/auth/*`: 20 requests / 15 minutes (mitigates brute-force dictionary attacks).
 *      * `/api/ai/*` & `/api/itinerary/*`: 30 requests / 15 minutes (defends GenAI quota drain).
 *      * `/api/contact`: 10 inquiries / 15 minutes (mitigates automated SMTP mail spamming).
 * 
 * 4. Same-Origin Policy (SOP) & CORS Whitelisting:
 *    - Cross-Origin Resource Sharing is strictly constrained to `process.env.CLIENT_URL`.
 *    - Wildcard (`*`) origin is prohibited when `credentials: true` is enabled, ensuring
 *      that third-party domains cannot read credentialed responses or inspect session state.
 * 
 * @module index
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import itineraryRoutes from './routes/itineraryRoutes.js';
import aiChatRoutes from './routes/aiChatRoutes.js';

// Load environment variables early in process bootstrap
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ==========================================
// 1. Security & Header Hardening Middleware
// ==========================================

/**
 * Helmet secures Express apps by setting various HTTP response headers.
 * Configured with cross-origin resource sharing allowances for client assets.
 */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

/**
 * CORS Configuration:
 * - `origin`: Strictly constrained to client origin (rejects wildcards when credentials are true).
 * - `credentials: true`: Authorizes browser transmission of HTTP-only JWT cookies.
 */
const corsOptions = {
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// ==========================================
// 2. Request Parsing & NoSQL Sanitization
// ==========================================

/**
 * Built-in JSON body parser with 10mb limit for base64 / text payloads.
 */
app.use(express.json({ limit: '10mb' }));

/**
 * URL-encoded body parser supporting rich nested structures.
 */
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Cookie parsing middleware populates req.cookies from HTTP request headers.
 */
app.use(cookieParser());

/**
 * NoSQL Injection Defense (Express 5 Compatible):
 * Express 5 defines `req.query` as a getter-only property. We use mongoSanitize.sanitize
 * to mutate `req.body`, `req.params`, and `req.query` in-place, neutralizing prohibited
 * '$' and '.' operators without reassigning getter properties.
 */
app.use((req, res, next) => {
  ['body', 'params', 'query'].forEach((key) => {
    if (req[key] && typeof req[key] === 'object') {
      if (mongoSanitize.has(req[key])) {
        console.warn(`🛡️ [NoSQL Sanitize] Sanitized potential injection in req.${key} from ${req.ip}`);
      }
      mongoSanitize.sanitize(req[key]);
    }
  });
  next();
});

// ==========================================
// 3. Rate Limiting Defenses (DDoS & Brute Force)
// ==========================================

/**
 * Sensitive Authentication Limiter:
 * Caps registration and login attempts to 20 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

/**
 * GenAI Service Limiter:
 * Mitigates Gemini 3.8 Flash quota exhaustion and API budget depletion.
 */
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI Travel Assistant rate limit reached. Please wait a few moments before sending another prompt.',
  },
});

/**
 * Contact Dispatch Limiter:
 * Mitigates SMTP mail bombing and automated spam flooding.
 */
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many inquiries submitted from this IP. Please wait 15 minutes before reaching out again.',
  },
});

/**
 * Global API Limiter:
 * Protects general read/write routes against aggressive scraping or volumetric DoS.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', globalLimiter);

// ==========================================
// 4. Primary Route Handlers
// ==========================================

/**
 * Health Check Endpoint
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'active',
    message: 'myjourney.pk backend running smoothly',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Authentication and User Routes (Rate Limited)
 */
app.use('/api/auth', authLimiter, authRoutes);

/**
 * AI Concierge & Generative Itinerary Routes (Rate Limited)
 */
app.use('/api/ai', aiLimiter, aiChatRoutes);
app.use('/api/itinerary', aiLimiter, itineraryRoutes);

/**
 * Contact Us Inquiry Routes (Rate Limited)
 */
app.use('/api/contact', contactLimiter, contactRoutes);

/**
 * Core Resource Directory Routes
 */
app.use('/api/destinations', destinationRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// ==========================================
// 5. 404 & Centralized Error Handling
// ==========================================

/**
 * Catch-all 404 handler for unmatched routes.
 */
app.use((req, res, next) => {
  const error = new Error(`Cannot ${req.method} ${req.originalUrl} - Route Not Found`);
  res.status(404);
  next(error);
});

/**
 * Centralized Error-Handling Middleware.
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
// 6. Bootstrap Server & Database Connection
// ==========================================

connectDB();

const server = app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 myjourney.pk server listening on port: ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS allowed origin: ${CLIENT_URL}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log('🛡️ Security: Helmet, Express 5 NoSQL Sanitizer, Rate Limiters Active');
  console.log('====================================================');
});

export default app;
