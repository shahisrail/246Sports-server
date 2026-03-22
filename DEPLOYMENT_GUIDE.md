# 🚀 Production Deployment Guide - Fix Login-V2 500 Error

## Problem
The `/auth/login-v2` endpoint returns 500 error because the `refresh_tokens` table doesn't exist in production database.

## Solution
Run the migration to add the refresh token system.

---

## 📋 Step-by-Step Instructions

### Option 1: Run Migration via Coolify Terminal (Recommended)

1. **Open Coolify Dashboard**
   - Go to your `246Sports-backend` service
   - Click on **Terminal** tab

2. **Connect to Database**
   ```bash
   # Get database connection string
   echo $DATABASE_URL
   ```

3. **Run Migration**
   ```bash
   cd /app/database/migrations
   psql $DATABASE_URL -f 006_add_refresh_token_system.sql
   ```

4. **Add Test User** (optional, for testing)
   ```bash
   cd /app/database/seeds
   psql $DATABASE_URL -f 006_seed_test_user.sql
   ```

5. **Test the Endpoint**
   ```bash
   curl -X POST 'https://api.246sports.com/api/v1/auth/login-v2' \
     -H 'Content-Type: application/json' \
     -d '{
       "email": "admin@246sports.com",
       "password": "Admin123!"
     }'
   ```

---

### Option 2: Run Migration Locally (if you have DB access)

```bash
# Set database URL
export DATABASE_URL="postgresql://user:password@host:port/database"

# Run migration
cd backend/database/migrations
psql $DATABASE_URL -f 006_add_refresh_token_system.sql

# Add test user
cd ../seeds
psql $DATABASE_URL -f 006_seed_test_user.sql
```

---

### Option 3: Run Migration Script

```bash
cd backend/database/migrations
chmod +x 006_add_refresh_token_system.sh
./006_add_refresh_token_system.sh
```

---

## ✅ Verification

After running the migration, verify the table exists:

```sql
-- Check table exists
\dt refresh_tokens

-- Check table structure
\d refresh_tokens

-- Count tokens (should be 0 initially)
SELECT COUNT(*) FROM refresh_tokens;
```

---

## 🧪 Testing

After migration, test the login-v2 endpoint:

**Request:**
```bash
POST https://api.246sports.com/api/v1/auth/login-v2
Content-Type: application/json

{
  "email": "admin@246sports.com",
  "password": "Admin123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Test Admin",
      "email": "admin@246sports.com",
      "role": "SUPER_ADMIN"
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "uuid",
    "tokenType": "Bearer",
    "expiresIn": "15m",
    "refreshExpiresIn": "7d"
  }
}
```

---

## 🔍 Troubleshooting

### If migration fails:

1. **Check PostgreSQL extension:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

2. **Check database connection:**
   ```bash
   psql $DATABASE_URL -c "SELECT 1;"
   ```

3. **Check table exists:**
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name = 'refresh_tokens';
   ```

### If login still returns 500:

1. **Check server logs in Coolify**
2. **Verify user exists:**
   ```sql
   SELECT * FROM users WHERE email = 'admin@246sports.com';
   ```
3. **Test database connection:**
   ```sql
   SELECT * FROM users LIMIT 1;
   ```

---

## 📝 What This Migration Does

- Creates `refresh_tokens` table for JWT refresh token rotation
- Adds indexes for performance
- Sets up foreign key to users table
- Enables secure token rotation (logout from all devices, etc.)

---

## 🔐 Security Notes

- Refresh tokens expire after 7 days
- Tokens are rotated on each refresh (old token is revoked)
- Supports logout from specific devices or all devices
- Tracks device info and user agent for security monitoring

---

## 📚 Additional Endpoints

After migration, these endpoints will work:

- `POST /api/v1/auth/login-v2` - Login with refresh tokens
- `POST /api/v1/auth/refresh` - Get new access token
- `POST /api/v1/auth/logout` - Logout (revoke refresh token)
- `POST /api/v1/auth/revoke-all` - Revoke all tokens (logout from all devices)
