/**
 * @fileoverview Booking model definition and schema configuration for MongoDB.
 * Records hotel reservation requests and bookings made by authenticated users,
 * tracking room selection, guest composition, stay duration, and lifecycle status.
 * @module models/Booking
 */

import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required for a booking'],
      index: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Hotel reference is required for a booking'],
      index: true,
    },
    roomType: {
      type: String,
      required: [true, 'Room type selection is required'],
      trim: true,
    },
    checkInDate: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Check-out date is required'],
      validate: {
        validator: function (value) {
          // Check-out date must be after check-in date
          return !this.checkInDate || value > this.checkInDate;
        },
        message: 'Check-out date must be strictly after the check-in date',
      },
    },
    guests: {
      adults: {
        type: Number,
        default: 1,
        min: [1, 'At least 1 adult guest is required'],
      },
      children: {
        type: Number,
        default: 0,
        min: [0, 'Children count cannot be negative'],
      },
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'cancelled', 'completed'],
        message: '{VALUE} is not a valid booking status. Allowed: pending, confirmed, cancelled, completed',
      },
      default: 'pending',
      index: true,
    },
    specialRequests: {
      type: String,
      trim: true,
      maxlength: [500, 'Special requests cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user bookings sorted by date
bookingSchema.index({ user: 1, createdAt: -1 });

// Index for administrative lookups by status and recency
bookingSchema.index({ status: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
