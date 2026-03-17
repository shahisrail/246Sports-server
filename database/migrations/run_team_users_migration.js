const { query } = require('../../dist/config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Running team_users table migration...');

    const sqlPath = path.join(__dirname, 'add_team_users_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await query(sql);

    console.log('✅ team_users table created successfully!');
    console.log('');
    console.log('Table structure:');
    console.log('- team_id: Links to teams table');
    console.log('- user_id: Links to users table');
    console.log('- role: TEAM_ADMIN, COACH, ASSISTANT_COACH, MANAGER, MEDICAL_STAFF');
    console.log('- UNIQUE constraint on (team_id, user_id, role)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
