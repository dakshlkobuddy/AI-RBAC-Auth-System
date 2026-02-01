const pool = require('../config/database');

// Get all roles
const getAllRoles = async () => {
  const query = `SELECT * FROM roles`;
  const result = await pool.query(query);
  return result.rows;
};

// Get role by ID
const getRoleById = async (roleId) => {
  const query = `SELECT * FROM roles WHERE id = $1`;
  const result = await pool.query(query, [roleId]);
  return result.rows[0];
};

// Get role by name
const getRoleByName = async (name) => {
  const query = `SELECT * FROM roles WHERE name = $1`;
  const result = await pool.query(query, [name]);
  return result.rows[0];
};

// Get permissions for a role
const getRolePermissions = async (roleId) => {
  const query = `SELECT permission FROM role_permissions WHERE role_id = $1`;
  const result = await pool.query(query, [roleId]);
  return result.rows.map(row => row.permission);
};

module.exports = {
  getAllRoles,
  getRoleById,
  getRoleByName,
  getRolePermissions,
};
