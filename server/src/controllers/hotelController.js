/**
 * @fileoverview Hotel controller managing directory listings, destination-linked queries,
 * slug lookups, and administrative property management.
 * @module controllers/hotelController
 */

import mongoose from 'mongoose';
import Hotel, { slugify } from '../models/Hotel.js';
import Destination from '../models/Destination.js';

/**
 * @desc    Get all hotels with filtering (destination ID or slug, price range, featured status, search) & pagination
 * @route   GET /api/hotels
 * @access  Public
 *
 * Query Params:
 *  - destination: Destination ObjectId or slug (e.g. 'hunza-valley' or 'lahore')
 *  - minPrice: Minimum starting price per night in PKR
 *  - maxPrice: Maximum starting price per night in PKR
 *  - isFeatured: 'true' | 'false'
 *  - search / q: Keyword matched against hotel name or address
 *  - sort: Sort field (e.g. 'pricePerNightMin', '-rating', '-createdAt')
 *  - page: Page number (default: 1)
 *  - limit: Results per page (default: 10, max: 50)
 */
export const getHotels = async (req, res) => {
  try {
    const { destination, minPrice, maxPrice, isFeatured, search, q, sort } = req.query;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    // 1. Destination filter (supports Destination ObjectId or Destination slug)
    if (destination) {
      if (mongoose.isValidObjectId(destination)) {
        filter.destination = destination;
      } else {
        const destDoc = await Destination.findOne({
          slug: destination.toLowerCase().trim(),
        }).select('_id');

        if (destDoc) {
          filter.destination = destDoc._id;
        } else {
          // If destination slug does not exist, return empty results gracefully
          return res.status(200).json({
            success: true,
            count: 0,
            total: 0,
            page,
            totalPages: 1,
            data: [],
          });
        }
      }
    }

    // 2. Price range filtering on base starting price
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.pricePerNightMin = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        filter.pricePerNightMin.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        filter.pricePerNightMin.$lte = Number(maxPrice);
      }
    }

    // 3. Featured status filter
    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

    // 4. Keyword search across name and address
    const keyword = (search || q || '').trim();
    if (keyword) {
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escapedKeyword, $options: 'i' } },
        { address: { $regex: escapedKeyword, $options: 'i' } },
        { amenities: { $regex: escapedKeyword, $options: 'i' } },
      ];
    }

    // 5. Sorting
    let sortBy = '-createdAt';
    if (sort) {
      sortBy = sort.split(',').join(' ');
    }

    const [total, hotels] = await Promise.all([
      Hotel.countDocuments(filter),
      Hotel.find(filter)
        .populate('destination', 'name slug province bannerImage')
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      count: hotels.length,
      total,
      page,
      totalPages,
      data: hotels,
    });
  } catch (error) {
    console.error('💥 [getHotels] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve hotels directory.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single hotel by slug or ObjectId with destination details
 * @route   GET /api/hotels/:slug
 * @access  Public
 */
export const getHotelBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const isObjectId = mongoose.isValidObjectId(slug);

    const query = isObjectId
      ? { $or: [{ _id: slug }, { slug: slug.toLowerCase() }] }
      : { slug: slug.toLowerCase() };

    const hotel = await Hotel.findOne(query)
      .populate('destination', 'name slug province description bannerImage coordinates')
      .lean();

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: `Hotel not found with identifier '${slug}'.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    console.error(`💥 [getHotelBySlug] Error for slug '${req.params.slug}':`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve hotel details.',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new hotel property
 * @route   POST /api/hotels
 * @access  Protected (admin only)
 */
export const createHotel = async (req, res) => {
  try {
    const {
      name,
      slug: customSlug,
      destination,
      address,
      pricePerNightMin,
      rating,
      reviewCount,
      images,
      coverImage,
      amenities,
      roomTypes,
      contactPhone,
      contactEmail,
      isFeatured,
    } = req.body;

    // Validate destination ID
    if (!destination || !mongoose.isValidObjectId(destination)) {
      return res.status(400).json({
        success: false,
        message: 'A valid Destination ObjectId is required.',
      });
    }

    const destinationExists = await Destination.findById(destination);
    if (!destinationExists) {
      return res.status(404).json({
        success: false,
        message: `Destination with ID '${destination}' does not exist.`,
      });
    }

    // Determine slug
    const finalSlug = (customSlug ? slugify(customSlug) : slugify(name)).toLowerCase();

    // Check slug uniqueness
    const existingHotel = await Hotel.findOne({ slug: finalSlug });
    if (existingHotel) {
      return res.status(409).json({
        success: false,
        message: `A hotel with the slug '${finalSlug}' already exists. Please provide a unique name or slug.`,
      });
    }

    const hotel = new Hotel({
      name,
      slug: finalSlug,
      destination,
      address,
      pricePerNightMin,
      rating: rating !== undefined ? rating : 4.5,
      reviewCount: reviewCount || 0,
      images: Array.isArray(images) ? images : [],
      coverImage,
      amenities: Array.isArray(amenities) ? amenities : [],
      roomTypes: Array.isArray(roomTypes) ? roomTypes : [],
      contactPhone: contactPhone || '',
      contactEmail: contactEmail || '',
      isFeatured: Boolean(isFeatured),
    });

    await hotel.save();

    const populatedHotel = await Hotel.findById(hotel._id)
      .populate('destination', 'name slug province bannerImage')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Hotel property created successfully.',
      data: populatedHotel,
    });
  } catch (error) {
    console.error('💥 [createHotel] Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Hotel validation failed.',
        errors: messages,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A hotel with this name or slug already exists.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create hotel property.',
      error: error.message,
    });
  }
};

/**
 * @desc    Update an existing hotel property
 * @route   PUT /api/hotels/:id
 * @access  Protected (admin only)
 */
export const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid Hotel ID: '${id}'.`,
      });
    }

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: `Hotel not found with ID '${id}'.`,
      });
    }

    // If destination is being modified, verify it exists
    if (req.body.destination) {
      if (!mongoose.isValidObjectId(req.body.destination)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Destination ObjectId provided.',
        });
      }
      const destExists = await Destination.findById(req.body.destination);
      if (!destExists) {
        return res.status(404).json({
          success: false,
          message: `Destination with ID '${req.body.destination}' does not exist.`,
        });
      }
    }

    // If slug is being updated or name is changed without slug, check uniqueness
    if (req.body.slug || (req.body.name && req.body.name !== hotel.name)) {
      const proposedSlug = (req.body.slug ? slugify(req.body.slug) : slugify(req.body.name)).toLowerCase();
      const slugClash = await Hotel.findOne({ slug: proposedSlug, _id: { $ne: id } });
      if (slugClash) {
        return res.status(409).json({
          success: false,
          message: `Slug '${proposedSlug}' is already in use by another hotel.`,
        });
      }
      hotel.slug = proposedSlug;
    }

    // Update mutable fields
    const allowedFields = [
      'name',
      'destination',
      'address',
      'pricePerNightMin',
      'rating',
      'reviewCount',
      'images',
      'coverImage',
      'amenities',
      'roomTypes',
      'contactPhone',
      'contactEmail',
      'isFeatured',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        hotel[field] = req.body[field];
      }
    });

    await hotel.save();

    const updatedHotel = await Hotel.findById(id)
      .populate('destination', 'name slug province bannerImage')
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Hotel property updated successfully.',
      data: updatedHotel,
    });
  } catch (error) {
    console.error(`💥 [updateHotel] Error for ID '${req.params.id}':`, error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Hotel validation failed.',
        errors: messages,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update hotel property.',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a hotel property
 * @route   DELETE /api/hotels/:id
 * @access  Protected (admin only)
 */
export const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid Hotel ID: '${id}'.`,
      });
    }

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: `Hotel not found with ID '${id}'.`,
      });
    }

    await hotel.deleteOne();

    return res.status(200).json({
      success: true,
      message: `Hotel '${hotel.name}' has been successfully deleted.`,
    });
  } catch (error) {
    console.error(`💥 [deleteHotel] Error for ID '${req.params.id}':`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete hotel property.',
      error: error.message,
    });
  }
};

export default {
  getHotels,
  getHotelBySlug,
  createHotel,
  updateHotel,
  deleteHotel,
};
