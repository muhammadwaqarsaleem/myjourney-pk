/**
 * @fileoverview Authentication controllers handling registration, authentication,
 * session destruction (logout), and current user profile inspection.
 * @module controllers/authController
 */

import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register a new user account
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, avatar, bio } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // 2. Prevent duplicate email registration
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // 3. Create user in database (password is automatically hashed by pre-save hook)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'user',
      avatar: avatar || '',
      bio: bio || '',
    });

    // 4. Issue JWT and set HTTP-only cookie
    const token = generateToken(res, user);

    // 5. Send sanitized response (excluding password)
    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        bookmarks: user.bookmarks,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. '),
      });
    }
    next(error);
  }
};

/**
 * @desc    Authenticate user & retrieve token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate presence of credentials
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // 2. Check for user and explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 3. Verify password hash matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 4. Issue JWT and set HTTP-only cookie
    const token = generateToken(res, user);

    // 5. Respond with sanitized user data
    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        bookmarks: user.bookmarks,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out user & clear HTTP-only auth cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0), // Instantly expire cookie
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * @desc    Retrieve currently authenticated user's profile
 * @route   GET /api/auth/me
 * @access  Private (Requires JWT via protect middleware)
 */
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

export default {
  register,
  login,
  logout,
  getMe,
};
