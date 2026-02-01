# Quick Start Guide

## 1. Database Setup (PostgreSQL)

```bash
# Create database
psql -U postgres
CREATE DATABASE email_crm_db;
\q
```

## 2. Backend Configuration

```bash
cd backend

# Install dependencies
npm install

# Create .env file (update with your database credentials)
copy .env.example .env

# Run database migrations
node migrations/run.js

# Seed sample data
node migrations/sample-data.js

# Start server (runs on port 5000)
npm start
```

## 3. Frontend Setup

```bash
cd frontend

# Option A: Using http-server
npx http-server -p 3000

# Option B: Using Python
python -m http.server 3000

# Option C: Open directly in browser
# Open index.html with your browser
```

## 4. Login with Demo Credentials

Open `http://localhost:3000` and login with:

```
Email: admin@company.com
Password: admin123
```

Or:
```
Email: marketing@company.com
Password: marketing123
```

Or:
```
Email: support@company.com
Password: support123
```

## 5. Test Email Intake

Send a test email to the system:

```bash
curl -X POST http://localhost:5000/api/emails/receive \
  -H "Content-Type: application/json" \
  -d '{
    "senderEmail": "john@example.com",
    "senderName": "John Doe",
    "subject": "Need your pricing plans",
    "message": "Hi, I am interested in your service. Can you send me your pricing and features?"
  }'
```

## 6. Check Marketing Dashboard

1. Login as marketing user
2. Go to Enquiries tab
3. See the newly created enquiry with AI-generated reply
4. Edit and send the reply

## Key Features

### Admin Can:
- Manage users (create, edit, delete)
- View all customers, enquiries, and tickets
- Reply to all enquiries and tickets

### Marketing Can:
- View enquiries
- See customer details
- Edit and send enquiry replies

### Support Can:
- View support tickets
- See customer details
- Edit and send support replies

## Folder Structure

```
backend/
├── config/       - Database & constants
├── controllers/  - Business logic
├── middleware/   - Authentication & authorization
├── models/       - Database queries
├── routes/       - API endpoints
├── services/     - AI simulation logic
├── utils/        - Helper functions
├── migrations/   - Database setup
└── server.js     - Express app

frontend/
├── index.html                 - Login page
├── admin-dashboard.html       - Admin panel
├── marketing-dashboard.html   - Marketing panel
├── support-dashboard.html     - Support panel
├── css/style.css              - Styling
└── js/
    ├── api.js                 - API calls
    ├── auth.js                - Authentication
    └── *-dashboard.js         - Panel logic
```

## Environment Variables (.env)

```
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
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=http://localhost:3000
```

## Troubleshooting

**Backend won't start?**
- Check PostgreSQL is running
- Verify .env database credentials
- Ensure port 5000 is free

**Can't login?**
- Verify sample data was seeded
- Check .env JWT_SECRET is set
- Clear browser localStorage

**Frontend shows 404?**
- Use http-server or Python server
- Check correct port (default 3000)
- Ensure FRONTEND_URL in backend .env matches

**CORS errors?**
- Verify CORS middleware in server.js
- Update FRONTEND_URL if needed

## API Testing

All API endpoints are documented in [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

Example requests:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'

# Get all users (replace TOKEN with your jwt token)
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer TOKEN"

# Get all enquiries
curl -X GET http://localhost:5000/api/enquiries \
  -H "Authorization: Bearer TOKEN"
```

## Next Steps

1. Customize AI reply templates in `backend/services/aiService.js`
2. Add email validation rules
3. Implement real email sending (currently only stores replies)
4. Add more customer types and statuses
5. Create admin analytics dashboard
6. Add email template customization
7. Implement conversation history/threading

Enjoy building! 🚀
