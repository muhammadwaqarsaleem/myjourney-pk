/**
 * @fileoverview Destination model definition and schema configuration for MongoDB.
 * Encapsulates tourist destinations across Pakistan, co-locating notable sites and
 * regional cuisine/famous foods per HCI discovery architecture.
 * @module models/Destination
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
    .replace(/[^\w\s-]/g, '') // Remove non-word characters (except spaces and hyphens)
    .replace(/[\s_-]+/g, '-')  // Replace spaces, underscores, and multiple hyphens with a single hyphen
    .replace(/^-+|-+$/g, '');   // Trim leading and trailing hyphens
};

/**
 * Sub-schema for individual tourist sites/attractions located within a destination.
 */
const siteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Site name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: {
        values: ['Historical', 'Natural', 'Adventure', 'Cultural', 'Religious'],
        message: '{VALUE} is not a valid site category. Allowed: Historical, Natural, Adventure, Cultural, Religious',
      },
      default: 'Natural',
    },
    ticketInfo: {
      type: String,
      trim: true,
      default: 'Free entry or on-site ticketing',
    },
  },
  { _id: true }
);

/**
 * Sub-schema for famous regional dishes and culinary specialties of a destination.
 */
const famousFoodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Food item name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    mustTrySpot: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: true }
);

/**
 * Main Destination Schema definition.
 */
const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Destination name is required'],
      trim: true,
      unique: true,
      maxlength: [120, 'Destination name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      trim: true,
      index: true,
    },
    province: {
      type: String,
      required: [true, 'Province / territory is required'],
      enum: {
        values: [
          'Punjab',
          'Sindh',
          'Khyber Pakhtunkhwa',
          'Balochistan',
          'Gilgit-Baltistan',
          'Azad Kashmir',
          'Islamabad Capital Territory',
        ],
        message: '{VALUE} is not a recognized Pakistani province or territory',
      },
    },
    description: {
      type: String,
      required: [true, 'Destination description is required'],
      trim: true,
    },
    bannerImage: {
      type: String,
      required: [true, 'Banner image URL is required'],
      trim: true,
    },
    gallery: [
      {
        url: {
          type: String,
          required: [true, 'Gallery image URL is required'],
          trim: true,
        },
        caption: {
          type: String,
          trim: true,
          default: '',
        },
      },
    ],
    bestTimeToVisit: {
      type: String,
      trim: true,
      default: 'Year-round',
    },
    climateInfo: {
      type: String,
      trim: true,
      default: '',
    },
    coordinates: {
      lat: {
        type: Number,
        default: null,
      },
      lng: {
        type: Number,
        default: null,
      },
    },
    sitesToVisit: [siteSchema],
    famousFoods: [famousFoodSchema],
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Average rating cannot be lower than 0'],
      max: [5, 'Average rating cannot exceed 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Text index on name, description, and province for rich multi-field search.
 */
destinationSchema.index({
  name: 'text',
  description: 'text',
  province: 'text',
});

/**
 * Pre-save Mongoose hook to automatically generate slug from name
 * if slug is absent or if the destination name was altered.
 */
destinationSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name);
  }
  if (typeof next === 'function') {
    next();
  }
});

const Destination = mongoose.model('Destination', destinationSchema);

export default Destination;
