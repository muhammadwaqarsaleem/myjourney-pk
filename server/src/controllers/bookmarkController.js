/**
 * @fileoverview Bookmark controller: allows authenticated users to toggle and
 * retrieve their bookmarked destinations and hotels.
 * @module controllers/bookmarkController
 */

// External dependencies
import User from '../models/User.js';

// Maps each accepted itemType to its dot-notation path in the User document
const VALID_ITEM_TYPES = {
  destination: 'bookmarks.destinations',
  hotel: 'bookmarks.hotels',
};

/**
 * @desc    Toggle a bookmark: adds the item if absent, removes it if present
 * @route   POST /api/bookmarks/toggle
 * @access  Protected
 *
 * Body: { itemId: string, itemType: 'destination' | 'hotel' }
 */
export const toggleBookmark = async (req, res) => {
  try {
    const { itemId, itemType } = req.body;

    // Validate request body inputs
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'itemId is required.',
      });
    }

    if (!itemType || !VALID_ITEM_TYPES[itemType]) {
      return res.status(400).json({
        success: false,
        message: `itemType must be one of: ${Object.keys(VALID_ITEM_TYPES).join(', ')}.`,
      });
    }

    const arrayPath = VALID_ITEM_TYPES[itemType];
    const arrayKey = itemType === 'destination' ? 'destinations' : 'hotels';

    // Determine current bookmark state
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const currentArray = user.bookmarks[arrayKey] || [];
    const isAlreadyBookmarked = currentArray.some((id) => id.toString() === itemId.toString());

    // Apply $pull to remove or $addToSet to add atomically
    let updatedUser;

    if (isAlreadyBookmarked) {
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { [arrayPath]: itemId } },
        { new: true }
      );
    } else {
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { [arrayPath]: itemId } },
        { new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: isAlreadyBookmarked ? 'Bookmark removed.' : 'Bookmark added.',
      data: {
        isBookmarked: !isAlreadyBookmarked,
        bookmarks: updatedUser.bookmarks,
      },
    });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle bookmark.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all bookmarks for the authenticated user, fully populated
 * @route   GET /api/bookmarks
 * @access  Protected
 */
export const getMyBookmarks = async (req, res) => {
  try {
    // Populate both sub-arrays with the fields required by the client
    const user = await User.findById(req.user._id)
      .populate('bookmarks.destinations', 'name slug coverImage province bannerImage')
      .populate('bookmarks.hotels', 'name slug coverImage pricePerNightMin province');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: user.bookmarks,
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookmarks.',
      error: error.message,
    });
  }
};

export default { toggleBookmark, getMyBookmarks };
