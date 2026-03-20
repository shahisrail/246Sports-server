export declare const apiRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const writeRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const searchRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const publicRateLimit: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Custom rate limiter for expensive operations
 * @param requests - Number of requests allowed
 * @param windowMs - Time window in milliseconds
 */
export declare const createCustomRateLimit: (requests: number, windowMs: number) => import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimit.middleware.d.ts.map