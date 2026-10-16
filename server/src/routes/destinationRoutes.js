/**
 * @fileoverview Route definitions for Destination and Regional Cuisine discovery.
 * Manages public discovery queries alongside role-protected administrative endpoints.
 * @module routes/destinationRoutes
 */

import express from 'express';
import {
  getDestinations,
  getDestinationBySlug,
  createDestination,
  updateDestination,
  deleteDestination,
} from '../controllers/destinationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/destinations
 * @desc    Fetch destinations with filtering (province, search, category) & pagination
 * @access  Public
 *
 * @route   POST /api/destinations
 * @desc    Create a new destination with sites and famous foods
 * @access  Protected (admin, creator)
 */
router
  .route('/')
  .get(getDestinations)
  .post(protect, authorize('admin', 'creator'), createDestination);

/**
 * @route   PUT /api/destinations/:id
 * @desc    Update destination details, sites, or culinary lists
 * @access  Protected (admin, creator)
 *
 * @route   DELETE /api/destinations/:id
 * @desc    Delete a destination
 * @access  Protected (admin only)
 */
router
  .route('/:id')
  .put(protect, authorize('admin', 'creator'), updateDestination)
  .delete(protect, authorize('admin'), deleteDestination);

/**
 * @route   GET /api/destinations/:slug
 * @desc    Fetch destination details by slug or MongoDB ObjectId
 * @access  Public
 */
router
  .route('/:slug')
  .get(getDestinationBySlug);

export default router;
