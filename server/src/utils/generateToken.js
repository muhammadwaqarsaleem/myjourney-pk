/**
 * @fileoverview Utility for generating signed JSON Web Tokens (JWT) and
 * configuring secure, HTTP-only cookies on Express response objects.
 * 
 * ============================================================================
 * ACADEMIC DEFENSE & ARCHITECTURAL HIGHLIGHTS
 * ============================================================================
 * 1. Cryptographic Signing & Symmetric Secret Encryption:
 *    - Employs HMAC SHA-256 (`HS256`) via the `jsonwebtoken` library.
 *    - The payload encapsulates minimal identity claims (`id` and RBAC `role`).
 *    - Sensitive fields (hashed password, salt, reset tokens) are omitted to prevent
 *      information leakage even if payload base64 strings are decoded client-side.
 * 
 * 2. CSRF (Cross-Site Request Forgery) Neutralization via SameSite & JSON APIs:
 *    - `SameSite: 'lax'` prevents the browser from attaching the authentication cookie
 *      on cross-site subresource requests (such as unauthorized POST form submissions
 *      or `<img>`/`<iframe>` embeds from untrusted origins).
 *    - Combined with REST APIs requiring `Content-Type: application/json`, simple
 *      cross-origin requests are blocked because standard HTML forms cannot emit
 *      raw JSON payloads without triggering a CORS preflight (`OPTIONS`) handshake.
 * 
 * 3. Cross-Site Scripting (XSS) Token Defense:
 *    - `httpOnly: true` explicitly instructs the browser runtime that the cookie must
 *      never be accessible to client-side scripts via `document.cookie`.
 *    - Even if an attacker achieves arbitrary JavaScript execution via a reflected XSS flaw,
 *      the session token cannot be read, copied, or exfiltrated.
 * 
 * 4. Transport Security:
 *    - `secure: process.env.NODE_ENV === 'production'` ensures cookies are strictly
 *      transmitted over encrypted TLS/HTTPS channels in production environments.
 * 
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
    httpOnly: true,                          // Prevents client-side script access, defending against XSS exfiltration
    secure: isProduction,                    // Transmitted strictly over HTTPS in production
    sameSite: isProduction ? 'lax' : 'lax', // Lax policy neutralizes cross-site CSRF state-changing requests
    maxAge: cookieMaxAge,
    path: '/',                               // Scoped globally across API and client routes
  });

  return token;
};

export default generateToken;
