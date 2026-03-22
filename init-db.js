const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

async function initializeDatabase() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        console.log('✅ Connected successfully');

        // Read the schema file
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('📋 Creating database tables...');
        await client.query(schema);

        console.log('✅ Database initialized successfully!');
        console.log('');

        // List created tables
        const result = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);

        console.log(`📊 Created ${result.rows.length} tables:`);
        result.rows.forEach(row => {
            console.log(`  ✓ ${row.table_name}`);
        });

        console.log('');
        console.log('🎉 Database is ready!');

    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

// Run if called directly
if (require.main === module) {
    initializeDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = { initializeDatabase };
