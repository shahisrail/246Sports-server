import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiRateLimit, publicRateLimit } from './middleware/rateLimit.middleware';
import { setupTenantContext } from './middleware/tenant.middleware';
import { httpLogger } from './utils/logger';
import v1Routes from './routes/v1.routes';
import { healthCheck, rootEndpoint } from './controllers/system.controller';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Trust proxy for rate limiting behind reverse proxies
app.set('trust proxy', 1);

// Middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// HTTP request logging
app.use(httpLogger as any);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware for API requests - check body parsing
app.use('/api', (req, _res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('========================================');
    console.log(`API REQUEST: ${req.method} ${req.path}`);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Raw body:', JSON.stringify(req.body, null, 2));
    console.log('========================================');
  }
  next();
});

// Rate limiting
app.use('/api/v1/auth', publicRateLimit); // Stricter for auth
app.use('/api/v1/search', apiRateLimit); // Search rate limiting
app.use('/api', apiRateLimit); // General API rate limiting

// Tenant context setup (must be before routes)
app.use('/api/v1', setupTenantContext as any);

// System endpoints
app.get('/health', healthCheck);
app.get('/', rootEndpoint);

// API Documentation (Swagger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes (v1)
app.use('/api/v1', v1Routes);

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
