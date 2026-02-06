const User = require('../models/User');
const Role = require('../models/Role');
const { ROLES } = require('../config/constants');

// Create a new user (Admin only)
const createUser = async (name, email, role) => {
  try {
    // Validate input
    if (!name || !email || !role) {
      return { success: false, message: 'Name, email, and role are required' };
    }

    // Check if user already exists
    const existingUser = await User.getUserByEmail(email);
    if (existingUser) {
      return { success: false, message: 'User with this email already exists' };
    }

    // Get role ID
    const roleData = await Role.getRoleByName(role);
    if (!roleData) {
      return { success: false, message: 'Invalid role' };
    }

    // Create user
    const newUser = await User.createUser(name, email, roleData.id);

    // TODO: Send password setup email here
    console.log(`[TODO] Send password setup email to ${email}`);

    return {
      success: true,
      message: 'User created successfully. Password setup email has been sent.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role_id: newUser.role_id,
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
    let roleId = null;
    if (role) {
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
