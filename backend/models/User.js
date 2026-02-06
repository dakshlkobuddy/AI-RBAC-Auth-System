const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// Create a new user
const createUser = async (name, email, roleId) => {
  const userId = uuidv4();
  const query = `
    INSERT INTO users (id, name, email, role_id, is_active, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING id, name, email, role_id, is_active, created_at
  `;
  const result = await pool.query(query, [userId, name, email, roleId, true]);
  return result.rows[0];
};

// Get user by ID
const getUserById = async (userId) => {
  const query = `
    SELECT u.id, u.name, u.email, u.role_id, u.is_active, u.created_at, r.name as role_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

// Get user by email
const getUserByEmail = async (email) => {
  const query = `
    SELECT u.id, u.name, u.email, u.password, u.role_id, u.is_active, u.created_at, r.name as role_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.email = $1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

// Get all users
const getAllUsers = async () => {
  const query = `
    SELECT u.id, u.name, u.email, u.role_id, u.is_active, u.created_at, r.name as role_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    ORDER BY u.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Update user password (set password after signup)
const updateUserPassword = async (userId, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = `
    UPDATE users
    SET password = $1
    WHERE id = $2
    RETURNING id, name, email, role_id
  `;
  const result = await pool.query(query, [hashedPassword, userId]);
  return result.rows[0];
};

// Update user details
const updateUser = async (userId, name, email, roleId = null) => {
  const query = roleId
    ? `
      UPDATE users
      SET name = $1, email = $2, role_id = $3
      WHERE id = $4
      RETURNING id, name, email, role_id, is_active, created_at
    `
    : `
      UPDATE users
      SET name = $1, email = $2
      WHERE id = $3
      RETURNING id, name, email, role_id, is_active, created_at
    `;

  const params = roleId
    ? [name, email, roleId, userId]
    : [name, email, userId];

  const result = await pool.query(query, params);
  return result.rows[0];
};

// Deactivate user
const deactivateUser = async (userId) => {
  const query = `
    UPDATE users
    SET is_active = false
    WHERE id = $1
    RETURNING id, name, email, is_active
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

// Delete user
const deleteUser = async (userId) => {
  const query = `DELETE FROM users WHERE id = $1`;
  await pool.query(query, [userId]);
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  getAllUsers,
  updateUserPassword,
  updateUser,
  deactivateUser,
  deleteUser,
};
