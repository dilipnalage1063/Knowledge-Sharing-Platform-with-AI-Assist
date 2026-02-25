const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token
 */
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized to access this route" });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

        // Attach user info to request
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Token verification failed" });
    }
};

module.exports = protect;
