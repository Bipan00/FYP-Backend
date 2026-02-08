/**
 * Listing Routes
 * 
 * Purpose: Define API routes for property listing management
 * Routes handle listing CRUD operations with proper authentication.
 * 
 * Academic Note: This demonstrates RESTful API design with
 * proper HTTP methods, route protection, and role-based access.
 */

const express = require('express');
const router = express.Router();
const {
    createListing,
    getOwnerListings,
    getAllListings,
    getListingById,
    updateListing,
    deleteListing,
    getAdminListings,
    updateListingStatus
} = require('../controllers/listing.controller');
const { protect, requireOwner, requireAdmin } = require('../middleware/auth.middleware');

/**
 * Public Routes
 */

/**
 * @route   GET /api/listings
 * @desc    Get all approved listings (for tenant browsing)
 * @access  Public
 */
router.get('/', getAllListings);

/**
 * Protected Routes (Owner Only)
 * All routes below require authentication and Owner role
 */

/**
 * @route   POST /api/listings
 * @desc    Create a new listing
 * @access  Protected (Owner)
 * @body    { title, description, price, location, latitude, longitude, type, images }
 */
router.post('/', protect, requireOwner, createListing);

/**
 * @route   GET /api/listings/my-listings
 * @desc    Get all listings for authenticated owner
 * @access  Protected (Owner)
 */
router.get('/my-listings', protect, requireOwner, getOwnerListings);

/**
 * @route   PUT /api/listings/:id
 * @desc    Update a listing
 * @access  Protected (Owner, must be owner of listing)
 * @body    { title, description, price, location, latitude, longitude, type, images }
 */
router.put('/:id', protect, requireOwner, updateListing);

/**
 * @route   DELETE /api/listings/:id
 * @desc    Delete a listing
 * @access  Protected (Owner, must be owner of listing)
 */
router.delete('/:id', protect, requireOwner, deleteListing);


/**
 * Admin Routes
 * Protected (Admin Only)
 */

/**
 * @route   GET /api/listings/admin/all
 * @desc    Get all listings for admin dashboard
 * @access  Protected (Admin)
 */
router.get('/admin/all', protect, requireAdmin, getAdminListings);

/**
 * @route   PATCH /api/listings/:id/status
 * @desc    Approve or reject a listing
 * @access  Protected (Admin)
 * @body    { isApproved: true/false }
 */
router.patch('/:id/status', protect, requireAdmin, updateListingStatus);

/**
 * @route   GET /api/listings/:id
 * @desc    Get single listing details
 * @access  Public
 * Note: This must be at the bottom to avoid catching other routes
 */
router.get('/:id', getListingById);

module.exports = router;
