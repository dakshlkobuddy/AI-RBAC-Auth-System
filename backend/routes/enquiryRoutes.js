const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { PERMISSIONS } = require('../config/constants');

/**
 * @route GET /api/enquiries
 * @desc Get all enquiries
 * @access Private - Marketing, Admin
 */
router.get('/', authenticate, authorize(PERMISSIONS.VIEW_ENQUIRIES), async (req, res, next) => {
  try {
    const result = await enquiryController.getAllEnquiries();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/enquiries/:enquiryId
 * @desc Get enquiry by ID
 * @access Private - Marketing, Admin
 */
router.get('/:enquiryId', authenticate, authorize(PERMISSIONS.VIEW_ENQUIRIES), async (req, res, next) => {
  try {
    const { enquiryId } = req.params;
    const result = await enquiryController.getEnquiryById(enquiryId);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/enquiries/:enquiryId/reply
 * @desc Reply to an enquiry
 * @access Private - Marketing, Admin
 */
router.post('/:enquiryId/reply', authenticate, authorize(PERMISSIONS.REPLY_ENQUIRY), async (req, res, next) => {
  try {
    const { enquiryId } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    const result = await enquiryController.replyEnquiry(enquiryId, reply);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/enquiries/:enquiryId
 * @desc Delete an enquiry
 * @access Private - Marketing, Admin
 */
router.delete('/:enquiryId', authenticate, authorize(PERMISSIONS.REPLY_ENQUIRY), async (req, res, next) => {
  try {
    const { enquiryId } = req.params;
    const result = await enquiryController.deleteEnquiry(enquiryId);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
