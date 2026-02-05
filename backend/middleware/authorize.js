const { getPermissionsByRole } = require('../utils/rbacUtils');

/**
 * Middleware to check user permissions and/or roles.
 *
 * Supports:
 * - authorize(PERMISSIONS.VIEW_USERS)
 * - authorize(['admin', 'marketing']) // role-only gate
 * - authorize(['marketing'], PERMISSIONS.VIEW_ENQUIRIES)
 */
const authorize = (rolesOrPermission, maybePermission) => {
  const roles = Array.isArray(rolesOrPermission) ? rolesOrPermission : null;
  const requiredPermission = roles ? maybePermission : rolesOrPermission;

  return (req, res, next) => {
    try {
      const userRole = req.user.role_name;

      if (roles && !roles.includes(userRole)) {
        return res.status(403).json({
          message: 'Access denied. You do not have the required role.',
          requiredRoles: roles,
          userRole,
        });
      }

      if (requiredPermission) {
        const userPermissions = getPermissionsByRole(userRole);
        if (!userPermissions.includes(requiredPermission)) {
          return res.status(403).json({
            message: 'Access denied. You do not have the required permission.',
            requiredPermission,
            userRole,
          });
        }
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ message: 'Authorization error' });
    }
  };
};

module.exports = authorize;
