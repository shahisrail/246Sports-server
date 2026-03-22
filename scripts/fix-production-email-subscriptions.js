#!/usr/bin/env node

/**
 * Production Email Subscriptions Fix Script (Node.js)
 *
 * This script applies the email subscriptions database fix to production
 * Usage: node scripts/fix-production-email-subscriptions.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

async function main() {
  console.log('');
  console.log('🔧 Email Subscriptions Database Fix - Production');
  console.log('================================================');
  console.log('');

  // Get production database URL
  const prodDbUrl = process.env.PRODUCTION_DATABASE_URL ||
                    process.env.DATABASE_URL;

  if (!prodDbUrl) {
    log.error('No production database URL found!');
    console.log('');
    console.log('Please set PRODUCTION_DATABASE_URL environment variable:');
    console.log('  export PRODUCTION_DATABASE_URL="postgres://..."');
    console.log('  node scripts/fix-production-email-subscriptions.js');
    console.log('');
    process.exit(1);
  }

  console.log(`📊 Production Database: ${prodDbUrl.substring(0, 50)}...`);
  console.log('');

  // Safety confirmation
  if (process.env.AUTO_CONFIRM !== 'yes') {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      rl.question(
        `${colors.yellow}⚠️  WARNING: This will modify the production database!${colors.reset}\n\nAre you sure you want to continue? (type 'yes' to confirm): `,
        resolve
      );
    });

    rl.close();

    if (answer.toLowerCase() !== 'yes') {
      log.error('Aborted by user');
      process.exit(1);
    }
  }

  console.log('');
  log.info('Starting database fix...');
  console.log('');

  const pool = new Pool({
    connectionString: prodDbUrl,
    ssl: prodDbUrl.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    // Step 1: Drop and recreate the function
    log.info('1️⃣  Fixing get_association_subscribers function...');

    await pool.query(`
      DROP FUNCTION IF EXISTS get_association_subscribers(UUID);

      CREATE OR REPLACE FUNCTION get_association_subscribers(p_association_id UUID)
      RETURNS TABLE(id UUID, email VARCHAR, status VARCHAR, subscription_date TIMESTAMP, preferences JSONB) AS $$
      BEGIN
          RETURN QUERY
          SELECT s.id, s.email, s.status, s.subscription_date, s.preferences
          FROM email_subscriptions s
          WHERE s.association_id = p_association_id
          AND s.deleted_at IS NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    log.success('Function fixed');

    // Step 2: Apply the complete fix from SQL file
    log.info('2️⃣  Applying database schema updates...');

    const fixSqlPath = path.join(__dirname, '../database/fix-email-subscriptions.sql');
    const fixSql = fs.readFileSync(fixSqlPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = fixSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await pool.query(statement);
      } catch (err: any) {
        // Ignore duplicate object errors (these are expected)
        if (!err.code || !['42P07', '42710', '42P16', '42701'].includes(err.code)) {
          throw err;
        }
      }
    }

    log.success('Schema updated');

    // Step 3: Verify the fix
    log.info('3️⃣  Verifying the fix...');

    // Check if function exists
    const functionCheck = await pool.query(`
      SELECT routine_name, routine_type
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_name = 'get_association_subscribers'
    `);

    if (functionCheck.rows.length === 0) {
      throw new Error('Function get_association_subscribers not found after fix');
    }

    // Check if email_subscriptions table has required columns
    const columnsCheck = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'email_subscriptions'
      AND column_name IN ('status', 'preferences', 'subscription_date', 'unsubscribed_at', 'ip_address')
      ORDER BY column_name
    `);

    const requiredColumns = ['status', 'preferences', 'subscription_date', 'unsubscribed_at', 'ip_address'];
    const foundColumns = columnsCheck.rows.map(row => row.column_name);

    for (const col of requiredColumns) {
      if (!foundColumns.includes(col)) {
        throw new Error(`Required column '${col}' not found in email_subscriptions table`);
      }
    }

    log.success('Verification complete');

    console.log('');
    log.success('Production database fix completed successfully!');
    console.log('');
    console.log('📋 Summary of changes:');
    console.log('   - Recreated get_association_subscribers function');
    console.log('   - Updated email_subscriptions table schema');
    console.log('   - Recreated indexes and constraints');
    console.log('   - Recreated database functions and views');
    console.log('');
    console.log('🧪 You can now test the email subscription endpoints:');
    console.log('   - GET  /api/v1/email-subscriptions/status');
    console.log('   - POST /api/v1/email-subscriptions/subscribe');
    console.log('');

  } catch (error: any) {
    console.log('');
    log.error(`Failed to apply fix: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
main().catch(err => {
  log.error(`Script failed: ${err.message}`);
  process.exit(1);
});
