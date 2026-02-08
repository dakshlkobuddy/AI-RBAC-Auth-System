const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { PERMISSIONS } = require('../config/constants');

/**
 * @route GET /api/contacts
 * @desc Get all contacts (Admin only)
 * @access Private - Admin
 */
router.get('/', authenticate, authorize(PERMISSIONS.VIEW_USERS), async (req, res, next) => {
  try {
    const result = await contactController.getAllContacts();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/contacts/:contactId
 * @desc Get contact by ID
 * @access Private - Authenticated users
 */
router.get('/:contactId', authenticate, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await contactController.getContactById(contactId);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/contacts/:contactId
 * @desc Update contact (Admin only)
 * @access Private - Admin
 */
router.put('/:contactId', authenticate, authorize(PERMISSIONS.UPDATE_USER), async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await contactController.updateContact(contactId, req.body || {});

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/contacts/:contactId
 * @desc Delete contact (Admin only)
 * @access Private - Admin
 */
router.delete('/:contactId', authenticate, authorize(PERMISSIONS.DELETE_USER), async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await contactController.deleteContact(contactId);

    if (!result.success) {
      const status = result.code === 'CONTACT_HAS_REFERENCES' ? 400 : 404;
      return res.status(status).json({ message: result.message });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
