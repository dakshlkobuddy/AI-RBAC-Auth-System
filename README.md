# Email CRM System (RBAC + IMAP + AI)

An email-first CRM that reads a company inbox, classifies emails (enquiry/support), extracts details, drafts replies, and routes items to role-specific dashboards. Built with Node.js + PostgreSQL and a static HTML/JS frontend.

---

## Table of Contents
1. Features
2. Tech Stack
3. Project Structure
4. Installation
5. Configuration
6. Database Setup
7. Running the Project
8. Email Ingestion (IMAP)
9. AI & Intent Detection
10. User Roles & Permissions
11. API Notes
12. API Examples
13. Screenshots
14. Troubleshooting

---

## Features

- IMAP inbox polling with Gmail support
- Automatic intent detection (enquiry vs support)
- NLP extraction of customer details
- AI-generated reply drafts
- Role-based dashboards (Admin, Marketing, Support)
- User invite + password setup via email token
- Contact, enquiry, support ticket management

---

## Tech Stack

Backend:
- Node.js, Express
- PostgreSQL
- ImapFlow (IMAP client)
- Nodemailer (SMTP)
- JWT + bcrypt
- Ollama (local LLM)

Frontend:
- HTML, CSS, Vanilla JS

---

## Project Structure

```
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
  migrations/
  server.js
  .env.example
frontend/
  index.html
  admin-dashboard.html
  marketing-dashboard.html
  support-dashboard.html
  set-password.html
  css/
  js/
README.md
```

---

## Installation

Prerequisites:
- Node.js 16+
- PostgreSQL 12+

Backend:
```
cd backend
npm install
```

Frontend:
- Serve `frontend/` with any static server

---

## Configuration

Create `backend/.env` (copy from `.env.example`) and fill values:

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
JWT_SECRET=your_secret_key_here_change_this
JWT_EXPIRE=7d
PASSWORD_SETUP_EXPIRE=24h

# Company Email (inbound)
COMPANY_EMAIL=your_company_email@gmail.com

# IMAP (Gmail)
IMAP_ENABLED=true
IMAP_DEBUG=true
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_SECURE=true
IMAP_USER=your_company_email@gmail.com
IMAP_PASS=your_app_password
IMAP_MAILBOX=INBOX
IMAP_POLL_MS=10000
IMAP_SOCKET_TIMEOUT=300000

# SMTP (reply + password setup emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_company_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_EMAIL=your_company_email@gmail.com
SMTP_FROM_NAME=Accompworld CRM Team
SMTP_SECURE=false

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Ollama (local LLM)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

Note:
- Use a Gmail App Password for IMAP/SMTP.
- `IMAP_MAILBOX` should be a valid mailbox (INBOX or [Gmail]/All Mail).

---

## Database Setup

Create database:
```
psql -U postgres
CREATE DATABASE email_crm_db;
```

Run migrations:
```
cd backend
node migrations/run.js
```

If you need extra columns or invite table:
```
node add-columns.js
```

---

## Running the Project

Backend:
```
cd backend
npm run dev
```

Frontend:
```
cd frontend
npm install -g http-server
http-server -p 3000
```

Open:
- `http://localhost:3000`

---

## API Examples

Create a user (invite + password setup email):
```
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "name": "Marketing User",
    "email": "marketing@company.com",
    "role": "marketing"
  }'
```

Manual email ingestion (for testing without IMAP):
```
curl -X POST http://localhost:5000/api/emails/receive \
  -H "Content-Type: application/json" \
  -d '{
    "senderEmail": "customer@example.com",
    "senderName": "Jane Smith",
    "subject": "Need pricing details",
    "message": "Please share pricing and demo options."
  }'
```

---

## Screenshots

Add screenshots to `docs/screenshots/` and update links below:

- Admin dashboard: `docs/screenshots/admin-dashboard.png`
- Marketing dashboard: `docs/screenshots/marketing-dashboard.png`
- Support dashboard: `docs/screenshots/support-dashboard.png`
- Set password screen: `docs/screenshots/set-password.png`

---

## Email Ingestion (IMAP)

The server polls the mailbox and processes new emails:
- Reads IMAP mailbox
- Skips messages not sent to `COMPANY_EMAIL`
- Inserts data into `enquiries` or `support_tickets`

If IMAP does not pick up new mails:
- Verify mailbox name
- Ensure IMAP enabled in Gmail
- Check `IMAP_USER`, `IMAP_PASS`, `IMAP_MAILBOX`

---

## AI & Intent Detection

AI is used to:
- Detect intent (enquiry vs support)
- Extract details (name, phone, company, location, product interest)
- Generate reply draft

Fallback logic exists if Ollama is not running.

---

## User Roles & Permissions

Admin:
- Manage users
- View all enquiries/support tickets
- Manage contacts

Marketing:
- View enquiries
- Reply to enquiries

Support:
- View support tickets
- Reply to support tickets

---

## API Notes

Base URL:
```
http://localhost:5000/api
```

Key endpoints:
- `POST /auth/login`
- `POST /auth/set-password` (token-based)
- `GET /users`
- `POST /users` (creates invite + sends password setup mail)
- `GET /enquiries`
- `GET /support/tickets`

---

## Troubleshooting

IMAP "Unknown Mailbox":
- Use `[Gmail]/All Mail` or `INBOX` exactly.
- List mailboxes using:
  ```
  node backend/list-imap-mailboxes.js
  ```

Ollama not responding:
- Ensure `ollama serve` is running on `http://localhost:11434`
- Check model name in `.env`

---

## License
ISC
