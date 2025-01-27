const jwt = require('jsonwebtoken');

// Middleware to validate JWT token
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from "Bearer <token>"
  if (!token) {
    return res.status(403).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user info to the request object
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { verifyToken };
