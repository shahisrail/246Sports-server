const { Client } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

async function createDefaultAdmin() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        console.log('✅ Connected successfully');

        // Check if admin already exists
        const checkResult = await client.query(`
            SELECT EXISTS (
                SELECT FROM users
                WHERE role = 'SUPER_ADMIN'
                AND deleted_at IS NULL
            );
        `);

        if (checkResult.rows[0].exists) {
            console.log('⚠️  Admin user already exists!');
            console.log('');
            const existingAdmin = await client.query(`
                SELECT id, name, email, role
                FROM users
                WHERE role = 'SUPER_ADMIN'
                AND deleted_at IS NULL
                LIMIT 1
            `);
            console.log('Existing admin:');
            console.log(`  Email: ${existingAdmin.rows[0].email}`);
            console.log(`  Name:  ${existingAdmin.rows[0].name}`);
            return;
        }

        console.log('👤 Creating default admin user...');

        // Default admin credentials
        const defaultAdmin = {
            id: uuidv4(),
            name: 'Super Admin',
            email: 'admin@246sports.com',
            password: await bcrypt.hash('Admin@246', 10),
            role: 'SUPER_ADMIN',
        };

        await client.query(
            `INSERT INTO users (id, name, email, password, role, association_id, club_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                defaultAdmin.id,
                defaultAdmin.name,
                defaultAdmin.email,
                defaultAdmin.password,
                defaultAdmin.role,
                null,
                null,
            ]
        );

        console.log('');
        console.log('✅ Default admin user created successfully!');
        console.log('');
        console.log('🔐 Default Admin Credentials:');
        console.log('   Email:    admin@246sports.com');
        console.log('   Password: Admin@246');
        console.log('');
        console.log('⚠️  IMPORTANT: Change this password after first login!');
        console.log('');

        // Verify
        const verifyResult = await client.query(`
            SELECT id, name, email, role, created_at
            FROM users
            WHERE email = 'admin@246sports.com'
        `);

        if (verifyResult.rows.length > 0) {
            console.log('✅ Verification successful - admin user is ready!');
        }

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

createDefaultAdmin()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
