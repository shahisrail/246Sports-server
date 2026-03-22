"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: '246Sports API',
            version: '2.0.0',
            description: `Multi-tenant national sports platform for Barbados

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
\`Authorization: Bearer <your_jwt_token>\`

## User Roles
- **SUPER_ADMIN**: Full system access
- **ASSOCIATION_ADMIN**: Manages association data
- **COMPETITION_MANAGER**: Manages competitions and fixtures
- **CLUB_ADMIN**: Manages club data
- **TEAM_MANAGER**: Manages team data
- **PUBLIC**: Limited public access

## Rate Limiting
API requests are rate-limited. Standard: 100 req/15min

## Pagination
List endpoints support pagination via \`page\` and \`limit\` query parameters.`,
            contact: {
                name: '246Sports Support',
                email: 'support@246sports.bb',
            },
        },
        servers: [
            {
                url: 'http://localhost:4000/api/v1',
                description: 'Development server',
            },
            {
                url: 'https://api.246sports.com/api/v1',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT authentication token. Obtain by logging in via /api/v1/auth/login',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    required: ['name', 'email', 'password', 'role'],
                    properties: {
                        id: { type: 'string', format: 'uuid', description: 'User UUID' },
                        name: { type: 'string', description: 'Full name', example: 'John Doe' },
                        email: { type: 'string', format: 'email', description: 'Email address', example: 'john@example.com' },
                        role: {
                            type: 'string',
                            enum: ['PUBLIC', 'SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'COMPETITION_MANAGER', 'CLUB_ADMIN', 'TEAM_MANAGER'],
                            description: 'User role for permissions',
                        },
                        association_id: { type: 'string', format: 'uuid', nullable: true, description: 'Associated association (for ASSOCIATION_ADMIN)' },
                        club_id: { type: 'string', format: 'uuid', nullable: true, description: 'Associated club (for CLUB_ADMIN)' },
                        created_at: { type: 'string', format: 'date-time', description: 'Account creation timestamp' },
                    },
                },
                Association: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string', example: 'Barbados Football Association' },
                        abbreviation: { type: 'string', example: 'BFA' },
                        logo: { type: 'string', format: 'uri', description: 'Logo image URL' },
                        description: { type: 'string', description: 'Association description' },
                        website: { type: 'string', format: 'uri', example: 'https://barbadosfa.com' },
                        contact_email: { type: 'string', format: 'email' },
                        contact_phone: { type: 'string' },
                        address: { type: 'string' },
                        founded_year: { type: 'integer', example: 1900 },
                        president_name: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Competition: {
                    type: 'object',
                    required: ['name', 'sport', 'association_id'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string', example: 'Premier League' },
                        sport: { type: 'string', example: 'Football' },
                        association_id: { type: 'string', format: 'uuid' },
                        category: { type: 'string', enum: ['LEAGUE', 'CUP', 'TOURNAMENT'], default: 'LEAGUE' },
                        status: { type: 'string', enum: ['UPCOMING', 'ONGOING', 'COMPLETED'], default: 'UPCOMING' },
                        rules: { type: 'string', description: 'Competition rules and regulations' },
                        points_win: { type: 'integer', default: 3, description: 'Points awarded for a win' },
                        points_draw: { type: 'integer', default: 1, description: 'Points awarded for a draw' },
                        points_loss: { type: 'integer', default: 0, description: 'Points awarded for a loss' },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Fixture: {
                    type: 'object',
                    required: ['competition_id', 'home_team_id', 'away_team_id', 'venue_id', 'scheduled_date'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        competition_id: { type: 'string', format: 'uuid', description: 'Competition UUID' },
                        home_team_id: { type: 'string', format: 'uuid', description: 'Home team UUID' },
                        away_team_id: { type: 'string', format: 'uuid', description: 'Away team UUID' },
                        venue_id: { type: 'string', format: 'uuid', description: 'Venue UUID' },
                        scheduled_date: { type: 'string', format: 'date-time', description: 'Scheduled match date/time' },
                        status: {
                            type: 'string',
                            enum: ['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED'],
                            default: 'SCHEDULED',
                        },
                        round: { type: 'string', example: 'Round 1' },
                        stream_url: { type: 'string', format: 'uri', description: 'Live stream URL if available' },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Result: {
                    type: 'object',
                    required: ['fixture_id', 'home_score', 'away_score'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        fixture_id: { type: 'string', format: 'uuid' },
                        home_score: { type: 'integer', minimum: 0, description: 'Home team score' },
                        away_score: { type: 'integer', minimum: 0, description: 'Away team score' },
                        status: {
                            type: 'string',
                            enum: ['SUBMITTED', 'CONFIRMED', 'PUBLISHED'],
                            default: 'SUBMITTED',
                        },
                        submitted_by: { type: 'string', format: 'uuid', description: 'User who submitted the result' },
                        confirmed_by: { type: 'string', format: 'uuid', description: 'User who confirmed the result' },
                        published_at: { type: 'string', format: 'date-time' },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Standing: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        competition_id: { type: 'string', format: 'uuid' },
                        team_id: { type: 'string', format: 'uuid' },
                        points: { type: 'integer', description: 'Total points', example: 24 },
                        played: { type: 'integer', description: 'Matches played', example: 10 },
                        won: { type: 'integer', description: 'Matches won', example: 8 },
                        drawn: { type: 'integer', description: 'Matches drawn', example: 0 },
                        lost: { type: 'integer', description: 'Matches lost', example: 2 },
                        goals_for: { type: 'integer', description: 'Goals scored', example: 25 },
                        goals_against: { type: 'integer', description: 'Goals conceded', example: 8 },
                        goal_difference: { type: 'integer', description: 'Goal difference', example: 17 },
                    },
                },
                Club: {
                    type: 'object',
                    required: ['name', 'association_id'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string', example: 'Eagles FC' },
                        association_id: { type: 'string', format: 'uuid' },
                        logo: { type: 'string', format: 'uri' },
                        founded_year: { type: 'integer', example: 1950 },
                        colors: { type: 'array', items: { type: 'string' }, example: ['Red', 'White'] },
                        address: { type: 'string' },
                        website: { type: 'string', format: 'uri' },
                        contact_email: { type: 'string', format: 'email' },
                        contact_phone: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Team: {
                    type: 'object',
                    required: ['name', 'club_id', 'competition_id'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string', example: 'Eagles FC Senior Team' },
                        club_id: { type: 'string', format: 'uuid' },
                        competition_id: { type: 'string', format: 'uuid' },
                        category: { type: 'string', enum: ['SENIOR', 'U23', 'U20', 'U18', 'U15', 'U13'], default: 'SENIOR' },
                        gender: { type: 'string', enum: ['MALE', 'FEMALE', 'MIXED'], default: 'MALE' },
                        logo: { type: 'string', format: 'uri' },
                        coach_name: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Player: {
                    type: 'object',
                    required: ['name', 'team_id'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string', example: 'Marcus Smith' },
                        team_id: { type: 'string', format: 'uuid' },
                        photo: { type: 'string', format: 'uri' },
                        position: { type: 'string', example: 'Forward' },
                        squad_number: { type: 'integer', example: 10 },
                        date_of_birth: { type: 'string', format: 'date' },
                        nationality: { type: 'string', example: 'Barbadian' },
                        height: { type: 'integer', description: 'Height in cm', example: 180 },
                        weight: { type: 'integer', description: 'Weight in kg', example: 75 },
                        bio: { type: 'string', description: 'Player biography' },
                        is_active: { type: 'boolean', default: true },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Venue: {
                    type: 'object',
                    required: ['name', 'address'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string', example: 'Kennington Oval' },
                        address: { type: 'string' },
                        latitude: { type: 'number', format: 'float', example: 13.0995 },
                        longitude: { type: 'number', format: 'float', example: -59.6136 },
                        capacity: { type: 'integer', example: 5000 },
                        surface: { type: 'string', enum: ['GRASS', 'ARTIFICIAL', 'HYBRID', 'INDOOR'], default: 'GRASS' },
                        photo: { type: 'string', format: 'uri' },
                        amenities: { type: 'array', items: { type: 'string' }, example: ['Parking', 'Floodlights', 'Changing Rooms'] },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Error message' },
                        error: { type: 'string', example: 'Detailed error information' },
                    },
                },
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Operation successful' },
                        data: { type: 'object', description: 'Response data' },
                    },
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer', example: 1, description: 'Current page number' },
                        limit: { type: 'integer', example: 20, description: 'Items per page' },
                        total: { type: 'integer', example: 100, description: 'Total number of items' },
                        totalPages: { type: 'integer', example: 5, description: 'Total number of pages' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/modules/**/*.ts', './src/modules/**/*.route.ts', './src/routes/**/*.ts'],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map