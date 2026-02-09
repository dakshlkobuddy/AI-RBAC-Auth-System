const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const ensureTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_invites (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      role_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id)
    )
  `;
  await pool.query(query);
};

const createInvite = async ({ id = null, name, email, roleId, token, expiresAt = null }) => {
  await ensureTable();
  const inviteId = id || uuidv4();
  const query = `
    INSERT INTO user_invites (id, name, email, role_id, token, expires_at, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING id, name, email, role_id, token, expires_at, created_at
  `;
  const result = await pool.query(query, [inviteId, name, email, roleId, token, expiresAt]);
  return result.rows[0];
};

const getInviteById = async (inviteId) => {
  await ensureTable();
  const query = `
    SELECT id, name, email, role_id, token, expires_at, created_at
    FROM user_invites
    WHERE id = $1
  `;
  const result = await pool.query(query, [inviteId]);
  return result.rows[0];
};

const getInviteByEmail = async (email) => {
  await ensureTable();
  const query = `
    SELECT id, name, email, role_id, token, expires_at, created_at
    FROM user_invites
    WHERE email = $1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const deleteInvite = async (inviteId) => {
  await ensureTable();
  const query = `DELETE FROM user_invites WHERE id = $1`;
  await pool.query(query, [inviteId]);
};

const deleteInviteByEmail = async (email) => {
  await ensureTable();
  const query = `DELETE FROM user_invites WHERE email = $1`;
  await pool.query(query, [email]);
};

module.exports = {
  createInvite,
  getInviteById,
  getInviteByEmail,
  deleteInvite,
  deleteInviteByEmail,
};
