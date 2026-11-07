/**
 * @fileoverview User model definition and schema configuration for MongoDB.
 * Implements password hashing via bcryptjs, credential comparison,
 * and role-based access control attributes (user, creator, admin).
 * Bookmarks are stored as separate ObjectId arrays for destinations and hotels.
 * @module models/User
 */

// External dependencies
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Schema definition
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
    // Structured bookmarks split by item type for independent population
    bookmarks: {
      destinations: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Destination',
        },
      ],
      hotels: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Hotel',
        },
      ],
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
 * Pre-save hook: hashes the password using bcryptjs whenever the password field is modified.
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compares a plain-text candidate password against the stored hash.
 *
 * @param {string} enteredPassword - Plaintext password to evaluate.
 * @returns {Promise<boolean>} True if the password matches, false otherwise.
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
