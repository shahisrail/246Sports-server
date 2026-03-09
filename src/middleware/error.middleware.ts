import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/responseHandler';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    errorResponse(res, err.message, 400, 'VALIDATION_ERROR');
    return;
  }

  if (err.name === 'UnauthorizedError') {
    errorResponse(res, 'Unauthorized access', 401, 'UNAUTHORIZED');
    return;
  }

  if (err.name === 'ForbiddenError') {
    errorResponse(res, 'Access forbidden', 403, 'FORBIDDEN');
    return;
  }

  if (err.name === 'NotFoundError') {
    errorResponse(res, 'Resource not found', 404, 'NOT_FOUND');
    return;
  }

  // Default error response
  errorResponse(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    500,
    'INTERNAL_ERROR'
  );
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  errorResponse(res, `Route ${req.originalUrl} not found`, 404, 'NOT_FOUND');
};
