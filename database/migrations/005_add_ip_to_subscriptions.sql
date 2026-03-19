-- ============================================================
-- ADD IP ADDRESS TRACKING TO EMAIL SUBSCRIPTIONS
-- Version: 1.0.0
-- Date: 2026-03-18
-- ============================================================

-- Add IP address column to track subscriber device IPs
ALTER TABLE email_subscriptions
ADD COLUMN IF NOT EXISTS ip_address INET DEFAULT NULL;

-- Add index for IP-based queries (useful for analytics)
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_ip
ON email_subscriptions(ip_address)
WHERE deleted_at IS NULL AND ip_address IS NOT NULL;

-- Drop the old function first
DROP FUNCTION IF EXISTS get_association_subscribers(UUID);

-- Recreate the get_association_subscribers function to include IP
CREATE FUNCTION get_association_subscribers(
    p_association_id UUID
) RETURNS TABLE (
    email VARCHAR(255),
    ip_address INET,
    subscription_date TIMESTAMP WITH TIME ZONE,
    preferences JSONB,
    status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        es.email,
        es.ip_address,
        es.subscription_date,
        es.preferences,
        es.status
    FROM email_subscriptions es
    WHERE es.association_id = p_association_id
    AND es.deleted_at IS NULL
    ORDER BY es.subscription_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON COLUMN email_subscriptions.ip_address IS 'IP address of the device used to subscribe (for analytics and security)';

DO $$
BEGIN
    RAISE NOTICE '✅ IP address tracking added to email_subscriptions table';
END $$;
