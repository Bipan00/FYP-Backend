/**
 * Authentication Controller
 * 
 * Purpose: Handle user registration and login with JWT authentication
 * This controller manages user authentication, token generation, and validation.
 * 
 * Academic Note: This demonstrates:
 * - User registration with validation
 * - Secure password handling
 * - JWT token generation and management
 * - Error handling for authentication flows
 * - RESTful API response patterns
 */

const User = require('../models/User.model');
const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token
 * 
 * Creates a JSON Web Token containing the user's ID.
 * The token is signed with a secret key and expires in 7 days.
 * 
 * @param {string} userId - MongoDB user ID
 * @returns {string} - Signed JWT token
 */
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId }, // Payload: user ID
        process.env.JWT_SECRET, // Secret key from environment variables
        { expiresIn: '7d' } // Token expires in 7 days
    );
};

/**
 * Register New User
 * 
 * @route   POST /api/auth/register
 * @desc    Create a new user account with hashed password
 * @access  Public
 */
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        // 2. Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // 3. Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered. Please login instead.'
            });
        }

        // 4. Validate role (if provided)
        const validRoles = ['Tenant', 'Owner', 'Admin'];
        const userRole = role || 'Tenant'; // Default to Tenant if not provided

        if (!validRoles.includes(userRole)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be Tenant, Owner, or Admin'
            });
        }

        // 5. Create new user (password will be hashed by pre-save hook)
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            role: userRole
        });

        // 6. Generate JWT token
        const token = generateToken(user._id);

        // 7. Send success response
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        console.error('Registration Error:', error);

        // Handle validation errors from Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        // Handle duplicate key error (email already exists)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered. Please login instead.'
            });
        }

        // Generic error response
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
};

/**
 * Login User
 * 
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT token
 * @access  Public
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // --- DEV SHORTCUT: Auto-create Admin if not exists ---
        if (email === 'admin@gharsathi.com' && password === 'admin123') {
            const adminUser = await User.findOne({ email });
            if (!adminUser) {
                console.log('Creating default admin user...');
                await User.create({
                    name: 'System Admin',
                    email: 'admin@gharsathi.com',
                    password: 'admin123',
                    role: 'Admin'
                });
            }
        }
        // -----------------------------------------------------

        // 2. Find user by email (include password field for comparison)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // 3. Compare provided password with hashed password
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // 4. Generate JWT token
        const token = generateToken(user._id);

        // 5. Send success response
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
};

// Export controller functions
module.exports = {
    register,
    login
};
