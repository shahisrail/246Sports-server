import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/responseHandler';
import { isValidEmail, isValidPassword, isValidUUID } from '../utils/validator';

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    errorResponse(res, 'Missing required fields', 400, 'VALIDATION_ERROR');
    return;
  }

  if (!isValidEmail(email)) {
    errorResponse(res, 'Invalid email format', 400, 'VALIDATION_ERROR');
    return;
  }

  if (!isValidPassword(password)) {
    errorResponse(
      res,
      'Password must be at least 8 characters with uppercase, lowercase, and number',
      400,
      'VALIDATION_ERROR'
    );
    return;
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    errorResponse(res, 'Email and password are required', 400, 'VALIDATION_ERROR');
    return;
  }

  if (!isValidEmail(email)) {
    errorResponse(res, 'Invalid email format', 400, 'VALIDATION_ERROR');
    return;
  }

  next();
};

export const validateUUID = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName] as string;

    if (!id || !isValidUUID(id)) {
      errorResponse(res, `Invalid ${paramName}`, 400, 'VALIDATION_ERROR');
      return;
    }

    next();
  };
};

export const validateCreateClub = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const {
    name,
    association_id,
    associationId,
    founded_year,
    foundedYear,
    colors,
    website,
    websiteUrl,
    contact_email,
    contactEmail,
    contact_phone,
    contactPhone
  } = req.body;

  // Extract fields (support both camelCase and snake_case)
  const finalAssociationId = association_id || associationId;
  const finalFoundedYear = founded_year || foundedYear;
  const finalWebsite = website || websiteUrl;
  const finalContactEmail = contact_email || contactEmail;
  const finalContactPhone = contact_phone || contactPhone;

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errorResponse(res, 'Club name is required', 400, 'VALIDATION_ERROR');
    return;
  }

  if (!finalAssociationId || !isValidUUID(finalAssociationId)) {
    errorResponse(res, 'Valid association ID is required', 400, 'VALIDATION_ERROR');
    return;
  }

  // Prevent placeholder values
  if (name === 'string' || name.trim().toLowerCase() === 'string') {
    errorResponse(res, 'Club name cannot be "string"', 400, 'VALIDATION_ERROR');
    return;
  }

  // Validate founded_year if provided
  if (finalFoundedYear !== undefined && finalFoundedYear !== null) {
    const year = Number(finalFoundedYear);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1800 || year > currentYear + 1) {
      errorResponse(
        res,
        `Founded year must be between 1800 and ${currentYear + 1}`,
        400,
        'VALIDATION_ERROR'
      );
      return;
    }
  }

  // Validate contact_email if provided
  if (finalContactEmail && !isValidEmail(finalContactEmail)) {
    errorResponse(res, 'Invalid contact email format', 400, 'VALIDATION_ERROR');
    return;
  }

  // Validate website if provided
  if (finalWebsite && typeof finalWebsite === 'string' && finalWebsite.trim().length > 0) {
    try {
      new URL(finalWebsite.startsWith('http') ? finalWebsite : `https://${finalWebsite}`);
    } catch {
      errorResponse(res, 'Invalid website URL format', 400, 'VALIDATION_ERROR');
      return;
    }
  }

  // Validate colors array if provided
  if (colors !== undefined && colors !== null) {
    if (!Array.isArray(colors)) {
      errorResponse(res, 'Colors must be an array', 400, 'VALIDATION_ERROR');
      return;
    }

    // Validate each color is a valid hex code
    for (const color of colors) {
      if (typeof color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
        errorResponse(
          res,
          'Colors must be valid hex codes (e.g., #FF0000)',
          400,
          'VALIDATION_ERROR'
        );
        return;
      }
    }
  }

  // Validate contact_phone format if provided (basic validation)
  if (finalContactPhone && typeof finalContactPhone === 'string') {
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(finalContactPhone.trim()) || finalContactPhone.trim().length < 7) {
      errorResponse(res, 'Invalid contact phone number format', 400, 'VALIDATION_ERROR');
      return;
    }
  }

  next();
};
