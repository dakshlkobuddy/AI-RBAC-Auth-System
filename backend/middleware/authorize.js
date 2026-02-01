const { getPermissionsByRole } = require('../utils/rbacUtils');

/**
 * Middleware to check user permissions
 * Usage: authorize(PERMISSIONS.VIEW_USERS)
 */
const authorize = (requiredPermission) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role_name;
      const userPermissions = getPermissionsByRole(userRole);

      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({
          message: 'Access denied. You do not have the required permission.',
          requiredPermission,
          userRole,
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ message: 'Authorization error' });
    }
  };
};

module.exports = authorize;
