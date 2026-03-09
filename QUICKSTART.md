# 246Sports - Quick Start Guide

<div align="center">

**Get the 246Sports Backend API running in 5 minutes**

[Step 1: Prerequisites](#step-1-prerequisites) • [Step 2: Database Setup](#step-2-database-setup) • [Step 3: Start Server](#step-3-start-server) • [Step 4: Test API](#step-4-test-api)

</div>

---

## 📋 Step 1: Prerequisites

Ensure you have the following installed:

```bash
# Check Node.js (need >= 18.0.0)
node --version

# Check npm (need >= 8.0.0)
npm --version

# Check PostgreSQL (need >= 14.0)
psql --version
```

**If you don't have PostgreSQL installed:**

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql-14
sudo service postgresql start
```

---

## 🗄️ Step 2: Database Setup

### Option A: Automatic Setup (Recommended)

Run our setup script:

```bash
# Make setup script executable
chmod +x scripts/setup.sh

# Run the setup
./scripts/setup.sh
```

### Option B: Manual Setup

#### 2.1 Create the Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE sports_db;"

# Verify database created
psql -U postgres -l | grep sports_db
```

#### 2.2 Run Database Migration

```bash
# Run the v2 schema migration
psql -U postgres -d sports_db -f database/schema_v2.sql

# You should see "CREATE TABLE" messages
```

#### 2.3 Verify Tables Created

```bash
# Connect to database
psql -U postgres -d sports_db

# List all tables
\dt

# You should see these tables:
# - associations
# - audit_logs
# - auth_tokens
# - background_jobs
# - clubs
# - competitions
# - fixture_updates
# - fixtures
# - news
# - players
# - refresh_tokens
# - result_history
# - results
# - seasons
# - standings
# - standings_history
# - teams
# - team_competitions
# - users
# - venues

# Exit psql
\q
```

#### 2.4 Test Database Connection

```bash
# Test connection
psql -U postgres -d sports_db -c "SELECT 1 as test;"

# Should return:
#  test
# -----
#     1
```

---

## 🔧 Step 3: Environment Configuration

The `.env` file should already be configured. Verify it has:

```bash
cat .env
```

**Expected content:**
```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sports_db
DB_USER=postgres
DB_PASSWORD=shahisrailcse

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_DAYS=7

CORS_ORIGIN=http://localhost:3001
LOG_LEVEL=debug
```

---

## 🚀 Step 4: Install Dependencies & Start Server

### 4.1 Install Dependencies

```bash
npm install
```

### 4.2 Create Logs Directory

```bash
mkdir -p logs
```

### 4.3 Start Development Server

```bash
npm run dev
```

**You should see:**
```
[2025-03-04 22:26:00] INFO: Server started on port 3000
[2025-03-04 22:26:00] INFO: Database connected successfully
```

---

## ✅ Step 5: Verify Installation

### 5.1 Health Check

Open a new terminal and run:

```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "2.0.0",
    "timestamp": "2025-03-04T22:26:00.000Z",
    "uptime": "0d 0h 2m",
    "environment": "development",
    "database": {
      "status": "healthy",
      "responseTime": "15ms"
    },
    "memory": {
      "used": "125MB",
      "total": "256MB",
      "rss": "180MB"
    }
  }
}
```

### 5.2 Access Swagger Documentation

Open your browser:
```
http://localhost:3000/api-docs
```

You should see the interactive API documentation with all endpoints.

---

## 🎯 Step 6: Your First API Call

### 6.1 Register a Super Admin User

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "email": "admin@246sports.com",
    "password": "Admin123!",
    "role": "SUPER_ADMIN"
  }'
```

**Using Swagger UI:**
1. Go to `http://localhost:3000/api-docs`
2. Find `POST /auth/register`
3. Click "Try it out"
4. Enter:
   ```json
   {
     "name": "Super Admin",
     "email": "admin@246sports.com",
     "password": "Admin123!",
     "role": "SUPER_ADMIN"
   }
   ```
5. Click "Execute"

**Expected response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid...",
      "name": "Super Admin",
      "email": "admin@246sports.com",
      "role": "SUPER_ADMIN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "uuid...",
    "tokenType": "Bearer",
    "expiresIn": "15m"
  }
}
```

**🔐 Save these tokens!** You'll need them for authenticated requests.

### 6.2 Login with Refresh Tokens (V2)

```bash
curl -X POST http://localhost:3000/api/v1/auth/login-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@246sports.com",
    "password": "Admin123!"
  }'
```

### 6.3 Create Your First Association

```bash
# Replace YOUR_ACCESS_TOKEN with the token from registration
curl -X POST http://localhost:3000/api/v1/associations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Barbados Football Association",
    "description": "National governing body for football",
    "sport": "Football",
    "country": "Barbados",
    "contact_email": "info@football.bb",
    "contact_phone": "+1-246-555-0123"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Association created successfully",
  "data": {
    "id": "uuid...",
    "name": "Barbados Football Association",
    "description": "National governing body for football",
    "sport": "Football",
    "country": "Barbados",
    ...
  }
}
```

---

## 🧪 Step 7: Test the Full Workflow

### Complete Workflow Script

Save this as `test-api.sh` and run it:

```bash
#!/bin/bash

# Configuration
API_URL="http://localhost:3000/api/v1"
EMAIL="test-admin@246sports.com"
PASSWORD="Test123!"

echo "🚀 Testing 246Sports API..."
echo ""

# 1. Register user
echo "1️⃣ Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Admin\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"role\": \"SUPER_ADMIN\"
  }")

echo "$REGISTER_RESPONSE" | jq .

# Extract tokens
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.accessToken')
REFRESH_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.refreshToken')

echo ""
echo "✅ User registered!"
echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo ""

# 2. Get associations
echo "2️⃣ Fetching associations..."
curl -s $API_URL/associations | jq .
echo ""

# 3. Create association
echo "3️⃣ Creating association..."
ASSOCIATION_RESPONSE=$(curl -s -X POST $API_URL/associations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "name": "Barbados Cricket Association",
    "description": "Test association",
    "sport": "Cricket",
    "country": "Barbados"
  }')

ASSOCIATION_ID=$(echo $ASSOCIATION_RESPONSE | jq -r '.data.id')
echo "$ASSOCIATION_RESPONSE" | jq .
echo ""

# 4. Search
echo "4️⃣ Testing search..."
curl -s "$API_URL/search?q=barbados" | jq .
echo ""

# 5. Health check
echo "5️⃣ Health check..."
curl -s http://localhost:3000/health | jq .
echo ""

echo "✅ All tests completed!"
```

**Run the test:**
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 📚 Next Steps

### Learn the API

- 📖 **Read the full README**: [README.md](README.md)
- 🧪 **Testing Guide**: [TESTING_GUIDE.md](TESTING_GUIDE.md)
- 🚀 **Improvements**: [IMPROVEMENTS_SUMMARY.md](IMPROVEMENTS_SUMMARY.md)

### Key Features to Test

1. **Authentication V2**
   - Login with refresh tokens
   - Token refresh flow
   - Logout (revoke token)
   - Revoke all tokens

2. **Multi-Tenant Isolation**
   - Create associations
   - Create clubs within associations
   - Test cross-tenant access prevention

3. **Search Functionality**
   - Global search across all entities
   - Entity-specific search
   - Type filtering

4. **Results & Standings**
   - Create competitions
   - Create fixtures
   - Submit results
   - Publish results (triggers standings calculation)

5. **News Module**
   - Create news articles
   - Test SEO-friendly slugs
   - Test publishing workflow

---

## 🔧 Troubleshooting

### Database Connection Error

**Error**: `password authentication failed for user "postgres"`

**Solution**:
```bash
# Reset PostgreSQL password
psql -U postgres -c "ALTER USER postgres PASSWORD 'shahisrailcse';"
```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port in .env
PORT=3001 npm run dev
```

### Tables Don't Exist

**Error**: `relation "users" does not exist`

**Solution**:
```bash
# Run the schema migration
psql -U postgres -d sports_db -f database/schema_v2.sql

# Verify tables created
psql -U postgres -d sports_db -c "\dt"
```

### Build Errors

**Error**: TypeScript compilation errors

**Solution**:
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

---

## 🎓 Understanding the Architecture

### API Versioning

All endpoints are under `/api/v1/` for backwards compatibility:
```
http://localhost:3000/api/v1/associations
http://localhost:3000/api/v1/auth/login-v2
```

### Authentication Flow

```
1. Register/Login → Get Access Token (15min) + Refresh Token (7 days)
2. Use Access Token for API requests
3. When Access Token expires (15min):
   → Use Refresh Token to get new Access Token
4. Logout → Refresh Token is revoked
```

### Multi-Tenant Architecture

```
Super Admin (Full Access)
├── Association A (Isolated)
│   ├── Clubs
│   └── Teams
├── Association B (Isolated)
│   ├── Clubs
│   └── Teams
```

---

## 📝 Common Tasks

### Reset the Database

```bash
# Drop and recreate database
dropdb -U postgres sports_db
createdb -U postgres sports_db
psql -U postgres -d sports_db -f database/schema_v2.sql
```

### View Logs

```bash
# Follow all logs
tail -f logs/combined.log

# View only errors
tail -f logs/error.log
```

### Refresh Search Index

```bash
psql -U postgres -d sports_db -c "REFRESH MATERIALIZED VIEW CONCURRENTLY search_index;"
```

---

## 🆘 Need Help?

- **Issues**: Check logs in `logs/` directory
- **API Docs**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

---

<div align="center">

**✅ You're all set! Start building your sports platform.**

For detailed documentation, see [README.md](README.md)

</div>
