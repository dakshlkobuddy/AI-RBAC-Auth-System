/**
 * Marketing Routes
 * Routes for marketing user enquiry management
 */

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const marketingController = require('../controllers/marketingController');

// All marketing routes require authentication and marketing role
router.use(authenticate);
router.use(authorize(['marketing']));

/**
 * GET /api/marketing/dashboard-stats
 * Get dashboard statistics
 * Permissions: marketing
 */
router.get('/dashboard-stats', marketingController.getDashboardStats);

/**
 * GET /api/marketing/enquiries
 * Get all enquiries
 * Permissions: marketing, VIEW_ENQUIRIES
 */
router.get('/enquiries', authorize(['marketing'], 'VIEW_ENQUIRIES'), marketingController.getEnquiries);

/**
 * GET /api/marketing/enquiries/:id
 * Get enquiry details
 * Permissions: marketing, VIEW_ENQUIRIES
 */
router.get('/enquiries/:id', authorize(['marketing'], 'VIEW_ENQUIRIES'), marketingController.getEnquiryDetails);

/**
 * POST /api/marketing/enquiries/:id/reply
 * Send reply to enquiry
 * Permissions: marketing, REPLY_ENQUIRY
 */
router.post('/enquiries/:id/reply', authorize(['marketing'], 'REPLY_ENQUIRY'), marketingController.sendEnquiryReply);

/**
 * POST /api/marketing/enquiries/:id/close
 * Close an enquiry
 * Permissions: marketing, REPLY_ENQUIRY
 */
router.post('/enquiries/:id/close', authorize(['marketing'], 'REPLY_ENQUIRY'), marketingController.closeEnquiry);

/**
 * DELETE /api/marketing/enquiries/:id
 * Delete an enquiry
 * Permissions: marketing, REPLY_ENQUIRY
 */
router.delete('/enquiries/:id', authorize(['marketing'], 'REPLY_ENQUIRY'), marketingController.deleteEnquiry);

module.exports = router;
