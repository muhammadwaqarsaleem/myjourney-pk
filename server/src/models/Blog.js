/**
 * @fileoverview Blog model definition and schema configuration for MongoDB.
 * Encapsulates community travelogues, personal adventures, and curated travel guides.
 * Supports Markdown/rich-text content, tags, likes, view tracking, and optional destination linkage.
 * @module models/Blog
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
    .replace(/[^\w\s-]/g, '') // Remove non-word characters
    .replace(/[\s_-]+/g, '-')  // Replace spaces, underscores, hyphens with single hyphen
    .replace(/^-+|-+$/g, '');   // Trim leading/trailing hyphens
};

/**
 * Calculates estimated reading time in minutes based on ~200 words per minute.
 *
 * @param {string} content - Raw markdown or HTML text.
 * @returns {number} Estimated read time in minutes (minimum 1).
 */
export const calculateReadTime = (content) => {
  if (!content) return 3;
  // Strip HTML tags if content contains rich-text HTML markup
  const plainText = content.replace(/<[^>]*>/g, ' ');
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    excerpt: {
      type: String,
      required: [true, 'Blog excerpt is required'],
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
      trim: true,
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image URL is required'],
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true,
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      default: null,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    readTime: {
      type: Number,
      default: 3,
      min: [1, 'Read time must be at least 1 minute'],
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published'],
        message: '{VALUE} is not a valid blog status. Allowed: draft, published',
      },
      default: 'published',
      index: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views count cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Text index on title, excerpt, and tags for multi-attribute search queries.
 */
blogSchema.index({
  title: 'text',
  excerpt: 'text',
  tags: 'text',
});

/**
 * Pre-save Mongoose middleware hook.
 * Automatically generates slug if absent or if title changed.
 * Automatically calculates readTime if not provided.
 */
blogSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title);
  }

  if (this.content && (!this.readTime || this.isModified('content'))) {
    this.readTime = calculateReadTime(this.content);
  }

  if (typeof next === 'function') {
    next();
  }
});

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
