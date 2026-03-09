import winston from 'winston';
import path from 'path';

const logDir = process.env.LOG_DIR || 'logs';

/**
 * Winston Logger Configuration
 * Provides structured logging with different levels and transports
 */

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Create logger instance
export const logger = winston.createLogger({
  levels,
  format: logFormat,
  defaultMeta: {
    service: '246sports-api',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug',
    })
  );
}

// Production console transport (less verbose)
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'info',
    })
  );
}

/**
 * Request logging middleware for HTTP requests
 */
export const httpLogger = (req: any, res: any, next: any) => {
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
      logger.warn('HTTP Request', logData);
    } else {
      logger.http('HTTP Request', logData);
    }
  });

  next();
};

/**
 * Audit logging for important actions
 */
export const auditLogger = (
  action: string,
  entity: string,
  userId: string,
  details: any
) => {
  logger.info('Audit Log', {
    audit: true,
    action,
    entity,
    userId,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

/**
 * Error logging helper
 */
export const errorLogger = (error: Error, context?: any) => {
  logger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

export default logger;
