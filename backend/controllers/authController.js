const User = require('../models/User');
const Role = require('../models/Role');
const UserInvite = require('../models/UserInvite');
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

    const existingUser = await User.getUserById(userId);
    if (!existingUser) {
      return { success: false, message: 'User not found' };
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

const setPasswordWithToken = async (token, password) => {
  try {
    const payload = verifyPasswordSetupToken(token);
    if (!payload) {
      return { success: false, message: 'Invalid or expired setup link' };
    }

    if (payload.inviteId) {
      const invite = await UserInvite.getInviteById(payload.inviteId);
      if (!invite) {
        return { success: false, message: 'Invalid or expired setup link' };
      }
      if (invite.token !== token) {
        return { success: false, message: 'Invalid or expired setup link' };
      }
      if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
        await UserInvite.deleteInvite(invite.id);
        return { success: false, message: 'Invalid or expired setup link' };
      }

      const existingUser = await User.getUserByEmail(invite.email);
      if (existingUser) {
        await UserInvite.deleteInvite(invite.id);
        return { success: false, message: 'User already exists. Please log in.' };
      }

      const newUser = await User.createUser(invite.name, invite.email, invite.role_id);
      const user = await User.updateUserPassword(newUser.id, password);
      await UserInvite.deleteInvite(invite.id);

      return {
        success: true,
        message: 'Password set successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    }

    return await setPassword(payload.userId, password);
  } catch (error) {
    console.error('Set password with token error:', error);
    throw error;
  }
};

// Validate active session and return current user profile
const getProfile = async (userId) => {
  try {
    const user = await User.getUserById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (!user.is_active) {
      return { success: false, message: 'User account is inactive' };
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name,
      },
    };
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

module.exports = {
  login,
  setPassword,
  setPasswordWithToken,
  getProfile,
};
