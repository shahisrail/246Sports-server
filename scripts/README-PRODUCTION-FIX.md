# Production Email Subscriptions Fix

This directory contains scripts to fix the email subscriptions database in production.

## Problem

The email subscription API was returning 500 errors because the `get_association_subscribers` database function had a mismatch between its existing return type and the updated schema.

## Solution

The scripts will:
1. Drop and recreate the `get_association_subscribers` function with the correct signature
2. Apply all database schema updates for the email_subscriptions table
3. Recreate indexes and constraints
4. Verify the fix was successful

## Usage

### Option 1: Bash Script (Recommended for production)

```bash
cd backend
./scripts/fix-production-email-subscriptions.sh
```

The script will:
- Read the production database URL from your `.env` file (line 4)
- Ask for confirmation before proceeding
- Apply the fix
- Verify the changes

### Option 2: Node.js Script

```bash
cd backend
node scripts/fix-production-email-subscriptions.js
```

Or with explicit database URL:

```bash
PRODUCTION_DATABASE_URL="postgres://..." node scripts/fix-production-email-subscriptions.js
```

### Option 3: Manual SQL Execution

If you prefer to run the SQL manually:

```bash
cd backend
psql $PRODUCTION_DATABASE_URL -f database/fix-email-subscriptions.sql
```

Then fix the function manually:

```sql
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
```

## Verification

After running the fix, test the endpoints:

```bash
# Test status endpoint
curl "https://demo.246sports.com/api/v1/email-subscriptions/status?email=test@example.com&association_id=YOUR_ASSOCIATION_ID"

# Test subscribe endpoint
curl -X POST "https://demo.246sports.com/api/v1/email-subscriptions/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","association_id":"YOUR_ASSOCIATION_ID"}'
```

## Safety

- Both scripts require explicit confirmation before making changes
- The fix uses `IF NOT EXISTS` and `DROP IF EXISTS` to avoid errors
- All changes are reversible if needed
- The scripts verify the fix was successful before completing

## What Changed

### Database Function
- **Before**: Function had incorrect return type
- **After**: Function correctly returns `TABLE(id UUID, email VARCHAR, status VARCHAR, subscription_date TIMESTAMP, preferences JSONB)`

### Table Schema
- Added missing columns: `subscribed_at`, `unsubscribed_at`, `ip_address`, `created_at`, `updated_at`, `deleted_at`
- Added `unsubscribe_token` with UUID generation
- Added `preferences` JSONB column
- Added `subscription_date` timestamp
- Added `status` VARCHAR with default 'ACTIVE'

### Indexes
- Recreated all indexes on `email_subscriptions` table for performance

### Views
- Recreated `active_subscribers` view with proper joins

## Support

If you encounter any issues:

1. Check the backend logs: `backend/logs/combined.log`
2. Verify the database URL is correct
3. Ensure you have necessary permissions to modify the database
4. Check that the `fix-email-subscriptions.sql` file exists in `backend/database/`
