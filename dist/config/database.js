"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.initDatabase = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const isProduction = process.env.NODE_ENV === "production";
// Pool configuration
const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: isProduction
            ? {
                rejectUnauthorized: false,
            }
            : false,
    }
    : {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432", 10),
        database: process.env.DB_NAME || "sports246",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
    };
// Create pool
exports.pool = new pg_1.Pool({
    ...poolConfig,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});
// Initialize database connection
const initDatabase = async () => {
    try {
        const client = await exports.pool.connect();
        await client.query("SELECT 1"); // test query
        client.release();
        console.log("✅ Database connected successfully");
    }
    catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
};
exports.initDatabase = initDatabase;
// Query helper
const query = (text, params) => {
    return exports.pool.query(text, params);
};
exports.query = query;
//# sourceMappingURL=database.js.map