/**
 * @fileoverview User model definition and schema configuration for MongoDB.
 * Implements password hashing via bcryptjs, credential comparison,
 * and role-based access attributes (user, creator, admin).
 * @module models/User
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'creator', 'admin'],
        message: '{VALUE} is not a valid role. Allowed roles: user, creator, admin',
      },
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: [250, 'Bio cannot exceed 250 characters'],
    },
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'bookmarkModel',
      },
    ],
    bookmarkModel: {
      type: String,
      default: 'Destination',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save Mongoose middleware hook.
 * Hashes the user password using bcryptjs whenever the password field is modified.
 */
userSchema.pre('save', async function (next) {
  // Only hash password if it has been modified or is new
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compares an entered plain-text password with the hashed password stored in the database.
 *
 * @param {string} enteredPassword - Plaintext candidate password to evaluate.
 * @returns {Promise<boolean>} True if password matches the hash, false otherwise.
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
