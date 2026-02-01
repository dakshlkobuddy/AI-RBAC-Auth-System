# Email-Based CRM System with RBAC and AI Simulation

A beginner-friendly, single-company CRM system that processes incoming emails, detects intent using AI simulation (rule-based), generates AI reply drafts, and allows role-based users to review and send replies.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [User Roles & Permissions](#user-roles--permissions)
- [Testing](#testing)

---

## Features

### 1. **User Authentication & Authorization (RBAC)**
- JWT-based authentication
- Role-based access control (Admin, Marketing, Support)
- Secure password management with bcrypt
- Permission-based middleware

### 2. **Email Processing**
- API endpoint to receive incoming emails
- Automatic contact detection and classification
- AI-simulated intent detection (Enquiry vs Support)
- AI-generated reply drafts (rule-based, no paid APIs)

### 3. **Admin Dashboard**
- User management (Create, View, Update, Delete users)
- View all customers/contacts
- View all enquiries and support tickets
- Manage and reply to enquiries
- Manage and reply to support tickets

### 4. **Marketing Dashboard**
- View enquiries
- See customer details and company info
- View and edit AI-generated replies
- Send enquiry replies

### 5. **Support Dashboard**
- View support tickets
- See customer details and company info
- View and edit AI-generated replies
- Send support replies

---

## Tech Stack

**Backend:**
- Node.js
- Express.js
- PostgreSQL
- JWT (JSON Web Tokens)
- bcryptjs (Password hashing)
- UUID (Unique IDs)

**Frontend:**
- HTML5
- CSS3
- Vanilla JavaScript
- RESTful API calls

**No Paid APIs Used:**
- AI simulation is completely rule-based using keyword detection
- No external AI services required

---

## Project Structure

```
ai rbac system/
├── backend/
│   ├── config/
│   │   ├── database.js          # PostgreSQL connection
│   │   └── constants.js         # Roles, permissions, status constants
│   ├── controllers/
│   │   ├── authController.js    # Login, set password
│   │   ├── userController.js    # User CRUD operations
│   │   ├── enquiryController.js # Enquiry management
│   │   ├── supportTicketController.js  # Support ticket management
│   │   ├── emailController.js   # Email processing
│   │   └── contactController.js # Contact management
│   ├── middleware/
│   │   ├── authenticate.js      # JWT verification
│   │   ├── authorize.js         # Permission checking
│   │   └── errorHandler.js      # Global error handling
│   ├── models/
│   │   ├── Role.js              # Role queries
│   │   ├── User.js              # User queries
│   │   ├── Company.js           # Company queries
│   │   ├── Contact.js           # Contact queries
│   │   ├── Enquiry.js           # Enquiry queries
│   │   └── SupportTicket.js     # Support ticket queries
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication endpoints
│   │   ├── userRoutes.js        # User management endpoints
│   │   ├── enquiryRoutes.js     # Enquiry endpoints
│   │   ├── supportTicketRoutes.js # Support ticket endpoints
│   │   ├── emailRoutes.js       # Email processing endpoint
│   │   └── contactRoutes.js     # Contact endpoints
│   ├── services/
│   │   └── aiService.js         # AI simulation logic
│   ├── utils/
│   │   ├── authUtils.js         # JWT and password utilities
│   │   └── rbacUtils.js         # RBAC helper functions
│   ├── migrations/
│   │   ├── run.js               # Database setup script
│   │   └── sample-data.js       # Sample data seeding
│   ├── server.js                # Express app setup
│   ├── package.json             # Dependencies
│   ├── .env.example             # Environment variables template
│   └── API_DOCUMENTATION.md     # Detailed API docs
├── frontend/
│   ├── index.html               # Login page
│   ├── admin-dashboard.html     # Admin panel
│   ├── marketing-dashboard.html # Marketing panel
│   ├── support-dashboard.html   # Support panel
│   ├── css/
│   │   └── style.css            # Main stylesheet
│   └── js/
│       ├── api.js               # API client
│       ├── auth.js              # Authentication logic
│       ├── admin-dashboard.js   # Admin panel logic
│       ├── marketing-dashboard.js # Marketing panel logic
│       └── support-dashboard.js # Support panel logic
└── README.md                    # This file
```

---

## Installation

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd "c:\Users\daksh\Desktop\ai rbac system\backend"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file** (copy from .env.example):
   ```bash
   copy .env.example .env
   ```

4. **Update .env with your database credentials:**
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=email_crm_db
   JWT_SECRET=your_secret_key_change_this
   ```

---

## Configuration

### Environment Variables

Create a `.env` file in the backend folder with these settings:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=email_crm_db

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key_here_change_this
JWT_EXPIRE=7d

# Email (optional for future use)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

---

## Running the Project

### 1. **Create Database**

Create a PostgreSQL database:
```bash
psql -U postgres
CREATE DATABASE email_crm_db;
\q
```

### 2. **Run Database Migrations**

```bash
cd backend
node migrations/run.js
```

This will create all necessary tables and insert default roles and permissions.

### 3. **Seed Sample Data (Optional)**

```bash
node migrations/sample-data.js
```

This creates test users with demo credentials.

### 4. **Start Backend Server**

```bash
npm start
# or for development with auto-reload:
npm run dev
```

Server will run on: `http://localhost:5000`

### 5. **Run Frontend**

You can run the frontend using a simple HTTP server:

**Option 1: Using Node's http-server**
```bash
npm install -g http-server
cd frontend
http-server -p 3000
```

**Option 2: Using Python**
```bash
cd frontend
python -m http.server 3000
```

**Option 3: Open directly in browser**
- Open `frontend/index.html` in your web browser

Frontend will be available at: `http://localhost:3000`

---

## Database Setup

### Tables Created

1. **roles** - User roles (admin, marketing, support)
2. **role_permissions** - Permissions assigned to each role
3. **users** - System users with authentication
4. **companies** - Customer companies
5. **contacts** - Individual contacts/customers
6. **enquiries** - Email enquiries from customers
7. **support_tickets** - Support issues from customers

### Database Schema

All tables use UUID primary keys for security and scalability.

---

## API Documentation

See [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) for complete API reference.

### Key Endpoints

**Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/set-password/:userId` - Set password for new user

**Users (Admin):**
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:userId` - Update user
- `DELETE /api/users/:userId` - Delete user

**Enquiries:**
- `GET /api/enquiries` - Get all enquiries
- `GET /api/enquiries/:enquiryId` - Get single enquiry
- `POST /api/enquiries/:enquiryId/reply` - Reply to enquiry

**Support Tickets:**
- `GET /api/support/tickets` - Get all tickets
- `GET /api/support/tickets/:ticketId` - Get single ticket
- `POST /api/support/tickets/:ticketId/reply` - Reply to ticket

**Email Intake:**
- `POST /api/emails/receive` - Receive and process incoming email

**Contacts:**
- `GET /api/contacts` - Get all contacts
- `GET /api/contacts/:contactId` - Get single contact

---

## User Roles & Permissions

### Admin
- Create, view, update, and delete users
- View all customers and enquiries
- View and reply to all enquiries
- View and reply to all support tickets

### Marketing
- View enquiries
- View customer and company details
- Edit and send enquiry replies

### Support
- View support tickets
- View customer and company details
- Edit and send support replies

---

## Testing

### Test Credentials

After running sample-data migration:

**Admin:**
- Email: `admin@company.com`
- Password: `admin123`

**Marketing:**
- Email: `marketing@company.com`
- Password: `marketing123`

**Support:**
- Email: `support@company.com`
- Password: `support123`

### Testing Email Intake

Send a test email using the API:

```bash
curl -X POST http://localhost:5000/api/emails/receive \
  -H "Content-Type: application/json" \
  -d '{
    "senderEmail": "customer@example.com",
    "senderName": "Jane Smith",
    "subject": "Need pricing information",
    "message": "What are your product pricing plans and features?"
  }'
```

The system will:
1. Detect intent (Enquiry based on keywords like "pricing")
2. Check if contact exists (create as prospect if not)
3. Generate AI-based reply draft
4. Save to enquiries table
5. Make available to marketing team

---

## AI Simulation Details

### Intent Detection
The AI service uses keyword matching to detect intent:

**Enquiry Keywords:** pricing, price, cost, quote, plan, features, how much, demo, trial, product, service, etc.

**Support Keywords:** issue, problem, error, bug, broken, help, support, urgent, crash, fail, complaint, refund, etc.

### Reply Generation
- Rule-based templates with randomized variations
- No external API calls
- Contextual greetings and closings
- Professional, human-like tone
- Customer name personalization

### Example Flow
```
Customer Email: "We're interested in your pricing and need a demo"
↓
Intent Detection: ENQUIRY (pricing + demo keywords)
↓
Contact Check: New email → Create as prospect
↓
AI Reply Generation: 
  "Dear [Name], Thank you for reaching out..."
  [Random template variation]
↓
Save to Database: enquiries table with status "new"
↓
Marketing Review: Can edit and send reply
```

---

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check DB credentials in .env
- Verify database exists

### Port Already in Use
- Backend: Change PORT in .env
- Frontend: Use different port: `http-server -p 3001`

### CORS Errors
- Ensure CORS is enabled in backend (see server.js)
- Update FRONTEND_URL in .env

### Logout Redirect Issues
- Clear browser localStorage
- Ensure token is properly removed on logout

---

## Future Enhancements

1. **Email Integration** - Real SMTP email receiving
2. **Advanced AI** - Integration with LLMs (optional)
3. **Email Templates** - Custom reply templates
4. **Conversation History** - Track email threads
5. **Analytics Dashboard** - Response times, resolution rates
6. **Mobile App** - React Native frontend
7. **Email Notifications** - Real-time alerts
8. **Document Upload** - Attachment handling
9. **Multi-company Support** - Multiple company tenants
10. **API Key Authentication** - For third-party integrations

---

## Security Considerations

- All passwords are hashed with bcryptjs
- JWT tokens expire after 7 days
- RBAC middleware validates permissions on every request
- SQL injection protection via parameterized queries
- CORS enabled for frontend communication
- Environment variables for sensitive data

---

## License
ISC

---

## Support
For issues or questions, please refer to the API documentation or check the code comments for detailed explanations.

Happy coding! 🚀
