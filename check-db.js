const { Client } = require('pg');

require('dotenv').config();

async function checkAndInitializeDatabase() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('🔍 Checking database...');
        await client.connect();

        // Check if users table exists
        const result = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'users'
            );
        `);

        const tablesExist = result.rows[0].exists;

        if (tablesExist) {
            console.log('✅ Database tables already exist');
            return true;
        } else {
            console.log('⚠️  Database tables not found');
            console.log('🔧 Initializing database...');
            return false;
        }

    } catch (error) {
        console.error('❌ Error checking database:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

// Run if called directly
if (require.main === module) {
    checkAndInitializeDatabase()
        .then((exists) => {
            if (!exists) {
                console.log('📝 Please run: node database/init-db.js');
                process.exit(1);
            }
            process.exit(0);
        })
        .catch(() => process.exit(1));
}

module.exports = { checkAndInitializeDatabase };
