/**
 * Test Routes
 * 
 * Purpose: Define API routes for testing backend connectivity
 * Routes map HTTP requests to controller functions.
 * 
 * Academic Note: Separating routes from controllers and server logic
 * makes the codebase modular and easier to maintain. Each route file
 * can handle a specific feature or resource.
 */

const express = require('express');
const router = express.Router();
const { getTestData } = require('../controllers/test.controller');

/**
 * @route   GET /api/test
 * @desc    Test endpoint to verify API is running
 * @access  Public
 */
router.get('/', getTestData);

// Export router to be used in server.js
module.exports = router;
