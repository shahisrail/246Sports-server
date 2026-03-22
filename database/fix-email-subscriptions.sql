-- Fix missing columns in email_subscriptions table
-- Run this on your production database to fix the 500 errors

-- Add missing columns if they don't exist
ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP;
ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50);
ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Ensure other required columns exist
ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS unsubscribe_token UUID DEFAULT uuid_generate_v4();
ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"news": true, "fixtures": true, "results": true}';
ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS subscription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';

-- Drop old unique constraint on email only
ALTER TABLE email_subscriptions DROP CONSTRAINT IF EXISTS email_subscriptions_email_key;

-- Add composite unique constraint on email + association_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'email_subscriptions_email_association_key'
    ) THEN
        ALTER TABLE email_subscriptions ADD CONSTRAINT email_subscriptions_email_association_key UNIQUE (email, association_id);
    END IF;
END $$;

-- Recreate indexes if needed
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_association ON email_subscriptions(association_id);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_status ON email_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_ip ON email_subscriptions(ip_address);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_unsubscribe_token ON email_subscriptions(unsubscribe_token);

-- Recreate functions
CREATE OR REPLACE FUNCTION is_subscribed_to_association(p_email TEXT, p_association_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM email_subscriptions
        WHERE LOWER(email) = LOWER(p_email)
        AND association_id = p_association_id
        AND status = 'ACTIVE'
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION unsubscribe_by_token(p_token UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE email_subscriptions
    SET status = 'UNSUBSCRIBED',
        unsubscribed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE unsubscribe_token = p_token;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

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

-- Recreate view
DROP VIEW IF EXISTS active_subscribers;
CREATE VIEW active_subscribers AS
SELECT s.*, a.name as association_name
FROM email_subscriptions s
LEFT JOIN associations a ON s.association_id = a.id
WHERE s.status = 'ACTIVE' AND s.deleted_at IS NULL;
