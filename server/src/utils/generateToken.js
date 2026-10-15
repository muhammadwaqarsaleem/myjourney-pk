/**
 * @fileoverview Utility for generating signed JSON Web Tokens (JWT) and
 * configuring secure, HTTP-only cookies on Express response objects.
 * @module utils/generateToken
 */

import jwt from 'jsonwebtoken';

/**
 * Signs a JWT with user payload and sets an HTTP-only authentication cookie on the response.
 *
 * @param {import('express').Response} res - Express response object.
 * @param {Object} user - User document or payload object.
 * @param {string|import('mongoose').Types.ObjectId} user._id - User unique database ID.
 * @param {string} user.role - User RBAC role (e.g., 'user', 'creator', 'admin').
 * @returns {string} Signed JWT token string.
 */
export const generateToken = (res, user) => {
  const payload = {
    id: user._id,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const isProduction = process.env.NODE_ENV === 'production';

  // 7 days in milliseconds
  const cookieMaxAge = 7 * 24 * 60 * 60 * 1000;

  res.cookie('token', token, {
    httpOnly: true, // Prevents client-side script access, defending against XSS
    secure: isProduction, // Transmitted only via HTTPS in production
    sameSite: isProduction ? 'none' : 'lax', // Supports cross-site credentialed requests in prod
    maxAge: cookieMaxAge,
  });

  return token;
};

export default generateToken;
