const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { ENQUIRY_STATUS } = require('../config/constants');

// Create a new enquiry
const createEnquiry = async (contactId, subject, message, aiReply) => {
  const enquiryId = uuidv4();
  const query = `
    INSERT INTO enquiries (id, contact_id, subject, message, ai_reply, status, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING id, contact_id, subject, message, ai_reply, status, created_at
  `;
  const result = await pool.query(query, [
    enquiryId,
    contactId,
    subject,
    message,
    aiReply,
    ENQUIRY_STATUS.NEW,
  ]);
  return result.rows[0];
};

// Get enquiry by ID with contact details
const getEnquiryById = async (enquiryId) => {
  const query = `
    SELECT e.*, c.name as contact_name, c.email as contact_email, c.customer_type, comp.company_name
    FROM enquiries e
    JOIN contacts c ON e.contact_id = c.id
    LEFT JOIN companies comp ON c.company_id = comp.id
    WHERE e.id = $1
  `;
  const result = await pool.query(query, [enquiryId]);
  return result.rows[0];
};

// Get all enquiries with contact details
const getAllEnquiries = async () => {
  const query = `
    SELECT e.*, c.name as contact_name, c.email as contact_email, c.customer_type, comp.company_name
    FROM enquiries e
    JOIN contacts c ON e.contact_id = c.id
    LEFT JOIN companies comp ON c.company_id = comp.id
    ORDER BY e.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Update enquiry status
const updateEnquiryStatus = async (enquiryId, status) => {
  const query = `
    UPDATE enquiries
    SET status = $1
    WHERE id = $2
    RETURNING id, contact_id, subject, status, updated_at
  `;
  const result = await pool.query(query, [status, enquiryId]);
  return result.rows[0];
};

// Update enquiry with sent reply
const updateEnquiryReply = async (enquiryId, aiReply, replySentAt) => {
  const query = `
    UPDATE enquiries
    SET ai_reply = $1, status = $2, reply_sent_at = $3
    WHERE id = $4
    RETURNING id, contact_id, subject, ai_reply, status, created_at
  `;
  const result = await pool.query(query, [aiReply, ENQUIRY_STATUS.REPLIED, replySentAt, enquiryId]);
  return result.rows[0];
};

module.exports = {
  createEnquiry,
  getEnquiryById,
  getAllEnquiries,
  updateEnquiryStatus,
  updateEnquiryReply,
};
