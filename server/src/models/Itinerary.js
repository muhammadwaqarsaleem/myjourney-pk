/**
 * @fileoverview Itinerary model definition and schema configuration for MongoDB.
 * Stores AI-generated and user-saved travel itineraries for destinations across Pakistan.
 * @module models/Itinerary
 */

import mongoose from 'mongoose';

/**
 * Sub-schema for individual daily plans within a multi-day itinerary.
 */
const dailyPlanItemSchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: [true, 'Day number is required'],
      min: [1, 'Day must be at least 1'],
    },
    title: {
      type: String,
      required: [true, 'Daily plan title is required'],
      trim: true,
    },
    morning: {
      type: String,
      trim: true,
      default: '',
    },
    afternoon: {
      type: String,
      trim: true,
      default: '',
    },
    evening: {
      type: String,
      trim: true,
      default: '',
    },
    recommendedFood: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { _id: true }
);

/**
 * Main Itinerary Schema definition.
 */
const itinerarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Destination reference is required'],
      index: true,
    },
    tripTitle: {
      type: String,
      required: [true, 'Trip title is required'],
      trim: true,
      maxlength: [200, 'Trip title cannot exceed 200 characters'],
    },
    days: {
      type: Number,
      required: [true, 'Number of days is required'],
      min: [1, 'Trip duration must be at least 1 day'],
      max: [14, 'Trip duration cannot exceed 14 days'],
    },
    budget: {
      type: String,
      required: [true, 'Budget tier is required'],
      enum: {
        values: ['budget', 'moderate', 'luxury'],
        message: '{VALUE} is not a valid budget tier. Allowed: budget, moderate, luxury',
      },
      lowercase: true,
      trim: true,
    },
    estimatedBudgetPKR: {
      type: Number,
      default: 0,
      min: [0, 'Estimated budget cannot be negative'],
    },
    travelersCount: {
      type: Number,
      default: 1,
      min: [1, 'Travelers count must be at least 1'],
    },
    interests: [
      {
        type: String,
        trim: true,
      },
    ],
    dailyPlan: {
      type: [dailyPlanItemSchema],
      validate: {
        validator: (val) => Array.isArray(val) && val.length > 0,
        message: 'Itinerary must contain at least one daily plan item.',
      },
    },
    travelTips: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly fetch user itineraries sorted by recency
itinerarySchema.index({ user: 1, createdAt: -1 });

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

export default Itinerary;

