const { ROLE_PERMISSIONS } = require('../config/constants');
const Role = require('../models/Role');

// Check if user has permission
const hasPermission = (rolePermissions, requiredPermission) => {
  return rolePermissions && rolePermissions.includes(requiredPermission);
};

// Get permissions from role name
const getPermissionsByRole = (roleName) => {
  return ROLE_PERMISSIONS[roleName] || [];
};

module.exports = {
  hasPermission,
  getPermissionsByRole,
};
