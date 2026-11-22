/**
 * @fileoverview Database configuration and connection manager using Mongoose.
 * Provides a resilient connection helper with retry readiness, event listeners,
 * forced IPv4 family resolution, and graceful process termination handling for SIGINT and SIGTERM.
 * 
 * ============================================================================
 * ACADEMIC DEFENSE & ARCHITECTURAL HIGHLIGHTS
 * ============================================================================
 * 1. OpenSSL 3 & TLSv1 Internal Alert Mitigation:
 *    Local ISP and router DNS resolvers often attempt IPv6 (AAAA records) resolution
 *    for MongoDB Atlas SRV clusters. When intermediate NAT/firewalls terminate or
 *    reset IPv6 TCP streams, OpenSSL triggers `ssl3_read_bytes:tlsv1 alert internal error`.
 *    Specifying `family: 4` restricts the Node.js `dns.lookup` mechanism strictly
 *    to IPv4, bypassing corrupted IPv6 routing routes.
 * 
 * 2. Fail-Fast Server Selection:
 *    By default, Mongoose waits 30,000ms (`serverSelectionTimeoutMS`) before failing.
 *    Setting this to 5,000ms provides quick failure feedback to clients and orchestrators
 *    rather than hanging HTTP worker threads under network partitions.
 * 
 * 3. Connection Pooling:
 *    Mongoose transparently manages a MongoDB driver pool (default maxPoolSize: 100),
 *    reusing established TCP connections for subsequent pipeline queries rather than
 *    initiating expensive three-way handshakes per HTTP request.
 * 
 * 4. Graceful Degradation & Signal Traps:
 *    POSIX signal handlers (SIGINT, SIGTERM) catch process termination events and
 *    cleanly close database socket handles, allowing in-flight write operations
 *    to finalize and preventing database lock corruption.
 * @module config/db
 */

import mongoose from 'mongoose';
import dns from 'dns';

// Resolve MongoDB SRV records via reliable public DNS (prevents querySrv EREFUSED from ISP/router DNS)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if custom servers cannot be set in restricted runtime environments
}

/**
 * Establishes an asynchronous connection to MongoDB via Mongoose.
 * 
 * In modern Mongoose (v6+ through v9+), legacy options such as `useNewUrlParser`,
 * `useUnifiedTopology`, and `useCreateIndex` are default and deprecated.
 * This function connects using the connection URI defined in environment variables.
 *
 * @async
 * @function connectDB
 * @returns {Promise<typeof mongoose>} Resolves with the Mongoose instance on successful connection.
 */
export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('❌ MongoDB Connection Error: MONGO_URI is not defined in environment variables.');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return;
  }

  try {
    const connectionInstance = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s if DB server is unreachable
      family: 4,                      // Force IPv4 to prevent local IPv6 dual-stack resolution & TLS handshake drops
      maxPoolSize: 10,               // Standard connection pool limit for containerized microservice efficiency
      socketTimeoutMS: 45000,        // Close sockets after 45 seconds of inactivity
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
