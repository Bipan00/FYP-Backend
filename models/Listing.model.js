/**
 * Listing Model
 * 
 * Purpose: Define the Listing schema for property listings
 * This model handles property data storage, validation, and relationships.
 * 
 * Academic Note: This demonstrates:
 * - MongoDB schema design with relationships
 * - Comprehensive data validation
 * - Reference to other models (User)
 * - Geolocation data storage
 * - Approval workflow pattern
 */

const mongoose = require('mongoose');

/**
 * Listing Schema Definition
 * 
 * Fields:
 * - title: Property title/name
 * - description: Detailed property description
 * - price: Monthly rent in NPR
 * - location: Address/location string
 * - latitude/longitude: GPS coordinates for map display
 * - type: Property type (Room or Hostel)
 * - images: Array of image URLs
 * - ownerId: Reference to User who owns this listing
 * - isApproved: Admin approval status
 * - timestamps: Automatically adds createdAt and updatedAt
 */
const listingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: [5, 'Title must be at least 5 characters long'],
            maxlength: [100, 'Title cannot exceed 100 characters']
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            minlength: [20, 'Description must be at least 20 characters long'],
            maxlength: [2000, 'Description cannot exceed 2000 characters']
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price must be a positive number']
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true
        },
        latitude: {
            type: Number,
            min: [-90, 'Latitude must be between -90 and 90'],
            max: [90, 'Latitude must be between -90 and 90']
        },
        longitude: {
            type: Number,
            min: [-180, 'Longitude must be between -180 and 180'],
            max: [180, 'Longitude must be between -180 and 180']
        },
        type: {
            type: String,
            enum: {
                values: ['Room', 'Hostel', 'Apartment', 'Flat'],
                message: 'Type must be either Room, Hostel, Apartment, or Flat'
            },
            required: [true, 'Type is required']
        },
        images: {
            type: [String],
            default: [],
            validate: {
                validator: function (arr) {
                    // Each image URL should be a valid string
                    return arr.every(url => typeof url === 'string' && url.length > 0);
                },
                message: 'All image URLs must be valid strings'
            }
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Owner ID is required']
        },
        isApproved: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true // Automatically adds createdAt and updatedAt fields
    }
);

/**
 * Index for faster queries
 * - ownerId: For getting owner's listings
 * - isApproved: For filtering approved listings
 * - createdAt: For sorting by date
 */
listingSchema.index({ ownerId: 1 });
listingSchema.index({ isApproved: 1 });
listingSchema.index({ createdAt: -1 });

/**
 * Virtual field: Get owner details
 * This allows us to populate owner information when needed
 */
listingSchema.virtual('owner', {
    ref: 'User',
    localField: 'ownerId',
    foreignField: '_id',
    justOne: true
});

/**
 * Transform JSON Output
 * Include virtual fields when converting to JSON
 */
listingSchema.set('toJSON', { virtuals: true });
listingSchema.set('toObject', { virtuals: true });

// Create and export the Listing model
const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
