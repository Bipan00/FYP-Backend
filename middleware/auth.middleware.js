/**
 * Authentication Middleware
 * 
 * Purpose: Protect routes and implement role-based access control
 * This middleware verifies JWT tokens and checks user permissions.
 * 
 * Academic Note: This demonstrates:
 * - JWT token verification
 * - Request authentication
 * - Role-based access control (RBAC)
 * - Middleware chaining in Express
 * - Security best practices
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

/**
 * Protect Middleware
 * 
 * Verifies JWT token and attaches authenticated user to request object.
 * This middleware should be used on all protected routes.
 * 
 * @middleware
 * @access Protected routes
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // 1. Check if token exists in Authorization header
        // Format: "Bearer <token>"
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            // Extract token from "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];
        }

        // 2. Check if token was provided
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please login to access this resource.'
            });
        }

        // 3. Verify token
        try {
            // Decode and verify the token using the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Find user by ID from token payload
            // Exclude password field from the result
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found. Please login again.'
                });
            }

            // 5. Attach user to request object for use in route handlers
            req.user = user;

            // 6. Continue to next middleware/route handler
            next();

        } catch (error) {
            // Token verification failed (invalid or expired)
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token. Please login again.'
                });
            }

            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired. Please login again.'
                });
            }

            throw error; // Re-throw other errors
        }

    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed. Please try again.'
        });
    }
};

/**
 * Require Owner Middleware
 * 
 * Checks if authenticated user has Owner or Admin role.
 * Must be used after the 'protect' middleware.
 * 
 * @middleware
 * @access Owner and Admin only
 */
const requireOwner = (req, res, next) => {
    // Check if user is authenticated (should be set by protect middleware)
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized. Please login first.'
        });
    }

    // Check if user role is Owner or Admin
    if (req.user.role !== 'Owner' && req.user.role !== 'Admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. This resource is only available to property owners.'
        });
    }

    // User has required role, continue to route handler
    next();
};

/**
 * Require Admin Middleware
 * 
 * Checks if authenticated user has Admin role.
 * Must be used after the 'protect' middleware.
 * 
 * @middleware
 * @access Admin only
 */
const requireAdmin = (req, res, next) => {
    // Check if user is authenticated (should be set by protect middleware)
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized. Please login first.'
        });
    }

    // Check if user role is Admin
    if (req.user.role !== 'Admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. This resource is only available to administrators.'
        });
    }

    // User has required role, continue to route handler
    next();
};

/**
 * Usage Examples:
 * 
 * // Protect a route (any authenticated user)
 * router.get('/profile', protect, getProfile);
 * 
 * // Owner-only route
 * router.post('/properties', protect, requireOwner, createProperty);
 * 
 * // Admin-only route
 * router.delete('/users/:id', protect, requireAdmin, deleteUser);
 */

// Export middleware functions
module.exports = {
    protect,
    requireOwner,
    requireAdmin
};
