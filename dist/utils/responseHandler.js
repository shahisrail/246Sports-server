"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginatedResponse = exports.errorResponse = exports.successResponse = void 0;
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
exports.successResponse = successResponse;
const errorResponse = (res, message = 'An error occurred', statusCode = 500, error) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(error && { error }),
    });
};
exports.errorResponse = errorResponse;
const paginatedResponse = (res, data, page, limit, total, message = 'Success') => {
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            page,
            limit,
            total,
            total_pages: totalPages,
        },
    });
};
exports.paginatedResponse = paginatedResponse;
//# sourceMappingURL=responseHandler.js.map