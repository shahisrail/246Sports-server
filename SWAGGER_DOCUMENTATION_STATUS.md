# 246Sports API - Swagger Documentation Status

## Overview
This document provides a comprehensive overview of all APIs in the 246Sports backend and their Swagger documentation status.

**Last Updated:** 2026-03-22

## Documentation Status

### ✅ Fully Documented APIs

The following API routes have comprehensive Swagger documentation with detailed endpoint descriptions, parameters, request bodies, and responses:

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Authentication** | 9 endpoints | ✅ Complete |
| `/api/v1/auth/register` | POST - Register new user | ✅ |
| `/api/v1/auth/login` | POST - Login user | ✅ |
| `/api/v1/auth/login-v2` | POST - Login with refresh tokens | ✅ |
| `/api/v1/auth/logout` | POST - Logout and invalidate tokens | ✅ |
| `/api/v1/auth/refresh` | POST - Refresh access token | ✅ |
| `/api/v1/auth/revoke-all` | POST - Revoke all user tokens | ✅ |
| `/api/v1/auth/forgot-password` | POST - Request password reset | ✅ |
| `/api/v1/auth/me` | GET - Get current user profile | ✅ |
| `/api/v1/auth/profile` | PUT - Update user profile | ✅ |
| `/api/v1/auth/change-password` | POST - Change password | ✅ |
| `/api/v1/auth/reset-password/validate` | POST - Validate reset token | ✅ |
| `/api/v1/auth/reset-password/confirm` | POST - Confirm password reset | ✅ |

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Fixtures** | 11 endpoints | ✅ Complete |
| `/api/v1/fixtures` | GET - Get all fixtures (filtered) | ✅ |
| `/api/v1/fixtures/today` | GET - Get today's fixtures | ✅ |
| `/api/v1/fixtures/upcoming` | GET - Get upcoming fixtures | ✅ |
| `/api/v1/fixtures/finished` | GET - Get finished fixtures | ✅ |
| `/api/v1/fixtures/:id` | GET - Get fixture by ID | ✅ |
| `/api/v1/fixtures/:id/calendar` | GET - Get fixture as calendar event | ✅ |
| `/api/v1/fixtures/:id/ics` | GET - Export fixture as ICS file | ✅ |
| `/api/v1/fixtures/:id/directions` | GET - Get directions to venue | ✅ |
| `/api/v1/fixtures` | POST - Create fixture | ✅ |
| `/api/v1/fixtures/:id` | PUT - Update fixture | ✅ |
| `/api/v1/fixtures/:id` | DELETE - Delete fixture | ✅ |

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Competitions** | 5 endpoints | ✅ Complete |
| `/api/v1/competitions` | GET - Get all competitions | ✅ |
| `/api/v1/competitions/:id` | GET - Get competition by ID | ✅ |
| `/api/v1/competitions` | POST - Create competition | ✅ |
| `/api/v1/competitions/:id` | PUT - Update competition | ✅ |
| `/api/v1/competitions/:id` | DELETE - Delete competition | ✅ |
| `/api/v1/competitions/:id/generate-fixtures` | POST - Generate fixtures | ✅ |

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Teams** | 5 endpoints | ✅ Complete |
| `/api/v1/teams/public` | GET - Get public teams | ✅ |
| `/api/v1/teams` | GET - Get teams (authenticated) | ✅ |
| `/api/v1/teams/:id` | GET - Get team by ID | ✅ |
| `/api/v1/teams` | POST - Create team | ✅ |
| `/api/v1/teams/:id` | PUT - Update team | ✅ |
| `/api/v1/teams/:id` | DELETE - Delete team | ✅ |

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Associations** | 6 endpoints | ✅ Complete |
| `/api/v1/associations` | GET - Get all associations | ✅ |
| `/api/v1/associations/:id` | GET - Get association by ID | ✅ |
| `/api/v1/associations` | POST - Create association | ✅ |
| `/api/v1/associations/:id` | PUT - Update association | ✅ |
| `/api/v1/associations/:id` | DELETE - Delete association | ✅ |
| `/api/v1/associations/:id/logo` | POST - Upload association logo | ✅ |

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Venues** | 5 endpoints | ✅ Complete |
| `/api/v1/venues` | GET - Get all venues | ✅ |
| `/api/v1/venues/:id` | GET - Get venue by ID | ✅ |
| `/api/v1/venues` | POST - Create venue | ✅ |
| `/api/v1/venues/:id` | PUT - Update venue | ✅ |
| `/api/v1/venues/:id` | DELETE - Delete venue | ✅ |

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Standings** | 2 endpoints | ✅ Complete |
| `/api/v1/standings/competition/:competitionId` | GET - Get standings | ✅ |
| `/api/v1/standings/recalculate/:competitionId` | POST - Recalculate standings | ✅ |

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Results** | 5 endpoints | ✅ Complete |
| `/api/v1/results` | GET - Get all results | ✅ |
| `/api/v1/results/fixture/:fixtureId` | GET - Get result by fixture | ✅ |
| `/api/v1/results` | POST - Submit result | ✅ |
| `/api/v1/results/:id/confirm` | PUT - Confirm result | ✅ |
| `/api/v1/results/:id/publish` | PUT - Publish result | ✅ |

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Stats** | 5 endpoints | ✅ Complete |
| `/api/v1/stats/dashboard` | GET - Dashboard stats (public) | ✅ |
| `/api/v1/stats/growth` | GET - Growth trends | ✅ |
| `/api/v1/stats/monthly-activity` | GET - Monthly activity | ✅ |
| `/api/v1/stats/entity-distribution` | GET - Entity distribution | ✅ |
| `/api/v1/stats/competition-status` | GET - Competition status | ✅ |

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Media** | 3 endpoints | ✅ Complete |
| `/api/v1/media/upload/image` | POST - Upload single image | ✅ |
| `/api/v1/media/upload/images` | POST - Upload multiple images | ✅ |
| `/api/v1/media/upload/delete` | POST - Delete image | ✅ |

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Invitations** | 4 endpoints | ✅ Complete |
| `/api/v1/invitations/accept` | POST - Accept invitation | ✅ |
| `/api/v1/invitations/complete` | POST - Complete registration | ✅ |
| `/api/v1/invitations` | GET - Get invitations | ✅ |
| `/api/v1/invitations/:id` | DELETE - Cancel invitation | ✅ |
| `/api/v1/invitations/:id/resend` | POST - Resend invitation | ✅ |

### ⚠️ Partially Documented APIs

These modules have basic tag definitions but lack detailed endpoint documentation:

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Clubs** | 7 endpoints | ⚠️ Tags only |
| `/api/v1/clubs/public` | GET - Get public clubs | ⚠️ |
| `/api/v1/clubs` | GET/POST/PUT - Club CRUD | ⚠️ |
| `/api/v1/clubs/:id/logo` | POST - Upload logo | ⚠️ |

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Players** | 5 endpoints | ⚠️ Tags only |
| `/api/v1/players` | GET/POST - Player CRUD | ⚠️ |
| `/api/v1/players/:id` | GET/PUT/DELETE - Player operations | ⚠️ |

| Module | Endpoints | Status |
|--------|-----------|--------|
| **News** | ~5 endpoints | ⚠️ Tags only |
| `/api/v1/news` | GET/POST - News CRUD | ⚠️ |

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Sports** | ~3 endpoints | ⚠️ Tags only |
| `/api/v1/sports` | GET/POST - Sports CRUD | ⚠️ |

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Users** | ~3 endpoints | ⚠️ Tags only |
| `/api/v1/users` | GET/POST - User management | ⚠️ |

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Audit** | ~2 endpoints | ⚠️ Tags only |
| `/api/v1/audit` | GET - Audit logs | ⚠️ |

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Search** | ~3 endpoints | ⚠️ Tags only |
| `/api/v1/search` | GET - Global search | ⚠️ |

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Email** | ~3 endpoints | ⚠️ No documentation |
| `/api/v1/email` | POST - Send emails | ⚠️ |

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Email Subscriptions** | ~2 endpoints | ⚠️ No documentation |
| `/api/v1/email-subscriptions` | POST/GET - Newsletter | ⚠️ |

## Data Models (Schemas)

### ✅ Fully Defined Schemas
All core data models are properly defined in the Swagger configuration:

- **User** - User accounts with roles
- **Association** - Sports associations
- **Competition** - Tournaments and leagues
- **Fixture** - Match fixtures
- **Result** - Match results
- **Standing** - League table standings
- **Club** - Sports clubs
- **Team** - Teams within clubs
- **Player** - Player profiles
- **Venue** - Sports venues
- **Error** - Error response format
- **ApiResponse** - Generic API response
- **Pagination** - Pagination metadata

## Authentication

### JWT Token Authentication
Most endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

### Token Management (V2)
Enhanced authentication with refresh tokens:
- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Long-lived (7 days)
- Endpoint: `/api/v1/auth/login-v2`
- Refresh endpoint: `/api/v1/auth/refresh`

### User Roles
- **SUPER_ADMIN**: Full system access
- **ASSOCIATION_ADMIN**: Association-level management
- **COMPETITION_MANAGER**: Competition management
- **CLUB_ADMIN**: Club-level management
- **TEAM_MANAGER**: Team-level management
- **PUBLIC**: Limited access

## API Access

### Development Server
- **URL**: `http://localhost:4000/api/v1`
- **Swagger UI**: `http://localhost:4000/api-docs`

### Production Server
- **URL**: `https://api.246sports.com/api/v1`
- **Swagger UI**: `https://api.246sports.com/api-docs`

## Rate Limiting
- **Standard**: 100 requests per 15 minutes
- Headers included in response:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

## Pagination

List endpoints support pagination:
- `page` (default: 1)
- `limit` (default: 20, max: 100)

Response includes pagination metadata:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Next Steps

### Recommended Actions
1. ✅ **Core APIs Complete**: All essential APIs are documented
2. ⚠️ **Add Detail to Partial APIs**: Complete endpoint documentation for Clubs, Players, News, Sports, Users
3. ⚠️ **Add Missing Modules**: Document Email and Email Subscriptions endpoints

### How to Add Documentation
To add Swagger documentation to any endpoint, use the following format in route files:

```typescript
/**
 * @swagger
 * /api/v1/resource:
 *   get:
 *     summary: Brief description
 *     tags: [ResourceName]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: param
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModelName'
 */
router.get('/', controller);
```

## Statistics

- **Total API Modules**: 18
- **Fully Documented**: 10 (56%)
- **Partially Documented**: 8 (44%)
- **Total Endpoints Documented**: 60+ endpoints
- **Data Models Defined**: 13 schemas

## Summary

The 246Sports API has comprehensive Swagger documentation for all core functionality including authentication, fixtures, competitions, teams, associations, venues, standings, results, statistics, media uploads, and user invitations. The documentation is accessible via the Swagger UI at `/api-docs` endpoint.

All critical APIs required for platform operation are fully documented with detailed parameters, request/response schemas, and authentication requirements. The remaining modules (Clubs, Players, News, Sports, Users, Audit, Search, Email) have basic tag definitions and can be enhanced following the same pattern used in the documented modules.
