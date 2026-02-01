# Complete Setup Instructions

## Overview
This is a complete Email-Based CRM system with Role-Based Access Control (RBAC) and AI-simulated replies. The project is divided into:
- **Backend**: Node.js/Express REST API
- **Frontend**: HTML/CSS/JavaScript
- **Database**: PostgreSQL

---

## Prerequisites Checklist

- [ ] Node.js v14+ installed
- [ ] PostgreSQL v12+ installed and running
- [ ] npm installed
- [ ] Git (optional)

---

## Step 1: Database Setup

### 1.1 Start PostgreSQL

**On Windows:**
```bash
# PostgreSQL service should start automatically
# Or start it manually via Services app
```

**Verify PostgreSQL is running:**
```bash
psql --version
```

### 1.2 Create Database

```bash
# Open PostgreSQL terminal
psql -U postgres

# Create the CRM database
CREATE DATABASE email_crm_db;

# Exit PostgreSQL
\q
```

---

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd "c:\Users\daksh\Desktop\ai rbac system\backend"
```

### 2.2 Install Dependencies

```bash
npm install
```

**Expected output:**
```
added 50+ packages in X.XXs
```

### 2.3 Configure Environment Variables

Copy the example file:
```bash
copy .env.example .env
```

Edit `.env` file with your database credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=email_crm_db
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_change_this_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### 2.4 Run Database Migrations

Create all tables and insert roles/permissions:

```bash
node migrations/run.js
```

**Expected output:**
```
Starting database migration...
✓ Database migration completed successfully!
```

### 2.5 Seed Sample Data

Insert test users and sample data:

```bash
node migrations/sample-data.js
```

**Expected output:**
```
Seeding sample data...
✓ Sample data seeded successfully!

Test Credentials:
Admin:     admin@company.com / admin123
Marketing: marketing@company.com / marketing123
Support:   support@company.com / support123
```

### 2.6 Start Backend Server

```bash
npm start
```

**Expected output:**
```
╔════════════════════════════════════════════════════════╗
║     Email-Based CRM System with RBAC                   ║
║     Server running on http://localhost:5000            ║
╚════════════════════════════════════════════════════════╝
```

**Keep this terminal running!** Open a new terminal for the next steps.

---

## Step 3: Frontend Setup

### 3.1 Open New Terminal

Open a new command prompt/PowerShell window.

### 3.2 Navigate to Frontend Directory

```bash
cd "c:\Users\daksh\Desktop\ai rbac system\frontend"
```

### 3.3 Run Frontend Server

**Option A: Using http-server (Recommended)**

```bash
# Install http-server globally (one time)
npm install -g http-server

# Start server on port 3000
http-server -p 3000
```

**Option B: Using Python**

```bash
# If you have Python installed
python -m http.server 3000
```

**Option C: Open Directly**

- Simply open `index.html` in your web browser
- Application will work but API calls might have CORS issues

**Expected output (http-server):**
```
Starting up http-server, serving ./
http://127.0.0.1:3000

Press Ctrl-C to stop the server
```

---

## Step 4: Access the Application

### 4.1 Open Browser

Open your web browser and go to:
```
http://localhost:3000
```

You should see the login page.

### 4.2 Login with Test Credentials

**Admin Account:**
```
Email: admin@company.com
Password: admin123
```

**Marketing Account:**
```
Email: marketing@company.com
Password: marketing123
```

**Support Account:**
```
Email: support@company.com
Password: support123
```

---

## Step 5: Test the System

### 5.1 Test as Admin

1. Login with admin credentials
2. You should see:
   - Dashboard with statistics
   - Users management panel
   - Enquiries list
   - Support tickets list
   - Contacts list

### 5.2 Create a Test User

1. Click "Users" tab
2. Click "+ Create User" button
3. Fill in:
   - Name: "Test User"
   - Email: "test@company.com"
   - Role: "marketing"
4. Click "Create User"
5. New user list should show the created user

### 5.3 Test Email Intake

Send a test email via API. Open a **third terminal** and run:

```bash
# Windows PowerShell
$body = @{
    senderEmail = "customer@example.com"
    senderName = "Jane Smith"
    subject = "Need your pricing"
    message = "Hi, I'm interested in your service. What are your pricing plans?"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/emails/receive" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

Or using **curl** (if available):

```bash
curl -X POST http://localhost:5000/api/emails/receive \
  -H "Content-Type: application/json" \
  -d "{\"senderEmail\":\"customer@example.com\",\"senderName\":\"Jane Smith\",\"subject\":\"Need your pricing\",\"message\":\"Hi, I'm interested in your service. What are your pricing plans?\"}"
```

### 5.4 View in Marketing Dashboard

1. Logout from admin
2. Login as marketing user (marketing@company.com / marketing123)
3. Go to Enquiries tab
4. You should see the newly created enquiry with:
   - Subject: "Need your pricing"
   - Contact: Jane Smith
   - AI-generated reply (editable)
5. You can edit the reply and click "Send Reply"

---

## Project Structure Reference

```
ai rbac system/
│
├── backend/                    # Node.js Express API
│   ├── config/                # Configuration files
│   ├── controllers/           # Business logic
│   ├── middleware/            # Auth & error handling
│   ├── models/                # Database queries
│   ├── routes/                # API endpoints
│   ├── services/              # AI simulation
│   ├── utils/                 # Helper functions
│   ├── migrations/            # Database setup
│   ├── server.js              # Main app file
│   ├── package.json           # Dependencies
│   ├── .env.example           # Environment template
│   ├── .env                   # Your config (create this)
│   └── API_DOCUMENTATION.md   # Complete API docs
│
├── frontend/                  # HTML/CSS/JavaScript
│   ├── index.html             # Login page
│   ├── admin-dashboard.html   # Admin panel
│   ├── marketing-dashboard.html # Marketing panel
│   ├── support-dashboard.html # Support panel
│   ├── css/
│   │   └── style.css          # Styling
│   └── js/
│       ├── api.js             # API client
│       ├── auth.js            # Auth logic
│       └── *-dashboard.js     # Panel logic
│
├── README.md                  # Full documentation
├── QUICK_START.md             # Quick reference
└── SETUP.md                   # This file
```

---

## Database Tables

The system automatically creates these tables:

| Table | Purpose |
|-------|---------|
| `roles` | User roles (admin, marketing, support) |
| `role_permissions` | Permissions per role |
| `users` | System users with auth |
| `companies` | Customer companies |
| `contacts` | Customers/leads |
| `enquiries` | Email enquiries |
| `support_tickets` | Support issues |

---

## Key Features Explained

### 1. Email Intake Flow
```
Incoming Email
    ↓
Check if contact exists
    ↓
Run AI intent detection
    ↓
Generate AI reply draft
    ↓
Save to database
    ↓
Available for review in dashboard
```

### 2. AI Simulation
- Rule-based keyword detection (no API calls)
- Detects "Enquiry" vs "Support" intent
- Generates human-like replies
- Each reply is unique (randomized templates)

### 3. Role-Based Access Control
```
Admin      → Create users, manage all
Marketing  → View & reply to enquiries
Support    → View & reply to tickets
```

### 4. User Authentication
- JWT tokens (expire in 7 days)
- Bcrypt password hashing
- Permission-based middleware

---

## API Endpoints (Quick Reference)

**Authentication:**
- `POST /api/auth/login` - Login user
- `POST /api/auth/set-password/:userId` - Set password

**Users (Admin only):**
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

**Enquiries:**
- `GET /api/enquiries` - List enquiries
- `POST /api/enquiries/:id/reply` - Reply to enquiry

**Support Tickets:**
- `GET /api/support/tickets` - List tickets
- `POST /api/support/tickets/:id/reply` - Reply to ticket

**Email Intake:**
- `POST /api/emails/receive` - Process incoming email

See [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) for complete details.

---

## Troubleshooting

### Issue: "Can't connect to PostgreSQL"

**Solution:**
1. Verify PostgreSQL service is running
2. Check .env database credentials
3. Ensure database exists:
   ```bash
   psql -U postgres -l
   ```

### Issue: Backend gives "Port 5000 already in use"

**Solution:**
```bash
# Change port in .env
PORT=5001

# Restart backend
npm start
```

### Issue: Frontend shows "Failed to fetch"

**Solution:**
1. Verify backend is running on port 5000
2. Check CORS is enabled
3. Clear browser cache and cookies
4. Check Network tab in browser DevTools

### Issue: Can't login with test credentials

**Solution:**
```bash
# Reseed the database
node migrations/sample-data.js

# Or check if tables exist
psql -U postgres -d email_crm_db
\dt  # List all tables
```

### Issue: Frontend static files not loading

**Solution:**
- Use `http-server` instead of opening .html directly
- Or use Python server: `python -m http.server 3000`

---

## Next Steps

1. **Customize AI Replies**: Edit `backend/services/aiService.js`
2. **Add More Users**: Use the admin panel to create users
3. **Test All Dashboards**: Try all three roles
4. **Read Documentation**: See [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)
5. **Deploy**: When ready, deploy to hosting platform

---

## Terminal Commands Reference

### Backend Commands
```bash
# Start server
npm start

# Development mode with auto-reload
npm run dev

# Run migrations
node migrations/run.js

# Seed data
node migrations/sample-data.js
```

### Frontend Commands
```bash
# Start http-server
http-server -p 3000

# Or Python server
python -m http.server 3000
```

### Database Commands
```bash
# Connect to database
psql -U postgres -d email_crm_db

# List tables
\dt

# View table structure
\d table_name

# Exit
\q
```

---

## Success Checklist

- [ ] PostgreSQL created and running
- [ ] Backend dependencies installed
- [ ] Database tables created
- [ ] Sample data seeded
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Can login with test credentials
- [ ] Admin panel loads all sections
- [ ] Can send test email via API
- [ ] Can see enquiry in marketing dashboard

If all checks pass, you're ready to use the system! 🎉

---

## Support & Documentation

- **API Docs**: [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)
- **Full README**: [README.md](README.md)
- **Quick Start**: [QUICK_START.md](QUICK_START.md)
- **Code Comments**: See inline comments in all files

---

**Happy Coding! 🚀**
