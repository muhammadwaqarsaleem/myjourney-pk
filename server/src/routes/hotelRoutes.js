/**
 * @fileoverview Route definitions for Hotel Directory operations.
 * Exposes public discovery endpoints alongside role-protected administrative management.
 * @module routes/hotelRoutes
 */

import express from 'express';
import {
  getHotels,
  getHotelBySlug,
  createHotel,
  updateHotel,
  deleteHotel,
} from '../controllers/hotelController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/hotels
 * @desc    Fetch hotels with filtering (destination, price range, featured) and pagination
 * @access  Public
 *
 * @route   POST /api/hotels
 * @desc    Create a new hotel property
 * @access  Protected (admin only)
 */
router
  .route('/')
  .get(getHotels)
  .post(protect, authorize('admin'), createHotel);

/**
 * @route   PUT /api/hotels/:id
 * @desc    Update hotel property details, room types, or amenities
 * @access  Protected (admin only)
 *
 * @route   DELETE /api/hotels/:id
 * @desc    Delete a hotel property
 * @access  Protected (admin only)
 */
router
  .route('/:id')
  .put(protect, authorize('admin'), updateHotel)
  .delete(protect, authorize('admin'), deleteHotel);

/**
 * @route   GET /api/hotels/:slug
 * @desc    Fetch hotel details by slug or MongoDB ObjectId with destination details
 * @access  Public
 */
router
  .route('/:slug')
  .get(getHotelBySlug);

export default router;
