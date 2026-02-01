# Email-Based CRM System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication APIs

### 1.1 Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "admin@company.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Admin User",
    "email": "admin@company.com",
    "role": "admin"
  }
}
```

### 1.2 Set Password (New User)
**POST** `/auth/set-password/:userId`

**Body:**
```json
{
  "password": "newPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password set successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## 2. User Management APIs (Admin Only)

### 2.1 Create User
**POST** `/users`
**Authorization Required:** Admin

**Body:**
```json
{
  "name": "Marketing Manager",
  "email": "marketing@company.com",
  "role": "marketing"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully. Password setup email has been sent.",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Marketing Manager",
    "email": "marketing@company.com",
    "role_id": 2
  }
}
```

### 2.2 Get All Users
**GET** `/users`
**Authorization Required:** Admin

**Response (200):**
```json
{
  "success": true,
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Admin User",
      "email": "admin@company.com",
      "role_id": 1,
      "is_active": true,
      "created_at": "2024-01-27T10:00:00Z",
      "role_name": "admin"
    }
  ]
}
```

### 2.3 Get User by ID
**GET** `/users/:userId`
**Authorization Required:** Authenticated User

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Admin User",
    "email": "admin@company.com",
    "role_id": 1,
    "is_active": true,
    "created_at": "2024-01-27T10:00:00Z",
    "role_name": "admin"
  }
}
```

### 2.4 Update User
**PUT** `/users/:userId`
**Authorization Required:** Admin

**Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@company.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Name",
    "email": "updated@company.com",
    "role_id": 1,
    "is_active": true,
    "created_at": "2024-01-27T10:00:00Z"
  }
}
```

### 2.5 Delete User
**DELETE** `/users/:userId`
**Authorization Required:** Admin

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 3. Enquiry APIs (Marketing & Admin)

### 3.1 Get All Enquiries
**GET** `/enquiries`
**Authorization Required:** Marketing, Admin

**Response (200):**
```json
{
  "success": true,
  "enquiries": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "contact_id": "550e8400-e29b-41d4-a716-446655440003",
      "subject": "Product Inquiry",
      "message": "What are your pricing plans?",
      "ai_reply": "Dear John,\n\nThank you for your inquiry...",
      "status": "new",
      "created_at": "2024-01-27T10:30:00Z",
      "contact_name": "John Doe",
      "contact_email": "john@techcorp.com",
      "customer_type": "prospect",
      "company_name": "TechCorp Inc."
    }
  ]
}
```

### 3.2 Get Enquiry by ID
**GET** `/enquiries/:enquiryId`
**Authorization Required:** Marketing, Admin

**Response (200):**
```json
{
  "success": true,
  "enquiry": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "contact_id": "550e8400-e29b-41d4-a716-446655440003",
    "subject": "Product Inquiry",
    "message": "What are your pricing plans?",
    "ai_reply": "Dear John,\n\nThank you for your inquiry...",
    "status": "new",
    "created_at": "2024-01-27T10:30:00Z",
    "contact_name": "John Doe",
    "contact_email": "john@techcorp.com",
    "customer_type": "prospect",
    "company_name": "TechCorp Inc."
  }
}
```

### 3.3 Reply to Enquiry
**POST** `/enquiries/:enquiryId/reply`
**Authorization Required:** Marketing, Admin

**Body:**
```json
{
  "reply": "Dear John,\n\nThank you for your interest in our products. We have several pricing plans available..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Enquiry replied successfully",
  "enquiry": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "contact_id": "550e8400-e29b-41d4-a716-446655440003",
    "subject": "Product Inquiry",
    "ai_reply": "Dear John,\n\nThank you for your interest in our products...",
    "status": "replied",
    "created_at": "2024-01-27T10:30:00Z"
  }
}
```

---

## 4. Support Ticket APIs (Support & Admin)

### 4.1 Get All Support Tickets
**GET** `/support/tickets`
**Authorization Required:** Support, Admin

**Response (200):**
```json
{
  "success": true,
  "tickets": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "contact_id": "550e8400-e29b-41d4-a716-446655440003",
      "subject": "System Error",
      "issue": "Getting 500 error when trying to upload files",
      "ai_reply": "Dear John,\n\nThank you for reaching out to our support team...",
      "status": "open",
      "created_at": "2024-01-27T11:00:00Z",
      "contact_name": "John Doe",
      "contact_email": "john@techcorp.com",
      "customer_type": "customer",
      "company_name": "TechCorp Inc."
    }
  ]
}
```

### 4.2 Get Support Ticket by ID
**GET** `/support/tickets/:ticketId`
**Authorization Required:** Support, Admin

**Response (200):**
```json
{
  "success": true,
  "ticket": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "contact_id": "550e8400-e29b-41d4-a716-446655440003",
    "subject": "System Error",
    "issue": "Getting 500 error when trying to upload files",
    "ai_reply": "Dear John,\n\nThank you for reaching out to our support team...",
    "status": "open",
    "created_at": "2024-01-27T11:00:00Z",
    "contact_name": "John Doe",
    "contact_email": "john@techcorp.com",
    "customer_type": "customer",
    "company_name": "TechCorp Inc."
  }
}
```

### 4.3 Reply to Support Ticket
**POST** `/support/tickets/:ticketId/reply`
**Authorization Required:** Support, Admin

**Body:**
```json
{
  "reply": "Dear John,\n\nThank you for reporting this issue. Our technical team has identified the problem..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ticket replied successfully",
  "ticket": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "contact_id": "550e8400-e29b-41d4-a716-446655440003",
    "subject": "System Error",
    "ai_reply": "Dear John,\n\nThank you for reporting this issue...",
    "status": "in_progress",
    "created_at": "2024-01-27T11:00:00Z"
  }
}
```

---

## 5. Email Intake API

### 5.1 Receive Email
**POST** `/emails/receive`
**Authorization Required:** Public (can be secured with API key)

**Body:**
```json
{
  "senderEmail": "john@techcorp.com",
  "senderName": "John Doe",
  "subject": "Need help with your service",
  "message": "I'm facing an issue with the upload feature and need urgent support"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Email processed successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "contact_id": "550e8400-e29b-41d4-a716-446655440003",
    "subject": "Need help with your service",
    "message": "I'm facing an issue with the upload feature and need urgent support",
    "ai_reply": "Dear John,\n\nThank you for reaching out to our support team...",
    "status": "new",
    "type": "support_ticket",
    "created_at": "2024-01-27T11:30:00Z"
  }
}
```

---

## 6. Contact APIs (Admin)

### 6.1 Get All Contacts
**GET** `/contacts`
**Authorization Required:** Admin

**Response (200):**
```json
{
  "success": true,
  "contacts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "John Doe",
      "email": "john@techcorp.com",
      "phone": "+1234567890",
      "company_id": "550e8400-e29b-41d4-a716-446655440006",
      "customer_type": "customer",
      "created_at": "2024-01-27T10:00:00Z",
      "company_name": "TechCorp Inc."
    }
  ]
}
```

### 6.2 Get Contact by ID
**GET** `/contacts/:contactId`
**Authorization Required:** Authenticated User

**Response (200):**
```json
{
  "success": true,
  "contact": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "name": "John Doe",
    "email": "john@techcorp.com",
    "phone": "+1234567890",
    "company_id": "550e8400-e29b-41d4-a716-446655440006",
    "customer_type": "customer",
    "created_at": "2024-01-27T10:00:00Z",
    "company_name": "TechCorp Inc."
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Email and password are required"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. You do not have the required permission.",
  "requiredPermission": "CREATE_USER",
  "userRole": "marketing"
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Testing with curl

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'

# Get all users (requires token)
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <jwt_token>"

# Create user
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Support Manager","email":"support@company.com","role":"support"}'

# Receive email
curl -X POST http://localhost:5000/api/emails/receive \
  -H "Content-Type: application/json" \
  -d '{
    "senderEmail":"customer@example.com",
    "senderName":"Jane Smith",
    "subject":"Need pricing information",
    "message":"What are your product pricing plans?"
  }'
```
