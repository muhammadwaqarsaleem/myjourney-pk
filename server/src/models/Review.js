/**
 * @fileoverview Review model for destination ratings and written feedback.
 * Provides a static aggregation method that recalculates and persists
 * averageRating and reviewCount on the parent Destination document
 * whenever a review is created or removed.
 * @module models/Review
 */

// External dependencies
import mongoose from 'mongoose';
import Destination from './Destination.js';

// Schema definition
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Review must belong to a destination'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    visitDate: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one review per user per destination
reviewSchema.index({ destination: 1, user: 1 }, { unique: true });

/**
 * Recalculates and persists averageRating and reviewCount on the
 * related Destination document using an aggregation pipeline.
 *
 * @static
 * @param {mongoose.Types.ObjectId} destinationId - Target destination to recalculate stats for.
 * @returns {Promise<void>}
 */
reviewSchema.statics.getAverageRating = async function (destinationId) {
  try {
    // Aggregate rating statistics for the given destination
    const stats = await this.aggregate([
      { $match: { destination: destinationId } },
      {
        $group: {
          _id: '$destination',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Destination.findByIdAndUpdate(destinationId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        reviewCount: stats[0].reviewCount,
      });
    } else {
      // No reviews remain; reset destination stats to defaults
      await Destination.findByIdAndUpdate(destinationId, {
        averageRating: 0,
        reviewCount: 0,
      });
    }
  } catch (error) {
    console.error('Error recalculating destination average rating:', error);
  }
};

// Post-save hook: recalculate destination stats after a review is created or updated
reviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.destination);
});

// Post-findOneAndDelete hook: recalculate stats after findByIdAndDelete / findOneAndDelete
reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) {
    doc.constructor.getAverageRating(doc.destination);
  }
});

// Post-deleteOne hook (document middleware): handles deleteOne() called on a document instance
reviewSchema.post('deleteOne', { document: true, query: false }, function () {
  this.constructor.getAverageRating(this.destination);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
