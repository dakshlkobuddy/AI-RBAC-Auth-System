const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { CUSTOMER_TYPE } = require('../config/constants');

// Create a new contact
const createContact = async (name, email, phone, companyId, customerType = CUSTOMER_TYPE.PROSPECT, location = null, productInterest = null) => {
  const contactId = uuidv4();
  const query = `
    INSERT INTO contacts (id, name, email, phone, location, product_interest, company_id, customer_type, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    RETURNING id, name, email, phone, location, product_interest, company_id, customer_type, created_at
  `;
  const result = await pool.query(query, [contactId, name, email, phone, location, productInterest, companyId, customerType]);
  return result.rows[0];
};

// Get contact by ID
const getContactById = async (contactId) => {
  const query = `
    SELECT c.*, comp.company_name
    FROM contacts c
    LEFT JOIN companies comp ON c.company_id = comp.id
    WHERE c.id = $1
  `;
  const result = await pool.query(query, [contactId]);
  return result.rows[0];
};

// Get contact by email
const getContactByEmail = async (email) => {
  const query = `
    SELECT c.*, comp.company_name
    FROM contacts c
    LEFT JOIN companies comp ON c.company_id = comp.id
    WHERE c.email = $1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

// Get all contacts
const getAllContacts = async () => {
  const query = `
    SELECT c.*, comp.company_name
    FROM contacts c
    LEFT JOIN companies comp ON c.company_id = comp.id
    ORDER BY c.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Update contact
const updateContact = async (contactId, name, email, phone, customerType, location = null, productInterest = null, companyId = null) => {
  const query = `
    UPDATE contacts
    SET name = $1, email = $2, phone = $3, customer_type = $4, location = $5, product_interest = $6, company_id = $7
    WHERE id = $8
    RETURNING id, name, email, phone, location, product_interest, company_id, customer_type, created_at
  `;
  const result = await pool.query(query, [name, email, phone, customerType, location, productInterest, companyId, contactId]);
  return result.rows[0];
};

// Update customer type only
const updateCustomerType = async (contactId, customerType) => {
  const query = `
    UPDATE contacts
    SET customer_type = $1
    WHERE id = $2
    RETURNING id, name, email, phone, location, product_interest, company_id, customer_type, created_at
  `;
  const result = await pool.query(query, [customerType, contactId]);
  return result.rows[0];
};

// Count related enquiries for contact
const countEnquiriesByContactId = async (contactId) => {
  const query = 'SELECT COUNT(*)::int AS count FROM enquiries WHERE contact_id = $1';
  const result = await pool.query(query, [contactId]);
  return result.rows[0]?.count || 0;
};

// Count related support tickets for contact
const countTicketsByContactId = async (contactId) => {
  const query = 'SELECT COUNT(*)::int AS count FROM support_tickets WHERE contact_id = $1';
  const result = await pool.query(query, [contactId]);
  return result.rows[0]?.count || 0;
};

// Promote customer to client if eligibility criteria met
const promoteToClientIfEligible = async (contactId) => {
  const query = `
    SELECT
      c.customer_type,
      c.created_at,
      (SELECT COUNT(*) FROM support_tickets WHERE contact_id = $1 AND status = 'resolved') AS resolved_tickets,
      (SELECT COUNT(*) FROM enquiries WHERE contact_id = $1) AS enquiries_count
    FROM contacts c
    WHERE c.id = $1
  `;
  const result = await pool.query(query, [contactId]);
  const row = result.rows[0];
  if (!row) return { eligible: false, updated: false };

  const resolvedTickets = Number(row.resolved_tickets || 0);
  const enquiriesCount = Number(row.enquiries_count || 0);
  const activeDays = row.created_at
    ? (Date.now() - new Date(row.created_at).getTime()) / (1000 * 60 * 60 * 24)
    : 0;

  const eligible =
    resolvedTickets >= 1 ||
    enquiriesCount >= 2 ||
    activeDays >= 30;

  if (!eligible || row.customer_type !== 'customer') {
    return { eligible, updated: false };
  }

  const updated = await updateCustomerType(contactId, 'client');
  return { eligible, updated: Boolean(updated) };
};

// Delete contact
const deleteContact = async (contactId) => {
  const query = 'DELETE FROM contacts WHERE id = $1';
  await pool.query(query, [contactId]);
};

module.exports = {
  createContact,
  getContactById,
  getContactByEmail,
  getAllContacts,
  updateContact,
  updateCustomerType,
  promoteToClientIfEligible,
  deleteContact,
  countEnquiriesByContactId,
  countTicketsByContactId,
};
