/**
 * Marketing Enquiry Model
 * Database queries for enquiry management
 */

const pool = require('../config/database');

class MarketingEnquiry {
  /**
   * Get dashboard statistics
   * Returns counts of total, new, and replied enquiries
   */
  static async getDashboardStats() {
    try {
      const query = `
        SELECT
          COUNT(*) as total_enquiries,
          SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_enquiries,
          SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied_enquiries
        FROM enquiries;
      `;

      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Database error in getDashboardStats:', error);
      throw error;
    }
  }

  /**
   * Get all enquiries with company and contact details
   * Used for the enquiries list view
   */
  static async getAllEnquiries() {
    try {
      const query = `
        SELECT
          e.id,
          e.subject,
          e.message,
          e.status,
          e.customer_type,
          e.ai_reply,
          e.created_at,
          c.name as contact_name,
          c.email,
          c.customer_type as contact_customer_type,
          co.company_name as company_name
        FROM enquiries e
        INNER JOIN contacts c ON e.contact_id = c.id
        INNER JOIN companies co ON e.company_id = co.id
        ORDER BY e.created_at DESC;
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Database error in getAllEnquiries:', error);
      throw error;
    }
  }

  /**
   * Get single enquiry with all details
   * Used for enquiry details view
   */
  static async getEnquiryById(id) {
    try {
      const query = `
        SELECT
          e.id,
          e.subject,
          e.message,
          e.status,
          e.customer_type,
          e.ai_reply,
          e.created_at,
          e.contact_id,
          e.company_id,
          c.name as contact_name,
          c.email,
          c.customer_type as contact_customer_type,
          co.company_name as company_name,
          co.website as company_website
        FROM enquiries e
        INNER JOIN contacts c ON e.contact_id = c.id
        INNER JOIN companies co ON e.company_id = co.id
        WHERE e.id = $1;
      `;

      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Database error in getEnquiryById:', error);
      throw error;
    }
  }

  /**
   * Update enquiry with AI reply and mark as replied
   * Called when marketing user sends a reply
   */
  static async updateEnquiryReply(id, reply) {
    try {
      const query = `
        UPDATE enquiries
        SET
          ai_reply = $1,
          status = 'replied',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
      `;

      const result = await pool.query(query, [reply, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Database error in updateEnquiryReply:', error);
      throw error;
    }
  }

  /**
   * Close an enquiry
   * Changes status from replied to closed
   */
  static async closeEnquiry(id) {
    try {
      const query = `
        UPDATE enquiries
        SET
          status = 'closed',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *;
      `;

      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Database error in closeEnquiry:', error);
      throw error;
    }
  }

  /**
   * Update customer type for a contact
   * Upgrades prospect → customer when reply is sent
   */
  static async updateCustomerType(contactId, customerType) {
    try {
      const query = `
        UPDATE contacts
        SET
          customer_type = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
      `;

      const result = await pool.query(query, [customerType, contactId]);
      return result.rows[0];
    } catch (error) {
      console.error('Database error in updateCustomerType:', error);
      throw error;
    }
  }

  /**
   * Get enquiry statistics by status
   * Used for dashboard pie charts or analytics
   */
  static async getEnquiriesByStatus() {
    try {
      const query = `
        SELECT
          status,
          COUNT(*) as count
        FROM enquiries
        GROUP BY status;
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Database error in getEnquiriesByStatus:', error);
      throw error;
    }
  }

  /**
   * Get enquiries by customer type
   * Used for segmentation analysis
   */
  static async getEnquiriesByCustomerType() {
    try {
      const query = `
        SELECT
          customer_type,
          COUNT(*) as count
        FROM contacts
        GROUP BY customer_type;
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Database error in getEnquiriesByCustomerType:', error);
      throw error;
    }
  }
}

module.exports = MarketingEnquiry;
