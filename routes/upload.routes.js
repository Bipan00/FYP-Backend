/**
 * Upload Routes
 * 
 * Purpose: Define API routes for image uploads
 * Routes handle file uploads with authentication and ownership verification.
 */

const express = require('express');
const router = express.Router();
const { uploadImages } = require('../controllers/upload.controller');
const upload = require('../middleware/upload.middleware');
const { protect, requireOwner } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/upload/images
 * @desc    Upload multiple images
 * @access  Protected (Owner)
 * @middleware
 *  - protect: Verify JWT
 *  - requireOwner: Verify Owner role
 *  - upload.array('images', 10): Process up to 10 image files
 */
router.post(
    '/images',
    protect,
    requireOwner,
    upload.array('images', 10), // Expect 'images' field, max 10 files
    uploadImages
);

module.exports = router;
