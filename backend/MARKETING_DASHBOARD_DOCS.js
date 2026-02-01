/**
 * MARKETING DASHBOARD - COMPLETE API DOCUMENTATION
 * ================================================
 * 
 * This document covers all APIs, functionality, and integration details
 * for the Marketing Dashboard in the Email-Based CRM System.
 */

// ================================================================
// 1. BACKEND APIS
// ================================================================

/**
 * GET /api/marketing/dashboard-stats
 * 
 * Description: Fetch dashboard statistics
 * 
 * Authentication: Required (JWT Bearer Token)
 * Authorization: Marketing role required
 * 
 * Request:
 *   GET /api/marketing/dashboard-stats
 *   Authorization: Bearer <jwt_token>
 * 
 * Success Response (200):
 *   {
 *     "success": true,
 *     "data": {
 *       "totalEnquiries": 10,
 *       "newEnquiries": 4,
 *       "repliedEnquiries": 6
 *     }
 *   }
 * 
 * Error Response (401/403/500):
 *   {
 *     "success": false,
 *     "message": "Error description"
 *   }
 */

/**
 * GET /api/marketing/enquiries
 * 
 * Description: Fetch all enquiries with company and contact details
 * 
 * Authentication: Required (JWT Bearer Token)
 * Authorization: Marketing role + VIEW_ENQUIRIES permission
 * 
 * Request:
 *   GET /api/marketing/enquiries
 *   Authorization: Bearer <jwt_token>
 * 
 * Success Response (200):
 *   {
 *     "success": true,
 *     "data": [
 *       {
 *         "id": "550e8400-e29b-41d4-a716-446655440000",
 *         "subject": "Need a demo",
 *         "message": "Can you give us a demo of your product?",
 *         "status": "new",
 *         "customer_type": "prospect",
 *         "ai_reply": null,
 *         "date": "2025-01-27T10:00:00Z",
 *         "contact_name": "John Doe",
 *         "email": "john@example.com",
 *         "contact_customer_type": "prospect",
 *         "company_name": "Tech Corp"
 *       },
 *       ...
 *     ]
 *   }
 * 
 * Database Query Used:
 *   SELECT e.*, c.name, c.email, c.customer_type, co.name as company_name
 *   FROM enquiries e
 *   JOIN contacts c ON e.contact_id = c.id
 *   JOIN companies co ON e.company_id = co.id
 *   WHERE e.deleted_at IS NULL
 *   ORDER BY e.created_at DESC;
 */

/**
 * GET /api/marketing/enquiries/:id
 * 
 * Description: Fetch single enquiry details with full information
 * 
 * Authentication: Required (JWT Bearer Token)
 * Authorization: Marketing role + VIEW_ENQUIRIES permission
 * 
 * URL Parameters:
 *   id: UUID of the enquiry
 * 
 * Request:
 *   GET /api/marketing/enquiries/550e8400-e29b-41d4-a716-446655440000
 *   Authorization: Bearer <jwt_token>
 * 
 * Success Response (200):
 *   {
 *     "success": true,
 *     "data": {
 *       "id": "550e8400-e29b-41d4-a716-446655440000",
 *       "subject": "Need a demo",
 *       "message": "Can you give us a demo of your product?",
 *       "status": "new",
 *       "customer_type": "prospect",
 *       "ai_reply": "Thank you for your interest. Our team will be in touch shortly.",
 *       "created_at": "2025-01-27T10:00:00Z",
 *       "contact_id": "contact-id-123",
 *       "company_id": "company-id-456",
 *       "contact_name": "John Doe",
 *       "email": "john@example.com",
 *       "contact_customer_type": "prospect",
 *       "company_name": "Tech Corp",
 *       "company_email": "info@techcorp.com",
 *       "company_phone": "+1234567890"
 *     }
 *   }
 * 
 * Error Response (404):
 *   {
 *     "success": false,
 *     "message": "Enquiry not found"
 *   }
 * 
 * Note: If ai_reply is null, it will be generated using rule-based AI
 */

/**
 * POST /api/marketing/enquiries/:id/reply
 * 
 * Description: Send reply to an enquiry
 * - Saves reply in database
 * - Changes status from 'new' to 'replied'
 * - Automatically upgrades customer_type from prospect to customer
 * 
 * Authentication: Required (JWT Bearer Token)
 * Authorization: Marketing role + REPLY_ENQUIRY permission
 * 
 * URL Parameters:
 *   id: UUID of the enquiry
 * 
 * Request Body:
 *   {
 *     "reply": "Thank you for reaching out. We would love to give you a demo. Please let us know your availability."
 *   }
 * 
 * Request:
 *   POST /api/marketing/enquiries/550e8400-e29b-41d4-a716-446655440000/reply
 *   Content-Type: application/json
 *   Authorization: Bearer <jwt_token>
 *   
 *   {
 *     "reply": "Thank you for your interest. Our team will schedule a demo."
 *   }
 * 
 * Success Response (200):
 *   {
 *     "success": true,
 *     "message": "Reply sent successfully",
 *     "data": {
 *       "id": "550e8400-e29b-41d4-a716-446655440000",
 *       "subject": "Need a demo",
 *       "message": "Can you give us a demo of your product?",
 *       "status": "replied",
 *       "customer_type": "customer",
 *       "ai_reply": "Thank you for your interest. Our team will schedule a demo.",
 *       "created_at": "2025-01-27T10:00:00Z",
 *       "updated_at": "2025-01-27T11:30:00Z"
 *     }
 *   }
 * 
 * Error Response (400):
 *   {
 *     "success": false,
 *     "message": "Reply cannot be empty"
 *   }
 * 
 * Error Response (404):
 *   {
 *     "success": false,
 *     "message": "Enquiry not found"
 *   }
 * 
 * Side Effects:
 *   - enquiries.status → 'replied'
 *   - enquiries.ai_reply → updated with sent reply
 *   - enquiries.updated_at → current timestamp
 *   - contacts.customer_type → 'customer' (if was 'prospect')
 *   - contacts.updated_at → current timestamp
 */

/**
 * POST /api/marketing/enquiries/:id/close
 * 
 * Description: Close an enquiry (mark as completed)
 * - Only available when status is 'replied'
 * - Changes status to 'closed'
 * 
 * Authentication: Required (JWT Bearer Token)
 * Authorization: Marketing role + REPLY_ENQUIRY permission
 * 
 * URL Parameters:
 *   id: UUID of the enquiry
 * 
 * Request:
 *   POST /api/marketing/enquiries/550e8400-e29b-41d4-a716-446655440000/close
 *   Authorization: Bearer <jwt_token>
 * 
 * Success Response (200):
 *   {
 *     "success": true,
 *     "message": "Enquiry closed successfully",
 *     "data": {
 *       "id": "550e8400-e29b-41d4-a716-446655440000",
 *       "status": "closed",
 *       "updated_at": "2025-01-27T12:00:00Z"
 *     }
 *   }
 * 
 * Error Response (404):
 *   {
 *     "success": false,
 *     "message": "Enquiry not found"
 *   }
 */

// ================================================================
// 2. FRONTEND INTEGRATION
// ================================================================

/**
 * Frontend Entry Points:
 * 
 * 1. Dashboard Page (Tab: "dashboard")
 *    - Loads stats via GET /api/marketing/dashboard-stats
 *    - Displays 3 stat cards
 *    - Updates on page load
 * 
 * 2. Enquiries Page (Tab: "enquiries")
 *    - Loads list via GET /api/marketing/enquiries
 *    - Displays table with 8 columns
 *    - Click "View" button to open detail view
 * 
 * 3. Enquiry Detail View
 *    - Loads via GET /api/marketing/enquiries/:id
 *    - Shows contact info, company, message
 *    - Displays editable AI reply
 *    - "Send Reply" button posts to POST /api/marketing/enquiries/:id/reply
 *    - "Close Enquiry" button posts to POST /api/marketing/enquiries/:id/close
 */

// ================================================================
// 3. SAMPLE WORKFLOW
// ================================================================

/**
 * Complete User Workflow:
 * 
 * Step 1: Login
 *   - User logs in with email: marketing@company.com, password: marketing123
 *   - Receives JWT token
 *   - Redirected to /marketing-dashboard.html
 * 
 * Step 2: View Dashboard
 *   - Page loads
 *   - JavaScript calls GET /api/marketing/dashboard-stats
 *   - Shows stats cards:
 *     - Total Enquiries: 10
 *     - New Enquiries: 4
 *     - Replied Enquiries: 6
 * 
 * Step 3: View Enquiries List
 *   - User clicks "Enquiries" tab
 *   - JavaScript calls GET /api/marketing/enquiries
 *   - Displays table with all enquiries
 * 
 * Step 4: View Enquiry Details
 *   - User clicks "View" button on a row
 *   - JavaScript calls GET /api/marketing/enquiries/:id
 *   - Shows detail view with:
 *     - Contact info
 *     - Company name
 *     - Original message from customer
 *     - AI-generated reply (editable)
 * 
 * Step 5: Send Reply
 *   - User edits the reply text
 *   - User clicks "Send Reply" button
 *   - JavaScript calls POST /api/marketing/enquiries/:id/reply
 *   - Enquiry status changes to 'replied'
 *   - Contact customer_type changes from 'prospect' to 'customer'
 *   - Returns to enquiries list
 *   - Stats are refreshed
 * 
 * Step 6: Close Enquiry
 *   - User can click "Close Enquiry" button (only if replied)
 *   - JavaScript calls POST /api/marketing/enquiries/:id/close
 *   - Enquiry status changes to 'closed'
 *   - Returns to enquiries list
 */

// ================================================================
// 4. RBAC & PERMISSIONS
// ================================================================

/**
 * Marketing User Permissions:
 * 
 * Allowed:
 *   - VIEW_ENQUIRIES: Can view all enquiries and details
 *   - REPLY_ENQUIRY: Can send replies and close enquiries
 * 
 * Not Allowed:
 *   - Cannot create, edit, or delete users
 *   - Cannot view support tickets
 *   - Cannot access admin routes
 * 
 * Middleware Check:
 *   Every marketing route checks:
 *   1. JWT token is valid (authenticate middleware)
 *   2. User role is 'marketing' (authorize middleware)
 *   3. User has required permission (authorize middleware with permission check)
 */

// ================================================================
// 5. AI REPLY GENERATION
// ================================================================

/**
 * Rule-Based AI Reply Logic:
 * 
 * The AI service detects keywords in the customer message and generates
 * professional replies without using any external AI APIs.
 * 
 * Keyword Detection:
 *   - "demo", "trial", "test" → Demo Enquiry
 *   - "price", "cost", "cheap" → Pricing Enquiry
 *   - "quote", "estimate" → Quote Enquiry
 *   - "support", "help", "issue" → Support Request (classified differently)
 *   - Default → General Enquiry
 * 
 * Reply Templates (Randomized):
 *   
 *   For Demo Enquiries:
 *     Template 1: "Thank you for your interest! Our team will schedule a demo at your earliest convenience."
 *     Template 2: "We'd love to show you our product! Please let us know your availability."
 *     Template 3: "A demo can be arranged immediately. What time works best for you?"
 *   
 *   For Pricing Enquiries:
 *     Template 1: "Pricing varies based on your requirements. Let's discuss your needs."
 *     Template 2: "We offer flexible pricing plans. Our team will send you a custom quote."
 *     Template 3: "Cost-effective solutions tailored to your budget. Contact our sales team."
 *   
 *   For General Enquiries:
 *     Template 1: "Thank you for reaching out! We appreciate your interest."
 *     Template 2: "Your enquiry is important to us. Our team will be in touch shortly."
 *     Template 3: "We're here to help! Let us know how we can assist you."
 * 
 * Generation Process:
 *   1. Detect intent from keywords in message
 *   2. Select appropriate template pool
 *   3. Randomly pick one template from pool
 *   4. Return as ai_reply
 *   5. Marketing user can edit before sending
 */

// ================================================================
// 6. DATABASE SCHEMA
// ================================================================

/**
 * Tables Used:
 * 
 * enquiries
 * ├── id (UUID, PK)
 * ├── contact_id (UUID, FK → contacts)
 * ├── company_id (UUID, FK → companies)
 * ├── subject (VARCHAR)
 * ├── message (TEXT)
 * ├── status ('new' | 'replied' | 'closed')
 * ├── customer_type ('prospect' | 'customer' | 'client')
 * ├── ai_reply (TEXT, nullable)
 * ├── created_at (TIMESTAMP)
 * ├── updated_at (TIMESTAMP)
 * └── deleted_at (TIMESTAMP, nullable)
 * 
 * contacts
 * ├── id (UUID, PK)
 * ├── company_id (UUID, FK → companies)
 * ├── name (VARCHAR)
 * ├── email (VARCHAR)
 * ├── customer_type ('prospect' | 'customer' | 'client')
 * ├── created_at (TIMESTAMP)
 * ├── updated_at (TIMESTAMP)
 * └── deleted_at (TIMESTAMP, nullable)
 * 
 * companies
 * ├── id (UUID, PK)
 * ├── name (VARCHAR)
 * ├── email (VARCHAR, nullable)
 * ├── phone (VARCHAR, nullable)
 * ├── created_at (TIMESTAMP)
 * ├── updated_at (TIMESTAMP)
 * └── deleted_at (TIMESTAMP, nullable)
 */

// ================================================================
// 7. ERROR HANDLING
// ================================================================

/**
 * Frontend Error Handling:
 * 
 * Try-Catch Blocks Wrap All API Calls:
 *   - Display user-friendly error messages
 *   - Log errors to console for debugging
 *   - Fallback UI states for failures
 * 
 * Common Error Scenarios:
 * 
 * 1. Unauthorized (401)
 *    - JWT token missing or expired
 *    - Redirect to login page
 * 
 * 2. Forbidden (403)
 *    - User doesn't have required permission
 *    - Show "Access Denied" message
 * 
 * 3. Not Found (404)
 *    - Enquiry doesn't exist
 *    - Show "Enquiry not found" message
 * 
 * 4. Server Error (500)
 *    - Database or server issue
 *    - Show "An error occurred" message
 *    - User can retry
 */

// ================================================================
// 8. TESTING CHECKLIST
// ================================================================

/**
 * Test Cases:
 * 
 * ✓ Login as marketing user
 * ✓ Dashboard page loads and shows stats
 * ✓ Enquiries page loads and displays table
 * ✓ Clicking "View" opens detail page
 * ✓ Original message and AI reply are displayed
 * ✓ Editing reply text works
 * ✓ Clicking "Send Reply" saves reply and changes status to 'replied'
 * ✓ Customer type changes from prospect to customer
 * ✓ Stats refresh after sending reply
 * ✓ "Close Enquiry" button appears only after reply is sent
 * ✓ Clicking "Close Enquiry" changes status to 'closed'
 * ✓ Logout button works and returns to login page
 * ✓ Non-marketing users cannot access marketing routes
 * ✓ Missing JWT token shows unauthorized error
 */

// ================================================================
// 9. DEPLOYMENT NOTES
// ================================================================

/**
 * Prerequisites:
 * - PostgreSQL database with schema created (migrations/run.js)
 * - Sample data seeded (migrations/sample-data.js)
 * - Backend server running on port 5000
 * - Frontend server running on port 3000
 * 
 * Configuration:
 * - .env file has correct DB_PASSWORD
 * - JWT_SECRET is set in .env
 * - Frontend API_BASE_URL points to backend correctly
 * 
 * Monitoring:
 * - Check browser console for JavaScript errors
 * - Check server logs for API errors
 * - Verify database queries are working
 */

module.exports = {
  apis: {
    dashboardStats: 'GET /api/marketing/dashboard-stats',
    getEnquiries: 'GET /api/marketing/enquiries',
    getEnquiryDetails: 'GET /api/marketing/enquiries/:id',
    sendReply: 'POST /api/marketing/enquiries/:id/reply',
    closeEnquiry: 'POST /api/marketing/enquiries/:id/close'
  },
  permissions: {
    marketing: ['VIEW_ENQUIRIES', 'REPLY_ENQUIRY']
  }
};
