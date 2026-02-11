const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
    throw new Error('JWT_SECRET is not configured');
  }
  return process.env.JWT_SECRET;
};

// Generate JWT token
const generateToken = (userId, roleId) => {
  return jwt.sign(
    { userId, roleId },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const generatePasswordSetupToken = (payloadOrUserId) => {
  const payload = typeof payloadOrUserId === 'string'
    ? { userId: payloadOrUserId }
    : (payloadOrUserId || {});

  return jwt.sign(
    { ...payload, purpose: 'password_setup' },
    getJwtSecret(),
    { expiresIn: process.env.PASSWORD_SETUP_EXPIRE || '24h' }
  );
};

const verifyPasswordSetupToken = (token) => {
  try {
    const payload = jwt.verify(token, getJwtSecret());
    if (!payload || payload.purpose !== 'password_setup') return null;
    return payload;
  } catch (error) {
    return null;
  }
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    return null;
  }
};

// Hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  generateToken,
  generatePasswordSetupToken,
  verifyPasswordSetupToken,
  verifyToken,
  hashPassword,
  comparePassword,
};
