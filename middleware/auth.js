const jwt = require('jsonwebtoken');

/**
 * Middleware to verify and authenticate JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if the Authorization header is provided and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token from the header

  try {
    // Verify token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is set in your environment
    req.user = decoded; // Attach decoded token data to request object for use in next middleware/handler
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    // Handle token verification errors
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = { verifyToken }; // Export as an object for easy imports
