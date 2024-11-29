const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key'; // Secret key used for signing tokens

// Token verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(403).json({ message: 'Token is missing' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded; // Store the decoded token information
    next();
  });
};

module.exports = verifyToken;
