/**
 * @fileoverview Authentication routes mapping HTTP endpoints to authController actions.
 * @module routes/authRoutes
 */

import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Public Authentication Routes
 */
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

/**
 * Protected Routes (Requires valid JWT)
 */
router.get('/me', protect, getMe);

export default router;
