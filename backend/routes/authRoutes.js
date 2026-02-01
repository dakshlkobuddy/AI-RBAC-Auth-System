const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @route POST /api/auth/login
 * @desc User login
 * @access Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await authController.login(email, password);

    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/auth/set-password/:userId
 * @desc Set password for new user
 * @access Public (with userId token)
 */
router.post('/set-password/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const result = await authController.setPassword(userId, password);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
