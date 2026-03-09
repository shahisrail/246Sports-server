# 246Sports Ecosystem Guide

<div align="center">

**Complete Guide to the 246Sports Platform Architecture**

[Overview](#overview) • [Architecture](#architecture) • [Data Flow](#data-flow) • [Key Features](#key-features) • [API Usage](#api-usage)

</div>

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Core Components](#core-components)
- [How It Works](#how-it-works)
- [Data Flow Diagrams](#data-flow-diagrams)
- [Key Features Explained](#key-features-explained)
- [Authentication System](#authentication-system)
- [Multi-Tenant Isolation](#multi-tenant-isolation)
- [Results & Standings System](#results--standings-system)
- [Search System](#search-system)
- [Security Features](#security-features)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)

---

## Overview

246Sports is a **multi-tenant sports management platform** designed for national sports associations. It provides a complete backend ecosystem for managing:

- 🏛️ **Associations** - National governing bodies
- 🏟️ **Clubs** - Member organizations
- ⚽ **Teams** - Sports teams within clubs
- 🏆 **Competitions** - Leagues, cups, tournaments
- 📅 **Fixtures** - Scheduled matches
- 📊 **Results** - Match results with validation workflow
- 📈 **Standings** - Automatically calculated league tables
- 👥 **Players** - Athlete management
- 🏟️ **Venues** - Location management
- 📰 **News** - Content management
- 🔍 **Search** - Full-text global search

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  (Web Apps, Mobile Apps, Third-Party Integrations)          │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                             │
│  • Express.js 5.2 Application                               │
│  • Rate Limiting (Multi-tier)                               │
│  • CORS Management                                          │
│  • Request Logging (Winston)                                │
│  • Security Headers (Helmet.js)                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   MIDDLEWARE LAYER                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 1. Tenant Context Setup                             │    │
│  │    - Injects association_id/club_id from user token │    │
│  │                                                      │    │
│  │ 2. JWT Authentication                                │    │
│  │    - Validates access tokens (15min expiry)         │    │
│  │    - Extracts user info (role, permissions)          │    │
│  │                                                      │    │
│  │ 3. RBAC Authorization                                 │    │
│  │    - SUPER_ADMIN (full access)                       │    │
│  │    - ASSOCIATION_ADMIN (association scope)          │    │
│  │    - CLUB_ADMIN (club scope)                         │    │
│  │    - TEAM_MANAGER (team scope)                       │    │
│  │                                                      │    │
│  │ 4. Request Validation                                 │    │
│  │    - UUID validation                                  │    │
│  │    - Email/password validation                        │    │
│  │    - SQL injection prevention                         │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │  Search  │  │   News   │  │ Results  │   │
│  │ V2 Token │  │Full-Text │  │  (CRUD)  │  │ Workflow │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Standings │  │Fixtures  │  │  Teams   │  │  Clubs   │   │
│  │Auto-Calc │  │ Calendar │  │ (M:N)    │  │ (Tenant) │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL Queries
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    POSTGRESQL DATABASE                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Multi-Tenant Schema                                 │    │
│  │ • associations (tenants)                            │    │
│  │ • clubs (tenant children)                           │    │
│  │ • teams (club children)                             │    │
│  │ • competitions (tenant children)                    │    │
│  │                                                     │    │
│  │ Performance Optimizations                            │    │
│  │ • GIN indexes (full-text search)                    │    │
│  │ • Composite indexes (common queries)                │    │
│  │ • Materialized views (search index)                 │    │
│  │ • Connection pooling (max 20)                       │    │
│  │                                                     │    │
│  │ Data Integrity                                      │    │
│  │ • Partial unique indexes (soft delete)              │    │
│  │ • Foreign key constraints                           │    │
│  │ • Advisory locks (standings calculation)            │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Authentication System (V2)

#### Token Architecture
```
┌─────────────────────────────────────────────────────────┐
│              AUTHENTICATION FLOW                         │
└─────────────────────────────────────────────────────────┘

1. REGISTER / LOGIN-V2
   ↓
   Returns: Access Token (15min) + Refresh Token (7days)

2. API REQUESTS (0-15 min)
   ↓
   Use: Access Token in Authorization header

3. ACCESS TOKEN EXPIRED (after 15min)
   ↓
   Use: Refresh Token to get new Access Token

4. LOGOUT / REVOKE-ALL
   ↓
   Refresh Token is revoked
```

#### Why This Architecture?

**Security**:
- **Short-lived Access Tokens** (15 min) - If stolen, minimal damage
- **Long-lived Refresh Tokens** (7 days) - Better UX, don't login frequently
- **Token Rotation** - Old refresh token invalidated when used
- **Revocation** - Can logout from all devices

**User Experience**:
- Seamless token refresh without re-authentication
- Session persistence across browser restarts
- Multi-device support with independent refresh tokens

#### Database Tables
```sql
users (id, email, password_hash, role, association_id, club_id)
refresh_tokens (id, user_id, token, expires_at, revoked_at, device_info)
```

---

### 2. Multi-Tenant Isolation System

#### Tenant Hierarchy

```
SUPER_ADMIN
├── Can access ALL data across all associations
├── Can manage users
└── Full system control

ASSOCIATION_ADMIN (Barbados Football Association)
├── Can ONLY access their association's data
├── Can manage competitions, fixtures, results
├── Can create clubs
└── Isolated from other associations

ASSOCIATION_ADMIN (Barbados Cricket Association)
├── Can ONLY access their association's data
├── Completely isolated from Football Association
└── Cannot see Football Association data

CLUB_ADMIN (Dynasty FC)
├── Can ONLY manage their club
├── Can manage teams and players
└── Cannot access other clubs

TEAM_MANAGER
├── Can ONLY manage assigned team
└── Read-only access to fixtures
```

#### How It Works

**Middleware Automatic Filtering**:
```typescript
// User logs in → JWT contains association_id
// Request: GET /api/v1/associations
// Middleware automatically adds: WHERE association_id = 'user-association-id'
```

**Cross-Tenant Access Prevention**:
```typescript
// Association A admin tries to access Association B data
// Request: PUT /api/v1/associations/association-b-id
// Response: 403 Forbidden - "Access denied to this association"
```

---

### 3. Results & Standings System

#### Three-Step Results Workflow

```
┌────────────────────────────────────────────────────────┐
│            RESULTS WORKFLOW                             │
└────────────────────────────────────────────────────────┘

STEP 1: SUBMIT (Anyone authorized)
├─ Home team captain submits result
├─ Status: SUBMITTED
└─ No standings update yet

STEP 2: CONFIRM (Competition Manager)
├─ Validates scores are reasonable
├─ Status: CONFIRMED
└─ No standings update yet

STEP 3: PUBLISH (Association Admin)
├─ Final approval
├─ Status: PUBLISHED
├─ Triggers: Automatic Standings Calculation
└─ Updates: Fixture status → FINISHED
```

#### Automatic Standings Calculation

```sql
-- When result is PUBLISHED:
CREATE TRIGGER update_standings
AFTER INSERT ON results
WHEN (NEW.status = 'PUBLISHED')
EXECUTE FUNCTION recalculate_standings();

-- Recalculation Logic:
DELETE FROM standings WHERE competition_id = NEW.competition_id;

INSERT INTO standings (competition_id, team_id, points, played, won, drawn, lost, goals_for, goals_against)
SELECT
    competition_id,
    team_id,
    SUM(
        CASE
            WHEN home_score > away_score THEN points_win
            WHEN home_score = away_score THEN points_draw
            ELSE points_loss
        END
    ) as points,
    COUNT(*) as played,
    SUM(home_score > away_score) as won,
    SUM(home_score = away_score) as drawn,
    SUM(home_score < away_score) as lost,
    SUM(home_score) as goals_for,
    SUM(away_score) as goals_against
FROM results
WHERE status = 'PUBLISHED'
GROUP BY competition_id, team_id;
```

#### Edge Cases Handled

**Result Versioning**:
- If a result needs to be corrected
- Old result is saved to `result_history`
- Changes are logged with user, timestamp, reason
- Standings recalculated safely

**Advisory Locking**:
- Prevents concurrent standings updates
- Ensures data consistency
- `pg_advisory_xact_lock()`

---

### 4. Search System

#### Full-Text Search Architecture

```
┌────────────────────────────────────────────────────────┐
│              SEARCH SYSTEM                              │
└────────────────────────────────────────────────────────┘

Materialized View: search_index
├─ Pre-joined data from all entities
├─ GIN indexes for fast full-text search
├─ Refreshed periodically (or manually)
└─ Sub-second response times

Search Query Flow:
1. User searches: "barbados football"
2. Query: SELECT * FROM search_index
   WHERE to_tsvector('english', title || ' ' || content)
   @@ plainto_tsquery('english', 'barbados football')
3. Results ranked by relevance (ts_rank)
4. Paginated response
```

#### Entity-Specific Search

```sql
-- Associations: Search name + description
SELECT * FROM associations
WHERE to_tsvector('english', name || ' ' || description)
@@ plainto_tsquery('english', 'barbados')
ORDER BY ts_rank(...) DESC;

-- Clubs: Search name with association filter
SELECT c.*, a.name as association_name
FROM clubs c
LEFT JOIN associations a ON c.association_id = a.id
WHERE to_tsvector('english', c.name) @@ plainto_tsquery('english', 'dynasty')
AND c.association_id = $1  -- Optional filter
```

---

## How It Works

### Complete User Journey

#### Scenario: Setting Up a New Football League

**Day 1: Setup**

```
1. Super Admin creates Association
   POST /api/v1/associations
   {
     "name": "Barbados Football Association",
     "sport": "Football",
     "country": "Barbados"
   }

2. Super Admin creates Season
   POST /api/v1/seasons
   {
     "association_id": "uuid",
     "name": "2025 Season",
     "start_date": "2025-01-01",
     "end_date": "2025-12-31"
   }

3. Super Admin creates Competition
   POST /api/v1/competitions
   {
     "association_id": "uuid",
     "season_id": "uuid",
     "name": "Premier Division",
     "points_win": 3,
     "points_draw": 1,
     "points_loss": 0
   }
```

**Day 2: Onboarding Clubs**

```
4. Association Admin creates Clubs
   POST /api/v1/clubs
   {
     "association_id": "uuid",
     "name": "Barbados Dynasty FC"
   }

5. Club Admin creates Teams
   POST /api/v1/teams
   {
     "club_id": "uuid",
     "name": "Senior Team",
     "category": "SENIOR"
   }

6. Register Team for Competition
   POST /api/v1/team-competitions
   {
     "team_id": "uuid",
     "competition_id": "uuid"
   }
```

**Day 3: Scheduling Fixtures**

```
7. Create Venues
   POST /api/v1/venues
   {
     "name": "National Stadium",
     "capacity": 5000
   }

8. Schedule Fixtures
   POST /api/v1/fixtures
   {
     "competition_id": "uuid",
     "home_team_id": "uuid",
     "away_team_id": "uuid",
     "venue_id": "uuid",
     "date_time": "2025-03-15T15:00:00Z"
   }
```

**Day 4: Match Day**

```
9. Match played, submit result
   POST /api/v1/results
   {
     "fixture_id": "uuid",
     "home_score": 2,
     "away_score": 1
   }
   → Status: SUBMITTED

10. Competition Manager confirms
    PUT /api/v1/results/{id}/confirm
    → Status: CONFIRMED

11. Association Admin publishes
    PUT /api/v1/results/{id}/publish
    → Status: PUBLISHED
    → Triggers: Standings recalculation

12. Check standings
    GET /api/v1/standings/competition/{competitionId}
    → Returns: Updated league table
```

---

## Data Flow Diagrams

### Authentication Flow

```
┌─────────┐                ┌──────────────┐                ┌───────────┐
│ CLIENT  │                │  API SERVER  │                │ DATABASE  │
└────┬────┘                └──────┬───────┘                └─────┬─────┘
     │                            │                             │
     │  POST /auth/login-v2        │                             │
     │  {email, password}          │                             │
     ├───────────────────────────>│                             │
     │                            │ SELECT * FROM users          │
     │                            │ WHERE email = $1             │
     │                            ├────────────────────────────>│
     │                            │<────────────────────────────┤
     │                            │ user record                 │
     │                            │                             │
     │                            │ Verify password (bcrypt)     │
     │                            │                             │
     │                            │ INSERT INTO refresh_tokens  │
     │                            │ (token, expires_at)          │
     │                            ├────────────────────────────>│
     │                            │<────────────────────────────┤
     │                            │                             │
     │  {accessToken,              │                             │
     │   refreshToken}             │                             │
     │<───────────────────────────┤                             │
     │                            │                             │
     │  Store refreshToken securely                             │
     │                            │                             │
     │  Use accessToken for API   │                             │
     │  requests                  │                             │
```

### Results → Standings Flow

```
┌─────────┐                ┌──────────────┐                ┌───────────┐
│ CLIENT  │                │  API SERVER  │                │ DATABASE  │
└────┬────┘                └──────┬───────┘                └─────┬─────┘
     │                            │                             │
     │  PUT /results/{id}/publish  │                             │
     ├───────────────────────────>│                             │
     │                            │ UPDATE results              │
     │                            │ SET status = 'PUBLISHED'     │
     │                            ├────────────────────────────>│
     │                            │                             │
     │                            │ TRIGGER: recalculate_       │
     │                            │   competition_standings()   │
     │                            │                             │
     │                            │ DELETE FROM standings       │
     │                            │ WHERE competition_id = $1    │
     │                            │                             │
     │                            │ INSERT INTO standings       │
     │                            │ (calculate from published   │
     │                            │  results)                   │
     │                            │                             │
     │                            │<────────────────────────────┤
     │                            │ Standings updated            │
     │                            │                             │
     │  Result published,          │                             │
     │  standings updated          │                             │
     │<───────────────────────────┤                             │
```

---

## Key Features Explained

### 1. Soft Delete System

**Why**: Data recovery, audit trail

**How it Works**:
```sql
-- Instead of: DELETE FROM associations WHERE id = $1
-- We do:
UPDATE associations
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- All queries filter out deleted records:
SELECT * FROM associations WHERE deleted_at IS NULL;
```

**Challenge**: Soft deleted emails blocked reuse

**Solution**: Partial unique indexes
```sql
CREATE UNIQUE INDEX users_email_unique
ON users(email)
WHERE deleted_at IS NULL;  -- Only unique if not deleted
```

### 2. Audit Logging

**What's Logged**:
- All CREATE/UPDATE/DELETE operations
- User who performed action
- IP address and user agent
- Timestamp
- Changes made

**Why**:
- Compliance
- Debugging
- Security investigation
- Accountability

**Example Log Entry**:
```json
{
  "action": "CREATE",
  "entity": "ASSOCIATION",
  "entity_id": "uuid",
  "user_id": "user-uuid",
  "details": {
    "name": "Barbados Football Association",
    "tenant_context": {
      "association_id": "uuid",
      "user_role": "SUPER_ADMIN"
    }
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "created_at": "2025-03-04T22:26:00Z"
}
```

### 3. Rate Limiting

**Protection Against**:
- Brute force attacks
- DDoS attacks
- API abuse
- Search flooding

**Tiers**:
```javascript
// Auth: 5 attempts per 15 minutes (successful attempts don't count)
authRateLimit

// Search: 20 requests per minute
searchRateLimit

// Write operations: 30 per 10 minutes
writeRateLimit

// Public API: 50 per 15 minutes (bypassed if authenticated)
publicRateLimit

// General API: 100 per 15 minutes
apiRateLimit
```

**User-ID Based**:
```javascript
keyGenerator: (req) => {
  return req.user?.userId
    ? `user:${req.user.userId}`  // Authenticated users
    : `ip:${req.ip}`;              // Anonymous users
}
```

### 4. Many-to-Many Relationships

**Problem**: Teams could only be in one competition

**Solution**: Junction table
```sql
CREATE TABLE team_competitions (
    id UUID PRIMARY KEY,
    team_id UUID REFERENCES teams(id),
    competition_id UUID REFERENCES competitions(id),
    UNIQUE(team_id, competition_id)
);

-- Now a team can be in multiple competitions:
INSERT INTO team_competitions (team_id, competition_id)
VALUES
  ('team-1', 'premier-league'),
  ('team-1', 'fa-cup'),
  ('team-1', 'league-cup');
```

---

## API Usage

### Quick Reference

#### Base URL
```
Development: http://localhost:3000/api/v1
Production:  https://api.246sports.bb/api/v1
```

#### Common Request Pattern

```bash
# 1. Login and get tokens
ACCESS_TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login-v2 \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@246sports.com","password":"Admin123!"}' \
  | jq -r '.data.accessToken')

# 2. Use token for API calls
curl http://localhost:3000/api/v1/associations \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 3. When token expires (15min), refresh
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

---

## Best Practices

### For Frontend Developers

**1. Token Management**
```javascript
// Store refresh token securely (httpOnly cookie recommended)
// Store access token in memory
let accessToken = null;

// Automatically refresh before expiry
setInterval(async () => {
  if (accessToken) {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: getRefreshToken() })
    });
    const data = await response.json();
    accessToken = data.data.accessToken;
  }
}, 14 * 60 * 1000); // 14 minutes
```

**2. Error Handling**
```javascript
// Handle 401 Unauthorized - token expired
if (response.status === 401) {
  // Try to refresh token
  const refreshSuccess = await refreshAccessToken();
  if (refreshSuccess) {
    // Retry original request
    return retryRequest();
  } else {
    // Redirect to login
    window.location = '/login';
  }
}

// Handle 403 Forbidden - insufficient permissions
if (response.status === 403) {
  showError("You don't have permission to perform this action");
}

// Handle 429 - rate limit exceeded
if (response.status === 429) {
  showError("Too many requests. Please wait a moment.");
}
```

**3. Pagination**
```javascript
// Always use pagination for list endpoints
async function getAssociations(page = 1, limit = 20) {
  const response = await fetch(
    `/api/v1/associations?page=${page}&limit=${limit}`
  );
  const data = await response.json();

  return {
    items: data.data,
    pagination: data.pagination,
    hasMore: data.pagination.page * data.pagination.limit < data.pagination.total
  };
}
```

### For Backend Developers

**1. Always Use Tenant Filtering**
```typescript
// Automatically filter by tenant
const tenantFilter = buildTenantFilter(req);

const result = await query(
  `SELECT * FROM associations WHERE 1=1 ${tenantFilter}`,
  []
);
```

**2. Validate Resource Ownership**
```typescript
// Before update/delete, verify user owns the resource
if (req.user.role !== UserRole.SUPER_ADMIN) {
  const resource = await query(
    'SELECT * FROM associations WHERE id = $1',
    [req.params.id]
  );

  if (resource.rows[0]?.association_id !== req.user.associationId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
}
```

**3. Use Transactions for Multi-Step Operations**
```sql
BEGIN;

INSERT INTO fixtures (...) VALUES (...);
INSERT INTO fixture_updates (...) VALUES (...);

COMMIT;
-- Or ROLLBACK if something fails
```

---

## Security Checklist

### Authentication ✅
- [x] JWT with short expiry (15 min)
- [x] Refresh token rotation
- [x] Token revocation (logout)
- [x] Password hashing (bcrypt)
- [x] Rate limiting on auth endpoints

### Authorization ✅
- [x] Role-based access control (RBAC)
- [x] Tenant isolation enforcement
- [x] Resource ownership validation
- [x] Authorization middleware

### Data Security ✅
- [x] SQL injection prevention (parameterized queries)
- [x] XSS protection (Helmet.js)
- [x] CORS configuration
- [x] Input validation
- [x] UUID validation

### API Security ✅
- [x] Rate limiting (multi-tier)
- [x] Request logging
- [x] Audit trails
- [x] Error handling (no sensitive data in errors)

---

## Monitoring & Maintenance

### Health Monitoring

**Check Endpoint**:
```bash
curl http://localhost:3000/health
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": {
      "status": "healthy",
      "responseTime": "15ms"
    },
    "memory": {
      "used": "125MB",
      "total": "256MB"
    },
    "uptime": "2d 5h 30m"
  }
}
```

### Log Monitoring

**Error Logs**:
```bash
tail -f logs/error.log
```

**All Logs**:
```bash
tail -f logs/combined.log
```

**Search for Errors**:
```bash
grep "ERROR" logs/combined.log
```

### Database Maintenance

**Refresh Search Index**:
```bash
psql -U postgres -d sports_db -c "REFRESH MATERIALIZED VIEW CONCURRENTLY search_index;"
```

**Vacuum Analyze** (weekly):
```bash
psql -U postgres -d sports_db -c "VACUUM ANALYZE;"
```

---

## Quick Reference Card

### Essential Commands

```bash
# Setup
./scripts/setup.sh

# Start server
npm run dev

# Build
npm run build

# Production
pm2 start dist/server.js --name 246sports-api

# Database migration
psql -U postgres -d sports_db -f database/schema_v2.sql

# Test API
./test-api.sh

# View logs
tail -f logs/combined.log
```

### Essential URLs

```
API: http://localhost:3000/api/v1
Health: http://localhost:3000/health
Swagger: http://localhost:3000/api-docs
```

### Default Credentials

```
Email: admin@246sports.com
Password: Admin123!
Role: SUPER_ADMIN
```

---

<div align="center">

**🎉 You now understand the complete 246Sports ecosystem!**

For implementation details, see:
- [QUICKSTART.md](QUICKSTART.md) - Get started in 5 minutes
- [README.md](README.md) - Full documentation
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing procedures

</div>
