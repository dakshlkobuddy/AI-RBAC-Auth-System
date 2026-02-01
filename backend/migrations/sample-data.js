/**
 * Seed Script - Create sample data for testing
 * Run with: node seeds/sample-data.js
 */

const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  const client = await pool.connect();
  try {
    console.log('Seeding sample data...');

    // Get role IDs
    const adminRole = await client.query("SELECT id FROM roles WHERE name = 'admin'");
    const marketingRole = await client.query("SELECT id FROM roles WHERE name = 'marketing'");
    const supportRole = await client.query("SELECT id FROM roles WHERE name = 'support'");

    // Create sample admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminId = uuidv4();

    await client.query(
      `INSERT INTO users (id, name, email, password, role_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [adminId, 'Admin User', 'admin@company.com', adminPassword, adminRole.rows[0].id, true]
    );

    // Create sample marketing user
    const marketingPassword = await bcrypt.hash('marketing123', 10);
    const marketingId = uuidv4();

    await client.query(
      `INSERT INTO users (id, name, email, password, role_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [marketingId, 'Marketing User', 'marketing@company.com', marketingPassword, marketingRole.rows[0].id, true]
    );

    // Create sample support user
    const supportPassword = await bcrypt.hash('support123', 10);
    const supportId = uuidv4();

    await client.query(
      `INSERT INTO users (id, name, email, password, role_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [supportId, 'Support User', 'support@company.com', supportPassword, supportRole.rows[0].id, true]
    );

    // Create sample company
    const companyId = uuidv4();
    await client.query(
      `INSERT INTO companies (id, company_name, website)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [companyId, 'TechCorp Inc.', 'https://techcorp.com']
    );

    // Create sample contact
    const contactId = uuidv4();
    await client.query(
      `INSERT INTO contacts (id, name, email, phone, company_id, customer_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [contactId, 'John Doe', 'john@techcorp.com', '+1234567890', companyId, 'prospect']
    );

    console.log('✓ Sample data seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin:     admin@company.com / admin123');
    console.log('Marketing: marketing@company.com / marketing123');
    console.log('Support:   support@company.com / support123');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
};

seedData();
