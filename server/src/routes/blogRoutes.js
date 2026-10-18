/**
 * @fileoverview Route definitions for Community Travelogues and Blogs.
 * Supports public discovery, creator/admin publication workflows, ownership-guarded
 * updates/deletions, and authenticated user like toggling.
 * @module routes/blogRoutes
 */

import express from 'express';
import {
  getPublishedBlogs,
  getBlogBySlug,
  getMyBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLikeBlog,
} from '../controllers/blogController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/blogs
 * @desc    Fetch published blogs with filtering (tags, destination, search keyword) and pagination
 * @access  Public
 *
 * @route   POST /api/blogs
 * @desc    Create a new travelogue or blog post
 * @access  Protected (creator, admin)
 */
router
  .route('/')
  .get(getPublishedBlogs)
  .post(protect, authorize('creator', 'admin'), createBlog);

/**
 * @route   GET /api/blogs/my-blogs
 * @desc    Fetch author's own drafts and published articles
 * @access  Protected (creator, admin)
 * @note    Must precede `/:slug` to prevent route collision
 */
router
  .route('/my-blogs')
  .get(protect, authorize('creator', 'admin'), getMyBlogs);

/**
 * @route   POST /api/blogs/:id/like
 * @desc    Toggle like for current authenticated user on a blog post
 * @access  Protected (all authenticated users)
 */
router
  .route('/:id/like')
  .post(protect, toggleLikeBlog);

/**
 * @route   GET /api/blogs/:slug
 * @desc    Fetch a single blog post by slug or ID and increment view count
 * @access  Public
 */
router
  .route('/:slug')
  .get(getBlogBySlug);

/**
 * @route   PUT /api/blogs/:id
 * @desc    Update an existing blog post (creator author or admin)
 * @access  Protected (creator, admin)
 *
 * @route   DELETE /api/blogs/:id
 * @desc    Delete a blog post (creator author or admin)
 * @access  Protected (creator, admin)
 */
router
  .route('/:id')
  .put(protect, authorize('creator', 'admin'), updateBlog)
  .delete(protect, authorize('creator', 'admin'), deleteBlog);

export default router;
