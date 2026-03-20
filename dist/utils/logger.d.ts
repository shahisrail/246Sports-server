import winston from 'winston';
export declare const logger: winston.Logger;
/**
 * Request logging middleware for HTTP requests
 */
export declare const httpLogger: (req: any, res: any, next: any) => void;
/**
 * Audit logging for important actions
 */
export declare const auditLogger: (action: string, entity: string, userId: string, details: any) => void;
/**
 * Error logging helper
 */
export declare const errorLogger: (error: Error, context?: any) => void;
export default logger;
//# sourceMappingURL=logger.d.ts.map