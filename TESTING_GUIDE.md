# 246Sports Testing Guide

<div align="center">

**Comprehensive Testing Guide for v2.0 Enterprise Edition**

[Manual Testing](#manual-testing) • [Security Testing](#security-testing) • [Performance Testing](#performance-testing) • [Integration Testing](#integration-testing)

</div>

---

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Test Data Setup](#test-data-setup)
- [Manual Testing](#manual-testing)
  - [Authentication Testing](#authentication-testing)
  - [CRUD Operations Testing](#crud-operations-testing)
  - [Search Functionality Testing](#search-functionality-testing)
  - [Results & Standings Testing](#results--standings-testing)
- [Security Testing](#security-testing)
- [Performance Testing](#performance-testing)
- [Integration Testing](#integration-testing)
- [Troubleshooting](#troubleshooting)
- [Test Checklist](#test-checklist)

---

## Introduction

This testing guide provides comprehensive instructions for testing all features of the 246Sports Backend API v2.0 Enterprise Edition. It includes manual testing procedures, security testing, performance testing, and integration testing workflows.

**Testing Scope**:
- All CRUD operations
- Authentication & authorization (V2 with refresh tokens)
- Full-text search functionality
- Rate limiting
- Tenant isolation
- Results workflow and standings calculation
- News module
- Security vulnerabilities
- Performance benchmarks

---

## Prerequisites

### Before Testing

1. **Server Running**: Ensure the development server is running
   ```bash
   npm run dev
   ```

2. **Database Setup**: Database schema v2.0 must be applied
   ```bash
   npm run db:migrate:v2
   ```

3. **Environment Configured**: `.env` file properly configured

4. **Tools Required**:
   - **cURL** (pre-installed on most systems)
   - **Postman** (optional, for GUI testing)
   - **k6** (for load testing)

### Verify Server Status

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "2.0.0",
    "database": {
      "status": "healthy"
    }
  }
}
```

---

## Test Data Setup

### Quick Test Data Setup Script

You can use the following SQL script to populate test data:

```sql
-- Insert test association
INSERT INTO associations (id, name, description, sport, country)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Barbados Football Association',
  'National governing body for football in Barbados',
  'Football',
  'Barbados'
);

-- Insert test season
INSERT INTO seasons (id, association_id, name, start_date, end_date)
VALUES (
  '650e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440001',
  '2025 Season',
  '2025-01-01',
  '2025-12-31'
);

-- Insert test competition
INSERT INTO competitions (id, association_id, season_id, name, sport, category)
VALUES (
  '750e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440001',
  '650e8400-e29b-41d4-a716-446655440001',
  'Premier League',
  'Football',
  'LEAGUE'
);
```

---

## Manual Testing

### Authentication Testing

#### 1. Register New User (V2 with Refresh Tokens)

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "email": "admin@246sports.com",
    "password": "SecurePass123!",
    "role": "SUPER_ADMIN"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Super Admin",
      "email": "admin@246sports.com",
      "role": "SUPER_ADMIN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "uuid-v4-token",
    "tokenType": "Bearer",
    "expiresIn": "15m"
  }
}
```

**Save these tokens** for subsequent tests:
- `ACCESS_TOKEN` = the accessToken value
- `REFRESH_TOKEN` = the refreshToken value

#### 2. Login V2 (Refresh Token Flow)

```bash
curl -X POST http://localhost:3000/api/v1/auth/login-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@246sports.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response**: Same as registration (returns both tokens)

#### 3. Refresh Access Token

After 15 minutes (or force test by modifying token expiration), use the refresh token:

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token",
    "tokenType": "Bearer",
    "expiresIn": "15m"
  }
}
```

**Note**: Old refresh token should be revoked (rotation).

#### 4. Logout (Revoke Refresh Token)

```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### 5. Revoke All Tokens

```bash
curl -X POST http://localhost:3000/api/v1/auth/revoke-all \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "password": "SecurePass123!"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "All tokens revoked successfully"
}
```

#### 6. Test Invalid Refresh Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "invalid-token-uuid"
  }'
```

**Expected Response**:
```json
{
  "success": false,
  "message": "Invalid or expired refresh token",
  "error": "INVALID_REFRESH_TOKEN"
}
```

---

### CRUD Operations Testing

#### Associations CRUD

**Create Association**:
```bash
curl -X POST http://localhost:3000/api/v1/associations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Barbados Cricket Association",
    "description": "Governing body for cricket",
    "sport": "Cricket",
    "country": "Barbados",
    "contact_email": "info@cricket.bb",
    "contact_phone": "+1-246-555-0123"
  }'
```

**Get All Associations**:
```bash
curl http://localhost:3000/api/v1/associations
```

**Get Single Association**:
```bash
curl http://localhost:3000/api/v1/associations/ASSOCIATION_ID
```

**Update Association**:
```bash
curl -X PUT http://localhost:3000/api/v1/associations/ASSOCIATION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Barbados Cricket Association (Updated)",
    "description": "Updated description"
  }'
```

**Delete Association (Soft Delete)**:
```bash
curl -X DELETE http://localhost:3000/api/v1/associations/ASSOCIATION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Competitions CRUD

**Create Competition**:
```bash
curl -X POST http://localhost:3000/api/v1/competitions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "association_id": "ASSOCIATION_ID",
    "season_id": "SEASON_ID",
    "name": "Premier Division 2025",
    "sport": "Football",
    "category": "LEAGUE",
    "points_win": 3,
    "points_draw": 1,
    "points_loss": 0
  }'
```

#### Clubs & Teams CRUD

**Create Club**:
```bash
curl -X POST http://localhost:3000/api/v1/clubs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "association_id": "ASSOCIATION_ID",
    "name": "Barbados Dynasty FC",
    "founded_year": 2020,
    "contact_email": "info@dynasty.bb"
  }'
```

**Create Team**:
```bash
curl -X POST http://localhost:3000/api/v1/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "club_id": "CLUB_ID",
    "name": "Senior Team",
    "category": "SENIOR"
  }'
```

#### Fixtures CRUD

**Create Fixture**:
```bash
curl -X POST http://localhost:3000/api/v1/fixtures \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "competition_id": "COMPETITION_ID",
    "home_team_id": "HOME_TEAM_ID",
    "away_team_id": "AWAY_TEAM_ID",
    "venue_id": "VENUE_ID",
    "date_time": "2025-03-15T15:00:00Z",
    "round": "1"
  }'
```

**Get Today's Fixtures**:
```bash
curl http://localhost:3000/api/v1/fixtures/today
```

**Download ICS Calendar**:
```bash
curl -O http://localhost:3000/api/v1/fixtures/FIXTURE_ID/ics
```

#### Players CRUD

**Create Player**:
```bash
curl -X POST http://localhost:3000/api/v1/players \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "team_id": "TEAM_ID",
    "name": "John Smith",
    "jersey_number": 10,
    "position": "Midfielder",
    "date_of_birth": "1995-05-15"
  }'
```

#### Venues CRUD

**Create Venue**:
```bash
curl -X POST http://localhost:3000/api/v1/venues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Barbados National Stadium",
    "address": "Saint Michael, Barbados",
    "capacity": 5000,
    "latitude": 13.0975,
    "longitude": -59.6167
  }'
```

---

### Search Functionality Testing

#### Global Search

**Basic Search**:
```bash
curl "http://localhost:3000/api/v1/search?q=barbados"
```

**Search with Type Filter**:
```bash
curl "http://localhost:3000/api/v1/search?q=football&types=ASSOCIATION,CLUB"
```

**Paginated Search**:
```bash
curl "http://localhost:3000/api/v1/search?q=premier&page=1&limit=10"
```

**Expected Response Format**:
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": [
    {
      "entity_type": "ASSOCIATION",
      "entity_id": "uuid",
      "title": "Barbados Football Association",
      "content": "National governing body...",
      "tenant_id": "association-uuid",
      "url_path": "/associations/uuid",
      "relevance": 0.95
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

#### Entity-Specific Search

**Search Associations**:
```bash
curl "http://localhost:3000/api/v1/search/associations?q=football"
```

**Search Clubs**:
```bash
curl "http://localhost:3000/api/v1/search/clubs?q=dynasty&association_id=ASSOCIATION_ID"
```

**Search Teams**:
```bash
curl "http://localhost:3000/api/v1/search/teams?q=senior"
```

**Search Venues**:
```bash
curl "http://localhost:3000/api/v1/search/venues?q=stadium"
```

---

### Results & Standings Testing

#### Submit Result

```bash
curl -X POST http://localhost:3000/api/v1/results \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "fixture_id": "FIXTURE_ID",
    "home_score": 2,
    "away_score": 1
  }'
```

**Expected Status**: SUBMITTED

#### Confirm Result

```bash
curl -X PUT http://localhost:3000/api/v1/results/RESULT_ID/confirm \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Status**: CONFIRMED

#### Publish Result (Triggers Standings Calculation)

```bash
curl -X PUT http://localhost:3000/api/v1/results/RESULT_ID/publish \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected**:
- Result status changes to PUBLISHED
- Standings are automatically recalculated
- Fixture status changes to FINISHED

#### Get Standings

```bash
curl http://localhost:3000/api/v1/standings/competition/COMPETITION_ID
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Standings retrieved successfully",
  "data": [
    {
      "position": 1,
      "team_id": "uuid",
      "team_name": "Barbados Dynasty FC",
      "played": 10,
      "won": 7,
      "drawn": 2,
      "lost": 1,
      "goals_for": 20,
      "goals_against": 8,
      "goal_difference": 12,
      "points": 23
    }
  ]
}
```

#### Manual Standings Recalculation

```bash
curl -X POST http://localhost:3000/api/v1/standings/recalculate/COMPETITION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### News Module Testing

#### Create News Article

```bash
curl -X POST http://localhost:3000/api/v1/news \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Barbados Premier League Kicks Off",
    "content": "The 2025 season begins with exciting matches...",
    "association_id": "ASSOCIATION_ID",
    "status": "PUBLISHED"
  }'
```

**Expected**: Slug is auto-generated (e.g., `barbados-premier-league-kicks-off`)

#### Get All News

```bash
curl http://localhost:3000/api/v1/news
```

#### Get News by Slug

```bash
curl http://localhost:3000/api/v1/news/barbados-premier-league-kicks-off
```

#### Update News

```bash
curl -X PUT http://localhost:3000/api/v1/news/NEWS_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content...",
    "status": "PUBLISHED"
  }'
```

#### Delete News

```bash
curl -X DELETE http://localhost:3000/api/v1/news/NEWS_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Security Testing

### 1. Authentication Security Tests

#### Test Rate Limiting on Auth Endpoint

```bash
# Run this 6 times (should be blocked on 6th attempt)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"wrong@email.com","password":"wrongpass"}'
  echo "Attempt $i"
done
```

**Expected**: 6th attempt should return:
```json
{
  "success": false,
  "message": "Too many login attempts, please try again later.",
  "error": "AUTH_RATE_LIMIT_EXCEEDED"
}
```

#### Test SQL Injection

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@246sports.com\' OR \'1\'=\'1","password":"password"}'
```

**Expected**: Should fail with "Invalid credentials"

#### Test XSS in Input Fields

```bash
curl -X POST http://localhost:3000/api/v1/associations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "<script>alert(\"XSS\")</script>",
    "description": "Test XSS"
  }'
```

**Expected**: Input should be sanitized or rejected

### 2. Authorization Tests

#### Test Unauthorized Access

```bash
# Try to access protected endpoint without token
curl http://localhost:3000/api/v1/associations
```

**Expected**:
```json
{
  "success": false,
  "message": "Authentication required",
  "error": "UNAUTHORIZED"
}
```

#### Test Invalid Token

```bash
curl http://localhost:3000/api/v1/associations \
  -H "Authorization: Bearer invalid-token"
```

**Expected**:
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "error": "INVALID_TOKEN"
}
```

#### Test Cross-Tenant Access Prevention

**Setup**: Create two association admins with different `association_id`

**Test**: Try to access other association's data
```bash
# Association A admin trying to access Association B data
curl -X PUT http://localhost:3000/api/v1/associations/ASSOCIATION_B_ID \
  -H "Authorization: Bearer ASSOC_A_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Hacked Name"}'
```

**Expected**: Should fail with 403 Forbidden

### 3. Input Validation Tests

#### Test Invalid Email

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "password123",
    "role": "SUPER_ADMIN"
  }'
```

**Expected**:
```json
{
  "success": false,
  "message": "Invalid email address",
  "error": "VALIDATION_ERROR"
}
```

#### Test Weak Password

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123",
    "role": "SUPER_ADMIN"
  }'
```

**Expected**: Password should be rejected (min 8 characters)

#### Test Invalid UUID

```bash
curl http://localhost:3000/api/v1/associations/not-a-uuid
```

**Expected**:
```json
{
  "success": false,
  "message": "Invalid UUID format",
  "error": "VALIDATION_ERROR"
}
```

### 4. API Abuse Tests

#### Test General Rate Limiting

```bash
# Make 101 requests quickly (should be limited at 100)
for i in {1..101}; do
  curl http://localhost:3000/api/v1/associations \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN" &
done
wait
```

**Expected**: Request 101 should return rate limit error

#### Test Search Rate Limiting

```bash
# Make 21 search requests in 1 minute (should be limited at 20)
for i in {1..21}; do
  curl "http://localhost:3000/api/v1/search?q=test"
  echo "Search $i"
done
```

**Expected**: Request 21 should return:
```json
{
  "success": false,
  "message": "Too many search requests, please slow down.",
  "error": "SEARCH_RATE_LIMIT_EXCEEDED"
}
```

---

## Performance Testing

### Load Testing with k6

#### Install k6

```bash
# macOS
brew install k6

# Linux
sudo apt-get install k6

# Or download from https://k6.io/
```

#### Test Script: `load-test.js`

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp up to 20 users
    { duration: '1m', target: 20 },    // Stay at 20 users
    { duration: '20s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.01'],    // Error rate < 1%
  },
};

const BASE_URL = 'http://localhost:3000/api/v1';

export default function () {
  // Health check
  let healthRes = http.get(`${BASE_URL.replace('/api/v1', '')}/health`);
  check(healthRes, {
    'health check status 200': (r) => r.status === 200,
  });

  // Search endpoint
  let searchRes = http.get(`${BASE_URL}/search?q=barbados`);
  check(searchRes, {
    'search status 200': (r) => r.status === 200,
    'search response time < 500ms': (r) => r.timings.duration < 500,
  });

  // Get associations
  let assocRes = http.get(`${BASE_URL}/associations`);
  check(assocRes, {
    'associations status 200': (r) => r.status === 200,
  });

  sleep(1);
}
```

#### Run Load Test

```bash
k6 run load-test.js
```

**Expected Results**:
- All requests should return 200 status
- 95th percentile response time < 2000ms
- Error rate < 1%

### Database Query Performance Test

```bash
# Enable query logging in PostgreSQL
# Edit postgresql.conf: log_min_duration_statement = 100

# Run test queries and check logs
psql -U postgres -d sports246 -c "
  EXPLAIN ANALYZE
  SELECT * FROM fixtures
  WHERE date_time >= CURRENT_DATE
  ORDER BY date_time;
"
```

**Expected**: Query execution time < 100ms

---

## Integration Testing

### Complete Workflow Test

#### Test Scenario: Full League Management Workflow

**Step 1: Create Association**
```bash
ASSOC_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/associations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Barbados Hockey Association",
    "sport": "Hockey",
    "country": "Barbados"
  }')

ASSOC_ID=$(echo $ASSOC_RESPONSE | jq -r '.data.id')
echo "Created Association: $ASSOC_ID"
```

**Step 2: Create Season**
```bash
SEASON_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/seasons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"association_id\": \"$ASSOC_ID\",
    \"name\": \"2025 Season\",
    \"start_date\": \"2025-01-01\",
    \"end_date\": \"2025-12-31\"
  }")

SEASON_ID=$(echo $SEASON_RESPONSE | jq -r '.data.id')
echo "Created Season: $SEASON_ID"
```

**Step 3: Create Competition**
```bash
COMP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/competitions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"association_id\": \"$ASSOC_ID\",
    \"season_id\": \"$SEASON_ID\",
    \"name\": \"Premier Division\",
    \"sport\": \"Hockey\",
    \"category\": \"LEAGUE\"
  }")

COMP_ID=$(echo $COMP_RESPONSE | jq -r '.data.id')
echo "Created Competition: $COMP_ID"
```

**Step 4: Create Clubs**
```bash
# Create 2 clubs
CLUB1_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/clubs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"association_id\": \"$ASSOC_ID\",
    \"name\": \"Dynasty HC\"
  }")

CLUB1_ID=$(echo $CLUB1_RESPONSE | jq -r '.data.id')
echo "Created Club 1: $CLUB1_ID"

CLUB2_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/clubs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"association_id\": \"$ASSOC_ID\",
    \"name\": \"Warriors HC\"
  }")

CLUB2_ID=$(echo $CLUB2_RESPONSE | jq -r '.data.id')
echo "Created Club 2: $CLUB2_ID"
```

**Step 5: Create Teams**
```bash
TEAM1_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"club_id\": \"$CLUB1_ID\",
    \"name\": \"Senior Team\"
  }")

TEAM1_ID=$(echo $TEAM1_RESPONSE | jq -r '.data.id')
echo "Created Team 1: $TEAM1_ID"

TEAM2_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"club_id\": \"$CLUB2_ID\",
    \"name\": \"Senior Team\"
  }")

TEAM2_ID=$(echo $TEAM2_RESPONSE | jq -r '.data.id')
echo "Created Team 2: $TEAM2_ID"
```

**Step 6: Create Venue**
```bash
VENUE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/venues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "National Hockey Stadium",
    "address": "Bridgetown, Barbados",
    "capacity": 3000
  }')

VENUE_ID=$(echo $VENUE_RESPONSE | jq -r '.data.id')
echo "Created Venue: $VENUE_ID"
```

**Step 7: Create Fixture**
```bash
FIXTURE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/fixtures \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"competition_id\": \"$COMP_ID\",
    \"home_team_id\": \"$TEAM1_ID\",
    \"away_team_id\": \"$TEAM2_ID\",
    \"venue_id\": \"$VENUE_ID\",
    \"date_time\": \"2025-03-20T15:00:00Z\"
  }")

FIXTURE_ID=$(echo $FIXTURE_RESPONSE | jq -r '.data.id')
echo "Created Fixture: $FIXTURE_ID"
```

**Step 8: Submit Result**
```bash
RESULT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/results \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"fixture_id\": \"$FIXTURE_ID\",
    \"home_score\": 3,
    \"away_score\": 1
  }")

RESULT_ID=$(echo $RESULT_RESPONSE | jq -r '.data.id')
echo "Submitted Result: $RESULT_ID (Status: SUBMITTED)"
```

**Step 9: Confirm Result**
```bash
curl -s -X PUT http://localhost:3000/api/v1/results/$RESULT_ID/confirm \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

echo "Result confirmed (Status: CONFIRMED)"
```

**Step 10: Publish Result (Triggers Standings)**
```bash
curl -s -X PUT http://localhost:3000/api/v1/results/$RESULT_ID/publish \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

echo "Result published (Status: PUBLISHED)"
```

**Step 11: Check Standings**
```bash
curl -s http://localhost:3000/api/v1/standings/competition/$COMP_ID | jq .
```

**Expected**: Standings should show:
- Dynasty HC: 1 match, 1 win, 3 points
- Warriors HC: 1 match, 1 loss, 0 points

**Step 12: Search Test**
```bash
curl -s "http://localhost:3000/api/v1/search?q=dynasty" | jq .
```

**Expected**: Should find the club "Dynasty HC"

**Step 13: Create News Article**
```bash
NEWS_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/news \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"title\": \"Dynasty HC Wins Premier League Opener\",
    \"content\": \"Dynasty HC defeated Warriors HC 3-1 in the opening match...\",
    \"association_id\": \"$ASSOC_ID\",
    \"status\": \"PUBLISHED\"
  }")

echo "Created News Article"
```

**Step 14: Cleanup (Optional)**
```bash
# Delete test data
curl -X DELETE http://localhost:3000/api/v1/associations/$ASSOC_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"

echo "Cleanup complete"
```

---

## Troubleshooting

### Common Testing Issues

#### Issue 1: Connection Refused

**Error**: `curl: (7) Failed to connect to localhost port 3000`

**Solution**:
```bash
# Check if server is running
lsof -i :3000

# If not, start server
npm run dev
```

#### Issue 2: Invalid Token

**Error**: `401 Unauthorized`

**Solution**:
```bash
# Token expires after 15 minutes. Get a new one:
curl -X POST http://localhost:3000/api/v1/auth/login-v2 \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@246sports.com","password":"SecurePass123!"}'
```

#### Issue 3: Rate Limiting During Tests

**Error**: `429 Too Many Requests`

**Solution**:
- Wait for the rate limit window to expire
- Or restart the server (clears in-memory rate limit counters)

#### Issue 4: Database Errors

**Error**: `Database connection failed`

**Solution**:
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -U postgres -d sports246 -c "SELECT 1"

# Check database exists
psql -U postgres -l | grep sports246
```

#### Issue 5: Search Not Working

**Error**: Search returns no results

**Solution**:
```bash
# Refresh search index
npm run db:refresh-search

# Or manually in psql
psql -U postgres -d sports246 -c "REFRESH MATERIALIZED VIEW CONCURRENTLY search_index;"
```

---

## Test Checklist

Use this checklist to ensure all features are tested:

### Authentication
- [ ] User registration returns access + refresh tokens
- [ ] Login v2 returns both tokens
- [ ] Refresh token rotation works correctly
- [ ] Old refresh token is revoked after rotation
- [ ] Logout revokes refresh token
- [ ] Revoke-all tokens works
- [ ] Invalid tokens are rejected
- [ ] Expired tokens are rejected
- [ ] Rate limiting works on auth endpoints

### CRUD Operations
- [ ] Create associations, competitions, clubs, teams
- [ ] Read operations work with proper filtering
- [ ] Update operations work
- [ ] Delete operations work (soft delete)
- [ ] Pagination works correctly
- [ ] Filtering works correctly
- [ ] UUID validation works

### Search
- [ ] Global search returns relevant results
- [ ] Entity-specific search works
- [ ] Type filtering works
- [ ] Pagination works in search
- [ ] Relevance ranking is correct
- [ ] Search handles empty results
- [ ] Search handles special characters

### Results & Standings
- [ ] Result submission works (SUBMITTED)
- [ ] Result confirmation works (CONFIRMED)
- [ ] Result publication works (PUBLISHED)
- [ ] Publishing triggers standings calculation
- [ ] Standings calculation is accurate
- [ ] Manual standings recalculation works
- [ ] Standings sorting is correct (points → GD → GF)

### News Module
- [ ] Create news with auto-generated slug
- [ ] Slug uniqueness is enforced
- [ ] News states work (DRAFT, PUBLISHED, ARCHIVED)
- [ ] Get news by slug works
- [ ] Update news works
- [ ] Delete news works

### Security
- [ ] Unauthorized access is blocked
- [ ] Invalid tokens are rejected
- [ ] Cross-tenant access is prevented
- [ ] SQL injection attempts fail
- [ ] XSS attempts are sanitized
- [ ] Rate limiting works (auth, search, general)
- [ ] Input validation works

### Performance
- [ ] Health check responds < 100ms
- [ ] Search responds < 500ms
- [ ] CRUD operations respond < 1s
- [ ] Standings calculation < 2s
- [ ] Database queries are optimized
- [ ] Rate limiting doesn't affect legitimate users

### Logging
- [ ] HTTP requests are logged
- [ ] Errors are logged to error.log
- [ ] Audit logs are created for CUD operations
- [ ] Logs are rotated properly
- [ ] Log files are created

---

## Additional Resources

- **API Documentation**: http://localhost:3000/api-docs
- **README**: [README.md](README.md)
- **Improvements Summary**: [IMPROVEMENTS_SUMMARY.md](IMPROVEMENTS_SUMMARY.md)

---

## Test Reports

### Test Execution Summary Template

```
Date: YYYY-MM-DD
Tester: [Your Name]
Environment: Development/Staging/Production
Version: 2.0.0

Tests Executed: XX
Passed: XX
Failed: XX
Skipped: XX

Critical Issues:
- [List any critical failures]

Non-Critical Issues:
- [List any minor failures]

Performance Notes:
- [Average response times]
- [Any performance concerns]

Recommendations:
- [Any improvements or concerns]
```

---

<div align="center">

**Happy Testing!**

For questions or issues, refer to the main README or contact support.

</div>
