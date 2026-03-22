const { Client } = require('pg');
require('dotenv').config();

async function fixTeamsSchema() {
    const databaseUrl = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;
    
    if (!databaseUrl) {
        console.error('❌ No DATABASE_URL found');
        process.exit(1);
    }

    const client = new Client({
        connectionString: databaseUrl,
    });

    try {
        console.log(`🔌 Connecting to database...`);
        await client.connect();
        console.log('✅ Connected successfully');

        console.log('📋 Adding missing columns to teams table...');
        
        const alterQueries = [
            'ALTER TABLE teams ADD COLUMN IF NOT EXISTS competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL',
            'ALTER TABLE teams ADD COLUMN IF NOT EXISTS abbreviation VARCHAR(20)',
            'ALTER TABLE teams ADD COLUMN IF NOT EXISTS founded_year INTEGER',
            'ALTER TABLE teams ADD COLUMN IF NOT EXISTS colors TEXT[]',
            'ALTER TABLE teams ADD COLUMN IF NOT EXISTS description TEXT',
            'ALTER TABLE teams ADD COLUMN IF NOT EXISTS website TEXT',
            'ALTER TABLE teams ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255)',
            'ALTER TABLE teams ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50)'
        ];

        for (const query of alterQueries) {
            try {
                process.stdout.write(`Running: ${query.substring(0, 50)}... `);
                await client.query(query);
                console.log('✅');
            } catch (err) {
                if (err.code === '42701') { // duplicate_column
                    console.log('ℹ️ Already exists');
                } else {
                    console.log('❌');
                    throw err;
                }
            }
        }

        console.log('✅ Database schema fixed successfully!');

    } catch (error) {
        console.error('❌ Error fixing database schema:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

fixTeamsSchema()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
