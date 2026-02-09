const User = require('../models/User');
const Role = require('../models/Role');
const UserInvite = require('../models/UserInvite');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../services/mailer');
const { generatePasswordSetupToken } = require('../utils/authUtils');

// Create a new user (Admin only)
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').toLowerCase());

const parseExpiryToDate = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const match = raw.match(/^(\d+)([smhd])$/i);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const ms = amount * (multipliers[unit] || 0);
  if (!ms) return null;
  return new Date(Date.now() + ms);
};

const createUser = async (name, email, role) => {
  try {
    // Validate input
    if (!name || !email || !role) {
      return { success: false, message: 'Name, email, and role are required' };
    }
    if (!isValidEmail(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    // Check if user already exists
    const existingUser = await User.getUserByEmail(email);
    if (existingUser) {
      return { success: false, message: 'User with this email already exists' };
    }

    const existingInvite = await UserInvite.getInviteByEmail(email);
    if (existingInvite) {
      return { success: false, message: 'Invite already sent to this email' };
    }

    if (role === 'admin') {
      return { success: false, message: 'Admin role cannot be created here' };
    }

    // Get role ID
    const roleData = await Role.getRoleByName(role);
    if (!roleData) {
      return { success: false, message: 'Invalid role' };
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const expiresAt = parseExpiryToDate(process.env.PASSWORD_SETUP_EXPIRE || '24h');
    const inviteId = uuidv4();
    const setupToken = generatePasswordSetupToken({ inviteId });
    const storedInvite = await UserInvite.createInvite({
      id: inviteId,
      name,
      email,
      roleId: roleData.id,
      token: setupToken,
      expiresAt,
    });
    const setupLink = `${frontendUrl.replace(/\/$/, '')}/set-password.html?token=${encodeURIComponent(setupToken)}`;

    sendEmail({
      to: email,
      subject: 'Set up your password',
      text: `Hello ${name},\n\nYour account has been created. Please set your password using the link below:\n\n${setupLink}\n\nThis link will expire in 24 hours.`,
      html: `
        <p>Hello ${name},</p>
        <p>Your account has been created. Please set your password using the link below:</p>
        <p><a href="${setupLink}">Set your password</a></p>
        <p>This link will expire in 24 hours.</p>
      `,
    }).catch((error) => {
      console.error('Password setup email failed:', error.message);
    });

    return {
      success: true,
      message: 'User created successfully. Password setup email has been sent.',
      invite: {
        id: storedInvite.id,
        name: storedInvite.name,
        email: storedInvite.email,
        role_id: storedInvite.role_id,
      },
    };
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

// Get all users
const getAllUsers = async () => {
  try {
    const users = await User.getAllUsers();
    return {
      success: true,
      users,
    };
  } catch (error) {
    console.error('Get users error:', error);
    throw error;
  }
};

// Get user by ID
const getUserById = async (userId) => {
  try {
    const user = await User.getUserById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

// Update user
const updateUser = async (userId, name, email, role) => {
  try {
    if (email && !isValidEmail(email)) {
      return { success: false, message: 'Invalid email format' };
    }
    let roleId = null;
    if (role) {
      if (role === 'admin') {
        return { success: false, message: 'Admin role cannot be assigned here' };
      }
      const roleData = await Role.getRoleByName(role);
      if (!roleData) {
        return { success: false, message: 'Invalid role' };
      }
      roleId = roleData.id;
    }

    const user = await User.updateUser(userId, name, email, roleId);
    return {
      success: true,
      message: 'User updated successfully',
      user,
    };
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

// Delete user
const deleteUser = async (userId) => {
  try {
    await User.deleteUser(userId);
    return {
      success: true,
      message: 'User deleted successfully',
    };
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
