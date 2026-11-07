/**
 * @fileoverview Bookmark routes: toggle and retrieval endpoints, all requiring authentication.
 * @module routes/bookmarkRoutes
 */

// External dependencies and controllers
import { Router } from 'express';
import { toggleBookmark, getMyBookmarks } from '../controllers/bookmarkController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/bookmarks/toggle - add or remove a bookmark for the authenticated user
router.route('/toggle').post(protect, toggleBookmark);

// GET  /api/bookmarks        - retrieve all bookmarks for the authenticated user
router.route('/').get(protect, getMyBookmarks);

export default router;
