"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePagination = exports.sanitizeInput = exports.isValidCoordinates = exports.isValidDate = exports.isValidPhone = exports.isValidUUID = exports.isValidPassword = exports.isValidEmail = void 0;
// Email validation regex
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
// Password validation (min 8 characters, at least one uppercase, one lowercase, one number)
const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};
exports.isValidPassword = isValidPassword;
// UUID validation
const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};
exports.isValidUUID = isValidUUID;
// Phone number validation (Barbados format)
const isValidPhone = (phone) => {
    const phoneRegex = /^(\+1246|1246)?[2-9]\d{2}-\d{4}$/;
    return phoneRegex.test(phone);
};
exports.isValidPhone = isValidPhone;
// Date validation
const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
};
exports.isValidDate = isValidDate;
// Coordinates validation
const isValidCoordinates = (lat, lng) => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};
exports.isValidCoordinates = isValidCoordinates;
// Sanitize input (remove HTML tags)
const sanitizeInput = (input) => {
    return input.replace(/<[^>]*>/g, '').trim();
};
exports.sanitizeInput = sanitizeInput;
// Validate pagination parameters
const validatePagination = (page, limit) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    return {
        page: Math.max(1, pageNum),
        limit: Math.min(100, Math.max(1, limitNum)), // Max 100 items per page
    };
};
exports.validatePagination = validatePagination;
//# sourceMappingURL=validator.js.map