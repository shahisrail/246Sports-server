-- ============================================================
-- PHASE 1: EMAIL SUBSCRIPTIONS SYSTEM MIGRATION
-- Association Email Newsletter & Updates System
-- Version: 1.0.0
-- Date: 2026-03-17
-- ============================================================

-- This migration creates an email subscription system that allows
-- users to subscribe to association updates (news, fixtures, results)

-- ============================================================
-- STEP 1: CREATE EMAIL_SUBSCRIPTIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS email_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    association_id UUID NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'UNSUBSCRIBED', 'BOUNCED')),
    subscription_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    unsubscribe_token VARCHAR(255) UNIQUE NOT NULL,
    preferences JSONB DEFAULT '{"news": true, "fixtures": true, "results": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- ============================================================

-- Index for email lookups (login, subscription checks)
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email
ON email_subscriptions(email)
WHERE deleted_at IS NULL;

-- Index for association lookups (get all subscribers for an association)
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_association
ON email_subscriptions(association_id)
WHERE deleted_at IS NULL;

-- Index for status filtering (active subscribers)
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_status
ON email_subscriptions(status)
WHERE deleted_at IS NULL;

-- Composite index for email + association uniqueness checks
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_subscriptions_unique
ON email_subscriptions(email, association_id)
WHERE deleted_at IS NULL;

-- Index for unsubscribe token lookups
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_unsubscribe_token
ON email_subscriptions(unsubscribe_token)
WHERE deleted_at IS NULL;

-- ============================================================
-- STEP 3: CREATE TRIGGER FOR UPDATED_AT
-- ============================================================

-- Create or replace the update_updated_at_column function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to email_subscriptions table
DROP TRIGGER IF EXISTS update_email_subscriptions_updated_at ON email_subscriptions;
CREATE TRIGGER update_email_subscriptions_updated_at
    BEFORE UPDATE ON email_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- STEP 4: ADD HELPER FUNCTIONS FOR SUBSCRIPTION MANAGEMENT
-- ============================================================

-- Function to check if an email is subscribed to an association
CREATE OR REPLACE FUNCTION is_subscribed_to_association(
    p_email VARCHAR(255),
    p_association_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    subscription_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO subscription_count
    FROM email_subscriptions
    WHERE LOWER(email) = LOWER(p_email)
    AND association_id = p_association_id
    AND status = 'ACTIVE'
    AND deleted_at IS NULL;

    RETURN COALESCE(subscription_count, 0) > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to get all active subscribers for an association
CREATE OR REPLACE FUNCTION get_association_subscribers(
    p_association_id UUID
) RETURNS TABLE (
    email VARCHAR(255),
    subscription_date TIMESTAMP WITH TIME ZONE,
    preferences JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        es.email,
        es.subscription_date,
        es.preferences
    FROM email_subscriptions es
    WHERE es.association_id = p_association_id
    AND es.status = 'ACTIVE'
    AND es.deleted_at IS NULL
    ORDER BY es.subscription_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to unsubscribe by token
CREATE OR REPLACE FUNCTION unsubscribe_by_token(
    p_token VARCHAR(255)
) RETURNS BOOLEAN AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE email_subscriptions
    SET
        status = 'UNSUBSCRIBED',
        unsubscribed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE unsubscribe_token = p_token
    AND status = 'ACTIVE'
    AND deleted_at IS NULL;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- STEP 5: ADD COMMENTS FOR DOCUMENTATION
-- ============================================================

COMMENT ON TABLE email_subscriptions IS 'User email subscriptions for association updates (news, fixtures, results)';
COMMENT ON COLUMN email_subscriptions.email IS 'Subscriber email address (stored in lowercase)';
COMMENT ON COLUMN email_subscriptions.association_id IS 'Association to subscribe to';
COMMENT ON COLUMN email_subscriptions.status IS 'Subscription status: ACTIVE, UNSUBSCRIBED, or BOUNCED';
COMMENT ON COLUMN email_subscriptions.unsubscribe_token IS 'Unique token for one-click unsubscribe links';
COMMENT ON COLUMN email_subscriptions.preferences IS 'JSON object with boolean flags: {news, fixtures, results}';
COMMENT ON COLUMN email_subscriptions.subscription_date IS 'When the subscription was created';
COMMENT ON COLUMN email_subscriptions.unsubscribed_at IS 'When the subscription was cancelled';

-- ============================================================
-- STEP 6: CREATE VIEW FOR ACTIVE SUBSCRIBERS (EASY QUERYING)
-- ============================================================

CREATE OR REPLACE VIEW active_subscribers AS
SELECT
    es.id,
    es.email,
    es.association_id,
    a.name as association_name,
    es.subscription_date,
    es.preferences,
    es.created_at
FROM email_subscriptions es
INNER JOIN associations a ON es.association_id = a.id
WHERE es.status = 'ACTIVE'
AND es.deleted_at IS NULL
AND a.deleted_at IS NULL;

COMMENT ON VIEW active_subscribers IS 'View of all active email subscribers with association names';

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

-- Verification query
DO $$
BEGIN
    RAISE NOTICE '✅ Email subscriptions system migration completed successfully';
    RAISE NOTICE '📊 Table email_subscriptions created with indexes';
    RAISE NOTICE '🔧 Helper functions created: is_subscribed_to_association, get_association_subscribers, unsubscribe_by_token';
    RAISE NOTICE '👁️  View active_subscribers created for easy querying';
END $$;
