/**
 * Authentication Routes
 * 
 * Purpose: Define API routes for user authentication
 * Routes handle user registration and login.
 * 
 * Academic Note: This demonstrates RESTful API design
 * with proper HTTP methods and endpoint naming.
 */

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { name, email, password, role }
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', login);

// Export router
module.exports = router;
