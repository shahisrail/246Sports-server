import { pool } from '../src/config/database';
import fs from 'fs';
import path from 'path';

/**
 * Email Subscriptions Database Migration
 *
 * This migration fixes the email subscriptions table and functions
 * Run: npm run migrate:email-subs
 */

export async function up(): Promise<void> {
  const client = await pool.connect();

  try {
    console.log('🔧 Running email subscriptions migration...');

    // Start transaction
    await client.query('BEGIN');

    // 1. Drop and recreate the function with correct signature
    console.log('1️⃣  Fixing get_association_subscribers function...');
    await client.query(`
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

    // 2. Add missing columns if they don't exist
    console.log('2️⃣  Adding missing columns...');
    const columns = [
      'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP',
      'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50)',
      'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP',
      'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS unsubscribe_token UUID DEFAULT uuid_generate_v4()',
      'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT \'{"news": true, "fixtures": true, "results": true}\'',
      'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS subscription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT \'ACTIVE\'',
    ];

    for (const column of columns) {
      try {
        await client.query(column);
      } catch (err: any) {
        // Ignore duplicate column errors
        if (err.code !== '42701') {
          console.warn(`Warning: ${err.message}`);
        }
      }
    }

    // 3. Drop old unique constraint on email only
    console.log('3️⃣  Updating constraints...');
    try {
      await client.query('ALTER TABLE email_subscriptions DROP CONSTRAINT IF EXISTS email_subscriptions_email_key');
    } catch (err: any) {
      // Ignore if constraint doesn't exist
    }

    // 4. Add composite unique constraint
    try {
      await client.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'email_subscriptions_email_association_key'
            ) THEN
                ALTER TABLE email_subscriptions ADD CONSTRAINT email_subscriptions_email_association_key UNIQUE (email, association_id);
            END IF;
        END $$;
      `);
    } catch (err: any) {
      console.warn(`Warning: ${err.message}`);
    }

    // 5. Recreate indexes
    console.log('4️⃣  Recreating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email)',
      'CREATE INDEX IF NOT EXISTS idx_email_subscriptions_association ON email_subscriptions(association_id)',
      'CREATE INDEX IF NOT EXISTS idx_email_subscriptions_status ON email_subscriptions(status)',
      'CREATE INDEX IF NOT EXISTS idx_email_subscriptions_ip ON email_subscriptions(ip_address)',
      'CREATE INDEX IF NOT EXISTS idx_email_subscriptions_unsubscribe_token ON email_subscriptions(unsubscribe_token)',
    ];

    for (const index of indexes) {
      await client.query(index);
    }

    // 6. Recreate view
    console.log('5️⃣  Recreating view...');
    await client.query(`
      DROP VIEW IF EXISTS active_subscribers;
      CREATE VIEW active_subscribers AS
      SELECT s.*, a.name as association_name
      FROM email_subscriptions s
      LEFT JOIN associations a ON s.association_id = a.id
      WHERE s.status = 'ACTIVE' AND s.deleted_at IS NULL;
    `);

    // Commit transaction
    await client.query('COMMIT');

    console.log('✅ Email subscriptions migration completed successfully!');
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  up()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
