const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { PERMISSIONS } = require('../config/constants');

/**
 * @route POST /api/users
 * @desc Create a new user (Admin only)
 * @access Private - Admin
 */
router.post('/', authenticate, authorize(PERMISSIONS.CREATE_USER), async (req, res, next) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Name, email, and role are required' });
    }

    const result = await userController.createUser(name, email, role);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/users
 * @desc Get all users (Admin only)
 * @access Private - Admin
 */
router.get('/', authenticate, authorize(PERMISSIONS.VIEW_USERS), async (req, res, next) => {
  try {
    const result = await userController.getAllUsers();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/users/:userId
 * @desc Get user by ID
 * @access Private - Authenticated users
 */
router.get('/:userId', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await userController.getUserById(userId);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/users/:userId
 * @desc Update user (Admin only)
 * @access Private - Admin
 */
router.put('/:userId', authenticate, authorize(PERMISSIONS.UPDATE_USER), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { name, email, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const result = await userController.updateUser(userId, name, email, role);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/users/:userId
 * @desc Delete user (Admin only)
 * @access Private - Admin
 */
router.delete('/:userId', authenticate, authorize(PERMISSIONS.DELETE_USER), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await userController.deleteUser(userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
