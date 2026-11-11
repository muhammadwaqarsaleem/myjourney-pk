/**
 * @fileoverview AI Chat Controller for the myjourney.pk conversational tourism assistant.
 * Handles public inbound chat messages, validates payload integrity, delegates prompt
 * synthesis to aiChatService, and delivers structured JSON responses.
 * @module controllers/aiChatController
 */

import { generateChatReply } from '../services/aiChatService.js';

/**
 * Handles incoming conversational travel inquiries for the AI Tourism Guide.
 *
 * @async
 * @function handleChatMessage
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware callback.
 * @returns {Promise<void>}
 */
export const handleChatMessage = async (req, res, next) => {
  try {
    const { message, conversationHistory } = req.body;

    // Validate that message exists, is a string, and is not solely whitespace
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid, non-empty message string is required.',
      });
    }

    // Validate conversationHistory structure if provided
    if (conversationHistory !== undefined && conversationHistory !== null && !Array.isArray(conversationHistory)) {
      return res.status(400).json({
        success: false,
        message: 'conversationHistory must be an array of prior chat turns.',
      });
    }

    const reply = await generateChatReply(message.trim(), conversationHistory);

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error('💥 [aiChatController] Error processing chat message:', error.message);

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to generate AI travel guide response.',
    });
  }
};

export default {
  handleChatMessage,
};

