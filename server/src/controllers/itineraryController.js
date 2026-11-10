/**
 * @fileoverview Itinerary controller managing AI itinerary generation,
 * user plan persistence, retrieval of personal travel itineraries, and deletion.
 * @module controllers/itineraryController
 */

import mongoose from 'mongoose';
import Itinerary from '../models/Itinerary.js';
import Destination from '../models/Destination.js';
import { generateItineraryPlan } from '../services/aiPlannerService.js';

/**
 * @desc    Generate a structured travel itinerary using Gemini AI or fallback mock
 * @route   POST /api/itinerary/generate
 * @access  Public
 *
 * Payload:
 *  - destinationId: MongoDB ObjectId (required)
 *  - days: Number between 1 and 14 (optional, default: 3)
 *  - budget: 'budget' | 'moderate' | 'luxury' (optional, default: 'moderate')
 *  - interests: String[] or comma-separated String (optional)
 *  - travelersCount: Number >= 1 (optional, default: 1)
 */
export const generateItinerary = async (req, res) => {
  try {
    const { destinationId, days, budget, interests, travelersCount } = req.body;

    // 1. Validate destinationId
    if (!destinationId || !mongoose.isValidObjectId(destinationId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid destinationId (MongoDB ObjectId) is required.',
      });
    }

    // 2. Validate days (1-14)
    let parsedDays = 3;
    if (days !== undefined && days !== null && days !== '') {
      parsedDays = Number(days);
      if (!Number.isInteger(parsedDays) || parsedDays < 1 || parsedDays > 14) {
        return res.status(400).json({
          success: false,
          message: 'Days must be an integer between 1 and 14.',
        });
      }
    }

    // 3. Validate budget tier
    const allowedBudgets = ['budget', 'moderate', 'luxury'];
    let normalizedBudget = 'moderate';
    if (budget !== undefined && budget !== null && budget !== '') {
      normalizedBudget = String(budget).toLowerCase().trim();
      if (!allowedBudgets.includes(normalizedBudget)) {
        return res.status(400).json({
          success: false,
          message: `Budget must be one of: [${allowedBudgets.join(', ')}].`,
        });
      }
    }

    // 4. Validate travelersCount
    let parsedTravelers = 1;
    if (travelersCount !== undefined && travelersCount !== null && travelersCount !== '') {
      parsedTravelers = Number(travelersCount);
      if (!Number.isInteger(parsedTravelers) || parsedTravelers < 1) {
        return res.status(400).json({
          success: false,
          message: 'travelersCount must be a positive integer (minimum 1).',
        });
      }
    }

    // 5. Invoke service
    const plan = await generateItineraryPlan({
      destinationId,
      days: parsedDays,
      budget: normalizedBudget,
      interests,
      travelersCount: parsedTravelers,
    });

    return res.status(200).json({
      success: true,
      message: 'Itinerary generated successfully.',
      data: {
        destinationId,
        ...plan,
        budget: normalizedBudget,
        days: parsedDays,
        travelersCount: parsedTravelers,
        interests: Array.isArray(interests) ? interests : plan.interests || [],
      },
    });
  } catch (error) {
    console.error('💥 [generateItinerary] Error:', error.message);

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to generate itinerary plan.',
    });
  }
};

/**
 * @desc    Save an itinerary to the authenticated user's travel plans
 * @route   POST /api/itinerary/save
 * @access  Protected (Authenticated user)
 *
 * Payload:
 *  - destinationId (or destination): MongoDB ObjectId
 *  - tripTitle: String
 *  - days: Number (1-14)
 *  - budget: 'budget' | 'moderate' | 'luxury'
 *  - estimatedBudgetPKR: Number
 *  - travelersCount: Number
 *  - interests: String[]
 *  - dailyPlan: Array of daily objects
 *  - travelTips: String[]
 */
export const saveItinerary = async (req, res) => {
  try {
    const {
      destinationId,
      destination: destFromBody,
      tripTitle,
      days,
      budget,
      estimatedBudgetPKR,
      travelersCount,
      interests,
      dailyPlan,
      travelTips,
    } = req.body;

    const targetDestinationId = destinationId || destFromBody;

    // 1. Validate destination reference
    if (!targetDestinationId || !mongoose.isValidObjectId(targetDestinationId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid destinationId is required.',
      });
    }

    const destinationDoc = await Destination.findById(targetDestinationId);
    if (!destinationDoc) {
      return res.status(404).json({
        success: false,
        message: `Destination with ID '${targetDestinationId}' does not exist.`,
      });
    }

    // 2. Validate trip title
    if (!tripTitle || typeof tripTitle !== 'string' || !tripTitle.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid tripTitle is required.',
      });
    }

    // 3. Validate days
    const parsedDays = Number(days);
    if (!Number.isInteger(parsedDays) || parsedDays < 1 || parsedDays > 14) {
      return res.status(400).json({
        success: false,
        message: 'Days must be an integer between 1 and 14.',
      });
    }

    // 4. Validate budget
    const allowedBudgets = ['budget', 'moderate', 'luxury'];
    const normalizedBudget = String(budget || '').toLowerCase().trim();
    if (!allowedBudgets.includes(normalizedBudget)) {
      return res.status(400).json({
        success: false,
        message: `Budget must be one of: [${allowedBudgets.join(', ')}].`,
      });
    }

    // 5. Validate dailyPlan
    if (!Array.isArray(dailyPlan) || dailyPlan.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'dailyPlan must be a non-empty array of daily itinerary items.',
      });
    }

    // 6. Construct and persist Itinerary
    const newItinerary = new Itinerary({
      user: req.user._id,
      destination: destinationDoc._id,
      tripTitle: tripTitle.trim(),
      days: parsedDays,
      budget: normalizedBudget,
      estimatedBudgetPKR: Number(estimatedBudgetPKR) || 0,
      travelersCount: Math.max(1, Number(travelersCount) || 1),
      interests: Array.isArray(interests) ? interests : [],
      dailyPlan,
      travelTips: Array.isArray(travelTips) ? travelTips : [],
    });

    const saved = await newItinerary.save();

    const populated = await Itinerary.findById(saved._id)
      .populate('destination', 'name slug coverImage bannerImage province')
      .populate('user', 'name email')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Itinerary saved successfully to your travel plans.',
      data: populated,
    });
  } catch (error) {
    console.error('💥 [saveItinerary] Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Itinerary validation failed.',
        errors: messages,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to save itinerary.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all saved itineraries for the currently authenticated user
 * @route   GET /api/itinerary/my-plans
 * @access  Protected (Authenticated user)
 */
export const getMyItineraries = async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ user: req.user._id })
      .populate('destination', 'name slug bannerImage coverImage province')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: itineraries.length,
      data: itineraries,
    });
  } catch (error) {
    console.error('💥 [getMyItineraries] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your travel plans.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single saved itinerary by ID
 * @route   GET /api/itinerary/:id
 * @access  Protected (Authenticated user)
 */
export const getItineraryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid Itinerary ID: '${id}'.`,
      });
    }

    const itinerary = await Itinerary.findById(id)
      .populate('destination', 'name slug bannerImage coverImage province sitesToVisit famousFoods')
      .populate('user', 'name email')
      .lean();

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: `Itinerary with ID '${id}' was not found.`,
      });
    }

    // Ensure owner or admin
    if (itinerary.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this travel plan.',
      });
    }

    return res.status(200).json({
      success: true,
      data: itinerary,
    });
  } catch (error) {
    console.error('💥 [getItineraryById] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve itinerary.',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a saved itinerary by ID
 * @route   DELETE /api/itinerary/:id
 * @access  Protected (Authenticated user)
 */
export const deleteItinerary = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid Itinerary ID: '${id}'.`,
      });
    }

    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: `Itinerary with ID '${id}' was not found.`,
      });
    }

    // Verify ownership or admin privileges
    if (itinerary.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this travel plan.',
      });
    }

    await itinerary.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Itinerary deleted successfully.',
    });
  } catch (error) {
    console.error('💥 [deleteItinerary] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete itinerary.',
      error: error.message,
    });
  }
};

export default {
  generateItinerary,
  saveItinerary,
  getMyItineraries,
  getItineraryById,
  deleteItinerary,
};

