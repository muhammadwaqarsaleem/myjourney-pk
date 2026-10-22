/**
 * @fileoverview Hotel model definition and schema configuration for MongoDB.
 * Represents hospitality properties associated with destinations across Pakistan,
 * including amenities, tiered room configurations, and contact details.
 * @module models/Hotel
 */

import mongoose from 'mongoose';

/**
 * Generates a URL-friendly slug from an input string.
 *
 * @param {string} text - Raw string to convert into slug.
 * @returns {string} Lowercased, hyphenated slug string.
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-')  // Replace spaces, underscores, and consecutive hyphens
    .replace(/^-+|-+$/g, '');   // Trim leading and trailing hyphens
};

/**
 * Sub-schema for distinct room types and pricing tiers available at a hotel.
 */
const roomTypeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Room title is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      default: 2,
      min: [1, 'Capacity must be at least 1 person'],
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Room price per night is required'],
      min: [0, 'Price per night cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: true }
);

/**
 * Main Hotel Schema Definition.
 */
const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
      maxlength: [150, 'Hotel name cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      trim: true,
      index: true,
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Associated destination reference is required'],
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Hotel address is required'],
      trim: true,
    },
    pricePerNightMin: {
      type: Number,
      required: [true, 'Base starting price per night is required'],
      min: [0, 'Base price cannot be negative'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    coverImage: {
      type: String,
      required: [true, 'Cover image URL is required'],
      trim: true,
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    roomTypes: [roomTypeSchema],
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compound text index for keyword discovery across hotel name and address.
 */
hotelSchema.index({
  name: 'text',
  address: 'text',
});

/**
 * Pre-save Mongoose hook to automatically generate URL-friendly slug
 * when the hotel name is modified or slug is empty.
 */
hotelSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name);
  }
  if (typeof next === 'function') {
    next();
  }
});

const Hotel = mongoose.model('Hotel', hotelSchema);

export default Hotel;
