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
            description: 'Multi-tenant national sports platform for Barbados',
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
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    required: ['name', 'email', 'password', 'role'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        role: {
                            type: 'string',
                            enum: ['PUBLIC', 'SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'COMPETITION_MANAGER', 'CLUB_ADMIN', 'TEAM_MANAGER'],
                        },
                        association_id: { type: 'string', format: 'uuid', nullable: true },
                        club_id: { type: 'string', format: 'uuid', nullable: true },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Association: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        logo: { type: 'string', format: 'uri' },
                        description: { type: 'string' },
                        website: { type: 'string', format: 'uri' },
                        contact_email: { type: 'string', format: 'email' },
                        contact_phone: { type: 'string' },
                        address: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Competition: {
                    type: 'object',
                    required: ['name', 'sport', 'association_id', 'season_id'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        sport: { type: 'string' },
                        association_id: { type: 'string', format: 'uuid' },
                        season_id: { type: 'string', format: 'uuid' },
                        category: { type: 'string', enum: ['LEAGUE', 'CUP', 'TOURNAMENT'] },
                        status: { type: 'string', enum: ['UPCOMING', 'ONGOING', 'COMPLETED'] },
                        rules: { type: 'string' },
                        points_win: { type: 'integer', default: 3 },
                        points_draw: { type: 'integer', default: 1 },
                        points_loss: { type: 'integer', default: 0 },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Fixture: {
                    type: 'object',
                    required: ['competition_id', 'home_team_id', 'away_team_id', 'venue_id', 'date_time'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        competition_id: { type: 'string', format: 'uuid' },
                        home_team_id: { type: 'string', format: 'uuid' },
                        away_team_id: { type: 'string', format: 'uuid' },
                        venue_id: { type: 'string', format: 'uuid' },
                        date_time: { type: 'string', format: 'date-time' },
                        status: {
                            type: 'string',
                            enum: ['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED'],
                        },
                        round: { type: 'string' },
                        stream_url: { type: 'string', format: 'uri' },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Result: {
                    type: 'object',
                    required: ['fixture_id', 'home_score', 'away_score'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        fixture_id: { type: 'string', format: 'uuid' },
                        home_score: { type: 'integer' },
                        away_score: { type: 'integer' },
                        status: {
                            type: 'string',
                            enum: ['SUBMITTED', 'CONFIRMED', 'PUBLISHED'],
                        },
                        submitted_by: { type: 'string', format: 'uuid' },
                        confirmed_by: { type: 'string', format: 'uuid' },
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
                        points: { type: 'integer' },
                        played: { type: 'integer' },
                        won: { type: 'integer' },
                        drawn: { type: 'integer' },
                        lost: { type: 'integer' },
                        goals_for: { type: 'integer' },
                        goals_against: { type: 'integer' },
                        goal_difference: { type: 'integer' },
                    },
                },
                Club: {
                    type: 'object',
                    required: ['name', 'association_id'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        association_id: { type: 'string', format: 'uuid' },
                        logo: { type: 'string', format: 'uri' },
                        founded_year: { type: 'integer' },
                        colors: { type: 'array', items: { type: 'string' } },
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
                        name: { type: 'string' },
                        club_id: { type: 'string', format: 'uuid' },
                        competition_id: { type: 'string', format: 'uuid' },
                        category: { type: 'string', enum: ['SENIOR', 'U23', 'U20', 'U18', 'U15', 'U13'] },
                        gender: { type: 'string', enum: ['MALE', 'FEMALE', 'MIXED'] },
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
                        name: { type: 'string' },
                        team_id: { type: 'string', format: 'uuid' },
                        photo: { type: 'string', format: 'uri' },
                        position: { type: 'string' },
                        squad_number: { type: 'integer' },
                        date_of_birth: { type: 'string', format: 'date' },
                        nationality: { type: 'string' },
                        height: { type: 'integer' },
                        weight: { type: 'integer' },
                        bio: { type: 'string' },
                        is_active: { type: 'boolean', default: true },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Venue: {
                    type: 'object',
                    required: ['name', 'address'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        address: { type: 'string' },
                        latitude: { type: 'number', format: 'float' },
                        longitude: { type: 'number', format: 'float' },
                        capacity: { type: 'integer' },
                        surface: { type: 'string', enum: ['GRASS', 'ARTIFICIAL', 'HYBRID', 'INDOOR'] },
                        photo: { type: 'string', format: 'uri' },
                        amenities: { type: 'array', items: { type: 'string' } },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        error: { type: 'string' },
                    },
                },
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: { type: 'object' },
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
    apis: ['./src/modules/**/*.ts', './src/modules/**/*.route.ts'],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map