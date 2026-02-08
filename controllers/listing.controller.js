/**
 * Listing Controller
 * 
 * Purpose: Handle all property listing CRUD operations
 * This controller manages listing creation, retrieval, updates, and deletion.
 * 
 * Academic Note: This demonstrates:
 * - CRUD operations in Express
 * - Authorization and ownership verification
 * - Input validation
 * - Error handling patterns
 * - RESTful API design
 */

const Listing = require('../models/listing.model');
const cloudinary = require('../config/cloudinary');

/**
 * Create New Listing
 * 
 * @route   POST /api/listings
 * @desc    Create a new property listing (Owner only)
 * @access  Protected (Owner)
 */
const createListing = async (req, res) => {
    try {
        const { title, description, price, location, latitude, longitude, type, images } = req.body;

        // 1. Validate required fields
        if (!title || !description || !price || !location || !type) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: title, description, price, location, type'
            });
        }

        // 2. Validate price
        if (price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a positive number'
            });
        }

        // 3. Validate type
        if (!['Room', 'Hostel', 'Apartment', 'Flat'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Type must be either Room, Hostel, Apartment, or Flat'
            });
        }

        // 4. Create listing with ownerId from authenticated user
        const listing = await Listing.create({
            title,
            description,
            price,
            location,
            latitude,
            longitude,
            type,
            images: images || [],
            ownerId: req.user._id, // Set from authenticated user
            isApproved: true // Auto-approve for development
        });

        // 5. Send success response
        res.status(201).json({
            success: true,
            message: 'Listing created successfully',
            data: listing
        });

    } catch (error) {
        console.error('Create Listing Error:', error);

        // Handle validation errors from Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        // Generic error response
        res.status(500).json({
            success: false,
            message: 'Failed to create listing. Please try again.'
        });
    }
};

/**
 * Get Owner's Listings
 * 
 * @route   GET /api/listings/my-listings
 * @desc    Get all listings for authenticated owner
 * @access  Protected (Owner)
 */
const getOwnerListings = async (req, res) => {
    try {
        // Find all listings for this owner, sorted by newest first
        const listings = await Listing.find({ ownerId: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: listings.length,
            data: listings
        });

    } catch (error) {
        console.error('Get Owner Listings Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch listings. Please try again.'
        });
    }
};

/**
 * Get All Approved Listings
 * 
 * @route   GET /api/listings
 * @desc    Get all approved listings (for tenant browsing)
 * @access  Public
 */
const getAllListings = async (req, res) => {
    try {
        const { type, minPrice, maxPrice, search } = req.query;

        // Build Query
        // let query = {}; // Show all listings for development
        let query = { isApproved: true }; // Original: Only show approved

        // Filter by Type
        if (type && type !== 'All') {
            query.type = type;
        }

        // Filter by Price Range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Search (Title or Location)
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { title: searchRegex },
                { location: searchRegex }
            ];
        }

        // Find listings matching query
        const listings = await Listing.find(query)
            .populate('ownerId', 'name email') // Include owner name and email
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: listings.length,
            data: listings
        });

    } catch (error) {
        console.error('Get All Listings Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch listings. Please try again.'
        });
    }
};

/**
 * Update Listing
 * 
 * @route   PUT /api/listings/:id
 * @desc    Update a listing (Owner only, must be owner of listing)
 * @access  Protected (Owner)
 */
const updateListing = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, location, latitude, longitude, type, images } = req.body;

        // 1. Find listing
        const listing = await Listing.findById(id);

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
        }

        // 2. Verify ownership (only owner can update their listing)
        if (listing.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this listing'
            });
        }

        // 3. Validate price if provided
        if (price !== undefined && price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a positive number'
            });
        }

        // 4. Validate type if provided
        if (type && !['Room', 'Hostel', 'Apartment', 'Flat'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Type must be either Room, Hostel, Apartment, or Flat'
            });
        }

        // 5. Update listing fields
        if (title) listing.title = title;
        if (description) listing.description = description;
        if (price) listing.price = price;
        if (location) listing.location = location;
        if (latitude !== undefined) listing.latitude = latitude;
        if (longitude !== undefined) listing.longitude = longitude;
        if (type) listing.type = type;
        if (images) listing.images = images;

        // 6. Save updated listing
        await listing.save();

        // 7. Send success response
        res.status(200).json({
            success: true,
            message: 'Listing updated successfully',
            data: listing
        });

    } catch (error) {
        console.error('Update Listing Error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid listing ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update listing. Please try again.'
        });
    }
};

/**
 * Helper to extract public ID from Cloudinary URL
 */
const getPublicIdFromUrl = (url) => {
    try {
        // Example: https://res.cloudinary.com/.../upload/v123/gharsathi/listings/abc.jpg
        const splitUrl = url.split('/');
        const filename = splitUrl[splitUrl.length - 1]; // abc.jpg
        const publicId = filename.split('.')[0]; // abc
        // We know our structure is gharsathi/listings/
        return `gharsathi/listings/${publicId}`;
    } catch (error) {
        return null;
    }
};

/**
 * Delete Listing
 * 
 * @route   DELETE /api/listings/:id
 * @desc    Delete a listing (Owner only, must be owner of listing)
 * @access  Protected (Owner)
 */
const deleteListing = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Find listing
        const listing = await Listing.findById(id);

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
        }

        // 2. Verify ownership (only owner can delete their listing)
        if (listing.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this listing'
            });
        }

        // 3. Delete images from Cloudinary
        if (listing.images && listing.images.length > 0) {
            const deletePromises = listing.images.map(url => {
                const publicId = getPublicIdFromUrl(url);
                if (publicId) {
                    return cloudinary.uploader.destroy(publicId);
                }
            });
            await Promise.all(deletePromises);
        }

        // 4. Delete listing
        await Listing.findByIdAndDelete(id);

        // 5. Send success response
        res.status(200).json({
            success: true,
            message: 'Listing deleted successfully'
        });

    } catch (error) {
        console.error('Delete Listing Error:', error);

        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid listing ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to delete listing. Please try again.'
        });
    }
};

// Export controller functions
/**
 * Get Admin Listings (All Listings)
 * 
 * @route   GET /api/listings/admin/all
 * @desc    Get all listings including pending/rejected (Admin only)
 * @access  Protected (Admin)
 */
const getAdminListings = async (req, res) => {
    try {
        // Fetch all listings sorted by newest first
        const listings = await Listing.find({})
            .populate('ownerId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: listings.length,
            data: listings
        });
    } catch (error) {
        console.error('Get Admin Listings Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch listings'
        });
    }
};

/**
 * Update Listing Status (Approve/Reject)
 * 
 * @route   PATCH /api/listings/:id/status
 * @desc    Update listing approval status (Admin only)
 * @access  Protected (Admin)
 */
const updateListingStatus = async (req, res) => {
    try {
        const { isApproved } = req.body;
        const { id } = req.params;

        if (typeof isApproved !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Invalid status provided'
            });
        }

        const listing = await Listing.findByIdAndUpdate(
            id,
            { isApproved },
            { new: true }
        );

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Listing ${isApproved ? 'approved' : 'rejected'} successfully`,
            data: listing
        });
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update listing status'
        });
    }
};

/**
 * Get Single Listing by ID
 * 
 * @route   GET /api/listings/:id
 * @desc    Get listing details by ID
 * @access  Public
 */
const getListingById = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate('ownerId', 'name email');

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
        }

        res.status(200).json({
            success: true,
            data: listing
        });
    } catch (error) {
        console.error('Get Listing By ID Error:', error);

        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid listing ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to fetch listing details'
        });
    }
};

// Export controller functions
module.exports = {
    createListing,
    getOwnerListings,
    getAllListings,
    getListingById,
    updateListing,
    deleteListing,
    getAdminListings,
    updateListingStatus
};
