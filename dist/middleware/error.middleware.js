"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const responseHandler_1 = require("../utils/responseHandler");
const errorHandler = (err, _req, res, _next) => {
    console.error('Error:', err);
    // Handle specific error types
    if (err.name === 'ValidationError') {
        (0, responseHandler_1.errorResponse)(res, err.message, 400, 'VALIDATION_ERROR');
        return;
    }
    if (err.name === 'UnauthorizedError') {
        (0, responseHandler_1.errorResponse)(res, 'Unauthorized access', 401, 'UNAUTHORIZED');
        return;
    }
    if (err.name === 'ForbiddenError') {
        (0, responseHandler_1.errorResponse)(res, 'Access forbidden', 403, 'FORBIDDEN');
        return;
    }
    if (err.name === 'NotFoundError') {
        (0, responseHandler_1.errorResponse)(res, 'Resource not found', 404, 'NOT_FOUND');
        return;
    }
    // Default error response
    (0, responseHandler_1.errorResponse)(res, process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message, 500, 'INTERNAL_ERROR');
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, _next) => {
    (0, responseHandler_1.errorResponse)(res, `Route ${req.originalUrl} not found`, 404, 'NOT_FOUND');
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=error.middleware.js.map