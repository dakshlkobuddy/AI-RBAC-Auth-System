const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

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
 * @route POST /api/auth/set-password
 * @desc Set password with token
 * @access Public (with token)
 */
router.post('/set-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    const result = await authController.setPasswordWithToken(token, password);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/auth/me
 * @desc Validate token and return current user
 * @access Private
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const result = await authController.getProfile(req.userId);

    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
