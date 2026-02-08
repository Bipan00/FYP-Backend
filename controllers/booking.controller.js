const Booking = require('../models/booking.model');
const Listing = require('../models/listing.model');

// Create a new booking request
const createBooking = async (req, res) => {
    try {
        const { listingId, message } = req.body;
        const tenantId = req.user._id;

        // Check if listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        // Prevent owner from booking their own listing
        if (listing.ownerId.toString() === tenantId.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot book your own listing' });
        }

        // Check for existing booking
        const existingBooking = await Booking.findOne({ listingId, tenantId });
        if (existingBooking) {
            return res.status(400).json({ success: false, message: 'You have already sent a request for this listing' });
        }

        const booking = await Booking.create({
            listingId,
            tenantId,
            ownerId: listing.ownerId,
            message
        });

        res.status(201).json({
            success: true,
            message: 'Booking request sent successfully',
            data: booking
        });

    } catch (error) {
        console.error('Create Booking Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create booking request' });
    }
};

// Get bookings for an owner
const getOwnerBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ ownerId: req.user._id })
            .populate('listingId', 'title location images price')
            .populate('tenantId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error('Get Owner Bookings Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }
};

// Update booking status (Accept/Reject)
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const booking = await Booking.findOne({ _id: id, ownerId: req.user._id });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        booking.status = status;
        await booking.save();

        res.status(200).json({
            success: true,
            message: `Booking request ${status.toLowerCase()}`,
            data: booking
        });

    } catch (error) {
        console.error('Update Booking Status Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update booking status' });
    }
};

module.exports = {
    createBooking,
    getOwnerBookings,
    updateBookingStatus
};
