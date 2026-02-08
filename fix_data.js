
const mongoose = require('mongoose');
const Listing = require('./models/listing.model');
require('dotenv').config({ path: './.env' });

const fixListing = async () => {
    try {
        console.log('Connecting to MongoDB...', process.env.MONGODB_URI ? 'URI found' : 'URI missing');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the listing with typo 'Appartment'
        const listing = await Listing.findOne({ title: { $regex: /Appartment/i } });

        if (listing) {
            console.log('Found listing:', listing.title, 'Current Type:', listing.type);

            // Update type to Apartment and fix title typo
            listing.type = 'Apartment';
            listing.title = listing.title.replace('Appartment', 'Apartment');

            await listing.save();
            console.log('Successfully updated listing to:', listing.title, 'Type:', listing.type);
        } else {
            console.log('No listing found with title containing "Appartment"');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

fixListing();
