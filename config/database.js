/**
 * Database Configuration Module
 * 
 * Purpose: Centralized MongoDB connection logic for GharSathi
 * This module handles database connection with proper error handling
 * and clear logging for development and debugging.
 * 
 * Academic Note: Separating database config from server.js follows
 * the separation of concerns principle, making code more maintainable.
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB Database
 * @returns {Promise} MongoDB connection promise
 */
const connectDB = async () => {
    try {
        // Get MongoDB URI from environment variables
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://bipant45_db_user:R4ELyO6PaYqEZnSP@bipan.1jgntiu.mongodb.net/?appName=bipan';

        // Connect to MongoDB with modern connection options
        const conn = await mongoose.connect(mongoURI);

        // Log successful connection with database host info
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ MongoDB Connected Successfully');
        console.log(`📍 Database Host: ${conn.connection.host}`);
        console.log(`📦 Database Name: ${conn.connection.name}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (error) {
        // Log connection error with details
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ MongoDB Connection Failed');
        console.error('Error Message:', error.message);
        console.error('⚠️  WARNING: Server will start without database connection');
        console.error('⚠️  Database-dependent features will not work until connection is restored');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Don't exit - allow server to start for development
        // In production, you may want to exit: process.exit(1);
    }
};

// Export the connection function
module.exports = connectDB;
