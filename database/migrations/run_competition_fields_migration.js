const { query } = require('../../dist/config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Running competition fields migration...');

    const sqlPath = path.join(__dirname, 'add_competition_fields.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await query(sql);

    console.log('✅ Competition fields added successfully!');
    console.log('');
    console.log('New fields added to competitions table:');
    console.log('- format: Competition format (e.g., "Round Robin", "Knockout")');
    console.log('- description: Competition description');
    console.log('- start_date: Competition start date');
    console.log('- end_date: Competition end date');
    console.log('- website: Competition website URL');
    console.log('- contact_email: Contact email address');
    console.log('- contact_phone: Contact phone number');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
