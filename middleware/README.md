# Middleware Directory

This directory will contain custom Express middleware functions.

**Purpose:** Handle cross-cutting concerns like authentication, validation, and error handling.

**Future Middleware:**
- `auth.middleware.js` - JWT authentication verification
- `validate.middleware.js` - Request data validation
- `upload.middleware.js` - File upload handling (property images)
- `errorHandler.middleware.js` - Centralized error handling

**Example Structure:**
```javascript
// Example authentication middleware
const authMiddleware = (req, res, next) => {
    // Verify JWT token
    // Attach user to request object
    // Call next() or return error
};

module.exports = authMiddleware;
```

Middleware will be created as features are implemented in future phases.
