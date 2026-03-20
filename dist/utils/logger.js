"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = exports.auditLogger = exports.httpLogger = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const logDir = process.env.LOG_DIR || 'logs';
/**
 * Winston Logger Configuration
 * Provides structured logging with different levels and transports
 */
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json());
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: 'HH:mm:ss' }), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
        msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
}));
// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Create logger instance
exports.logger = winston_1.default.createLogger({
    levels,
    format: logFormat,
    defaultMeta: {
        service: '246sports-api',
        environment: process.env.NODE_ENV || 'development',
    },
    transports: [
        // Error log file
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 10485760, // 10MB
            maxFiles: 5,
        }),
        // Combined log file
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, 'combined.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 5,
        }),
    ],
    // Handle exceptions and rejections
    exceptionHandlers: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, 'exceptions.log'),
        }),
    ],
    rejectionHandlers: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, 'rejections.log'),
        }),
    ],
});
// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
    exports.logger.add(new winston_1.default.transports.Console({
        format: consoleFormat,
        level: 'debug',
    }));
}
// Production console transport (less verbose)
if (process.env.NODE_ENV === 'production') {
    exports.logger.add(new winston_1.default.transports.Console({
        format: consoleFormat,
        level: 'info',
    }));
}
/**
 * Request logging middleware for HTTP requests
 */
const httpLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { method, url, ip } = req;
        const { statusCode } = res;
        const logData = {
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            ip,
            user: req.user?.userId || 'anonymous',
            userAgent: req.get('user-agent'),
        };
        if (statusCode >= 400) {
            exports.logger.warn('HTTP Request', logData);
        }
        else {
            exports.logger.http('HTTP Request', logData);
        }
    });
    next();
};
exports.httpLogger = httpLogger;
/**
 * Audit logging for important actions
 */
const auditLogger = (action, entity, userId, details) => {
    exports.logger.info('Audit Log', {
        audit: true,
        action,
        entity,
        userId,
        timestamp: new Date().toISOString(),
        ...details,
    });
};
exports.auditLogger = auditLogger;
/**
 * Error logging helper
 */
const errorLogger = (error, context) => {
    exports.logger.error('Error occurred', {
        message: error.message,
        stack: error.stack,
        ...context,
    });
};
exports.errorLogger = errorLogger;
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map