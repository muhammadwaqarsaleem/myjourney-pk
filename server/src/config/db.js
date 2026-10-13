/**
 * @fileoverview Database configuration and connection manager using Mongoose.
 * Provides a resilient connection helper with retry readiness, event listeners,
 * and graceful process termination handling for SIGINT and SIGTERM.
 * @module config/db
 */

import mongoose from 'mongoose';

/**
 * Establishes an asynchronous connection to MongoDB via Mongoose.
 * 
 * In modern Mongoose (v6+), legacy options such as `useNewUrlParser`,
 * `useUnifiedTopology`, and `useCreateIndex` are default and deprecated.
 * This function connects using the connection URI defined in environment variables.
 *
 * @async
 * @function connectDB
 * @returns {Promise<typeof mongoose>} Resolves with the Mongoose instance on successful connection.
 * @throws {Error} Throws and terminates process if connection fails initially.
 */
export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('❌ MongoDB Connection Error: MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    const connectionInstance = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s if DB server is unreachable
    });

    console.log(
      `✅ MongoDB Connected Successfully: Host -> ${connectionInstance.connection.host} | DB -> ${connectionInstance.connection.name}`
    );

    // Setup connection-level event listeners for runtime connection disruptions
    mongoose.connection.on('error', (err) => {
      console.error(`⚠️ MongoDB runtime error encountered: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB connection lost. Attempting reconnection or waiting for network recovery...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB connection re-established.');
    });

    return connectionInstance;
  } catch (error) {
    console.error(`❌ MongoDB Initial Connection Failed: ${error.message}`);
    console.warn('⚠️ Server will continue running, but DB-dependent features require an active MongoDB instance.');
    console.warn('👉 Check your MONGO_URI in .env or ensure MongoDB is running (e.g., local mongod or MongoDB Atlas).');

    // In production environments, exit immediately to trigger container restart or alert orchestrators
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

/**
 * Handles graceful shutdown of the MongoDB connection when the Node process
 * receives a termination signal (e.g., Ctrl+C in terminal or container termination).
 *
 * @param {string} signal - The signal received (e.g., 'SIGINT', 'SIGTERM').
 * @returns {Promise<void>}
 */
const handleGracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown of MongoDB connection...`);
  try {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection successfully closed. Clean process exit.');
    process.exit(0);
  } catch (err) {
    console.error(`❌ Error occurred during MongoDB disconnect on ${signal}: ${err.message}`);
    process.exit(1);
  }
};

// Listen for process termination signals for resilient resource clean-up
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));

export default connectDB;
