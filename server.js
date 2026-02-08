/**
 * GharSathi Backend Server
 * 
 * Final Year Project - Academic Use Only
 * 
 * Purpose: Main server file for GharSathi rental platform API
 * This file initializes the Express server, connects to MongoDB,
 * sets up middleware, and defines API routes.
 * 
 * Tech Stack:
 * - Node.js + Express.js (Backend framework)
 * - MongoDB + Mongoose (Database)
 * - CORS (Cross-Origin Resource Sharing)
 * - Helmet (Security headers)
 * - Rate Limiting (API protection)
 */

// ============================================
// 1. IMPORT DEPENDENCIES
// ============================================
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import custom modules
const connectDB = require('./config/database');

// ============================================
// 2. INITIALIZE EXPRESS APP
// ============================================
const app = express();

// ============================================
// 3. MIDDLEWARE CONFIGURATION
// ============================================

/**
 * Body Parser Middleware
 * Parses incoming JSON requests and makes data available in req.body
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * CORS Middleware
 * Allows frontend (React) to communicate with backend API
 * In production, you should specify allowed origins
 */
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

/**
 * Helmet Middleware
 * Sets security-related HTTP headers to protect against common vulnerabilities
 */
app.use(helmet());

/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests from a single IP
 * Current: 100 requests per 15 minutes
 */
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// ============================================
// 4. CONNECT TO DATABASE
// ============================================
connectDB();

// Middleware to parse JSON bodies
// Increased limit to 50mb for handling base64 images if needed
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================
// 5. API ROUTES
// ============================================

/**
 * Root Route
 * Simple endpoint to verify server is running
 */
app.get('/', (req, res) => {
    res.json({
        message: '🏠 GharSathi API is running...',
        version: '1.0.0',
        status: 'active'
    });
});

/**
 * Test API Routes
 * Used to verify frontend-backend connectivity
 */
app.use('/api/test', require('./routes/test.routes'));

/**
 * Authentication Routes
 * User registration and login
 */
app.use('/api/auth', require('./routes/auth.routes'));

/**
 * Listing Routes
 * Property listing management
 */
app.use('/api/listings', require('./routes/listing.routes'));

/**
 * Upload Routes
 * Image upload handling
 */
app.use('/api/upload', require('./routes/upload.routes'));

/**
 * Booking Routes
 * Request management
 */
app.use('/api/bookings', require('./routes/booking.routes'));




// ============================================
// 6. ERROR HANDLING
// ============================================

/**
 * 404 Handler - Route Not Found
 */
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// 7. START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 GharSathi Server Started');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
