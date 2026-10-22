/**
 * @fileoverview Booking controller managing reservation inquiries, user stay records,
 * date validation, duration calculations, and administrative status transitions.
 * @module controllers/bookingController
 */

import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Hotel from '../models/Hotel.js';

/**
 * @desc    Create a new hotel booking inquiry/reservation
 * @route   POST /api/bookings
 * @access  Protected (Authenticated user)
 *
 * Payload:
 *  - hotel: Hotel ObjectId
 *  - roomType: Title of room type (e.g. 'Deluxe King Room')
 *  - checkInDate: ISO date string
 *  - checkOutDate: ISO date string
 *  - guests: { adults: Number, children: Number } (optional, defaults { adults: 1, children: 0 })
 *  - totalPrice: Optional Number (auto-calculated from room price * nights if omitted)
 *  - specialRequests: String (optional, max 500 chars)
 */
export const createBooking = async (req, res) => {
  try {
    const {
      hotel: hotelId,
      roomType,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice: customTotalPrice,
      specialRequests,
    } = req.body;

    // 1. Validate hotel ID and check property existence
    if (!hotelId || !mongoose.isValidObjectId(hotelId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid Hotel ObjectId is required.',
      });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: `Hotel with ID '${hotelId}' was not found.`,
      });
    }

    // 2. Validate room type
    if (!roomType || typeof roomType !== 'string' || !roomType.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid roomType string is required.',
      });
    }

    // Check if the requested room type matches one listed on the hotel property
    const matchingRoom = hotel.roomTypes.find(
      (r) => r.title.trim().toLowerCase() === roomType.trim().toLowerCase()
    );

    // 3. Robust Date Validation
    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Both checkInDate and checkOutDate are required.',
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'checkInDate and checkOutDate must be valid dates (e.g. YYYY-MM-DD or ISO 8601).',
      });
    }

    // Ensure check-out is strictly after check-in
    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be strictly after the check-in date.',
      });
    }

    // Calculate total duration in nights
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (nights < 1) {
      return res.status(400).json({
        success: false,
        message: 'A booking must span at least 1 night.',
      });
    }

    // 4. Calculate total price if not supplied
    let calculatedPrice;
    if (customTotalPrice !== undefined && !isNaN(Number(customTotalPrice)) && Number(customTotalPrice) >= 0) {
      calculatedPrice = Number(customTotalPrice);
    } else if (matchingRoom) {
      calculatedPrice = matchingRoom.pricePerNight * nights;
    } else {
      // Fallback to base hotel starting rate
      calculatedPrice = hotel.pricePerNightMin * nights;
    }

    // 5. Sanitize guest structure
    const adults = Math.max(1, parseInt(guests?.adults, 10) || 1);
    const children = Math.max(0, parseInt(guests?.children, 10) || 0);

    // 6. Create booking document
    const booking = new Booking({
      user: req.user._id,
      hotel: hotel._id,
      roomType: matchingRoom ? matchingRoom.title : roomType.trim(),
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests: {
        adults,
        children,
      },
      totalPrice: calculatedPrice,
      status: 'pending',
      specialRequests: specialRequests || '',
    });

    await booking.save();

    // Populate hotel and user details for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('hotel', 'name slug coverImage address rating destination')
      .populate('user', 'name email')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Booking inquiry submitted successfully.',
      nights,
      data: populatedBooking,
    });
  } catch (error) {
    console.error('💥 [createBooking] Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Booking validation failed.',
        errors: messages,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create booking inquiry.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all bookings for the currently authenticated user
 * @route   GET /api/bookings/my-bookings
 * @access  Protected (Authenticated user)
 */
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: 'hotel',
        select: 'name slug coverImage address rating destination',
        populate: {
          path: 'destination',
          select: 'name slug province',
        },
      })
      .sort('-createdAt')
      .lean();

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('💥 [getMyBookings] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your bookings.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all bookings across the platform
 * @route   GET /api/bookings
 * @access  Protected (admin only)
 *
 * Query Params:
 *  - status: Filter by status ('pending', 'confirmed', 'cancelled', 'completed')
 *  - hotel: Filter by Hotel ObjectId
 *  - page: Page number (default: 1)
 *  - limit: Results per page (default: 15, max: 100)
 */
export const getAllBookings = async (req, res) => {
  try {
    const { status, hotel } = req.query;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const filter = {};

    if (status) {
      filter.status = status.toLowerCase().trim();
    }

    if (hotel && mongoose.isValidObjectId(hotel)) {
      filter.hotel = hotel;
    }

    const [total, bookings] = await Promise.all([
      Booking.countDocuments(filter),
      Booking.find(filter)
        .populate('user', 'name email avatar role')
        .populate({
          path: 'hotel',
          select: 'name slug coverImage address destination',
          populate: {
            path: 'destination',
            select: 'name slug province',
          },
        })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page,
      totalPages,
      data: bookings,
    });
  } catch (error) {
    console.error('💥 [getAllBookings] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking records.',
      error: error.message,
    });
  }
};

/**
 * @desc    Update a booking status (e.g. pending -> confirmed, cancelled, completed)
 * @route   PATCH /api/bookings/:id/status
 * @access  Protected (admin only)
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid Booking ID: '${id}'.`,
      });
    }

    const allowedStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!status || !allowedStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${status}'. Allowed statuses: [${allowedStatuses.join(', ')}].`,
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found with ID '${id}'.`,
      });
    }

    booking.status = status.toLowerCase();
    await booking.save();

    const updatedBooking = await Booking.findById(id)
      .populate('user', 'name email avatar')
      .populate({
        path: 'hotel',
        select: 'name slug coverImage address destination',
        populate: {
          path: 'destination',
          select: 'name slug province',
        },
      })
      .lean();

    return res.status(200).json({
      success: true,
      message: `Booking status updated to '${status}'.`,
      data: updatedBooking,
    });
  } catch (error) {
    console.error(`💥 [updateBookingStatus] Error for ID '${req.params.id}':`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update booking status.',
      error: error.message,
    });
  }
};

export default {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
};
