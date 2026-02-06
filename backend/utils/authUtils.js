const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (userId, roleId) => {
  return jwt.sign(
    { userId, roleId },
    process.env.JWT_SECRET || 'your_secret_key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const generatePasswordSetupToken = (userId) => {
  return jwt.sign(
    { userId, purpose: 'password_setup' },
    process.env.JWT_SECRET || 'your_secret_key',
    { expiresIn: process.env.PASSWORD_SETUP_EXPIRE || '24h' }
  );
};

const verifyPasswordSetupToken = (token) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    if (!payload || payload.purpose !== 'password_setup') return null;
    return payload;
  } catch (error) {
    return null;
  }
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
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
