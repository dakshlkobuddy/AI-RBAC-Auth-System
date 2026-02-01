const { verifyToken } = require('../utils/authUtils');
const User = require('../models/User');
const { getPermissionsByRole } = require('../utils/rbacUtils');

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Get user details
    const user = await User.getUserById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    req.userId = decoded.userId;
    req.roleId = decoded.roleId;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

module.exports = authenticate;
