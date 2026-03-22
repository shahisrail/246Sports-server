#!/usr/bin/env node

const { Client } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

async function ensureDefaultAdmin() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('🔍 Checking database...');
        await client.connect();
        console.log('✅ Connected to database');
        console.log('');

        // Check if admin already exists
        console.log('🔍 Checking for existing admin user...');
        const checkResult = await client.query(`
            SELECT id, name, email, role
            FROM users
            WHERE role = 'SUPER_ADMIN'
            AND deleted_at IS NULL
            LIMIT 1
        `);

        if (checkResult.rows.length > 0) {
            console.log('✅ Admin user already exists!');
            console.log('');
            console.log('Existing Admin Details:');
            console.log(`  ID:    ${checkResult.rows[0].id}`);
            console.log(`  Name:  ${checkResult.rows[0].name}`);
            console.log(`  Email: ${checkResult.rows[0].email}`);
            console.log(`  Role:  ${checkResult.rows[0].role}`);
            console.log('');
            console.log('ℹ️  No action needed. Admin user is ready.');
            return;
        }

        console.log('⚠️  No admin user found.');
        console.log('🔧 Creating default admin user...');
        console.log('');

        // Default admin credentials
        const defaultAdmin = {
            id: uuidv4(),
            name: 'Super Admin',
            email: 'admin@246sports.com',
            password: await bcrypt.hash('Admin@246', 10),
            role: 'SUPER_ADMIN',
        };

        await client.query(
            `INSERT INTO users (id, name, email, password, role, association_id, club_id, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
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

        console.log('✅ Default admin user created successfully!');
        console.log('');
        console.log('═══════════════════════════════════════════════');
        console.log('🔐 DEFAULT ADMIN CREDENTIALS');
        console.log('═══════════════════════════════════════════════');
        console.log(`   Email:    ${defaultAdmin.email}`);
        console.log(`   Password: Admin@246`);
        console.log('═══════════════════════════════════════════════');
        console.log('');
        console.log('⚠️  IMPORTANT:');
        console.log('   1. Save these credentials');
        console.log('   2. Login at: http://localhost:4000/api/v1/auth/login-v2');
        console.log('   3. CHANGE PASSWORD after first login!');
        console.log('');

        // Verify
        const verifyResult = await client.query(`
            SELECT id, name, email, role, created_at
            FROM users
            WHERE email = $1
        `, [defaultAdmin.email]);

        if (verifyResult.rows.length > 0) {
            console.log('✅ Verification successful - admin user is ready to use!');
            console.log(`   User ID: ${verifyResult.rows[0].id}`);
            console.log(`   Created: ${verifyResult.rows[0].created_at}`);
        }

    } catch (error) {
        console.error('');
        console.error('❌ Error:', error.message);
        console.error('');
        console.error('Troubleshooting:');
        console.error('1. Make sure PostgreSQL is running');
        console.error('2. Check DATABASE_URL in .env file');
        console.error('3. Make sure database tables exist');
        console.error('');
        throw error;
    } finally {
        await client.end();
        console.log('');
        console.log('👋 Done!');
    }
}

console.log('');
console.log('═══════════════════════════════════════════════');
console.log('🚀 246Sports - Admin User Setup');
console.log('═══════════════════════════════════════════════');
console.log('');

ensureDefaultAdmin()
    .then(() => {
        console.log('');
        console.log('✅ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('');
        console.error('❌ Script failed!');
        process.exit(1);
    });
