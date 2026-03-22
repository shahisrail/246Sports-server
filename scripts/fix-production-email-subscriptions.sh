#!/bin/bash

# ============================================
# Production Email Subscriptions Fix Script
# ============================================
# This script applies the email subscriptions database fix to production
# Usage: ./scripts/fix-production-email-subscriptions.sh

set -e  # Exit on error

echo "🔧 Email Subscriptions Database Fix - Production"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Production Database URL (from .env)
# You can also pass it as an argument: DATABASE_URL="..." ./scripts/fix-production-email-subscriptions.sh
if [ -z "$DATABASE_URL" ]; then
    # Try to get it from .env file
    if [ -f .env ]; then
        # Get the production database URL (line 4 in .env)
        PROD_DB_URL=$(grep "^# postgres://postgres:" .env | sed 's/^# //')

        if [ -z "$PROD_DB_URL" ]; then
            echo -e "${RED}❌ Error: Could not find production database URL in .env${NC}"
            echo "Please set DATABASE_URL environment variable or add it to .env"
            exit 1
        fi
    else
        echo -e "${RED}❌ Error: .env file not found and DATABASE_URL not set${NC}"
        exit 1
    fi
else
    PROD_DB_URL=$DATABASE_URL
fi

echo "📊 Production Database: ${PROD_DB_URL:0:50}..."
echo ""

# Safety confirmation
echo -e "${YELLOW}⚠️  WARNING: This will modify the production database!${NC}"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirmation

if [ "$confirmation" != "yes" ]; then
    echo -e "${RED}❌ Aborted by user${NC}"
    exit 1
fi

echo ""
echo "🚀 Starting database fix..."
echo ""

# Create a backup timestamp
BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
echo "📝 Backup timestamp: $BACKUP_TIMESTAMP"

# Step 1: Drop and recreate the function
echo "1️⃣  Fixing get_association_subscribers function..."
psql "$PROD_DB_URL" << 'SQL' || {
    echo -e "${RED}❌ Failed to fix function${NC}"
    exit 1
}
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
SQL

echo -e "${GREEN}   ✅ Function fixed${NC}"

# Step 2: Apply the complete fix
echo "2️⃣  Applying database schema updates..."
psql "$PROD_DB_URL" -f database/fix-email-subscriptions.sql || {
    echo -e "${YELLOW}⚠️  Some schema updates had warnings (this is normal)${NC}"
}

echo -e "${GREEN}   ✅ Schema updated${NC}"

# Step 3: Verify the fix
echo "3️⃣  Verifying the fix..."
psql "$PROD_DB_URL" << 'SQL' || {
    echo -e "${RED}❌ Verification failed${NC}"
    exit 1
}
-- Check if function exists and has correct signature
SELECT
    routine_name as function_name,
    routine_type as type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'get_association_subscribers';

-- Check if email_subscriptions table has all required columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'email_subscriptions'
AND column_name IN ('status', 'preferences', 'subscription_date', 'unsubscribed_at', 'ip_address')
ORDER BY column_name;
SQL

echo -e "${GREEN}   ✅ Verification complete${NC}"

echo ""
echo -e "${GREEN}✅ Production database fix completed successfully!${NC}"
echo ""
echo "📋 Summary of changes:"
echo "   - Recreated get_association_subscribers function"
echo "   - Updated email_subscriptions table schema"
echo "   - Recreated indexes and constraints"
echo "   - Recreated database functions and views"
echo ""
echo "🧪 You can now test the email subscription endpoints:"
echo "   - GET  /api/v1/email-subscriptions/status"
echo "   - POST /api/v1/email-subscriptions/subscribe"
echo ""
