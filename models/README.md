# Models Directory

This directory will contain Mongoose schema models for the database.

**Purpose:** Define data structures and schemas for MongoDB collections.

**Future Models:**
- User model (for authentication)
- Property model (for rental listings)
- Booking model (for reservations)
- Review model (for property reviews)

**Example Structure:**
```javascript
const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
    field1: String,
    field2: Number,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Example', exampleSchema);
```

Models will be created as features are implemented in future phases.
