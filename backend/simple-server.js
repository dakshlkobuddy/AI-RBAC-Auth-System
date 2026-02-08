const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/database');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import auth controller
const authController = require('./controllers/authController');

// ================================================================
// AUTH ROUTES
// ================================================================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await authController.login(email, password);

    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================================================================
// HEALTH CHECK
// ================================================================

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Simple email receive endpoint
app.post('/api/emails/receive', async (req, res) => {
  const client = await pool.connect();
  try {
    const { fromEmail, fromName, subject, message } = req.body;
    
    if (!fromEmail || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing fields: fromEmail, subject, message'
      });
    }

    await client.query('BEGIN');

    // Simple intent detection
    const lowerMessage = message.toLowerCase();
    const isSupport = /issue|error|problem|bug|crash|can't|urgent|help|access denied/.test(lowerMessage);
    const isEnquiry = /pricing|price|demo|features|plan|interested|quote|enterprise/.test(lowerMessage);
    
    let intent = 'other';
    if (isSupport) intent = 'support';
    else if (isEnquiry) intent = 'enquiry';

    // Get or create company
    const domain = fromEmail.split('@')[1];
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const companyName = personalDomains.includes(domain) ? 'Individual' : domain.split('.')[0];
    
    let company = await client.query('SELECT id FROM companies WHERE company_name = $1', [companyName]);
    let companyId;
    
    if (company.rows.length === 0) {
      const newCompany = await client.query(
        'INSERT INTO companies (id, company_name, website) VALUES ($1, $2, $3) RETURNING id',
        [uuidv4(), companyName, domain]
      );
      companyId = newCompany.rows[0].id;
    } else {
      companyId = company.rows[0].id;
    }

    // Get or create contact as 'prospect'
    let contact = await client.query(
      'SELECT id, name, email FROM contacts WHERE email = $1',
      [fromEmail]
    );
    let contactId;
    
    if (contact.rows.length === 0) {
      const newContact = await client.query(
        'INSERT INTO contacts (id, company_id, name, email, customer_type, created_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id, name, email',
        [uuidv4(), companyId, fromName || fromEmail.split('@')[0], fromEmail, 'prospect']
      );
      contactId = newContact.rows[0].id;
    } else {
      contactId = contact.rows[0].id;
    }

    // Save to appropriate table
    let result;
    if (intent === 'support') {
      result = await client.query(
        `INSERT INTO support_tickets (id, contact_id, company_id, subject, issue, status, priority, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
         RETURNING id, subject, status`,
        [uuidv4(), contactId, companyId, subject, message, 'open', 'medium']
      );
    } else {
      result = await client.query(
        `INSERT INTO enquiries (id, contact_id, company_id, subject, message, status, customer_type, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
         RETURNING id, subject, status`,
        [uuidv4(), contactId, companyId, subject, message, 'new', 'prospect']
      );
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Email received and processed',
      data: {
        type: intent === 'support' ? 'support_ticket' : 'enquiry',
        id: result.rows[0].id,
        subject: result.rows[0].subject,
        status: result.rows[0].status,
        intent
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

// ================================================================
// USERS ENDPOINTS
// ================================================================

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, r.name as role, u.created_at
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC`
    );
    
    res.status(200).json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================
// ENQUIRIES ENDPOINTS
// ================================================================

app.get('/api/enquiries', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.subject, e.message, e.status, e.customer_type, 
              c.name, c.email, co.company_name, e.created_at
       FROM enquiries e
       LEFT JOIN contacts c ON e.contact_id = c.id
       LEFT JOIN companies co ON e.company_id = co.id
       ORDER BY e.created_at DESC`
    );
    
    res.status(200).json({
      success: true,
      enquiries: result.rows
    });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================
// SUPPORT TICKETS ENDPOINTS
// ================================================================

app.get('/api/support/tickets', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.subject, t.issue, t.status, t.priority,
              c.name, c.email, co.company_name, t.created_at
       FROM support_tickets t
       LEFT JOIN contacts c ON t.contact_id = c.id
       LEFT JOIN companies co ON t.company_id = co.id
       ORDER BY t.created_at DESC`
    );
    
    res.status(200).json({
      success: true,
      tickets: result.rows
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================
// CONTACTS ENDPOINTS
// ================================================================

app.get('/api/contacts', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.email, c.phone, c.customer_type,
              co.company_name, c.created_at
       FROM contacts c
       LEFT JOIN companies co ON c.company_id = co.id
       ORDER BY c.created_at DESC`
    );
    
    res.status(200).json({
      success: true,
      contacts: result.rows
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/contacts/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const result = await pool.query(
      `SELECT c.id, c.name, c.email, c.phone, c.customer_type,
              co.company_name, c.created_at
       FROM contacts c
       LEFT JOIN companies co ON c.company_id = co.id
       WHERE c.id = $1`,
      [contactId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(200).json({
      success: true,
      contact: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.put('/api/contacts/:contactId', async (req, res) => {
  const client = await pool.connect();
  try {
    const { contactId } = req.params;
    const { name, email, phone, company_name } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    await client.query('BEGIN');

    let companyId = null;
    if (company_name) {
      const existingCompany = await client.query(
        'SELECT id FROM companies WHERE company_name = $1',
        [company_name]
      );
      if (existingCompany.rows.length) {
        companyId = existingCompany.rows[0].id;
      } else {
        const newCompany = await client.query(
          'INSERT INTO companies (id, company_name) VALUES ($1, $2) RETURNING id',
          [uuidv4(), company_name]
        );
        companyId = newCompany.rows[0].id;
      }
    }

    const updateResult = await client.query(
      `UPDATE contacts
       SET name = $1,
           email = $2,
           phone = $3,
           company_id = $4
       WHERE id = $5
       RETURNING id`,
      [name, email, phone || null, companyId, contactId]
    );

    if (updateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Contact not found' });
    }

    await client.query('COMMIT');

    const refreshed = await pool.query(
      `SELECT c.id, c.name, c.email, c.phone, c.customer_type,
              co.company_name, c.created_at
       FROM contacts c
       LEFT JOIN companies co ON c.company_id = co.id
       WHERE c.id = $1`,
      [contactId]
    );

    res.status(200).json({
      success: true,
      contact: refreshed.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating contact:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

app.delete('/api/contacts/:contactId', async (req, res) => {
  const client = await pool.connect();
  try {
    const { contactId } = req.params;

    const enquiryCount = await client.query(
      'SELECT COUNT(*)::int AS count FROM enquiries WHERE contact_id = $1',
      [contactId]
    );
    const ticketCount = await client.query(
      'SELECT COUNT(*)::int AS count FROM support_tickets WHERE contact_id = $1',
      [contactId]
    );

    if ((enquiryCount.rows[0].count || 0) > 0 || (ticketCount.rows[0].count || 0) > 0) {
      return res.status(400).json({
        message: 'Contact is linked to existing enquiries or support tickets'
      });
    }

    const deleteResult = await client.query(
      'DELETE FROM contacts WHERE id = $1 RETURNING id',
      [contactId]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

// ================================================================
// MARKETING ENDPOINTS
// ================================================================

app.get('/api/marketing/enquiries', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.subject, e.message, e.status, e.customer_type, e.created_at,
              c.name as contact_name, c.email, co.company_name
       FROM enquiries e
       LEFT JOIN contacts c ON e.contact_id = c.id
       LEFT JOIN companies co ON e.company_id = co.id
       ORDER BY e.created_at DESC`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching marketing enquiries:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/marketing/dashboard-stats', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new,
        SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied
       FROM enquiries`
    );
    
    const row = result.rows[0];
    res.status(200).json({
      success: true,
      data: {
        totalEnquiries: row.total || 0,
        newEnquiries: row.new || 0,
        repliedEnquiries: row.replied || 0
      }
    });
  } catch (error) {
    console.error('Error fetching marketing stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================
// SUPPORT ENDPOINTS
// ================================================================

app.get('/api/support/dashboard-stats', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
       FROM support_tickets`
    );
    
    const row = result.rows[0];
    res.status(200).json({
      success: true,
      data: {
        totalTickets: row.total || 0,
        openTickets: row.open || 0,
        resolvedTickets: row.resolved || 0
      }
    });
  } catch (error) {
    console.error('Error fetching support stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/support/tickets', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.subject, t.issue, t.status, t.priority, t.created_at,
              c.name as contact_name, c.email, co.company_name
       FROM support_tickets t
       LEFT JOIN contacts c ON t.contact_id = c.id
       LEFT JOIN companies co ON t.company_id = co.id
       ORDER BY t.created_at DESC`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\nServer running on http://localhost:${PORT}\n`);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
