/**
 * @fileoverview Authentication and Role-Based Access Control (RBAC) middleware.
 * Verifies JWT from HTTP-only cookies or Authorization headers and guards routes based on roles.
 * @module middleware/authMiddleware
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to authenticate requests via JWT.
 * Inspects both `req.cookies.token` and `req.headers.authorization`.
 * Attaches the authenticated user document (without password) to `req.user`.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @returns {Promise<void>}
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Check HTTP-only cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Check Authorization Bearer header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No authentication token provided.',
    });
  }

  try {
    // Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user without password
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Attach authenticated user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid or expired token.',
      error: error.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token',
    });
  }
};

/**
 * Role-Based Access Control (RBAC) middleware factory.
 * Restricts route access to users possessing specified roles.
 *
 * @param {...string} roles - Permitted roles (e.g. 'admin', 'creator').
 * @returns {import('express').RequestHandler}
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to authorization check.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route. Requires: [${roles.join(', ')}]`,
      });
    }

    next();
  };
};

export default { protect, authorize };
