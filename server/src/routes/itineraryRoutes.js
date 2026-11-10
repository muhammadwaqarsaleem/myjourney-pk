/**
 * @fileoverview Itinerary routes for AI-driven itinerary generation,
 * persistence, user itinerary retrieval, and plan management.
 * @module routes/itineraryRoutes
 */

import { Router } from 'express';
import {
  generateItinerary,
  saveItinerary,
  getMyItineraries,
  getItineraryById,
  deleteItinerary,
} from '../controllers/itineraryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/itinerary/generate - Public endpoint to generate AI itineraries
router.route('/generate').post(generateItinerary);

// POST /api/itinerary/save - Authenticated endpoint to save an itinerary
router.route('/save').post(protect, saveItinerary);

// GET  /api/itinerary/my-plans - Authenticated endpoint to fetch user's saved itineraries
router.route('/my-plans').get(protect, getMyItineraries);

// GET & DELETE /api/itinerary/:id - Retrieve or delete a specific saved itinerary
router.route('/:id').get(protect, getItineraryById).delete(protect, deleteItinerary);

export default router;

