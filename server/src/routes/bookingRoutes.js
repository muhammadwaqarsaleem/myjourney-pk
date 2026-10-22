/**
 * @fileoverview Route definitions for Hotel Booking inquiries and reservations.
 * Manages user booking submissions, user reservation histories, and administrative status transitions.
 * @module routes/bookingRoutes
 */

import express from 'express';
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/bookings/my-bookings
 * @desc    Fetch bookings submitted by the authenticated user
 * @access  Protected (user)
 */
router
  .route('/my-bookings')
  .get(protect, getMyBookings);

/**
 * @route   POST /api/bookings
 * @desc    Submit a new hotel reservation inquiry
 * @access  Protected (user)
 *
 * @route   GET /api/bookings
 * @desc    View all hotel bookings across the platform with optional filters & pagination
 * @access  Protected (admin only)
 */
router
  .route('/')
  .post(protect, createBooking)
  .get(protect, authorize('admin'), getAllBookings);

/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Update status of a specific booking (e.g. pending -> confirmed, cancelled, completed)
 * @access  Protected (admin only)
 */
router
  .route('/:id/status')
  .patch(protect, authorize('admin'), updateBookingStatus);

export default router;
