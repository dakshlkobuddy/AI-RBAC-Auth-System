const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { TICKET_STATUS } = require('../config/constants');

// Create a new support ticket
const createTicket = async (contactId, subject, issue, aiReply) => {
  const ticketId = uuidv4();
  const query = `
    INSERT INTO support_tickets (id, contact_id, subject, issue, ai_reply, status, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING id, contact_id, subject, issue, ai_reply, status, created_at
  `;
  const result = await pool.query(query, [
    ticketId,
    contactId,
    subject,
    issue,
    aiReply,
    TICKET_STATUS.OPEN,
  ]);
  return result.rows[0];
};

// Get ticket by ID with contact details
const getTicketById = async (ticketId) => {
  const query = `
    SELECT t.*, c.name as contact_name, c.email as contact_email, c.customer_type, comp.company_name
    FROM support_tickets t
    JOIN contacts c ON t.contact_id = c.id
    LEFT JOIN companies comp ON c.company_id = comp.id
    WHERE t.id = $1
  `;
  const result = await pool.query(query, [ticketId]);
  return result.rows[0];
};

// Get all tickets with contact details
const getAllTickets = async () => {
  const query = `
    SELECT t.*, c.name as contact_name, c.email as contact_email, c.customer_type, comp.company_name
    FROM support_tickets t
    JOIN contacts c ON t.contact_id = c.id
    LEFT JOIN companies comp ON c.company_id = comp.id
    ORDER BY t.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Update ticket status
const updateTicketStatus = async (ticketId, status) => {
  const query = `
    UPDATE support_tickets
    SET status = $1
    WHERE id = $2
    RETURNING id, contact_id, subject, status, updated_at
  `;
  const result = await pool.query(query, [status, ticketId]);
  return result.rows[0];
};

// Update ticket customer type (optional sync with contacts)
const updateTicketCustomerType = async (ticketId, customerType) => {
  const query = `
    UPDATE support_tickets
    SET customer_type = $1
    WHERE id = $2
    RETURNING id, contact_id, subject, customer_type, updated_at
  `;
  const result = await pool.query(query, [customerType, ticketId]);
  return result.rows[0];
};

// Update ticket with sent reply
const updateTicketReply = async (ticketId, aiReply, replySentAt) => {
  const query = `
    UPDATE support_tickets
    SET ai_reply = $1, status = $2, reply_sent_at = $3
    WHERE id = $4
    RETURNING id, contact_id, subject, ai_reply, status, created_at
  `;
  const result = await pool.query(query, [aiReply, TICKET_STATUS.IN_PROGRESS, replySentAt, ticketId]);
  return result.rows[0];
};

// Delete support ticket
const deleteTicket = async (ticketId) => {
  const query = `DELETE FROM support_tickets WHERE id = $1`;
  await pool.query(query, [ticketId]);
};

module.exports = {
  createTicket,
  getTicketById,
  getAllTickets,
  updateTicketStatus,
  updateTicketCustomerType,
  updateTicketReply,
  deleteTicket,
};
