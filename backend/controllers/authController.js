const User = require('../models/User');
const Role = require('../models/Role');
const { generateToken, comparePassword, verifyPasswordSetupToken } = require('../utils/authUtils');

// Admin login
const login = async (email, password) => {
  try {
    const user = await User.getUserByEmail(email);

    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    if (!user.is_active) {
      return { success: false, message: 'User account is inactive' };
    }

    if (!user.password) {
      return { success: false, message: 'Please set your password first' };
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password' };
    }

    const token = generateToken(user.id, user.role_id);

    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Set password (used when user receives password setup link)
const setPassword = async (userId, password) => {
  try {
    // Validate password
    if (!password || password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    const user = await User.updateUserPassword(userId, password);

    return {
      success: true,
      message: 'Password set successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error('Set password error:', error);
    throw error;
  }
};

const setPasswordWithToken = async (token, password, email) => {
  try {
    const payload = verifyPasswordSetupToken(token);
    if (!payload) {
      return { success: false, message: 'Invalid or expired setup link' };
    }

    const user = await User.getUserById(payload.userId);
    if (!user || user.email !== email) {
      return { success: false, message: 'Email does not match the setup link' };
    }

    return await setPassword(payload.userId, password);
  } catch (error) {
    console.error('Set password with token error:', error);
    throw error;
  }
};

module.exports = {
  login,
  setPassword,
  setPasswordWithToken,
};
