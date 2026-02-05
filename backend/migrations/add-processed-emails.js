const pool = require('../config/database');

async function addProcessedEmailsTable() {
  try {
    console.log('Creating processed_emails table if not exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS processed_emails (
        id SERIAL PRIMARY KEY,
        message_id TEXT UNIQUE NOT NULL,
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ processed_emails table ready');
    process.exit(0);
  } catch (error) {
    console.error('Failed to create processed_emails table:', error.message);
    process.exit(1);
  }
}

addProcessedEmailsTable();
