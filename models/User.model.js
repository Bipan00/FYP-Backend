/**
 * User Model
 * 
 * Purpose: Define the User schema for MongoDB with authentication features
 * This model handles user data storage, password hashing, and authentication.
 * 
 * Academic Note: This demonstrates:
 * - Mongoose schema definition
 * - Password security with bcrypt
 * - Pre-save hooks for data transformation
 * - Instance methods for password comparison
 * - Data sanitization (excluding password from responses)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * User Schema Definition
 * 
 * Fields:
 * - name: User's full name
 * - email: Unique email address (used for login)
 * - password: Hashed password (never stored in plain text)
 * - role: User type (Tenant, Owner, or Admin)
 * - timestamps: Automatically adds createdAt and updatedAt
 */
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters long'],
            maxlength: [50, 'Name cannot exceed 50 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address'
            ]
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters long'],
            select: false // Don't include password in queries by default
        },
        role: {
            type: String,
            enum: {
                values: ['Tenant', 'Owner', 'Admin'],
                message: 'Role must be either Tenant, Owner, or Admin'
            },
            default: 'Tenant',
            required: [true, 'Role is required']
        }
    },
    {
        timestamps: true // Automatically adds createdAt and updatedAt fields
    }
);

/**
 * Pre-save Hook: Hash Password
 * 
 * This middleware runs before saving a user document.
 * It hashes the password using bcrypt if the password field is modified.
 * 
 * Academic Note: This is a security best practice - never store
 * passwords in plain text. Bcrypt is a one-way hashing algorithm
 * designed specifically for password hashing.
 */
userSchema.pre('save', async function () {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return;
    }

    // Generate a salt (random data added to password before hashing)
    // Salt rounds: 10 is a good balance between security and performance
    const salt = await bcrypt.genSalt(10);

    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance Method: Compare Password
 * 
 * Compares a plain text password with the hashed password in the database.
 * Used during login to verify user credentials.
 * 
 * @param {string} candidatePassword - Plain text password to compare
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        // bcrypt.compare handles the hashing and comparison
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

/**
 * Transform JSON Output
 * 
 * Remove sensitive data (password) when converting to JSON.
 * This ensures passwords are never accidentally sent in API responses.
 */
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
