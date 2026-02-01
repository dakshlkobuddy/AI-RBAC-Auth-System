const pool = require('./config/database');

async function checkSchema() {
  try {
    // Check contacts table structure
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'contacts' 
      ORDER BY ordinal_position
    `);
    
    console.log('Contacts table columns:');
    console.log(result.rows);
    
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'contacts'
      )
    `);
    
    console.log('Contacts table exists:', tableCheck.rows[0].exists);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSchema();
