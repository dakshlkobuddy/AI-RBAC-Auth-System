const pool = require('./config/database');

async function addMissingColumns() {
  try {
    console.log('Adding missing columns to enquiries table...');
    
    // Add company_id column to enquiries
    await pool.query(`
      ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS company_id UUID,
      ADD CONSTRAINT fk_enquiries_company FOREIGN KEY (company_id) REFERENCES companies(id)
    `).catch(() => {
      // Column might already exist, continue
    });
    
    // Add customer_type column to enquiries
    await pool.query(`
      ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS customer_type VARCHAR(50) DEFAULT 'prospect'
    `).catch(() => {
      // Column might already exist
    });

    // Add intent and sentiment columns to enquiries
    await pool.query(`
      ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS intent VARCHAR(50),
      ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC,
      ADD COLUMN IF NOT EXISTS sentiment_label VARCHAR(20)
    `).catch(() => {
      // Column might already exist
    });
    
    console.log('✓ Enquiries table updated');
    
    console.log('Adding missing columns to support_tickets table...');
    
    // Add company_id column to support_tickets
    await pool.query(`
      ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS company_id UUID,
      ADD CONSTRAINT fk_support_company FOREIGN KEY (company_id) REFERENCES companies(id)
    `).catch(() => {
      // Column might already exist, continue
    });
    
    // Add priority column to support_tickets
    await pool.query(`
      ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'medium'
    `).catch(() => {
      // Column might already exist
    });

    // Add customer_type column to support_tickets
    await pool.query(`
      ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS customer_type VARCHAR(50) DEFAULT 'prospect'
    `).catch(() => {
      // Column might already exist
    });

    // Add intent and sentiment columns to support_tickets
    await pool.query(`
      ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS intent VARCHAR(50),
      ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC,
      ADD COLUMN IF NOT EXISTS sentiment_label VARCHAR(20)
    `).catch(() => {
      // Column might already exist
    });
    
    console.log('✓ Support_tickets table updated');

    console.log('Adding missing columns to contacts table...');

    await pool.query(`
      ALTER TABLE contacts ADD COLUMN IF NOT EXISTS location VARCHAR(255),
      ADD COLUMN IF NOT EXISTS product_interest TEXT
    `).catch(() => {
      // Column might already exist
    });

    console.log('✓ Contacts table updated');
    
    console.log('\n✓ All columns added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding columns:', error.message);
    process.exit(1);
  }
}

addMissingColumns();
