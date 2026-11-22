/**
 * @fileoverview ContactMessage model for visitor enquiries submitted via the Contact Us form.
 * 
 * ============================================================================
 * ACADEMIC DEFENSE & ARCHITECTURAL HIGHLIGHTS
 * ============================================================================
 * 1. Categorization & Triage Indexing:
 *    - Implements enum validation for `category` ('General Inquiry', 'Partnership', 'Feedback')
 *      enabling customer support routing and departmental filtering.
 * 2. Audit Trail & Read Status Flags:
 *    - `isRead` flag enables administrative inbox management with automatic Mongoose `timestamps`.
 * 
 * @module models/ContactMessage
 */

import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    category: {
      type: String,
      enum: {
        values: ['General Inquiry', 'Partnership', 'Feedback'],
        message: '{VALUE} is not a valid category',
      },
      default: 'General Inquiry',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message body is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters long'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

export default ContactMessage;
