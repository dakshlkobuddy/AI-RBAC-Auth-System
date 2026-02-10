/**
 * Email Model
 * Handles email intake and processing
 * Manages email data in the database
 */

const pool = require('../config/database');

class Email {
  /**
   * Save incoming email to database
   * Creates contact and company if they don't exist
   */
  static async saveIncomingEmail(emailData) {
    const {
      fromEmail,
      fromName,
      phone,
      extracted,
      subject,
      message,
      sentimentScore,
      sentimentLabel,
      messageId,
      intent,
      aiReply,
      confidence
    } = emailData;

    try {
      // Start transaction
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        // Step 0: Deduplicate by message_id if provided
        if (messageId) {
          const insertResult = await client.query(
            `
            INSERT INTO processed_emails (message_id, processed_at)
            VALUES ($1, CURRENT_TIMESTAMP)
            ON CONFLICT (message_id) DO NOTHING
            RETURNING message_id
            `,
            [messageId]
          );

          if (insertResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return {
              success: true,
              skipped: true,
              message: 'Email already processed'
            };
          }
        }

        const extractedPhone = extracted?.phone || phone || null;

        // Step 1: Find or create company
        const company = await this.findOrCreateCompany(
          client,
          fromEmail,
          extracted?.company_name,
          extracted?.website
        );

        // Step 2: Find or create contact
        const contact = await this.findOrCreateContact(
          client,
          fromEmail,
          extracted?.name || fromName,
          company.id,
          extractedPhone,
          extracted?.location || null,
          extracted?.product_interest || null
        );

        // Step 3: Save email to appropriate table (enquiry or support_ticket)
        let result;

        if (intent === 'support') {
          result = await this.saveToSupportTickets(
            client,
            contact.id,
            company.id,
            subject,
            message,
            aiReply,
            confidence,
            intent,
            sentimentScore,
            sentimentLabel
          );
        } else {
          result = await this.saveToEnquiries(
            client,
            contact.id,
            company.id,
            subject,
            message,
            aiReply,
            confidence,
            intent,
            sentimentScore,
            sentimentLabel
          );
        }

        await client.query('COMMIT');
        
        return {
          success: true,
          data: result,
          message: `Email processed as ${intent}`
        };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error saving incoming email:', error);
      throw error;
    }
  }

  /**
   * Find or create company from email domain
   */
  static async findOrCreateCompany(client, email, extractedCompanyName = '', extractedWebsite = '') {
    try {
      const domain = email.split('@')[1];
      
      // Check if it's a personal email
      const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
      
      let companyName = domain;
      let isPersonal = false;
      const website = extractedWebsite && extractedWebsite.trim().length > 1 ? extractedWebsite.trim() : null;

      if (extractedCompanyName && extractedCompanyName.trim().length > 1) {
        companyName = extractedCompanyName.trim();
        isPersonal = false;
      } else if (personalDomains.includes(domain.toLowerCase())) {
        // Link to default "Individual" company
        companyName = 'Individual';
        isPersonal = true;
      } else {
        // Create company name from domain
        companyName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
      }

      // Check if company exists
      let query = 'SELECT id, company_name FROM companies WHERE company_name = $1 LIMIT 1';
      let result = await client.query(query, [companyName]);

      if (result.rows.length > 0) {
        const existing = result.rows[0];
        if (website && (!existing.website || existing.website === domain || existing.website === 'gmail.com')) {
          const updateResult = await client.query(
            `UPDATE companies SET website = $1 WHERE id = $2 RETURNING id, company_name, website`,
            [website, existing.id]
          );
          return updateResult.rows[0] || existing;
        }
        return existing;
      }

      // Create new company
      const { v4: uuidv4 } = require('uuid');
      const companyId = uuidv4();

      query = `
        INSERT INTO companies (id, company_name, website, created_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING id, company_name;
      `;

      result = await client.query(query, [companyId, companyName, website || (isPersonal ? null : domain)]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding or creating company:', error);
      throw error;
    }
  }

  /**
   * Find or create contact from email
   * New contacts are marked as 'prospect'
   */
  static async findOrCreateContact(client, email, name, companyId, phone = null, location = null, productInterest = null) {
    try {
      // Check if contact exists by email or phone
      let query = `
        SELECT id, name, email, phone, location, product_interest, customer_type, company_id FROM contacts 
        WHERE email = $1
        ${phone ? 'OR phone = $2' : ''}
        LIMIT 1
      `;
      let result = phone
        ? await client.query(query, [email, phone])
        : await client.query(query, [email]);

      if (result.rows.length > 0) {
        const existing = result.rows[0];
        let existingCompanyName = '';
        if (existing.company_id) {
          const companyResult = await client.query(
            'SELECT company_name FROM companies WHERE id = $1 LIMIT 1',
            [existing.company_id]
          );
          existingCompanyName = companyResult.rows[0]?.company_name || '';
        }
        const newCompanyNameResult = companyId
          ? await client.query('SELECT company_name FROM companies WHERE id = $1 LIMIT 1', [companyId])
          : { rows: [] };
        const newCompanyName = newCompanyNameResult.rows[0]?.company_name || '';

        const shouldUpdateCompany =
          companyId &&
          existing.company_id !== companyId &&
          existingCompanyName === 'Individual' &&
          newCompanyName &&
          newCompanyName !== 'Individual';

        const shouldPromote = existing.customer_type === 'prospect';
        const shouldUpdatePhone = phone && !existing.phone;
        const shouldUpdateLocation = location && !existing.location;
        const shouldUpdateProduct = productInterest && !existing.product_interest;
        const emailPrefix = (existing.email || '').split('@')[0];
        const shouldUpdateName =
          name &&
          (existing.name === emailPrefix || existing.name === emailPrefix.replace(/[._-]/g, ' ') || existing.name === 'Unknown');

        if (shouldPromote || shouldUpdatePhone || shouldUpdateLocation || shouldUpdateProduct || shouldUpdateName || shouldUpdateCompany) {
          const updateQuery = `
            UPDATE contacts
            SET
              name = COALESCE($1, name),
              phone = COALESCE($2, phone),
              location = COALESCE($3, location),
              product_interest = COALESCE($4, product_interest),
              customer_type = CASE WHEN customer_type = 'prospect' THEN 'customer' ELSE customer_type END,
              company_id = COALESCE($5, company_id)
            WHERE id = $6
            RETURNING id, name, email, customer_type
          `;
          const updateResult = await client.query(updateQuery, [
            name || null,
            phone || null,
            location || null,
            productInterest || null,
            shouldUpdateCompany ? companyId : null,
            existing.id
          ]);
          return updateResult.rows[0] || existing;
        }

        return existing;
      }

      // Create new contact as prospect
      const { v4: uuidv4 } = require('uuid');
      const contactId = uuidv4();

      // Extract name from email if not provided
      let contactName = name || email.split('@')[0];

      query = `
        INSERT INTO contacts (id, company_id, name, email, phone, location, product_interest, customer_type, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'prospect', CURRENT_TIMESTAMP)
        RETURNING id, name, email, customer_type;
      `;

      result = await client.query(query, [
        contactId,
        companyId,
        contactName,
        email,
        phone,
        location,
        productInterest
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding or creating contact:', error);
      throw error;
    }
  }

  /**
   * Save email as enquiry
   */
  static async saveToEnquiries(client, contactId, companyId, subject, message, aiReply, confidence, intent, sentimentScore, sentimentLabel) {
    try {
      const { v4: uuidv4 } = require('uuid');
      const enquiryId = uuidv4();

      const query = `
        INSERT INTO enquiries (
          id, contact_id, company_id, subject, message, 
          status, customer_type, ai_reply, intent, sentiment_score, sentiment_label, created_at
        )
        VALUES ($1, $2, $3, $4, $5, 'new', 'prospect', $6, $7, $8, $9, CURRENT_TIMESTAMP)
        RETURNING id, subject, status, customer_type, intent, sentiment_score, sentiment_label;
      `;

      const result = await client.query(query, [
        enquiryId,
        contactId,
        companyId,
        subject,
        message,
        aiReply,
        intent,
        sentimentScore,
        sentimentLabel
      ]);

      return {
        type: 'enquiry',
        id: result.rows[0].id,
        subject: result.rows[0].subject,
        status: result.rows[0].status,
        aiReply: aiReply,
        intent: result.rows[0].intent,
        sentiment: {
          score: result.rows[0].sentiment_score,
          label: result.rows[0].sentiment_label
        },
        confidence: confidence
      };
    } catch (error) {
      console.error('Error saving to enquiries:', error);
      throw error;
    }
  }

  /**
   * Save email as support ticket
   */
  static async saveToSupportTickets(client, contactId, companyId, subject, message, aiReply, confidence, intent, sentimentScore, sentimentLabel) {
    try {
      const { v4: uuidv4 } = require('uuid');
      const ticketId = uuidv4();

      const query = `
        INSERT INTO support_tickets (
          id, contact_id, company_id, subject, issue, 
          status, priority, ai_reply, intent, sentiment_score, sentiment_label, created_at
        )
        VALUES ($1, $2, $3, $4, $5, 'open', 'medium', $6, $7, $8, $9, CURRENT_TIMESTAMP)
        RETURNING id, subject, status, priority, intent, sentiment_score, sentiment_label;
      `;

      const result = await client.query(query, [
        ticketId,
        contactId,
        companyId,
        subject,
        message,
        aiReply,
        intent,
        sentimentScore,
        sentimentLabel
      ]);

      return {
        type: 'support_ticket',
        id: result.rows[0].id,
        subject: result.rows[0].subject,
        status: result.rows[0].status,
        priority: result.rows[0].priority,
        aiReply: aiReply,
        intent: result.rows[0].intent,
        sentiment: {
          score: result.rows[0].sentiment_score,
          label: result.rows[0].sentiment_label
        },
        confidence: confidence
      };
    } catch (error) {
      console.error('Error saving to support_tickets:', error);
      throw error;
    }
  }

  /**
   * Get email processing history
   */
  static async getProcessingHistory(limit = 50) {
    try {
      const query = `
        SELECT 
          'enquiry' as type,
          e.id, e.subject, e.message, e.status, 
          c.name as contact_name, c.email,
          co.company_name as company_name, e.created_at
        FROM enquiries e
        JOIN contacts c ON e.contact_id = c.id
        JOIN companies co ON e.company_id = co.id
        
        UNION ALL
        
        SELECT 
          'support' as type,
          st.id, st.subject, st.issue as message, st.status,
          c.name as contact_name, c.email,
          co.company_name as company_name, st.created_at
        FROM support_tickets st
        JOIN contacts c ON st.contact_id = c.id
        JOIN companies co ON st.company_id = co.id
        
        ORDER BY created_at DESC
        LIMIT $1;
      `;

      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting processing history:', error);
      throw error;
    }
  }

  /**
   * Get processing stats for admin dashboard
   */
  static async getProcessingStats() {
    try {
      const query = `
        SELECT 
          COUNT(DISTINCT CASE WHEN type = 'enquiry' THEN id END) as total_enquiries_processed,
          COUNT(DISTINCT CASE WHEN type = 'support' THEN id END) as total_support_processed,
          COUNT(DISTINCT CASE WHEN status = 'new' THEN id END) as new_enquiries,
          COUNT(DISTINCT CASE WHEN status = 'open' THEN id END) as open_tickets
        FROM (
          SELECT 'enquiry' as type, id, status FROM enquiries
          UNION ALL
          SELECT 'support' as type, id, status FROM support_tickets
        ) as all_items;
      `;

      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting processing stats:', error);
      throw error;
    }
  }
}

module.exports = Email;
