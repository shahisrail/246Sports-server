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
dotenv_1.default.config();
const app = (0, express_1.default)();
// Trust proxy (Coolify / reverse proxy)
app.set("trust proxy", 1);
const defaultCorsOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "https://246sports.com",
    "https://www.246sports.com",
];
const configuredCorsOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const allowedCorsOrigins = Array.from(new Set([...defaultCorsOrigins, ...configuredCorsOrigins]));
const isCorsOriginAllowed = (origin) => {
    if (!origin)
        return true;
    return allowedCorsOrigins.includes("*") || allowedCorsOrigins.includes(origin);
};
const getCorsResponseOrigin = (origin) => {
    if (origin && isCorsOriginAllowed(origin))
        return origin;
    if (allowedCorsOrigins.includes("*"))
        return origin || "*";
    return allowedCorsOrigins[0];
};
// CORS headers (preflight)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (isCorsOriginAllowed(origin)) {
        res.header("Access-Control-Allow-Origin", getCorsResponseOrigin(origin));
    }
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Tenant-ID");
    res.header("Access-Control-Expose-Headers", "X-Total-Count, X-Page, X-Limit");
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
        return;
    }
    next();
});
// Security
app.use((0, helmet_1.default)({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
    crossOriginEmbedderPolicy: false,
}));
// CORS
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (isCorsOriginAllowed(origin)) {
            callback(null, getCorsResponseOrigin(origin));
            return;
        }
        callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true,
}));
// Logger
app.use(logger_1.httpLogger);
// Body parser
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Rate limit
app.use("/api/v1/auth", rateLimit_middleware_1.publicRateLimit);
app.use("/api/v1/search", rateLimit_middleware_1.apiRateLimit);
app.use("/api", rateLimit_middleware_1.apiRateLimit);
// Tenant
app.use("/api/v1", tenant_middleware_1.setupTenantContext);
// Routes
app.get("/health", system_controller_1.healthCheck);
app.get("/", system_controller_1.rootEndpoint);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
app.use("/api/v1", v1_routes_1.default);
// Errors
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map