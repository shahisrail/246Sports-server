import rateLimit from 'express-rate-limit';

/**
 * Rate Limiting Middleware
 * Protects against brute force attacks and API abuse
 */

// General API rate limit
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: any) => {
    // Use IP + user ID for authenticated users
    return req.user?.userId
      ? `user:${req.user.userId}`
      : `ip:${req.socket.remoteAddress}`;
  },
});

// Strict rate limit for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
    error: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Moderate rate limit for write operations (POST, PUT, DELETE)
export const writeRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // 30 write operations per window
  message: {
    success: false,
    message: 'Too many write operations, please slow down.',
    error: 'WRITE_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Search rate limit
export const searchRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 searches per minute
  message: {
    success: false,
    message: 'Too many search requests, please slow down.',
    error: 'SEARCH_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public API rate limit (for unauthenticated requests)
export const publicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window for public users
  message: {
    success: false,
    message: 'Too many requests, please authenticate for higher limits.',
    error: 'PUBLIC_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: any) => {
    // Skip if user is authenticated
    return !!req.user;
  },
});

/**
 * Custom rate limiter for expensive operations
 * @param requests - Number of requests allowed
 * @param windowMs - Time window in milliseconds
 */
export const createCustomRateLimit = (requests: number, windowMs: number) => {
  return rateLimit({
    windowMs,
    max: requests,
    message: {
      success: false,
      message: `Rate limit exceeded: ${requests} requests per ${windowMs / 1000} seconds`,
      error: 'CUSTOM_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};
