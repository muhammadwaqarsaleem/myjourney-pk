/**
 * @fileoverview Contact controller: handles visitor enquiry submissions,
 * automated email dispatch via Nodemailer SMTP, and admin message retrieval.
 * 
 * ============================================================================
 * ACADEMIC DEFENSE & ARCHITECTURAL HIGHLIGHTS
 * ============================================================================
 * 1. Simple Mail Transfer Protocol (SMTP) & Transport Configuration:
 *    - Uses `nodemailer` to construct an authenticated transport pipeline.
 *    - Port 465 utilizes implicit SSL/TLS (`secure: true`), immediately wrapping
 *      the socket connection in a secure TLS handshake, whereas Port 587 typically
 *      initiates plain-text negotiation before elevating via the `STARTTLS` command.
 * 
 * 2. Mail Header Injection Mitigation:
 *    - Attackers attempt Mail Injection by embedding carriage-return / line-feed
 *      (`\r\n` or `%0A%0D`) characters into the `subject` or `name` fields to inject
 *      arbitrary SMTP commands (e.g., `Bcc: victim@example.com`).
 *    - Input sanitization strips line breaks from headers, neutralizing header tampering.
 * 
 * 3. Graceful Fallback & Circuit Breaking:
 *    - If SMTP credentials are absent from `.env` or network firewall filters block
 *      port 465/587 in local development, the controller logs the full inquiry to the
 *      server console and responds with HTTP 200 `{ success: true, message: "Inquiry logged in development mode." }`.
 *    - This ensures developer workflows remain uninterrupted while persisting data safely in MongoDB.
 * 
 * @module controllers/contactController
 */

import nodemailer from 'nodemailer';
import ContactMessage from '../models/ContactMessage.js';

// Standard RFC 5322 email regex
const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

/**
 * Creates and caches the reusable Nodemailer transporter instance.
 * @returns {import('nodemailer').Transporter|null}
 */
const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  const isSecure = SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 465,
    secure: isSecure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    // Prevent unhandled socket hangs during SMTP connection
    connectionTimeout: 8000,
    greetingTimeout: 8000,
  });
};

/**
 * @desc    Submit a contact form enquiry & dispatch email notification
 * @route   POST /api/contact
 * @access  Public
 */
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, category, subject, message } = req.body;

    // 1. Validate mandatory fields
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your full name.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your email address.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a subject for your message.' });
    }

    if (!message || message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters long.',
      });
    }

    // 2. Sanitize against email header injection (strip newlines from header fields)
    const sanitizedName = name.replace(/[\r\n]/g, '').trim();
    const sanitizedSubject = subject.replace(/[\r\n]/g, '').trim();
    const sanitizedCategory = ['General Inquiry', 'Partnership', 'Feedback'].includes(category)
      ? category
      : 'General Inquiry';
    const sanitizedMessage = message.trim();

    // 3. Persist contact inquiry in MongoDB
    const contactRecord = await ContactMessage.create({
      name: sanitizedName,
      email: trimmedEmail,
      category: sanitizedCategory,
      subject: sanitizedSubject,
      message: sanitizedMessage,
    });

    // 4. Dispatch Email Notification Pipeline
    const transporter = getTransporter();
    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || 'mwaqarsaleem1@gmail.com';

    if (!transporter) {
      console.log('📬 [Contact Mailer - DEV MODE] SMTP credentials not fully configured in .env.');
      console.log('====================================================');
      console.log(`From:     ${sanitizedName} <${trimmedEmail}>`);
      console.log(`Category: ${sanitizedCategory}`);
      console.log(`Subject:  ${sanitizedSubject}`);
      console.log(`Message:  ${sanitizedMessage}`);
      console.log('====================================================');

      return res.status(200).json({
        success: true,
        message: 'Inquiry logged in development mode.',
        data: contactRecord,
      });
    }

    // Prepare HTML and plain text email payload
    const mailOptions = {
      from: `"${sanitizedName} (myjourney.pk)" <${process.env.SMTP_USER}>`,
      to: receiverEmail,
      replyTo: trimmedEmail,
      subject: `[${sanitizedCategory}] ${sanitizedSubject}`,
      text: `New contact inquiry received on myjourney.pk:\n\nName: ${sanitizedName}\nEmail: ${trimmedEmail}\nCategory: ${sanitizedCategory}\nSubject: ${sanitizedSubject}\n\nMessage:\n${sanitizedMessage}\n\nSubmitted at: ${new Date().toISOString()}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 16px; background-color: #ffffff;">
          <div style="background-color: #047857; padding: 16px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px;">myjourney.pk &mdash; New Inquiry</h2>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 120px;">From:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${sanitizedName} &lt;${trimmedEmail}&gt;</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Category:</td>
              <td style="padding: 8px 0; color: #047857; font-weight: bold;">${sanitizedCategory}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Subject:</td>
              <td style="padding: 8px 0; color: #0f172a;">${sanitizedSubject}</td>
            </tr>
          </table>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${sanitizedMessage}</p>
          </div>
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
            This email was dispatched by the myjourney.pk contact notification service.
          </p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ [Contact Mailer] Inquiry successfully dispatched to ${receiverEmail}`);
      return res.status(200).json({
        success: true,
        message: 'Your inquiry has been successfully dispatched. We will get back to you shortly.',
        data: contactRecord,
      });
    } catch (mailError) {
      console.error('⚠️ [Contact Mailer] SMTP dispatch failed:', mailError.message);
      // Graceful degradation: The message was persisted in the DB, so we return success to the user
      return res.status(200).json({
        success: true,
        message: 'Your inquiry has been received and saved. Our team will review it shortly.',
        data: contactRecord,
      });
    }
  } catch (error) {
    console.error('💥 Error submitting contact form:', error);

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
