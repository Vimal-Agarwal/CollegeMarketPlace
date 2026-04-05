// ============================================================
//  middleware/authMiddleware.js
//  Verifies JWT token on protected routes
// ============================================================

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check Authorization header for Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. Please login.' });
  }

  try {
    // Verify token and decode user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request so routes can use req.user
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token is invalid or expired.' });
  }
};

module.exports = { protect };
