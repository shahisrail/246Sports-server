import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import {
  apiRateLimit,
  publicRateLimit,
} from "./middleware/rateLimit.middleware";
import { setupTenantContext } from "./middleware/tenant.middleware";
import { httpLogger } from "./utils/logger";
import v1Routes from "./routes/v1.routes";
import { healthCheck, rootEndpoint } from "./controllers/system.controller";

dotenv.config();

const app: Application = express();

// Trust proxy (Coolify / reverse proxy)
app.set("trust proxy", 1);

// CORS headers (preflight)
app.use((req, res, next): void => {
  res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Tenant-ID"
  );
  res.header("Access-Control-Expose-Headers", "X-Total-Count, X-Page, X-Limit");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Security
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

// Logger
app.use(httpLogger as any);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limit
app.use("/api/v1/auth", publicRateLimit);
app.use("/api/v1/search", apiRateLimit);
app.use("/api", apiRateLimit);

// Tenant
app.use("/api/v1", setupTenantContext as any);

// Routes
app.get("/health", healthCheck);
app.get("/", rootEndpoint);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1", v1Routes);

// Errors
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
