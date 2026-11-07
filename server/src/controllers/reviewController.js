/**
 * @fileoverview Review controller: handles CRUD operations for destination reviews.
 * Rating statistics are recalculated automatically via Review model post-hooks
 * whenever a review is created or deleted.
 * @module controllers/reviewController
 */

// External dependencies
import mongoose from 'mongoose';
import Review from '../models/Review.js';

/**
 * @desc    Get all reviews for a specific destination with pagination
 * @route   GET /api/reviews/destination/:destinationId
 * @access  Public
 *
 * Query params: page (default 1), limit (default 10, max 50)
 */
export const getDestinationReviews = async (req, res) => {
  try {
    const { destinationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(destinationId)) {
      return res.status(400).json({
        success: false,
        message: `Invalid destination ID format '${destinationId}'.`,
      });
    }

    // Parse and clamp pagination parameters
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    // Fetch total count and paginated results in parallel
    const [total, reviews] = await Promise.all([
      Review.countDocuments({ destination: destinationId }),
      Review.find({ destination: destinationId })
        .populate('user', 'name avatar')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      pagination: {
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: reviews,
    });
  } catch (error) {
    console.error('Error fetching destination reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve reviews.',
      error: error.message,
    });
  }
};

/**
 * @desc    Add a review for a destination
 * @route   POST /api/reviews/destination/:destinationId
 * @access  Protected (user, creator, admin)
 */
export const addReview = async (req, res) => {
  try {
    const { destinationId } = req.params;
    const { rating, comment, visitDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(destinationId)) {
      return res.status(400).json({
        success: false,
        message: `Invalid destination ID format '${destinationId}'.`,
      });
    }

    // Validate rating value
    const parsedRating = Number(rating);
    if (!rating || isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating is required and must be a number between 1 and 5.',
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Review comment is required.',
      });
    }

    // Reject duplicate reviews before hitting the unique index
    const existingReview = await Review.findOne({
      destination: destinationId,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this destination.',
      });
    }

    // Create review and populate user fields for the response
    const review = await Review.create({
      user: req.user._id,
      destination: destinationId,
      rating: parsedRating,
      comment: comment.trim(),
      visitDate: visitDate || '',
    });

    await review.populate('user', 'name avatar');

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: review,
    });
  } catch (error) {
    console.error('Error adding review:', error);

    // Handle duplicate key error from the compound unique index
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this destination.',
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: messages,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to submit review.',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Protected (review owner or admin)
 */
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid review ID format '${id}'.`,
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    // Only the review owner or an admin may delete
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this review.',
      });
    }

    // findByIdAndDelete triggers the post('findOneAndDelete') hook to recalculate stats
    await Review.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully.',
      deletedId: id,
    });
  } catch (error) {
    console.error(`Error deleting review '${req.params.id}':`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete review.',
      error: error.message,
    });
  }
};

export default { getDestinationReviews, addReview, deleteReview };
