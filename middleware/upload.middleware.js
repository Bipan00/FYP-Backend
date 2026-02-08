/**
 * Upload Middleware
 * 
 * Purpose: Configure Multer for handling file uploads
 * - Uses memory storage to process files before uploading to Cloudinary
 * - Filters for image files only
 * - Limits file size to 5MB
 */

const multer = require('multer');

// Configure storage (Memory storage for processing before Cloudinary upload)
const storage = multer.memoryStorage();

// File filter (Accept only images)
const fileFilter = (req, file, cb) => {
    // Check MIME type
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

// Configure limits
const limits = {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
};

// Create multer instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: limits
});

module.exports = upload;
