const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    },
    message: {
        type: String,
        maxlength: 500
    }
}, { timestamps: true });

// Prevent duplicate bookings from same tenant for same listing
bookingSchema.index({ listingId: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
