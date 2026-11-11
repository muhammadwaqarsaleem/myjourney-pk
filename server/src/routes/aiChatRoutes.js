/**
 * @fileoverview AI Assistant chat routes for conversational travel guidance.
 * Exposes public endpoints for real-time tourism queries across Pakistan,
 * grounded in platform entities with internal markdown deep links.
 * @module routes/aiChatRoutes
 */

import { Router } from 'express';
import { handleChatMessage } from '../controllers/aiChatController.js';

const router = Router();

// POST /api/ai/chat - Public endpoint to query conversational travel guide
router.route('/chat').post(handleChatMessage);

export default router;

