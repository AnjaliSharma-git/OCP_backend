const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }
    
    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        req.user = decoded; // Add user data to request object
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
};
