/**
 * @fileoverview Destination controller managing CRUD operations, multi-criteria filtering,
 * slug/ID lookups, and role-guarded content administration.
 * @module controllers/destinationController
 */

import mongoose from 'mongoose';
import Destination, { slugify } from '../models/Destination.js';

/**
 * @desc    Get all destinations with filtering, search keyword, and pagination
 * @route   GET /api/destinations
 * @access  Public
 *
 * Query Params:
 *  - province: Filter by province (e.g., "Punjab", "Gilgit-Baltistan")
 *  - search / q: Search keyword matched against name, description, and province
 *  - category: Filter destinations having sites of category ('Historical', 'Natural', 'Adventure', 'Cultural', 'Religious')
 *  - sort: Sort field (e.g., "-averageRating", "-createdAt", "name")
 *  - page: Page number (default: 1)
 *  - limit: Results per page (default: 10, max: 50)
 */
export const getDestinations = async (req, res) => {
  try {
    const { province, search, q, category, sort } = req.query;

    // Parse and sanitize pagination parameters
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    // Build query filter
    const filter = {};

    // 1. Province filter
    if (province) {
      filter.province = { $regex: new RegExp(`^${province.trim()}$`, 'i') };
    }

    // 2. Search keyword filter across name, description, and province
    const keyword = (search || q || '').trim();
    if (keyword) {
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escapedKeyword, $options: 'i' } },
        { description: { $regex: escapedKeyword, $options: 'i' } },
        { province: { $regex: escapedKeyword, $options: 'i' } },
      ];
    }

    // 3. Category filter applied to co-located sites
    if (category) {
      filter['sitesToVisit.category'] = {
        $regex: new RegExp(`^${category.trim()}$`, 'i'),
      };
    }

    // 4. Sorting logic
    let sortBy = '-createdAt';
    if (sort) {
      sortBy = sort.split(',').join(' ');
    }

    // Execute queries in parallel for performance
    const [total, destinations] = await Promise.all([
      Destination.countDocuments(filter),
      Destination.find(filter)
        .populate('createdBy', 'name email avatar role')
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      count: destinations.length,
      total,
      pagination: {
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: destinations,
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve destinations.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single destination details by slug or MongoDB ObjectId
 * @route   GET /api/destinations/:slug
 * @access  Public
 */
export const getDestinationBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Destination slug or identifier is required.',
      });
    }

    // Allow lookup by slug or by valid MongoDB ObjectId
    const isObjectId = mongoose.Types.ObjectId.isValid(slug);
    const query = isObjectId ? { $or: [{ slug: slug.toLowerCase() }, { _id: slug }] } : { slug: slug.toLowerCase() };

    const destination = await Destination.findOne(query).populate('createdBy', 'name email avatar role');

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: `Destination not found with identifier '${slug}'.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: destination,
    });
  } catch (error) {
    console.error(`Error fetching destination '${req.params.slug}':`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve destination details.',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new destination
 * @route   POST /api/destinations
 * @access  Protected (admin, creator)
 */
export const createDestination = async (req, res) => {
  try {
    const {
      name,
      province,
      description,
      bannerImage,
      gallery,
      bestTimeToVisit,
      climateInfo,
      coordinates,
      sitesToVisit,
      famousFoods,
    } = req.body;

    // Validate mandatory fields
    if (!name || !province || !description || !bannerImage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, province, description, bannerImage.',
      });
    }

    // Check for duplicate name
    const existingDestination = await Destination.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existingDestination) {
      return res.status(400).json({
        success: false,
        message: `A destination with the name '${name.trim()}' already exists.`,
      });
    }

    // Build new destination payload
    const destinationData = {
      name: name.trim(),
      slug: req.body.slug ? slugify(req.body.slug) : slugify(name),
      province,
      description,
      bannerImage,
      gallery: Array.isArray(gallery) ? gallery : [],
      bestTimeToVisit: bestTimeToVisit || 'Year-round',
      climateInfo: climateInfo || '',
      coordinates: coordinates || { lat: null, lng: null },
      sitesToVisit: Array.isArray(sitesToVisit) ? sitesToVisit : [],
      famousFoods: Array.isArray(famousFoods) ? famousFoods : [],
      createdBy: req.user?._id || null,
    };

    const destination = await Destination.create(destinationData);
    await destination.populate('createdBy', 'name email avatar role');

    return res.status(201).json({
      success: true,
      message: 'Destination created successfully.',
      data: destination,
    });
  } catch (error) {
    console.error('Error creating destination:', error);

    // Mongoose duplicate key error handler
    if (error.code === 11000) {
      const duplicatedField = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({
        success: false,
        message: `Duplicate value entered for ${duplicatedField}. Must be unique.`,
      });
    }

    // Mongoose validation error handler
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
      message: 'Internal server error while creating destination.',
      error: error.message,
    });
  }
};

/**
 * @desc    Update existing destination
 * @route   PUT /api/destinations/:id
 * @access  Protected (admin, creator)
 */
export const updateDestination = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid destination ID format '${id}'.`,
      });
    }

    const destination = await Destination.findById(id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: `Destination with ID '${id}' not found.`,
      });
    }

    // If name is being changed, check for conflict and update slug
    if (req.body.name && req.body.name.trim() !== destination.name) {
      const conflict = await Destination.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${req.body.name.trim()}$`, 'i') },
      });

      if (conflict) {
        return res.status(400).json({
          success: false,
          message: `A destination with name '${req.body.name.trim()}' already exists.`,
        });
      }

      req.body.slug = slugify(req.body.name);
    }

    // Apply updates and run schema validation
    Object.assign(destination, req.body);
    await destination.save();
    await destination.populate('createdBy', 'name email avatar role');

    return res.status(200).json({
      success: true,
      message: 'Destination updated successfully.',
      data: destination,
    });
  } catch (error) {
    console.error(`Error updating destination '${req.params.id}':`, error);

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
      message: 'Internal server error while updating destination.',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete destination
 * @route   DELETE /api/destinations/:id
 * @access  Protected (admin only)
 */
export const deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid destination ID format '${id}'.`,
      });
    }

    const destination = await Destination.findByIdAndDelete(id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: `Destination with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Destination '${destination.name}' deleted successfully.`,
      deletedId: id,
    });
  } catch (error) {
    console.error(`Error deleting destination '${req.params.id}':`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while deleting destination.',
      error: error.message,
    });
  }
};

export default {
  getDestinations,
  getDestinationBySlug,
  createDestination,
  updateDestination,
  deleteDestination,
};
