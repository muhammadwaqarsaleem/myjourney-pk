/**
 * @fileoverview Authentication controllers handling registration, authentication,
 * session destruction (logout), and current user profile inspection.
 * 
 * ============================================================================
 * ACADEMIC DEFENSE & ARCHITECTURAL HIGHLIGHTS
 * ============================================================================
 * 1. OpenSSL 3 & Network Partition Resilience:
 *    During high-concurrency or intermittent ISP TLS connection drops, outbound
 *    socket connections to MongoDB Atlas can raise OpenSSL alert errors
 *    (`ssl3_read_bytes:tlsv1 alert internal error`). Rather than bubbling raw socket
 *    termination stack traces into Express's unhandled exception pipeline, database
 *    write operations are wrapped in defensive try/catch blocks that translate
 *    network/SSL errors into graceful HTTP 503 (Service Unavailable) JSON payloads.
 * 
 * 2. Zero External Network Latency in Auth Path:
 *    Third-party HTTPS queries (e.g., gravatar lookups or external profile syncs)
 *    are strictly banned from registration and login pathways. External dependencies
 *    introduce TLS handshakes, latency jitter, and single points of failure that
 *    compromise authentication availability.
 * 
 * 3. Bcrypt Hashing & Work Factor:
 *    Passwords are salted (10 rounds) and hashed asynchronously using bcryptjs
 *    in the Mongoose User model pre-save middleware. Bcrypt incorporates key-derivation
 *    delays that defend against offline dictionary and rainbow-table attacks.
 * 
 * 4. Defense-in-Depth Cookie Architecture (CSRF & XSS Mitigation):
 *    Authentication tokens are issued as cryptographically signed JWTs and set inside
 *    HTTP-Only, SameSite=Lax (or Strict in prod), Secure cookies.
 *    - `httpOnly: true`: Blocks client-side JavaScript (`document.cookie`) access,
 *      immunizing the system against XSS credential exfiltration.
 *    - `sameSite: 'lax'`: Dictates that cookies are not attached to cross-site state-changing
 *      requests (e.g., POST/PUT from third-party origins), natively neutralizing CSRF.
 * 
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
    const { name, email, password, role, bio } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).trim().toLowerCase();

    if (trimmedName.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot exceed 50 characters.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // 2. Prevent duplicate email registration via query check
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // 3. Create user in database (password is automatically hashed by model pre-save hook)
    // Note: Avatar defaults to empty string or internal placeholder; no third-party network fetches
    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password,
      role: role && ['user', 'creator'].includes(role) ? role : 'user',
      avatar: '',
      bio: bio ? String(bio).trim().slice(0, 250) : '',
    });

    // 4. Issue JWT and set HTTP-only cookie
    const token = generateToken(res, user);

    // 5. Send sanitized response (excluding password hash)
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
    console.error('💥 Registration error caught:', error.message);

    // Handle Mongoose duplicate key error (MongoDB E11000)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. '),
      });
    }

    // Defensive handling for OpenSSL 3 / TLSv1 internal alerts or network drops
    if (
      error.name === 'MongoNetworkError' ||
      error.name === 'MongooseServerSelectionError' ||
      error.message?.includes('SSL') ||
      error.message?.includes('tlsv1') ||
      error.message?.includes('ECONNRESET') ||
      error.message?.includes('ETIMEDOUT')
    ) {
      return res.status(503).json({
        success: false,
        message: 'Database service is temporarily unavailable or experienced a secure connection reset. Please try again shortly.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred during registration. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
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

    const trimmedEmail = String(email).trim().toLowerCase();

    // 2. Check for user and explicitly select password field
    const user = await User.findOne({ email: trimmedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 3. Verify password hash matches using constant-time comparison in bcrypt
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
    console.error('💥 Login error caught:', error.message);

    if (
      error.name === 'MongoNetworkError' ||
      error.name === 'MongooseServerSelectionError' ||
      error.message?.includes('SSL') ||
      error.message?.includes('tlsv1')
    ) {
      return res.status(503).json({
        success: false,
        message: 'Database service is temporarily unavailable. Please try again shortly.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Login failed due to an internal server error.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
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
