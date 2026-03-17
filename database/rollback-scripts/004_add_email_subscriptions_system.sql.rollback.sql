-- ============================================================
-- ROLLBACK: Email Subscriptions System
-- This file reverses migration 004_add_email_subscriptions_system.sql
-- ============================================================

-- WARNING: This will delete all email subscription data!
-- Make sure to backup before running this rollback.

-- ============================================================
-- STEP 1: DROP VIEWS
-- ============================================================

DROP VIEW IF EXISTS active_subscribers;

-- ============================================================
-- STEP 2: DROP FUNCTIONS
-- ============================================================

DROP FUNCTION IF EXISTS is_subscribed_to_association(VARCHAR(255), UUID);
DROP FUNCTION IF EXISTS get_association_subscribers(UUID);
DROP FUNCTION IF EXISTS unsubscribe_by_token(VARCHAR(255));

-- ============================================================
-- STEP 3: DROP TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS update_email_subscriptions_updated_at ON email_subscriptions;

-- ============================================================
-- STEP 4: DROP INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_email_subscriptions_email;
DROP INDEX IF EXISTS idx_email_subscriptions_association;
DROP INDEX IF EXISTS idx_email_subscriptions_status;
DROP INDEX IF EXISTS idx_email_subscriptions_unique;
DROP INDEX IF EXISTS idx_email_subscriptions_unsubscribe_token;

-- ============================================================
-- STEP 5: DROP TABLE
-- ============================================================

DROP TABLE IF EXISTS email_subscriptions CASCADE;

-- ============================================================
-- STEP 6: DROP FUNCTION (if not used elsewhere)
-- ============================================================

DROP FUNCTION IF EXISTS update_updated_at_column();

-- ============================================================
-- ROLLBACK COMPLETE
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Email subscriptions system rollback completed';
    RAISE NOTICE '⚠️  All subscription data has been permanently deleted';
END $$;
