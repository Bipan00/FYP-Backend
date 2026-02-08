/**
 * Upload Controller
 * 
 * Purpose: Handle image uploads to Cloudinary
 * 
 * Flow:
 * 1. Receive files from multer middleware (req.files)
 * 2. Upload each file to Cloudinary in parallel
 * 3. Return array of secure image URLs
 * 
 * Academic Note: This demonstrates secure file handling, 
 * streaming uploads, and parallel asynchronous operations.
 */

const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Helper function to upload a single buffer to Cloudinary
 * Uses streamifier to convert buffer to stream for Cloudinary upload
 */
const uploadStream = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'gharsathi/listings', // Organized folder structure
                resource_type: 'image',
                transformation: [{ width: 1200, height: 800, crop: 'limit' }] // Optimize images
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

/**
 * Upload Images
 * 
 * @route   POST /api/upload/images
 * @desc    Upload multiple images to Cloudinary
 * @access  Protected (Owner)
 */
const uploadImages = async (req, res) => {
    try {
        // Check if files exist
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No image files provided'
            });
        }

        // Upload all files in parallel
        const uploadPromises = req.files.map(file => uploadStream(file.buffer));

        // Wait for all uploads to complete
        const results = await Promise.all(uploadPromises);

        // Extract secure URLs
        const imageUrls = results.map(result => result.secure_url);

        res.status(200).json({
            success: true,
            message: 'Images uploaded successfully',
            count: imageUrls.length,
            data: imageUrls
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload images. Please try again.',
            error: error.message
        });
    }
};

module.exports = {
    uploadImages
};
