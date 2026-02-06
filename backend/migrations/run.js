const pool = require('../config/database');

/**
 * Database Migration Script
 * This script creates all necessary tables for the CRM system
 */

const createTablesSQL = `
-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role Permissions Table
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL,
  permission VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  UNIQUE(role_id, permission)
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  role_id INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  location VARCHAR(255),
  product_interest TEXT,
  company_id UUID,
  customer_type VARCHAR(50) DEFAULT 'prospect',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Enquiries Table
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY,
  contact_id UUID NOT NULL,
  company_id UUID,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  ai_reply TEXT,
  intent VARCHAR(50),
  sentiment_score NUMERIC,
  sentiment_label VARCHAR(20),
  status VARCHAR(50) DEFAULT 'new',
  customer_type VARCHAR(50) DEFAULT 'prospect',
  reply_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY,
  contact_id UUID NOT NULL,
  company_id UUID,
  subject VARCHAR(255) NOT NULL,
  issue TEXT NOT NULL,
  ai_reply TEXT,
  intent VARCHAR(50),
  sentiment_score NUMERIC,
  sentiment_label VARCHAR(20),
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(50) DEFAULT 'medium',
  reply_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Insert Default Roles
INSERT INTO roles (name) VALUES ('admin') ON CONFLICT DO NOTHING;
INSERT INTO roles (name) VALUES ('marketing') ON CONFLICT DO NOTHING;
INSERT INTO roles (name) VALUES ('support') ON CONFLICT DO NOTHING;

-- Insert Role Permissions for Admin
INSERT INTO role_permissions (role_id, permission)
SELECT id, 'CREATE_USER' FROM roles WHERE name = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'VIEW_USERS' FROM roles WHERE name = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'UPDATE_USER' FROM roles WHERE name = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'DELETE_USER' FROM roles WHERE name = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'VIEW_ENQUIRIES' FROM roles WHERE name = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'REPLY_ENQUIRY' FROM roles WHERE name = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'VIEW_TICKETS' FROM roles WHERE name = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'REPLY_TICKET' FROM roles WHERE name = 'admin'
ON CONFLICT DO NOTHING;

-- Insert Role Permissions for Marketing
INSERT INTO role_permissions (role_id, permission)
SELECT id, 'VIEW_ENQUIRIES' FROM roles WHERE name = 'marketing'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'REPLY_ENQUIRY' FROM roles WHERE name = 'marketing'
ON CONFLICT DO NOTHING;

-- Insert Role Permissions for Support
INSERT INTO role_permissions (role_id, permission)
SELECT id, 'VIEW_TICKETS' FROM roles WHERE name = 'support'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'REPLY_TICKET' FROM roles WHERE name = 'support'
ON CONFLICT DO NOTHING;
`;

const runMigration = async () => {
  try {
    console.log('Starting database migration...');
    const statements = createTablesSQL.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }

    console.log('✓ Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
