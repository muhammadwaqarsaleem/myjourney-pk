/**
 * @fileoverview Contact routes: public form submission and admin-only message retrieval.
 * @module routes/contactRoutes
 */

// External dependencies and controllers
import { Router } from 'express';
import { submitContactForm, getAllMessages } from '../controllers/contactController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/contact - submit a contact form enquiry (public)
// GET  /api/contact - retrieve all contact messages (admin only)
router
  .route('/')
  .post(submitContactForm)
  .get(protect, authorize('admin'), getAllMessages);

export default router;
