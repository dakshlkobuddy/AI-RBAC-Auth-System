/**
 * AI SIMULATION INTEGRATION GUIDE
 * ================================
 * 
 * Complete documentation for rule-based AI integration in Email-Based CRM
 * 
 * Author: AI Assistant
 * Date: January 2026
 * Version: 1.0
 */

// ================================================================
// 1. ARCHITECTURE OVERVIEW
// ================================================================

/**
 * AI PROCESSING PIPELINE:
 * 
 * 1. EMAIL INTAKE
 *    └─ POST /api/emails/receive
 *       ├─ Receives: fromEmail, fromName, subject, message
 *       └─ No authentication required (should be IP-restricted)
 * 
 * 2. AI PROCESSING (Automatic - No User Interaction)
 *    ├─ Intent Detection
 *    │  └─ Analyzes message using keyword-based rules
 *    │     └─ Returns: 'enquiry', 'support', or 'other'
 *    │
 *    └─ Reply Generation
 *       └─ Creates professional draft using templates
 *          └─ Returns: Professional reply text
 * 
 * 3. CONTACT & COMPANY IDENTIFICATION
 *    ├─ Find or Create Contact
 *    │  ├─ Existing email → Use existing contact
 *    │  └─ New email → Create contact as 'prospect'
 *    │
 *    └─ Find or Create Company
 *       ├─ Business email (company.com) → Create from domain
 *       └─ Personal email (gmail, yahoo) → Link to 'Individual'
 * 
 * 4. DATABASE PERSISTENCE
 *    ├─ If ENQUIRY
 *    │  └─ Save to enquiries table
 *    │     └─ status: 'new'
 *    │     └─ customer_type: 'prospect'
 *    │
 *    └─ If SUPPORT
 *       └─ Save to support_tickets table
 *          └─ status: 'open'
 *          └─ priority: 'medium'
 * 
 * 5. DASHBOARD DISPLAY
 *    ├─ Marketing Dashboard
 *    │  └─ Sees enquiries with AI reply
 *    │     ├─ Can edit reply
 *    │     └─ On send → status: 'replied', customer_type: 'customer'
 *    │
 *    ├─ Support Dashboard
 *    │  └─ Sees support tickets with AI reply
 *    │     ├─ Can edit reply
 *    │     └─ On send → status: 'resolved', customer_type: 'client'
 *    │
 *    └─ Admin Dashboard
 *       └─ Sees all with AI metadata
 *          └─ Can view intent detection and confidence scores
 */

// ================================================================
// 2. INTENT DETECTION LOGIC
// ================================================================

/**
 * KEYWORD-BASED INTENT DETECTION
 * 
 * The AI analyzes the incoming message for specific keywords
 * and assigns an intent based on keyword frequency and type.
 * 
 * SUPPORT INTENT KEYWORDS:
 * ├─ Technical Issues: issue, error, problem, bug, broken
 * ├─ Performance Issues: crash, fail, down, offline, slow
 * ├─ Access Issues: can't, cannot, login issue, access denied
 * ├─ Complaint/Refund: complaint, refund, return, uninstall
 * └─ Urgency: urgent, asap, help, support
 * 
 * ENQUIRY INTENT KEYWORDS:
 * ├─ Pricing: price, cost, quote, quotation, how much
 * ├─ Features: features, capability, does it, how does
 * ├─ Demos: demo, trial, interested, free, enterprise
 * ├─ Information: details, information, what is, product
 * └─ Plans: plan, package, upgrade, downgrade, custom
 * 
 * DETECTION ALGORITHM:
 * 1. Convert message to lowercase
 * 2. Count matches for SUPPORT_KEYWORDS
 * 3. Count matches for ENQUIRY_KEYWORDS
 * 4. Decision:
 *    - If support_score > enquiry_score AND > 0 → 'support'
 *    - Else if enquiry_score > 0 → 'enquiry'
 *    - Else → 'other'
 * 5. Calculate confidence as (keyword_matches / total_keywords) * 100
 * 
 * EXAMPLES:
 * 
 * Message: "I have an error in my system and it crashes"
 * Matches: error, crash (2 support keywords)
 * Result: intent='support', confidence=16.7% (2/12 keywords)
 * 
 * Message: "What's your pricing for the premium plan?"
 * Matches: pricing, premium, plan (3 enquiry keywords)
 * Result: intent='enquiry', confidence=25% (3/12 keywords)
 * 
 * Message: "Hello"
 * Matches: none
 * Result: intent='other', confidence=0%
 */

// ================================================================
// 3. REPLY GENERATION
// ================================================================

/**
 * TEMPLATE-BASED REPLY GENERATION
 * 
 * AI uses predefined templates with randomization
 * to generate human-like professional replies.
 * 
 * NO EXTERNAL APIS USED - All templates are hardcoded
 * 
 * TEMPLATE STRUCTURE:
 * {
 *   greetings: [...],  // Random opening
 *   bodies: [...],     // Random main content
 *   closings: [...]    // Random conclusion
 * }
 * 
 * GENERATION PROCESS:
 * 1. Determine template set (enquiry or support)
 * 2. Randomly select one greeting
 * 3. Randomly select one body
 * 4. Randomly select one closing
 * 5. Combine with contact name
 * 6. Return complete reply draft
 * 
 * TEMPLATE EXAMPLES:
 * 
 * ENQUIRY - Greeting Options:
 * ├─ "Thank you for reaching out to us!"
 * ├─ "We appreciate your interest in our products and services."
 * ├─ "Thank you for your inquiry!"
 * └─ [3 more options...]
 * 
 * ENQUIRY - Body Options:
 * ├─ "We're excited to help you learn more about our solutions..."
 * ├─ "Your interest is important to us. We offer a range of plans..."
 * └─ [3 more options...]
 * 
 * ENQUIRY - Closing Options:
 * ├─ "Please reply to this email with any questions..."
 * ├─ "We'd be happy to arrange a personalized demonstration..."
 * └─ [3 more options...]
 * 
 * SUPPORT - Similar structure with different wording
 * 
 * GENERATED REPLY EXAMPLE:
 * 
 * "Dear John Doe,
 * 
 *  Thank you for reaching out to us! We received your message and
 *  we're reviewing it carefully.
 * 
 *  We understand the urgency of resolving this. Our technical team
 *  is reviewing your case and will provide a solution shortly.
 * 
 *  We'll keep you updated on progress. Feel free to reach out if you
 *  have any questions.
 * 
 *  Best regards,
 *  Customer Support Team
 *  Email-Based CRM System"
 */

// ================================================================
// 4. CONTACT & COMPANY LOGIC
// ================================================================

/**
 * CONTACT IDENTIFICATION & CREATION
 * 
 * When an email arrives from an unknown sender:
 * 
 * 1. CHECK IF CONTACT EXISTS
 *    └─ Query: SELECT * FROM contacts WHERE email = $1
 *       ├─ Found → Use existing contact
 *       └─ Not found → Create new contact
 * 
 * 2. CREATE NEW CONTACT
 *    ├─ Extract name from email (before @)
 *    ├─ Or use provided fromName
 *    ├─ Set customer_type = 'prospect' (new contacts are prospects)
 *    └─ Save to contacts table
 * 
 * 3. COMPANY IDENTIFICATION
 *    ├─ Extract domain from email
 *    ├─ Check if it's personal email:
 *    │  ├─ gmail.com → Link to 'Individual'
 *    │  ├─ yahoo.com → Link to 'Individual'
 *    │  ├─ hotmail.com → Link to 'Individual'
 *    │  └─ [other personal domains...]
 *    │
 *    └─ If business email:
 *       ├─ Search for existing company with same domain
 *       ├─ Found → Use existing company
 *       └─ Not found → Create new company from domain
 * 
 * EXAMPLE SCENARIOS:
 * 
 * Scenario 1: New prospect from business email
 * ├─ Email: alice@techcorp.com
 * ├─ Contact: New contact created as 'prospect'
 * ├─ Company: 'Techcorp' created from domain
 * └─ Result: Saved to enquiries/support_tickets
 * 
 * Scenario 2: New contact from Gmail
 * ├─ Email: john@gmail.com
 * ├─ Contact: New contact created as 'prospect'
 * ├─ Company: 'Individual' (default)
 * └─ Result: Saved to enquiries/support_tickets
 * 
 * Scenario 3: Returning contact
 * ├─ Email: alice@techcorp.com (already in database)
 * ├─ Contact: Existing contact used (may have changed to 'customer')
 * ├─ Company: Existing company
 * └─ Result: New record created, contact not modified
 */

// ================================================================
// 5. DATABASE SCHEMA INTEGRATION
// ================================================================

/**
 * TABLES USED BY AI SYSTEM
 * 
 * 1. ENQUIRIES TABLE (for enquiry intent)
 *    ├─ id (UUID, PK)
 *    ├─ contact_id (UUID, FK → contacts)
 *    ├─ company_id (UUID, FK → companies)
 *    ├─ subject (VARCHAR)
 *    ├─ message (TEXT) ← Original email message
 *    ├─ status ('new' → 'replied' → 'closed')
 *    │  └─ 'new': AI just created it
 *    │  └─ 'replied': Marketing user sent a reply
 *    │  └─ 'closed': Marketing user closed it
 *    ├─ customer_type ('prospect' → 'customer' → 'client')
 *    │  └─ 'prospect': New contact from email
 *    │  └─ 'customer': Marketing user sent reply
 *    │  └─ 'client': (optional upgrade)
 *    ├─ ai_reply (TEXT) ← AI-generated draft, can be edited
 *    ├─ created_at (TIMESTAMP)
 *    ├─ updated_at (TIMESTAMP)
 *    └─ deleted_at (TIMESTAMP, nullable)
 * 
 * 2. SUPPORT_TICKETS TABLE (for support intent)
 *    ├─ id (UUID, PK)
 *    ├─ contact_id (UUID, FK → contacts)
 *    ├─ company_id (UUID, FK → companies)
 *    ├─ subject (VARCHAR)
 *    ├─ issue (TEXT) ← Original email issue
 *    ├─ status ('open' → 'resolved' → 'closed')
 *    │  └─ 'open': AI just created it
 *    │  └─ 'resolved': Support user replied
 *    │  └─ 'closed': Issue fully closed
 *    ├─ priority ('low' | 'medium' | 'high')
 *    │  └─ Set to 'medium' by AI (users can change)
 *    ├─ ai_reply (TEXT) ← AI-generated draft
 *    ├─ created_at (TIMESTAMP)
 *    ├─ updated_at (TIMESTAMP)
 *    └─ deleted_at (TIMESTAMP, nullable)
 * 
 * 3. CONTACTS TABLE (updated by AI)
 *    ├─ customer_type ('prospect' → 'customer' → 'client')
 *    │  └─ Updated when user sends reply
 *    └─ [other fields...]
 * 
 * 4. COMPANIES TABLE (created by AI if needed)
 *    ├─ name (from email domain or 'Individual')
 *    ├─ email (email domain for business companies)
 *    └─ [other fields...]
 */

// ================================================================
// 6. API ENDPOINTS
// ================================================================

/**
 * ENDPOINT 1: POST /api/emails/receive
 * 
 * DESCRIPTION: Receive incoming email and process with AI
 * 
 * AUTHENTICATION: None (should be IP-restricted in production)
 * 
 * REQUEST:
 * {
 *   "fromEmail": "john@company.com",
 *   "fromName": "John Doe",
 *   "subject": "Need a demo",
 *   "message": "Can you give us a demo of your product?"
 * }
 * 
 * RESPONSE SUCCESS (200):
 * {
 *   "success": true,
 *   "message": "Email processed successfully by AI",
 *   "data": {
 *     "type": "enquiry",
 *     "id": "550e8400-e29b-41d4-a716-446655440000",
 *     "subject": "Need a demo",
 *     "status": "new",
 *     "aiProcessing": {
 *       "intent": "enquiry",
 *       "confidence": 75.5,
 *       "draftReply": "Dear John Doe,\n\nThank you for reaching out..."
 *     }
 *   }
 * }
 * 
 * RESPONSE ERROR (400):
 * {
 *   "success": false,
 *   "message": "Missing required fields: fromEmail, subject, message"
 * }
 */

/**
 * ENDPOINT 2: GET /api/emails/history
 * 
 * DESCRIPTION: Get email processing history
 * 
 * AUTHENTICATION: Required (JWT token)
 * ROLE FILTERING:
 *   - Admin: Sees all enquiries and support tickets
 *   - Marketing: Sees only enquiries
 *   - Support: Sees only support tickets
 * 
 * QUERY PARAMETERS:
 *   limit: number of records (default: 50)
 * 
 * RESPONSE (200):
 * {
 *   "success": true,
 *   "count": 25,
 *   "data": [
 *     {
 *       "type": "enquiry",
 *       "id": "...",
 *       "subject": "Need a demo",
 *       "message": "Can you give us a demo?",
 *       "status": "new",
 *       "contact_name": "John Doe",
 *       "email": "john@company.com",
 *       "company_name": "Tech Corp",
 *       "created_at": "2025-01-27T10:00:00Z"
 *     },
 *     ...
 *   ]
 * }
 */

/**
 * ENDPOINT 3: GET /api/emails/stats
 * 
 * DESCRIPTION: Get AI processing statistics
 * 
 * AUTHENTICATION: Required (Admin only)
 * 
 * RESPONSE (200):
 * {
 *   "success": true,
 *   "data": {
 *     "totalEnquiriesProcessed": 45,
 *     "totalSupportProcessed": 12,
 *     "newEnquiries": 8,
 *     "openTickets": 3
 *   }
 * }
 */

/**
 * ENDPOINT 4: POST /api/emails/test/intent-detection
 * 
 * DESCRIPTION: Test intent detection (for debugging)
 * 
 * AUTHENTICATION: Required (JWT token)
 * 
 * REQUEST:
 * {
 *   "message": "I have an error in my system"
 * }
 * 
 * RESPONSE (200):
 * {
 *   "success": true,
 *   "data": {
 *     "intent": "support",
 *     "confidence": 92.5,
 *     "matchedSupportKeywords": ["error"],
 *     "matchedEnquiryKeywords": [],
 *     "explanation": "AI detected intent as 'support' with 92.5% confidence..."
 *   }
 * }
 */

/**
 * ENDPOINT 5: POST /api/emails/test/reply-generation
 * 
 * DESCRIPTION: Test reply generation (for debugging)
 * 
 * AUTHENTICATION: Required (JWT token)
 * 
 * REQUEST:
 * {
 *   "contactName": "John Doe",
 *   "intent": "enquiry"
 * }
 * 
 * RESPONSE (200):
 * {
 *   "success": true,
 *   "data": {
 *     "intent": "enquiry",
 *     "contactName": "John Doe",
 *     "sampleReplies": [
 *       "Dear John Doe, Thank you for reaching out...",
 *       "Dear John Doe, We appreciate your interest...",
 *       "Dear John Doe, Thank you for your inquiry..."
 *     ],
 *     "explanation": "AI generates professional replies..."
 *   }
 * }
 */

// ================================================================
// 7. DASHBOARD INTEGRATION
// ================================================================

/**
 * MARKETING DASHBOARD
 * 
 * NEW ENQUIRIES WORKFLOW:
 * 1. AI receives email → Creates enquiry with status='new'
 * 2. Marketing user logs in → Sees enquiry in list
 * 3. User clicks "View" → Sees:
 *    ├─ Original customer message
 *    ├─ AI-generated reply draft
 *    └─ Editable reply textarea
 * 4. User can:
 *    ├─ Edit the reply
 *    └─ Click "Send Reply"
 * 5. On send:
 *    ├─ enquiries.ai_reply → Updated with user's text
 *    ├─ enquiries.status → 'replied'
 *    ├─ enquiries.updated_at → Current timestamp
 *    ├─ contacts.customer_type → 'customer'
 *    └─ contacts.updated_at → Current timestamp
 * 6. Marketing can later:
 *    ├─ View replied enquiries
 *    └─ Click "Close Enquiry" to set status='closed'
 */

/**
 * SUPPORT DASHBOARD
 * 
 * NEW SUPPORT TICKETS WORKFLOW:
 * 1. AI receives email → Creates support_ticket with status='open'
 * 2. Support user logs in → Sees ticket in list
 * 3. User clicks "View" → Sees:
 *    ├─ Original customer issue
 *    ├─ AI-generated reply draft
 *    └─ Editable reply textarea
 * 4. User can:
 *    ├─ Edit the reply
 *    └─ Click "Send Reply"
 * 5. On send:
 *    ├─ support_tickets.ai_reply → Updated with user's text
 *    ├─ support_tickets.status → 'resolved'
 *    ├─ support_tickets.updated_at → Current timestamp
 *    ├─ contacts.customer_type → 'client' (upgraded from customer/prospect)
 *    └─ contacts.updated_at → Current timestamp
 * 6. Support can later:
 *    ├─ View resolved tickets
 *    └─ Click "Close Ticket" to set status='closed'
 */

/**
 * ADMIN DASHBOARD
 * 
 * AI PROCESSING VIEW:
 * 1. Admin can see:
 *    ├─ All enquiries and support tickets
 *    ├─ AI intent detection (enquiry vs support)
 *    ├─ Confidence scores
 *    ├─ Processing history
 *    └─ Processing statistics
 * 
 * 2. Admin can:
 *    ├─ View complete processing metadata
 *    ├─ Monitor AI decisions
 *    ├─ Understand intent distribution
 *    └─ Test AI with /test endpoints
 * 
 * 3. Admin CANNOT:
 *    └─ Trigger AI manually (AI only runs on email intake)
 */

// ================================================================
// 8. IMPORTANT CONSTRAINTS
// ================================================================

/**
 * AI RESPONSIBILITIES (What AI DOES):
 * ✓ Detect intent from incoming emails
 * ✓ Generate professional reply drafts
 * ✓ Create contacts as 'prospect'
 * ✓ Create companies from email domains
 * ✓ Save to database automatically
 * ✓ Calculate confidence scores
 * 
 * AI BOUNDARIES (What AI DOES NOT):
 * ✗ Send emails automatically
 * ✗ Change status automatically (always 'new' or 'open')
 * ✗ Upgrade customer_type automatically
 * ✗ Delete or modify existing data
 * ✗ Bypass role-based access control
 * ✗ Make decisions for users
 * ✗ Use external paid APIs
 */

/**
 * USER RESPONSIBILITIES (What USERS DO):
 * ✓ Review AI's generated replies
 * ✓ Edit replies as needed
 * ✓ Send replies (triggers status and customer_type updates)
 * ✓ Close enquiries/tickets
 * ✓ Make business decisions
 * 
 * PERMISSION REQUIREMENTS:
 * Marketing:
 *   - Can view enquiries
 *   - Can send replies to enquiries
 * 
 * Support:
 *   - Can view support tickets
 *   - Can send replies to tickets
 * 
 * Admin:
 *   - Can view all items
 *   - Can monitor AI decisions
 *   - Can test AI endpoints
 */

// ================================================================
// 9. TESTING WORKFLOWS
// ================================================================

/**
 * TEST 1: Enquiry Processing
 * 
 * 1. POST /api/emails/receive
 *    {
 *      "fromEmail": "prospect@newcompany.com",
 *      "fromName": "Alice Johnson",
 *      "subject": "Interested in pricing",
 *      "message": "What is your pricing for the enterprise plan? We need a quote."
 *    }
 * 
 * 2. Check response:
 *    ├─ type should be 'enquiry'
 *    ├─ intent should be 'enquiry'
 *    ├─ confidence should be high (multiple pricing keywords)
 *    └─ aiReply should be professional
 * 
 * 3. Query database:
 *    ├─ New contact created as 'prospect'
 *    ├─ New company 'Newcompany' created
 *    ├─ Enquiry created with status='new'
 *    └─ ai_reply stored in database
 * 
 * 4. Log into Marketing Dashboard:
 *    ├─ Enquiry appears in list
 *    ├─ Click "View"
 *    ├─ Edit the reply if needed
 *    ├─ Click "Send Reply"
 *    └─ Status changes to 'replied', customer_type to 'customer'
 */

/**
 * TEST 2: Support Ticket Processing
 * 
 * 1. POST /api/emails/receive
 *    {
 *      "fromEmail": "customer@company.com",
 *      "fromName": "Bob Smith",
 *      "subject": "System Error",
 *      "message": "I'm getting an error when I try to login. Can't access my account."
 *    }
 * 
 * 2. Check response:
 *    ├─ type should be 'support_ticket'
 *    ├─ intent should be 'support'
 *    ├─ confidence should be high (error, login, can't)
 *    └─ aiReply should be support-focused
 * 
 * 3. Query database:
 *    ├─ Contact found or created
 *    ├─ Support ticket created with status='open'
 *    └─ ai_reply stored with support template
 * 
 * 4. Log into Support Dashboard:
 *    ├─ Ticket appears in list
 *    ├─ Click "View"
 *    ├─ Edit the reply if needed
 *    ├─ Click "Send Reply"
 *    └─ Status changes to 'resolved', customer_type to 'client'
 */

module.exports = {
  description: 'AI Simulation Integration Guide',
  version: '1.0',
  lastUpdated: '2025-01-27'
};
