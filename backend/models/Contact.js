const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { CUSTOMER_TYPE } = require('../config/constants');

// Create a new contact
const createContact = async (name, email, phone, companyId, customerType = CUSTOMER_TYPE.PROSPECT) => {
  const contactId = uuidv4();
  const query = `
    INSERT INTO contacts (id, name, email, phone, company_id, customer_type, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING id, name, email, phone, company_id, customer_type, created_at
  `;
  const result = await pool.query(query, [contactId, name, email, phone, companyId, customerType]);
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
const updateContact = async (contactId, name, email, phone, customerType) => {
  const query = `
    UPDATE contacts
    SET name = $1, email = $2, phone = $3, customer_type = $4
    WHERE id = $5
    RETURNING id, name, email, phone, company_id, customer_type, created_at
  `;
  const result = await pool.query(query, [name, email, phone, customerType, contactId]);
  return result.rows[0];
};

// Update customer type only
const updateCustomerType = async (contactId, customerType) => {
  const query = `
    UPDATE contacts
    SET customer_type = $1
    WHERE id = $2
    RETURNING id, name, email, phone, company_id, customer_type, created_at
  `;
  const result = await pool.query(query, [customerType, contactId]);
  return result.rows[0];
};

module.exports = {
  createContact,
  getContactById,
  getContactByEmail,
  getAllContacts,
  updateContact,
  updateCustomerType,
};
