# 246Sports Backend API - Enterprise Edition v2.0

<div align="center">

**Multi-Tenant National Sports Platform for Barbados**

[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [API Documentation](#-api-documentation) • [Testing Guide](#-testing-guide) • [Changelog](#-changelog)

</div>

---

## Table of Contents

- [Overview](#overview)
- [What's New in v2.0](#whats-new-in-v20)
- [Features](#-features)
- [Architecture](#architecture)
  - [User Roles & Workflow](#user-roles--workflow)
  - [Quick Reference Card](#quick-reference-card)
  - [Technology Stack](#technology-stack)
  - [System Architecture](#system-architecture)
  - [Multi-Tenant Isolation](#multi-tenant-isolation)
- [Quick Start](#-quick-start)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Performance](#performance)
- [Monitoring & Logging](#monitoring--logging)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

246Sports is a comprehensive multi-tenant sports management platform designed for national sports associations in Barbados. The system provides complete functionality for managing associations, clubs, teams, competitions, fixtures, results, and automated standings calculations.

**Current Version**: 2.0.0 Enterprise Edition
**Production Ready**: ~95%
**Status**: Enterprise-grade, scalable, production-ready API

---

## What's New in v2.0

### Major Upgrades from v1.0

| Feature | v1.0 | v2.0 Enterprise |
|---------|------|-----------------|
| **Authentication** | 7-day JWT | Refresh token rotation (15min access + 7day refresh) |
| **Tenant Isolation** | Manual enforcement | Automatic middleware-based isolation |
| **Search** | None | Full-text global search with relevance ranking |
| **News System** | Not implemented | Complete CRUD with SEO-friendly slugs |
| **Rate Limiting** | None | Multi-tier (auth, search, API, write operations) |
| **Logging** | console.log only | Winston with file rotation and structured JSON |
| **API Versioning** | None | `/api/v1/` structure for backwards compatibility |
| **Data Integrity** | Basic unique constraints | Partial unique indexes for soft delete |
| **Performance** | Uncertain | Optimized indexes + GIN full-text search |
| **Standings Safety** | No edge case handling | Result versioning + advisory locking |
| **Teams → Competitions** | One-to-many | Many-to-many junction table |
| **Monitoring** | Basic | Enhanced health checks with database status |

---

## Features

### Core Functionality

- **Multi-Tenant Architecture**: Association-level data isolation with automatic middleware enforcement
- **Role-Based Access Control (RBAC)**: 6 roles with granular permissions
- **Results Workflow**: Three-step process (SUBMITTED → CONFIRMED → PUBLISHED)
- **Automated Standings**: Real-time standings calculation when results are published
- **Comprehensive Audit Trail**: Track all CREATE/UPDATE/DELETE operations
- **Soft Delete**: Recoverable deletions with audit trails

### v2.0 Enterprise Features

#### 🔒 Security
- **Refresh Token System**: Industry-standard token rotation and revocation
- **Multi-Tier Rate Limiting**: Protection against brute force, DDoS, and API abuse
- **Tenant Isolation Middleware**: Automatic prevention of cross-tenant data leakage
- **Input Validation**: Comprehensive request validation with error handling

#### 🔍 Search & Discovery
- **Global Full-Text Search**: PostgreSQL GIN indexes with materialized views
- **Relevance Ranking**: Intelligent search result ordering
- **Type Filtering**: Search by entity type (associations, clubs, teams, venues, news)

#### 📰 Content Management
- **News Module**: Create, manage, and publish news articles
- **SEO-Friendly URLs**: Automatic slug generation with uniqueness
- **Publishing Workflow**: Draft, Published, and Archived states

#### 📊 Monitoring & Logging
- **Winston Logging**: Structured JSON logging with file rotation
- **Enhanced Health Checks**: Database status, memory tracking, uptime reporting
- **HTTP Request Logging**: Duration tracking, user identification
- **Audit Logging**: Complete action history with tenant context

#### ⚡ Performance
- **Database Indexes**: Composite indexes on frequently queried columns
- **Partial Unique Indexes**: Efficient soft delete handling
- **Connection Pooling**: Optimized database connection management
- **Query Optimization**: Sub-2-second response times

---

## Architecture

### User Roles & Workflow

#### Role Hierarchy

The system implements a 4-tier role hierarchy with distinct responsibilities:

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPER ADMIN                              │
│            (Platform Owner - Highest Level)                 │
│                                                              │
│  Responsibilities:                                          │
│  • Create Associations                                      │
│  • Create Seasons                                           │
│  • Create Competitions                                      │
│  • Create Association Admins                                │
│  • Full access to all tenants and data                      │
└────────────────────────┬────────────────────────────────────┘
                         │ creates
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 ASSOCIATION ADMIN                            │
│           (League Manager - Tenant Owner)                   │
│                                                              │
│  Responsibilities:                                          │
│  • Manage entire Association                                │
│  • Create Clubs & Club Admins                               │
│  • Create Venues                                            │
│  • Create/Manage Fixtures                                   │
│  • Publish Results (final approval)                         │
│  • Create Competition Managers                              │
│  • Access limited to their Association only                 │
└────────────────────────┬────────────────────────────────────┘
                         │ creates
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ CLUB ADMIN   │ │ COMPETITION  │ │ (Optional)   │
│              │ │ MANAGER      │ │ TEAM MANAGER │
│ Responsibilities│          │ │              │
│ • Create Teams│ │ Responsibilities│ │              │
│ • Register    │ │ • Confirm    │ │ • Manage     │
│   Teams to    │ │   Results    │ │   specific   │
│   Competitions│ │ • Verify     │ │   team       │
│ • Submit      │ │   accuracy   │ │   details    │
│   Match       │ │ • Manage     │ │              │
│   Results     │ │   fixtures   │ │              │
│ • Manage      │ │ • Schedule   │ │              │
│   Players     │ │   matches    │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
  Access limited   Access limited
  to own club      to assigned
                   competition(s)
```

#### How Users Are Created

##### 1. Super Admin
Created during initial system setup:

```bash
POST /api/v1/auth/register
{
  "email": "superadmin@246sports.com",
  "password": "SecurePassword123!",
  "role": "SUPER_ADMIN"
}
```

##### 2. Association Admin
Created by Super Admin in two ways:

**Option A: During Association Creation**
```bash
POST /api/v1/associations
Authorization: Bearer <super-admin-token>
{
  "name": "Barbados Football Association",
  "sport": "Football",
  "country": "Barbados",
  "admin_email": "john@barbadosfootball.com",
  "admin_name": "John Smith",
  "admin_password": "SecurePass123!"
}
# This creates both the Association AND assigns John as Association Admin
```

**Option B: Separately**
```bash
POST /api/v1/users/association-admin
Authorization: Bearer <super-admin-token>
{
  "association_id": "uuid-of-association",
  "email": "john@barbadosfootball.com",
  "name": "John Smith",
  "password": "SecurePass123!",
  "role": "ASSOCIATION_ADMIN"
}
```

##### 3. Club Admin
Created by Association Admin:

**Option A: During Club Creation**
```bash
POST /api/v1/clubs
Authorization: Bearer <association-admin-token>
{
  "association_id": "uuid",
  "name": "Barbados Dynasty FC",
  "admin_email": "jane@dynastyfc.com",
  "admin_name": "Jane Doe",
  "admin_password": "SecurePass123!"
}
# This creates the Club AND assigns Jane as Club Admin
```

**Option B: Separately**
```bash
POST /api/v1/users/club-admin
Authorization: Bearer <association-admin-token>
{
  "club_id": "uuid-of-club",
  "email": "jane@dynastyfc.com",
  "name": "Jane Doe",
  "password": "SecurePass123!",
  "role": "CLUB_ADMIN"
}
```

##### 4. Competition Manager
Created by Association Admin:

```bash
POST /api/v1/users/competition-manager
Authorization: Bearer <association-admin-token>
{
  "competition_id": "uuid-of-competition",
  "email": "mike@premierdivision.com",
  "name": "Mike Johnson",
  "password": "SecurePass123!",
  "role": "COMPETITION_MANAGER"
}
```

#### Complete User Journey: Setting Up a New League

##### Day 1: Setup (Super Admin)

**Step 1: Create Association**
```bash
POST /api/v1/associations
Authorization: Bearer <super-admin-token>
{
  "name": "Barbados Football Association",
  "sport": "Football",
  "country": "Barbados",
  "admin_email": "john@barbadosfootball.com",
  "admin_name": "John Smith",
  "admin_password": "SecurePass123!"
}
```
**What Happens:**
- Association created with ID: `assoc-uuid-1`
- John Smith automatically assigned as Association Admin
- John receives email with login credentials

**Step 2: Create Season**
```bash
POST /api/v1/seasons
Authorization: Bearer <super-admin-or-association-admin-token>
{
  "association_id": "assoc-uuid-1",
  "name": "2025 Season",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31"
}
```
**What Happens:**
- Season created with ID: `season-uuid-1`
- All competitions in 2025 will use this season

**Step 3: Create Competition**
```bash
POST /api/v1/competitions
Authorization: Bearer <super-admin-or-association-admin-token>
{
  "association_id": "assoc-uuid-1",
  "season_id": "season-uuid-1",
  "name": "Premier Division",
  "type": "LEAGUE",
  "points_win": 3,
  "points_draw": 1,
  "points_loss": 0
}
```
**What Happens:**
- Competition created with ID: `comp-uuid-1`
- Scoring rules configured
- Ready for team registration

##### Day 2: Onboarding Clubs

**Step 4: Create Clubs**
**Who:** Association Admin (John Smith)
```bash
POST /api/v1/clubs
Authorization: Bearer <association-admin-token>
{
  "association_id": "assoc-uuid-1",
  "name": "Barbados Dynasty FC",
  "admin_email": "jane@dynastyfc.com",
  "admin_name": "Jane Doe",
  "admin_password": "SecurePass123!"
}
```
**What Happens:**
- Club created with ID: `club-uuid-1`
- Jane Doe automatically assigned as Club Admin
- Jane receives email invitation

**Step 5: Create Teams**
**Who:** Club Admin (Jane Doe)
```bash
POST /api/v1/teams
Authorization: Bearer <club-admin-token>
{
  "club_id": "club-uuid-1",
  "name": "Senior Team",
  "category": "SENIOR"
}
```
**What Happens:**
- Team created with ID: `team-uuid-1`
- Team belongs to Barbados Dynasty FC

**Step 6: Register Team for Competition**
**Who:** Club Admin (Jane Doe) OR Association Admin (John Smith)
```bash
POST /api/v1/team-competitions
Authorization: Bearer <club-admin-or-association-admin-token>
{
  "team_id": "team-uuid-1",
  "competition_id": "comp-uuid-1"
}
```
**What Happens:**
- Team registered to Premier Division
- Team appears in competition standings when matches are played
- Team can now be scheduled in fixtures

##### Day 3: Scheduling Fixtures

**Step 7: Create Venues**
**Who:** Association Admin (John Smith)
```bash
POST /api/v1/venues
Authorization: Bearer <association-admin-token>
{
  "name": "National Stadium",
  "capacity": 5000,
  "address": "Bridgetown, Barbados",
  "association_id": "assoc-uuid-1"
}
```
**What Happens:**
- Venue created with ID: `venue-uuid-1`
- Available for fixture assignment

**Step 8: Schedule Fixtures**
**Who:** Association Admin (John Smith) OR Competition Manager
```bash
POST /api/v1/fixtures
Authorization: Bearer <association-admin-or-competition-manager-token>
{
  "competition_id": "comp-uuid-1",
  "home_team_id": "team-uuid-1",
  "away_team_id": "team-uuid-2",
  "venue_id": "venue-uuid-1",
  "date_time": "2025-03-15T15:00:00Z",
  "round": "Round 1"
}
```
**What Happens:**
- Fixture created with ID: `fixture-uuid-1`
- Both clubs notified
- Fixture appears in calendar

##### Day 4: Match Day

**Step 9: Submit Result**
**Who:** Club Admin from either team
```bash
POST /api/v1/results
Authorization: Bearer <club-admin-token>
{
  "fixture_id": "fixture-uuid-1",
  "home_score": 2,
  "away_score": 1
}
```
**What Happens:**
- Result created with status: `SUBMITTED`
- NOT yet visible in standings
- Awaiting confirmation

**Step 10: Confirm Result**
**Who:** Competition Manager
```bash
PUT /api/v1/results/result-uuid-1/confirm
Authorization: Bearer <competition-manager-token>
```
**What Happens:**
- Competition Manager reviews result
- Status changes to `CONFIRMED`
- Still NOT in standings - awaiting publication

**Step 11: Publish Result**
**Who:** Association Admin (John Smith)
```bash
PUT /api/v1/results/result-uuid-1/publish
Authorization: Bearer <association-admin-token>
```
**What Happens:**
- Status changes to `PUBLISHED`
- Result is now official
- **Standings automatically recalculated**
- League table updated immediately

**Step 12: Check Standings**
**Who:** Anyone (public endpoint)
```bash
GET /api/v1/standings/competition/comp-uuid-1
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "position": 1,
      "team_id": "team-uuid-1",
      "team_name": "Barbados Dynasty FC",
      "played": 1,
      "won": 1,
      "drawn": 0,
      "lost": 0,
      "goals_for": 2,
      "goals_against": 1,
      "goal_difference": 1,
      "points": 3
    }
  ]
}
```

#### Permission Matrix

| Action | Super Admin | Association Admin | Competition Manager | Club Admin | Team Manager | Public |
|--------|-------------|-------------------|---------------------|------------|--------------|--------|
| **User Management** |
| Create Association Admin | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create Club Admin | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Competition Manager | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Association Management** |
| Create Association | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Update Association | ✅ | ✅ (own only) | ❌ | ❌ | ❌ | ❌ |
| View All Associations | ✅ | ✅ (own only) | ✅ (own only) | ✅ (own only) | ✅ (own only) | ✅ |
| **Season & Competition** |
| Create Season | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| Create Competition | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| Update Competition | ✅ | ✅ (own) | ✅ (assigned) | ❌ | ❌ | ❌ |
| **Club & Team Management** |
| Create Club | ✅ | ✅ (own assoc) | ❌ | ❌ | ❌ | ❌ |
| Update Club | ✅ | ✅ (own assoc) | ❌ | ✅ (own) | ❌ | ❌ |
| Create Team | ✅ | ✅ (own assoc) | ❌ | ✅ (own club) | ❌ | ❌ |
| Update Team | ✅ | ✅ (own assoc) | ❌ | ✅ (own club) | ✅ (own) | ❌ |
| Register Team to Competition | ✅ | ✅ (own) | ❌ | ✅ (own) | ❌ | ❌ |
| **Fixture & Result Management** |
| Create Venue | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| Create Fixture | ✅ | ✅ (own) | ✅ (assigned) | ❌ | ❌ | ❌ |
| Update Fixture | ✅ | ✅ (own) | ✅ (assigned) | ❌ | ❌ | ❌ |
| Submit Result | ✅ | ✅ (own) | ❌ | ✅ (own team) | ✅ (own) | ❌ |
| Confirm Result | ✅ | ✅ (own) | ✅ (assigned) | ❌ | ❌ | ❌ |
| Publish Result | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| **Viewing Data** |
| View Standings | ✅ | ✅ (own) | ✅ (assigned) | ✅ (own) | ✅ (own) | ✅ |
| View Fixtures | ✅ | ✅ (own) | ✅ (assigned) | ✅ (own) | ✅ (own) | ✅ |
| View Results | ✅ | ✅ (own) | ✅ (assigned) | ✅ (own) | ✅ (own) | ✅ |
| View News | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

#### Data Isolation Rules

```
Super Admin
├── Can see/manage ALL associations and data
└── Full platform access

Association Admin (Barbados FA)
├── Can only see/manage Barbados FA data
├── Cannot see other associations
└── Manages all clubs, teams, competitions within Barbados FA

Competition Manager (Premier Division)
├── Can only manage assigned competition(s)
├── Can see fixtures/results for assigned competitions
└── Cannot modify other competitions

Club Admin (Barbados Dynasty FC)
├── Can only manage own club
├── Can only submit results for own team's fixtures
└── Cannot see other clubs' sensitive data

Team Manager (Senior Team)
├── Can only manage assigned team
├── Limited to team roster and details
└── Cannot modify club-level settings
```

#### Quick Reference Card

**"Who can do what?"**

| Question | Answer |
|----------|--------|
| **Who creates associations?** | Super Admin only |
| **Who creates clubs?** | Super Admin or Association Admin |
| **Who creates teams?** | Club Admin (for their club) or Association Admin |
| **Who registers teams to competitions?** | Club Admin or Association Admin |
| **Who creates venues?** | Association Admin (for their association) |
| **Who schedules fixtures?** | Association Admin or Competition Manager |
| **Who submits match results?** | Club Admin (for their team's matches) |
| **Who confirms results?** | Competition Manager or Association Admin |
| **Who publishes results?** | Association Admin only |
| **Who can view standings?** | Everyone (public) |
| **How is a Club Admin created?** | Automatically when Association Admin creates a club |
| **How is a Competition Manager created?** | Manually by Association Admin |

#### Technology Stack

```
Backend Framework: Express.js 5.2
Language:         TypeScript 5.9 (Strict Mode)
Database:         PostgreSQL 14+
Authentication:   JWT + Refresh Token Rotation
Logging:          Winston
API Docs:         Swagger/OpenAPI 3.0
Rate Limiting:    express-rate-limit
Search:           PostgreSQL Full-Text Search (GIN)
```

#### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│              (Web, Mobile, Third-Party Apps)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Middleware Chain                                     │  │
│  │  • Helmet (Security Headers)                         │  │
│  │  • CORS (Cross-Origin Resource Sharing)              │  │
│  │  • HTTP Logging (Winston)                            │  │
│  │  • Rate Limiting (Multi-tier)                        │  │
│  │  • Tenant Context Setup                              │  │
│  │  • JWT Authentication                                │  │
│  │  • RBAC Authorization                                │  │
│  │  • Request Validation                                │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │  Auth V2   │ │   Search   │ │   News     │ Controllers  │
│  │ (Refresh   │ │ (Full-Text)│ │  (CRUD)    │              │
│  │  Tokens)   │ │            │ │            │              │
│  └────────────┘ └────────────┘ └────────────┘              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │   Results  │ │ Standings  │ │  Fixtures  │              │
│  │ (Workflow) │ │ (Auto-Calc)│ │ (Calendar) │              │
│  └────────────┘ └────────────┘ └────────────┘              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │   Teams    │ │   Clubs    │ │Associations│              │
│  │ (M:N Comp) │ │  (Tenant)  │ │  (Tenant)  │              │
│  └────────────┘ └────────────┘ └────────────┘              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL 14+                                      │  │
│  │  • Multi-tenant schema with tenant isolation         │  │
│  │  • GIN indexes for full-text search                  │  │
│  │  • Materialized views for search                     │  │
│  │  • Partial unique indexes for soft delete            │  │
│  │  • Advisory locks for standings recalculation        │  │
│  │  • Connection pooling (max 20 connections)           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### Multi-Tenant Isolation

```
┌─────────────────────────────────────────────────────────────┐
│                   Super Admin                               │
│            (Full Access to All Tenants)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Association A │ │ Association B │ │ Association C │
│   (Tenant 1)  │ │   (Tenant 2)  │ │   (Tenant 3)  │
│              │ │              │ │              │
│ • Clubs      │ │ • Clubs      │ │ • Clubs      │
│ • Teams      │ │ • Teams      │ │ • Teams      │
│ • Competitions│ │ • Competitions│ │ • Competitions│
└──────────────┘ └──────────────┘ └──────────────┘
     ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Club Admin A1│ │ Club Admin B1│ │ Club Admin C1│
│              │ │              │ │              │
│ • Own Club   │ │ • Own Club   │ │ • Own Club   │
│ • Own Teams  │ │ • Own Teams  │ │ • Own Teams  │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## Quick Start

### Prerequisites

- **Node.js**: >= 18.0.0
- **PostgreSQL**: >= 14.0
- **npm**: >= 8.0.0

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd 246Sports

# Install dependencies
npm install

# Create logs directory
mkdir -p logs

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migration
npm run db:migrate:v2

# Start development server
npm run dev
```

### Verify Installation

```bash
# Check server health
curl http://localhost:3000/health

# Expected response:
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "2.0.0",
    "timestamp": "2025-03-04T20:00:00.000Z",
    "uptime": "0d 0h 5m",
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

### Access API Documentation

Once the server is running, access the interactive Swagger documentation at:

```
http://localhost:3000/api-docs
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sports246
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=15m

# Refresh Token Configuration
REFRESH_TOKEN_EXPIRES_DAYS=7

# CORS Configuration
CORS_ORIGIN=http://localhost:4200
```

### Security Notes

- **JWT_SECRET**: Use a strong, random string in production (min 32 characters)
- **DB_PASSWORD**: Use a strong password
- **CORS_ORIGIN**: Restrict to your frontend domain in production

---

## Database Setup

### Option 1: Fresh Installation

```bash
# Create database
createdb sports246

# Run v2 schema migration
psql -U postgres -d sports246 -f database/schema_v2.sql
```

### Option 2: Upgrade from v1.0

```bash
# Apply v2 improvements on top of existing schema
psql -U postgres -d sports246 -f database/schema_v2.sql
```

### Refresh Search Index

```bash
# Refresh materialized view for search
npm run db:refresh-search
```

### Database Schema Highlights

#### Key Tables

```sql
-- Users with RBAC
users (id, email, password_hash, role, association_id, club_id)

-- Refresh tokens for security
refresh_tokens (id, user_id, token, expires_at, revoked_at, device_info)

-- Multi-tenant entities
associations (id, name, description, sport, country)
clubs (id, association_id, name, logo_url)
teams (id, club_id, name, logo_url)

-- Competitions with season support
competitions (id, association_id, season_id, name, type, points_system)

-- Team-Competitions (Many-to-Many)
team_competitions (id, team_id, competition_id)

-- Fixtures & Results
fixtures (id, competition_id, home_team_id, away_team_id, date_time, venue_id)
results (id, fixture_id, home_score, away_score, status)
result_history (id, result_id, home_score, away_score, changed_by, changed_at)

-- Automated standings
standings (id, competition_id, team_id, played, won, drawn, lost, goals_for, goals_against, points)

-- News & Search
news (id, title, slug, content, status, published_at)
fixture_updates (id, fixture_id, minute, update_type, description)

-- Background jobs
background_jobs (id, job_type, status, payload, result)

-- Audit logs
audit_logs (id, user_id, action, entity, entity_id, details, ip_address)
```

#### Performance Indexes

```sql
-- Fixtures
CREATE INDEX idx_fixtures_datetime_status ON fixtures(date_time, status);
CREATE INDEX idx_fixtures_competition_status ON fixtures(competition_id, status);

-- Results
CREATE INDEX idx_results_published ON results(published_at DESC);

-- Standings
CREATE INDEX idx_standings_competition_points ON standings(competition_id, points DESC);

-- Full-Text Search
CREATE INDEX idx_news_search ON news USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX idx_associations_name ON associations USING gin(to_tsvector('english', name));
```

---

## API Documentation

### Base URL

```
Development: http://localhost:3000/api/v1
Production:  https://api.246sports.com/api/v1
```

### Authentication

Most endpoints require authentication. Include the access token in the Authorization header:

```bash
Authorization: Bearer <access_token>
```

#### Token Expiration

- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

### Core Endpoints

#### Authentication (V2)

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/login-v2         # New: Returns access + refresh tokens
POST /api/v1/auth/refresh           # New: Exchange refresh token for new access token
POST /api/v1/auth/logout            # New: Revoke refresh token
POST /api/v1/auth/revoke-all        # New: Revoke all user tokens
GET  /api/v1/auth/me
```

**Registration Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@246sports.com",
      "role": "SUPER_ADMIN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "uuid-v4-refresh-token",
    "tokenType": "Bearer",
    "expiresIn": "15m"
  }
}
```

#### Associations

```http
GET    /api/v1/associations
GET    /api/v1/associations/:id
POST   /api/v1/associations
PUT    /api/v1/associations/:id
DELETE /api/v1/associations/:id
```

#### Competitions

```http
GET    /api/v1/competitions
GET    /api/v1/competitions/:id
POST   /api/v1/competitions
PUT    /api/v1/competitions/:id
DELETE /api/v1/competitions/:id
```

#### Fixtures

```http
GET    /api/v1/fixtures
GET    /api/v1/fixtures/today        # Today's fixtures
GET    /api/v1/fixtures/:id
GET    /api/v1/fixtures/:id/ics      # Export to ICS calendar
POST   /api/v1/fixtures
PUT    /api/v1/fixtures/:id
DELETE /api/v1/fixtures/:id
```

#### Results

```http
GET    /api/v1/results
GET    /api/v1/results/:id
POST   /api/v1/results               # Submit result (status: SUBMITTED)
PUT    /api/v1/results/:id/confirm   # Confirm result (status: CONFIRMED)
PUT    /api/v1/results/:id/publish   # Publish result (triggers standings recalculation)
```

**Result Workflow**:
```
SUBMITTED (by anyone)
    ↓
CONFIRMED (by competition manager/association admin)
    ↓
PUBLISHED (by association admin) → Triggers standings calculation
```

#### Standings

```http
GET    /api/v1/standings/competition/:competitionId
POST   /api/v1/standings/recalculate/:competitionId    # Manual recalculation (admin only)
```

#### Clubs & Teams

```http
# Clubs
GET    /api/v1/clubs
GET    /api/v1/clubs/:id
POST   /api/v1/clubs
PUT    /api/v1/clubs/:id
DELETE /api/v1/clubs/:id

# Teams
GET    /api/v1/teams
GET    /api/v1/teams/:id
POST   /api/v1/teams
PUT    /api/v1/teams/:id
DELETE /api/v1/teams/:id
```

#### Players & Venues

```http
# Players
GET    /api/v1/players
GET    /api/v1/players/:id
POST   /api/v1/players
PUT    /api/v1/players/:id
DELETE /api/v1/players/:id

# Venues
GET    /api/v1/venues
GET    /api/v1/venues/:id
POST   /api/v1/venues
PUT    /api/v1/venues/:id
DELETE /api/v1/venues/:id
```

### v2.0 New Endpoints

#### Search

```http
GET    /api/v1/search?q=query&types=ASSOCIATION,CLUB    # Global search
GET    /api/v1/search/associations?q=query
GET    /api/v1/search/clubs?q=query
GET    /api/v1/search/teams?q=query
GET    /api/v1/search/venues?q=query
```

**Search Response**:
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
      "relevance": 0.95
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

#### News

```http
GET    /api/v1/news
GET    /api/v1/news/:slug
POST   /api/v1/news
PUT    /api/v1/news/:id
DELETE /api/v1/news/:id
```

**News States**:
- `DRAFT`: Not publicly visible
- `PUBLISHED`: Publicly visible with published_at timestamp
- `ARCHIVED`: No longer displayed in main feed

#### System

```http
GET    /health                         # Enhanced health check with DB status
GET    /                               # Root endpoint with API info
```

**Health Check Response**:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "2.0.0",
    "timestamp": "2025-03-04T20:00:00.000Z",
    "uptime": "2d 5h 30m",
    "environment": "production",
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

#### Audit Logs

```http
GET    /api/v1/audit/logs              # View all logs (admin only)
GET    /api/v1/audit/statistics        # Audit statistics
```

### API Versioning

All endpoints are versioned under `/api/v1/` to ensure backwards compatibility. Future versions (v2, v3) will be released at new URL paths without breaking existing clients.

### Response Format

**Success Response**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

**Paginated Response**:
```json
{
  "success": true,
  "message": "Data retrieved",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Security

### Authentication & Authorization

#### Role-Based Access Control (RBAC)

| Role | Description | Permissions |
|------|-------------|-------------|
| **SUPER_ADMIN** | Platform administrator | Full access to all entities and tenants |
| **ASSOCIATION_ADMIN** | Association administrator | Full access within their association |
| **COMPETITION_MANAGER** | Competition manager | Manage competitions, fixtures, results |
| **CLUB_ADMIN** | Club administrator | Manage own club, teams, players |
| **TEAM_MANAGER** | Team manager | Manage team roster and fixtures |
| **PUBLIC** | Unauthenticated user | Read-only access to public data |

#### Token Security

**Access Token** (JWT):
- Expiration: 15 minutes
- Used for API authentication
- Short-lived for security

**Refresh Token**:
- Expiration: 7 days
- Used to obtain new access tokens
- Automatically rotated on refresh
- Can be revoked (logout, revoke-all)
- Device/user agent tracking

#### Rate Limiting

| Endpoint Type | Limit | Window | Description |
|--------------|-------|--------|-------------|
| **Authentication** | 5 attempts | 15 minutes | Brute force protection (successful requests not counted) |
| **Search** | 20 requests | 1 minute | Prevent search abuse |
| **Write Operations** | 30 requests | 10 minutes | POST, PUT, DELETE |
| **Public API** | 50 requests | 15 minutes | Unauthenticated users |
| **General API** | 100 requests | 15 minutes | Authenticated users (user-ID based) |

#### Tenant Isolation

- Automatic middleware injection of tenant context
- Prevention of cross-tenant data access
- Association admins restricted to their association
- Club admins restricted to their club
- Resource ownership validation on updates/deletes

#### Input Validation

- Email validation with regex
- Password strength requirements (min 8 characters)
- UUID validation for all ID parameters
- SQL injection prevention (parameterized queries)
- XSS protection (Helmet.js headers)

---

## Performance

### Database Optimizations

#### Indexes

```sql
-- Composite indexes for common queries
CREATE INDEX idx_fixtures_datetime_status ON fixtures(date_time, status);
CREATE INDEX idx_fixtures_competition_status ON fixtures(competition_id, status);
CREATE INDEX idx_results_published ON results(published_at DESC);
CREATE INDEX idx_standings_competition_points ON standings(competition_id, points DESC);

-- GIN indexes for full-text search
CREATE INDEX idx_news_search ON news USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX idx_associations_name ON associations USING gin(to_tsvector('english', name));
```

#### Query Optimization

- Materialized view for global search (refreshable)
- Partial unique indexes for soft delete compatibility
- Connection pooling (max 20 connections)
- Sub-2-second response time guarantee

### Caching Strategy (Future)

Consider implementing Redis for:
- Session storage
- Query result caching
- Rate limit counters
- Real-time data (live scores)

---

## Monitoring & Logging

### Winston Logging

#### Log Files

```
logs/
├── error.log          # Errors only
├── combined.log       # All logs
├── exceptions.log     # Uncaught exceptions
└── rejections.log     # Unhandled promise rejections
```

#### Log Levels

- **error**: Critical errors requiring attention
- **warn**: Warning messages
- **info**: General informational messages
- **http**: HTTP request logs (method, URL, status, duration)
- **debug**: Detailed debugging information (development only)

#### Log Format

**Development** (Pretty-printed):
```
[2025-03-04 20:00:00] INFO: Server started on port 3000
```

**Production** (Structured JSON):
```json
{
  "level": "info",
  "message": "Server started",
  "port": 3000,
  "environment": "production",
  "timestamp": "2025-03-04T20:00:00.000Z"
}
```

### HTTP Request Logging

Every HTTP request is logged with:
- Method and URL
- Status code
- Duration
- IP address
- User ID (if authenticated)

### Audit Logging

All CREATE/UPDATE/DELETE operations are logged:
- User who performed the action
- Action type (CREATE, UPDATE, DELETE)
- Entity type and ID
- Changes made
- Tenant context
- IP address and user agent

### Health Monitoring

#### Health Check Endpoint

```
GET /health
```

Returns:
- Server status
- Database connection status
- Database response time
- Memory usage
- Uptime
- Version number

### Viewing Logs

```bash
# Follow all logs in real-time
npm run logs

# View error logs only
tail -f logs/error.log

# Search logs for specific errors
grep "ERROR" logs/combined.log
```

---

## Project Structure

```
246Sports/
├── src/
│   ├── config/
│   │   └── database.ts           # PostgreSQL connection configuration
│   ├── controllers/
│   │   ├── system.controller.ts  # Health check, root endpoint
│   │   └── ...                   # Module controllers
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT authentication & RBAC
│   │   ├── error.middleware.ts   # Error handling
│   │   ├── rateLimit.middleware.ts   # v2.0: Rate limiting
│   │   ├── tenant.middleware.ts      # v2.0: Tenant isolation
│   │   └── validation.middleware.ts  # Request validation
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth-v2.controller.ts     # v2.0: Refresh tokens
│   │   │   └── auth.routes.ts
│   │   ├── associations/
│   │   ├── competitions/
│   │   ├── fixtures/
│   │   ├── results/
│   │   ├── standings/
│   │   ├── clubs/
│   │   ├── teams/
│   │   ├── players/
│   │   ├── venues/
│   │   ├── audit/
│   │   ├── search/                      # v2.0: Full-text search
│   │   │   ├── search.controller.ts
│   │   │   └── search.routes.ts
│   │   └── news/                        # v2.0: News module
│   │       ├── news.controller.ts
│   │       └── news.routes.ts
│   ├── routes/
│   │   └── v1.routes.ts                 # v2.0: API versioning
│   ├── types/
│   │   └── index.ts                     # TypeScript type definitions
│   ├── utils/
│   │   ├── logger.ts                    # v2.0: Winston logging
│   │   ├── responseHandler.ts           # Standardized responses
│   │   ├── validator.ts                 # Input validation helpers
│   │   └── jwt.ts                       # JWT token generation
│   ├── app.ts                           # Express application setup
│   └── server.ts                        # Server entry point
├── database/
│   ├── schema.sql                       # Original v1.0 schema
│   └── schema_v2.sql                    # v2.0: Enterprise schema
├── logs/                                # v2.0: Log files (created at runtime)
├── .env                                 # Environment variables (not in git)
├── .env.example                         # Environment variables template
├── .gitignore
├── README.md                            # This file
├── TESTING_GUIDE.md                     # v2.0: Testing guide
├── IMPROVEMENTS_SUMMARY.md              # v2.0: What's new documentation
├── package.json
├── tsconfig.json
└── nodemon.json
```

---

## Deployment

### Production Checklist

- [ ] Update environment variables (strong secrets, production CORS origin)
- [ ] Enable SSL/TLS for database connection
- [ ] Set NODE_ENV=production
- [ ] Configure production database backups
- [ ] Set up log aggregation (e.g., ELK stack, Splunk)
- [ ] Configure error tracking (e.g., Sentry, DataDog)
- [ ] Enable CDN for static assets (logos, images)
- [ ] Configure reverse proxy (nginx, Apache)
- [ ] Set up process manager (PM2, systemd)
- [ ] Configure firewall rules
- [ ] Enable database connection pooling
- [ ] Set up monitoring and alerting

### Building for Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/server.js --name 246sports-api

# View logs
pm2 logs 246sports-api

# Monitor
pm2 monit

# Restart
pm2 restart 246sports-api

# Stop
pm2 stop 246sports-api
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build image
docker build -t 246sports-api .

# Run container
docker run -p 3000:3000 --env-file .env 246sports-api
```

---

## Testing

For comprehensive testing instructions, see [TESTING_GUIDE.md](TESTING_GUIDE.md).

### Quick Test Commands

```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"SUPER_ADMIN"}'

# Login with refresh tokens
curl -X POST http://localhost:3000/api/v1/auth/login-v2 \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Global search
curl "http://localhost:3000/api/v1/search?q=barbados"
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Follow the existing code style
- Ensure all tests pass before submitting

---

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Database Connection Failed

```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -U postgres -l | grep sports246

# Test connection
psql -U postgres -d sports246 -c "SELECT 1"
```

#### Build Errors

```bash
# Clean build artifacts
rm -rf dist node_modules

# Reinstall dependencies
npm install

# Rebuild
npm run build
```

#### Permission Issues

```bash
# Create logs directory with proper permissions
mkdir -p logs
chmod 755 logs
```

---

## Changelog

### Version 2.0.0 (Enterprise Edition) - March 2025

#### Major Features Added

- **Refresh Token System**: Industry-standard authentication with token rotation
- **Global Full-Text Search**: PostgreSQL GIN indexes with relevance ranking
- **News Module**: Complete CRUD with SEO-friendly slugs
- **Multi-Tier Rate Limiting**: Protection against API abuse
- **Winston Logging**: Production-ready structured logging
- **API Versioning**: `/api/v1/` structure for backwards compatibility
- **Tenant Isolation Middleware**: Automatic cross-tenant data leak prevention
- **Enhanced Health Checks**: Database status, memory tracking, uptime
- **Team-Competitions Junction Table**: Many-to-many relationship support
- **Result Versioning**: Audit trail for result changes
- **Background Jobs Table**: Foundation for async operations
- **Performance Indexes**: Optimized database queries
- **Partial Unique Indexes**: Soft delete compatibility

#### Security Improvements

- 15-minute access token expiration
- Refresh token rotation and revocation
- Auth rate limiting (5 attempts/15min)
- User-ID-based rate limiting
- Tenant isolation enforcement
- Input validation improvements

#### Performance Improvements

- Composite database indexes
- GIN full-text search indexes
- Materialized view for search
- Connection pooling optimization
- Sub-2-second response times

#### Developer Experience

- Comprehensive API documentation (Swagger)
- Testing guide (TESTING_GUIDE.md)
- Detailed README update
- Improved error messages
- HTTP request logging

### Version 1.0.0 (MVP) - February 2025

#### Initial Release

- Multi-tenant architecture
- RBAC with 6 roles
- Associations, Clubs, Teams management
- Competitions & Seasons
- Fixtures & Results workflow
- Automated standings calculation
- Players & Venues management
- Audit logging
- Soft delete
- Swagger documentation

---

## Support

For issues, questions, or contributions:

- **Issues**: [GitHub Issues](https://github.com/yourusername/246sports/issues)
- **Documentation**: [README.md](README.md) | [TESTING_GUIDE.md](TESTING_GUIDE.md)
- **Email**: support@246sports.com

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for Barbados Sports**

[⬆ Back to Top](#-246sports-backend-api---enterprise-edition-v20)

</div>
