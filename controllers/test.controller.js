/**
 * Test Controller
 * 
 * Purpose: Handle test API endpoint requests
 * This controller provides a simple endpoint to verify that the
 * backend API is running and accessible from the frontend.
 * 
 * Academic Note: Controllers handle the business logic and send
 * responses. This follows the MVC (Model-View-Controller) pattern.
 */

/**
 * Test API Endpoint Handler
 * 
 * @route   GET /api/test
 * @desc    Returns API status and server information
 * @access  Public
 */
const getTestData = (req, res) => {
    try {
        // Prepare response data
        const responseData = {
            success: true,
            message: '🏠 GharSathi API is running successfully!',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            version: '1.0.0'
        };

        // Send JSON response with 200 status code
        res.status(200).json(responseData);

    } catch (error) {
        // Handle any unexpected errors
        console.error('Error in test controller:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Export controller functions
module.exports = {
    getTestData
};
