/**
 * @fileoverview Review routes: public read and protected write/delete endpoints.
 * @module routes/reviewRoutes
 */

// External dependencies and controllers
import { Router } from 'express';
import { getDestinationReviews, addReview, deleteReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// GET  /api/reviews/destination/:destinationId  - fetch paginated reviews for a destination
// POST /api/reviews/destination/:destinationId  - submit a new review (authenticated)
router
  .route('/destination/:destinationId')
  .get(getDestinationReviews)
  .post(protect, addReview);

// DELETE /api/reviews/:id - delete a review (owner or admin)
router.route('/:id').delete(protect, deleteReview);

export default router;
