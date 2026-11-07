/**
 * @fileoverview Contact controller: handles visitor enquiry submissions and
 * admin retrieval of all contact messages.
 * @module controllers/contactController
 */

// External dependencies
import ContactMessage from '../models/ContactMessage.js';

/**
 * @desc    Submit a contact form enquiry
 * @route   POST /api/contact
 * @access  Public
 */
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate all required fields before persisting
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'Subject is required.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Your message has been received. We will get back to you soon.',
      data: contactMessage,
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);

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
      message: 'Failed to submit contact form.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all contact messages sorted newest first
 * @route   GET /api/contact
 * @access  Protected (admin only)
 */
export const getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort('-createdAt').lean();

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact messages.',
      error: error.message,
    });
  }
};

export default { submitContactForm, getAllMessages };
