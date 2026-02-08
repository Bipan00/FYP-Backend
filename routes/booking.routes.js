const express = require('express');
const router = express.Router();
const { createBooking, getOwnerBookings, updateBookingStatus } = require('../controllers/booking.controller');
const { protect, requireOwner } = require('../middleware/auth.middleware');

// Create booking (Any authenticated user can book, except owner of listing handled in controller)
router.post('/', protect, createBooking);

// Get requests for my listings (Owner only)
router.get('/owner', protect, requireOwner, getOwnerBookings);

// Update request status (Owner only)
router.patch('/:id/status', protect, requireOwner, updateBookingStatus);

module.exports = router;
