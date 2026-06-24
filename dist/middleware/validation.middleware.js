"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateClub = exports.validateUUID = exports.validateLogin = exports.validateRegister = void 0;
const responseHandler_1 = require("../utils/responseHandler");
const validator_1 = require("../utils/validator");
const validateRegister = (req, res, next) => {
    const { name, firstName, lastName, email, password, role } = req.body;
    const finalName = name || [firstName, lastName].filter(Boolean).join(' ').trim();
    if (!finalName || !email || !password || !role) {
        (0, responseHandler_1.errorResponse)(res, 'Missing required fields', 400, 'VALIDATION_ERROR');
        return;
    }
    if (!(0, validator_1.isValidEmail)(email)) {
        (0, responseHandler_1.errorResponse)(res, 'Invalid email format', 400, 'VALIDATION_ERROR');
        return;
    }
    if (!(0, validator_1.isValidPassword)(password)) {
        (0, responseHandler_1.errorResponse)(res, 'Password must be at least 8 characters with uppercase, lowercase, and number', 400, 'VALIDATION_ERROR');
        return;
    }
    next();
};
exports.validateRegister = validateRegister;
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        (0, responseHandler_1.errorResponse)(res, 'Email and password are required', 400, 'VALIDATION_ERROR');
        return;
    }
    if (!(0, validator_1.isValidEmail)(email)) {
        (0, responseHandler_1.errorResponse)(res, 'Invalid email format', 400, 'VALIDATION_ERROR');
        return;
    }
    next();
};
exports.validateLogin = validateLogin;
const validateUUID = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (!id || !(0, validator_1.isValidUUID)(id)) {
            (0, responseHandler_1.errorResponse)(res, `Invalid ${paramName}`, 400, 'VALIDATION_ERROR');
            return;
        }
        next();
    };
};
exports.validateUUID = validateUUID;
const validateCreateClub = (req, res, next) => {
    const { name, association_id, associationId, founded_year, foundedYear, colors, website, websiteUrl, contact_email, contactEmail, contact_phone, contactPhone } = req.body;
    // Extract fields (support both camelCase and snake_case)
    const finalAssociationId = association_id || associationId;
    const finalFoundedYear = founded_year || foundedYear;
    const finalWebsite = website || websiteUrl;
    const finalContactEmail = contact_email || contactEmail;
    const finalContactPhone = contact_phone || contactPhone;
    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        (0, responseHandler_1.errorResponse)(res, 'Club name is required', 400, 'VALIDATION_ERROR');
        return;
    }
    if (!finalAssociationId || !(0, validator_1.isValidUUID)(finalAssociationId)) {
        (0, responseHandler_1.errorResponse)(res, 'Valid association ID is required', 400, 'VALIDATION_ERROR');
        return;
    }
    // Prevent placeholder values
    if (name === 'string' || name.trim().toLowerCase() === 'string') {
        (0, responseHandler_1.errorResponse)(res, 'Club name cannot be "string"', 400, 'VALIDATION_ERROR');
        return;
    }
    // Validate founded_year if provided
    if (finalFoundedYear !== undefined && finalFoundedYear !== null) {
        const year = Number(finalFoundedYear);
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1800 || year > currentYear + 1) {
            (0, responseHandler_1.errorResponse)(res, `Founded year must be between 1800 and ${currentYear + 1}`, 400, 'VALIDATION_ERROR');
            return;
        }
    }
    // Validate contact_email if provided
    if (finalContactEmail && !(0, validator_1.isValidEmail)(finalContactEmail)) {
        (0, responseHandler_1.errorResponse)(res, 'Invalid contact email format', 400, 'VALIDATION_ERROR');
        return;
    }
    // Validate website if provided
    if (finalWebsite && typeof finalWebsite === 'string' && finalWebsite.trim().length > 0) {
        try {
            new URL(finalWebsite.startsWith('http') ? finalWebsite : `https://${finalWebsite}`);
        }
        catch {
            (0, responseHandler_1.errorResponse)(res, 'Invalid website URL format', 400, 'VALIDATION_ERROR');
            return;
        }
    }
    // Validate colors array if provided
    if (colors !== undefined && colors !== null) {
        if (!Array.isArray(colors)) {
            (0, responseHandler_1.errorResponse)(res, 'Colors must be an array', 400, 'VALIDATION_ERROR');
            return;
        }
        // Validate each color is a valid hex code
        for (const color of colors) {
            if (typeof color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
                (0, responseHandler_1.errorResponse)(res, 'Colors must be valid hex codes (e.g., #FF0000)', 400, 'VALIDATION_ERROR');
                return;
            }
        }
    }
    // Validate contact_phone format if provided (basic validation)
    if (finalContactPhone && typeof finalContactPhone === 'string') {
        const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
        if (!phoneRegex.test(finalContactPhone.trim()) || finalContactPhone.trim().length < 7) {
            (0, responseHandler_1.errorResponse)(res, 'Invalid contact phone number format', 400, 'VALIDATION_ERROR');
            return;
        }
    }
    next();
};
exports.validateCreateClub = validateCreateClub;
//# sourceMappingURL=validation.middleware.js.map