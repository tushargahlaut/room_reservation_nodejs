// Middleware to check if the user has an admin role
function checkAdminRole(req, res, next) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    next(); // User is admin, continue to the next middleware
  }
  
  module.exports = { checkAdminRole };
  