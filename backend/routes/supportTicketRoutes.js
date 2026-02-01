const express = require('express');
const router = express.Router();
const supportTicketController = require('../controllers/supportTicketController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { PERMISSIONS } = require('../config/constants');

/**
 * @route GET /api/support/tickets
 * @desc Get all support tickets
 * @access Private - Support, Admin
 */
router.get('/', authenticate, authorize(PERMISSIONS.VIEW_TICKETS), async (req, res, next) => {
  try {
    const result = await supportTicketController.getAllTickets();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/support/tickets/:ticketId
 * @desc Get support ticket by ID
 * @access Private - Support, Admin
 */
router.get('/:ticketId', authenticate, authorize(PERMISSIONS.VIEW_TICKETS), async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const result = await supportTicketController.getTicketById(ticketId);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/support/tickets/:ticketId/reply
 * @desc Reply to a support ticket
 * @access Private - Support, Admin
 */
router.post('/:ticketId/reply', authenticate, authorize(PERMISSIONS.REPLY_TICKET), async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    const result = await supportTicketController.replyTicket(ticketId, reply);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
