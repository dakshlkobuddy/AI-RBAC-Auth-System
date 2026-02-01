const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const emailController = require('../controllers/emailController');

/**
 * POST /api/emails/receive
 * 
 * Receive and process incoming email
 * AI automatically:
 * 1. Detects intent (enquiry or support)
 * 2. Generates reply draft
 * 3. Creates/finds contact and company
 * 4. Saves to appropriate table
 * 
 * Access: Public (should be IP-restricted or API-key protected in production)
 * 
 * Request Body:
 *   {
 *     "fromEmail": "john@company.com",
 *     "fromName": "John Doe",
 *     "subject": "Need a demo",
 *     "message": "Can you give us a demo of your product?"
 *   }
 * 
 * Response:
 *   {
 *     "success": true,
 *     "message": "Email processed successfully by AI",
 *     "data": {
 *       "type": "enquiry",
 *       "id": "...",
 *       "subject": "Need a demo",
 *       "status": "new",
 *       "aiProcessing": {
 *         "intent": "enquiry",
 *         "confidence": 85.5,
 *         "draftReply": "Dear John Doe..."
 *       }
 *     }
 *   }
 */
router.post('/receive', emailController.receiveEmail);

/**
 * GET /api/emails/history
 * 
 * Get email processing history
 * Shows all processed emails with AI decisions
 * 
 * Access: Requires authentication
 * Filtering:
 * - Admin: sees all enquiries and support tickets
 * - Marketing: sees only enquiries
 * - Support: sees only support tickets
 * 
 * Query Parameters:
 *   limit: number of records to return (default: 50)
 */
router.get(
  '/history',
  authenticate,
  emailController.getProcessingHistory
);

/**
 * GET /api/emails/stats
 * 
 * Get AI processing statistics
 * Shows summary of processed emails
 * 
 * Access: Admin only
 * 
 * Response:
 *   {
 *     "success": true,
 *     "data": {
 *       "totalEnquiriesProcessed": 45,
 *       "totalSupportProcessed": 12,
 *       "newEnquiries": 8,
 *       "openTickets": 3
 *     }
 *   }
 */
router.get(
  '/stats',
  authenticate,
  authorize(['admin']),
  emailController.getProcessingStats
);

/**
 * POST /api/emails/test/intent-detection
 * 
 * Test intent detection without saving to database
 * Useful for debugging and understanding AI behavior
 * 
 * Access: Admin or authenticated users
 * 
 * Request Body:
 *   {
 *     "message": "I have an error in my system"
 *   }
 * 
 * Response:
 *   {
 *     "success": true,
 *     "data": {
 *       "intent": "support",
 *       "confidence": 92.5,
 *       "matchedSupportKeywords": ["error"],
 *       "matchedEnquiryKeywords": [],
 *       "explanation": "AI detected intent as 'support' with 92.5% confidence..."
 *     }
 *   }
 */
router.post(
  '/test/intent-detection',
  authenticate,
  emailController.testIntentDetection
);

/**
 * POST /api/emails/test/reply-generation
 * 
 * Test reply generation without saving to database
 * Shows sample replies with randomization
 * 
 * Access: Admin or authenticated users
 * 
 * Request Body:
 *   {
 *     "contactName": "John Doe",
 *     "intent": "enquiry"
 *   }
 * 
 * Response:
 *   {
 *     "success": true,
 *     "data": {
 *       "intent": "enquiry",
 *       "contactName": "John Doe",
 *       "sampleReplies": [
 *         "Dear John Doe, Thank you for reaching out...",
 *         "Dear John Doe, We appreciate your interest...",
 *         "Dear John Doe, Thank you for your inquiry..."
 *       ],
 *       "explanation": "AI generates professional replies using..."
 *     }
 *   }
 */
router.post(
  '/test/reply-generation',
  authenticate,
  emailController.testReplyGeneration
);

module.exports = router;
