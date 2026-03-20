"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const error_middleware_1 = require("./middleware/error.middleware");
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
const tenant_middleware_1 = require("./middleware/tenant.middleware");
const logger_1 = require("./utils/logger");
const v1_routes_1 = __importDefault(require("./routes/v1.routes"));
const system_controller_1 = require("./controllers/system.controller");
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
// Trust proxy for rate limiting behind reverse proxies
app.set('trust proxy', 1);
// Handle preflight requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-ID');
    res.header('Access-Control-Expose-Headers', 'X-Total-Count, X-Page, X-Limit');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
});
// Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],
}));
// HTTP request logging
app.use(logger_1.httpLogger);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Debug middleware for API requests - check body parsing
app.use('/api', (req, _res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('========================================');
        console.log(`API REQUEST: ${req.method} ${req.path}`);
        console.log('Content-Type:', req.headers['content-type']);
        console.log('Raw body:', JSON.stringify(req.body, null, 2));
        console.log('========================================');
    }
    next();
});
// Rate limiting
app.use('/api/v1/auth', rateLimit_middleware_1.publicRateLimit); // Stricter for auth
app.use('/api/v1/search', rateLimit_middleware_1.apiRateLimit); // Search rate limiting
app.use('/api', rateLimit_middleware_1.apiRateLimit); // General API rate limiting
// Tenant context setup (must be before routes)
app.use('/api/v1', tenant_middleware_1.setupTenantContext);
// System endpoints
app.get('/health', system_controller_1.healthCheck);
app.get('/', system_controller_1.rootEndpoint);
// API Documentation (Swagger)
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// API Routes (v1)
app.use('/api/v1', v1_routes_1.default);
// Error handling (must be last)
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map