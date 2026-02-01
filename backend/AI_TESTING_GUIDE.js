/**
 * EMAIL-BASED CRM - AI SYSTEM TESTING GUIDE
 * ==========================================
 * 
 * Complete instructions for testing the rule-based AI email processing system
 */

// ================================================================
// TEST 1: SEND ENQUIRY EMAIL (INTENT DETECTION TEST)
// ================================================================

/**
 * Test: Customer sends pricing enquiry email
 * 
 * Expected Result:
 * - AI detects intent as 'enquiry'
 * - Creates contact as 'prospect'
 * - Saves to enquiries table with status='new'
 * - Generates professional reply draft
 * 
 * Steps:
 * 1. Open Postman or curl terminal
 * 2. Send POST request with this data
 */

POST /api/emails/receive
Content-Type: application/json

{
  "fromEmail": "alice@techcompany.com",
  "fromName": "Alice Johnson",
  "subject": "Pricing for Enterprise Plan",
  "message": "Hello, we're interested in your enterprise plan. What is your pricing and can you provide a quote for 50 users?"
}

/**
 * Expected Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Email processed successfully by AI",
 *   "data": {
 *     "type": "enquiry",
 *     "id": "550e8400-e29b-41d4-a716-446655440001",
 *     "subject": "Pricing for Enterprise Plan",
 *     "status": "new",
 *     "aiProcessing": {
 *       "intent": "enquiry",
 *       "confidence": 83.3,
 *       "draftReply": "Dear Alice Johnson,\n\nThank you for reaching out to us!..."
 *     }
 *   }
 * }
 * 
 * What Happened in Database:
 * 1. Contact created: alice@techcompany.com as 'prospect'
 * 2. Company created: 'Techcompany' from domain
 * 3. Enquiry created in enquiries table:
 *    - status: 'new'
 *    - customer_type: 'prospect'
 *    - ai_reply: [Professional draft]
 */

// ================================================================
// TEST 2: SEND SUPPORT EMAIL (INTENT DETECTION TEST)
// ================================================================

/**
 * Test: Customer sends support ticket
 * 
 * Expected Result:
 * - AI detects intent as 'support'
 * - Creates contact as 'prospect'
 * - Saves to support_tickets table with status='open'
 * - Generates support-focused reply draft
 */

POST /api/emails/receive
Content-Type: application/json

{
  "fromEmail": "bob@company.com",
  "fromName": "Bob Smith",
  "subject": "Login Error",
  "message": "I'm getting an error when I try to login. It says 'access denied'. Can you help me fix this urgent issue?"
}

/**
 * Expected Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Email processed successfully by AI",
 *   "data": {
 *     "type": "support_ticket",
 *     "id": "550e8400-e29b-41d4-a716-446655440002",
 *     "subject": "Login Error",
 *     "status": "open",
 *     "priority": "medium",
 *     "aiProcessing": {
 *       "intent": "support",
 *       "confidence": 95.2,
 *       "draftReply": "Dear Bob Smith,\n\nThank you for reaching out to our support team..."
 *     }
 *   }
 * }
 * 
 * What Happened in Database:
 * 1. Contact created: bob@company.com as 'prospect'
 * 2. Company created: 'Company' from domain
 * 3. Support ticket created in support_tickets table:
 *    - status: 'open'
 *    - priority: 'medium'
 *    - ai_reply: [Support-focused draft]
 */

// ================================================================
// TEST 3: PERSONAL EMAIL TEST
// ================================================================

/**
 * Test: Customer sends email from Gmail
 * 
 * Expected Result:
 * - Contact created as 'prospect'
 * - Company linked to 'Individual' (default)
 * - Proper intent detection (enquiry or support)
 */

POST /api/emails/receive
Content-Type: application/json

{
  "fromEmail": "charlie@gmail.com",
  "fromName": "Charlie Brown",
  "subject": "Product Demo",
  "message": "Hi, I'd like to see a demo of your product. Can you arrange a trial for me?"
}

/**
 * Expected Response:
 * - Contact: charlie@gmail.com, prospect
 * - Company: 'Individual'
 * - Enquiry: status='new'
 * - Intent: 'enquiry' (keywords: demo, trial)
 */

// ================================================================
// TEST 4: TEST INTENT DETECTION ENDPOINT
// ================================================================

/**
 * Test: Use the test endpoint to validate AI intent detection
 * 
 * This endpoint does NOT save to database - useful for debugging
 */

POST /api/emails/test/intent-detection
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "message": "I have a critical bug in the system that's crashing our app"
}

/**
 * Expected Response (200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "intent": "support",
 *     "confidence": 100,
 *     "matchedSupportKeywords": ["bug", "crashing"],
 *     "matchedEnquiryKeywords": [],
 *     "explanation": "AI detected intent as 'support' with 100% confidence based on keyword analysis."
 *   }
 * }
 */

// ================================================================
// TEST 5: TEST REPLY GENERATION ENDPOINT
// ================================================================

/**
 * Test: Preview AI-generated replies without saving
 * 
 * Shows randomization - each call generates different replies
 */

POST /api/emails/test/reply-generation
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "contactName": "John Doe",
  "intent": "enquiry"
}

/**
 * Expected Response (200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "intent": "enquiry",
 *     "contactName": "John Doe",
 *     "sampleReplies": [
 *       "Dear John Doe,\n\nThank you for reaching out to us! We received your message and we're reviewing it carefully.\n\nWe're excited to help you learn more about our solutions...",
 *       "Dear John Doe,\n\nWe appreciate your interest in our products and services. We received your message and we're reviewing it carefully.\n\nYour interest is important to us...",
 *       "Dear John Doe,\n\nThank you for your inquiry! We received your message and we're reviewing it carefully.\n\nWe would love to discuss how our products can help solve your business challenges..."
 *     ],
 *     "explanation": "AI generates professional replies using randomized templates. Each generation may differ slightly."
 *   }
 * }
 * 
 * Note: Each time you call this, you get different replies due to randomization
 */

// ================================================================
// TEST 6: VIEW ENQUIRY IN MARKETING DASHBOARD
// ================================================================

/**
 * Test: Log into Marketing Dashboard and view AI-processed enquiry
 * 
 * Steps:
 * 1. Go to http://localhost:3000
 * 2. Log in as marketing@company.com / marketing123
 * 3. Go to "Enquiries" tab
 * 4. Click "View" on the enquiry from Test 1 (Alice)
 * 
 * What You'll See:
 * ├─ Contact Name: Alice Johnson
 * ├─ Email: alice@techcompany.com
 * ├─ Company: Techcompany
 * ├─ Customer Type: prospect
 * ├─ Original Message: "Hello, we're interested in..."
 * ├─ AI-Generated Reply: [Professional draft from AI]
 * └─ Send Reply Button
 * 
 * What Marketing User Can Do:
 * 1. Review the AI-generated reply
 * 2. Edit the reply if needed
 * 3. Click "Send Reply"
 * 4. Status changes to 'replied'
 * 5. Customer type changes to 'customer'
 */

// ================================================================
// TEST 7: VIEW SUPPORT TICKET IN SUPPORT DASHBOARD
// ================================================================

/**
 * Test: Log into Support Dashboard and view AI-processed ticket
 * 
 * Steps:
 * 1. Go to http://localhost:3000
 * 2. Log in as support@company.com / support123
 * 3. Go to "Support Tickets" tab
 * 4. Click "View" on the ticket from Test 2 (Bob)
 * 
 * What You'll See:
 * ├─ Contact Name: Bob Smith
 * ├─ Email: bob@company.com
 * ├─ Company: Company
 * ├─ Original Issue: "I'm getting an error..."
 * ├─ AI-Generated Reply: [Support-focused draft from AI]
 * └─ Send Reply Button
 * 
 * What Support User Can Do:
 * 1. Review the AI-generated reply
 * 2. Edit the reply if needed
 * 3. Click "Send Reply"
 * 4. Status changes to 'resolved'
 * 5. Customer type changes to 'client'
 */

// ================================================================
// TEST 8: VIEW ADMIN AI DASHBOARD
// ================================================================

/**
 * Test: Log into Admin Dashboard and monitor AI decisions
 * 
 * Steps:
 * 1. Go to http://localhost:3000
 * 2. Log in as admin@company.com / admin123
 * 3. View "AI Processing" section (if available)
 * 
 * What Admin Sees:
 * ├─ All enquiries and support tickets
 * ├─ Processing statistics
 * ├─ Intent detection results
 * ├─ Confidence scores
 * └─ Processing history
 */

// ================================================================
// TEST 9: VERIFY DATABASE CHANGES
// ================================================================

/**
 * Test: Query database to verify AI operations
 * 
 * Check Contacts Table:
 * SELECT * FROM contacts WHERE email IN ('alice@techcompany.com', 'bob@company.com', 'charlie@gmail.com');
 * 
 * Expected:
 * ├─ alice@techcompany.com: customer_type='prospect'
 * ├─ bob@company.com: customer_type='prospect'
 * └─ charlie@gmail.com: customer_type='prospect'
 * 
 * Check Companies Table:
 * SELECT * FROM companies WHERE name IN ('Techcompany', 'Company', 'Individual');
 * 
 * Expected:
 * ├─ 'Techcompany': created from domain
 * ├─ 'Company': created from domain
 * └─ 'Individual': linked to Gmail contact
 * 
 * Check Enquiries Table:
 * SELECT * FROM enquiries WHERE status='new';
 * 
 * Expected:
 * ├─ Alice's pricing enquiry: status='new', ai_reply filled
 * └─ Charlie's demo request: status='new', ai_reply filled
 * 
 * Check Support Tickets Table:
 * SELECT * FROM support_tickets WHERE status='open';
 * 
 * Expected:
 * └─ Bob's login error: status='open', priority='medium', ai_reply filled
 */

// ================================================================
// TEST 10: SEND REPLY AND VERIFY UPDATES
// ================================================================

/**
 * Test: Marketing user sends reply to enquiry
 * 
 * Steps in Frontend:
 * 1. Log in as marketing@company.com
 * 2. View enquiry from Alice
 * 3. Edit AI reply (optional)
 * 4. Click "Send Reply"
 * 
 * Expected Changes in Database:
 * 1. Enquiry updated:
 *    - status: 'new' → 'replied'
 *    - ai_reply: updated with actual reply sent
 * 2. Contact updated:
 *    - customer_type: 'prospect' → 'customer'
 * 
 * Verify with Query:
 * SELECT * FROM enquiries WHERE id='<alice_enquiry_id>';
 * 
 * Results:
 * ├─ status: 'replied'
 * ├─ ai_reply: [Updated with actual message sent]
 * └─ updated_at: current timestamp
 */

// ================================================================
// TEST 11: FULL END-TO-END WORKFLOW
// ================================================================

/**
 * Complete workflow test:
 * 
 * 1. SEND EMAIL (API)
 *    POST /api/emails/receive with enquiry email
 *    → AI processes, creates contact/company, saves to DB
 * 
 * 2. VIEW IN DASHBOARD (Frontend)
 *    Marketing logs in → Goes to Enquiries tab
 *    → Sees new enquiry with AI reply
 * 
 * 3. EDIT & SEND (Frontend)
 *    Click View → Edit reply → Click Send Reply
 *    → Status changes, customer upgrades
 * 
 * 4. VERIFY (Database)
 *    Query database to confirm all changes
 *    → Contact now 'customer'
 *    → Enquiry now 'replied'
 *    → Updated timestamps correct
 */

// ================================================================
// CURL COMMAND EXAMPLES
// ================================================================

/**
 * Test 1: Send Enquiry Email
 * 
 * curl -X POST http://localhost:5000/api/emails/receive \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "fromEmail": "alice@techcompany.com",
 *     "fromName": "Alice Johnson",
 *     "subject": "Pricing for Enterprise Plan",
 *     "message": "Hello, we are interested in your enterprise plan. What is your pricing?"
 *   }'
 */

/**
 * Test 2: Send Support Email
 * 
 * curl -X POST http://localhost:5000/api/emails/receive \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "fromEmail": "bob@company.com",
 *     "fromName": "Bob Smith",
 *     "subject": "Login Error",
 *     "message": "I am getting an error when I try to login. Can you help fix this urgent issue?"
 *   }'
 */

/**
 * Test 3: Test Intent Detection
 * 
 * curl -X POST http://localhost:5000/api/emails/test/intent-detection \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer YOUR_JWT_TOKEN" \
 *   -d '{
 *     "message": "I have a critical bug that is crashing the system"
 *   }'
 */

/**
 * Test 4: Test Reply Generation
 * 
 * curl -X POST http://localhost:5000/api/emails/test/reply-generation \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer YOUR_JWT_TOKEN" \
 *   -d '{
 *     "contactName": "John Doe",
 *     "intent": "enquiry"
 *   }'
 */

/**
 * Test 5: Get Processing History
 * 
 * curl -X GET "http://localhost:5000/api/emails/history?limit=50" \
 *   -H "Authorization: Bearer YOUR_JWT_TOKEN"
 */

/**
 * Test 6: Get Processing Stats (Admin Only)
 * 
 * curl -X GET http://localhost:5000/api/emails/stats \
 *   -H "Authorization: Bearer YOUR_JWT_TOKEN_ADMIN"
 */

// ================================================================
// TROUBLESHOOTING
// ================================================================

/**
 * Issue: "Email processed successfully by AI" but no data in dashboard
 * 
 * Solution:
 * 1. Check database directly: SELECT * FROM enquiries;
 * 2. Verify contact created: SELECT * FROM contacts;
 * 3. Verify company created: SELECT * FROM companies;
 * 4. Refresh dashboard in browser (Ctrl+F5)
 * 5. Check browser console for errors (F12)
 * 6. Check server logs for database errors
 */

/**
 * Issue: AI detecting wrong intent
 * 
 * Solution:
 * 1. Test with /test/intent-detection endpoint
 * 2. Check which keywords matched
 * 3. Review AI_SERVICE.js keyword lists
 * 4. Update keywords if needed for your use case
 */

/**
 * Issue: Reply draft looks unprofessional
 * 
 * Solution:
 * 1. Edit the reply in dashboard before sending
 * 2. Review template in aiService.js
 * 3. Customize templates for your company
 * 4. The AI draft is just a starting point for users
 */

/**
 * Issue: Contact or Company not created
 * 
 * Solution:
 * 1. Verify email is valid and in correct format
 * 2. Check database connection
 * 3. Verify migrations have run: SELECT * FROM contacts;
 * 4. Check server logs for database errors
 */

module.exports = {
  description: 'Complete testing guide for AI Email System',
  version: '1.0',
  lastUpdated: '2025-01-27'
};
