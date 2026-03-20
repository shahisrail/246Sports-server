"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.initDatabase = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ❌ DO NOT EXIT (IMPORTANT)
if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is missing!");
    console.log("⚠️ Continuing without DB...");
}
const isProduction = process.env.NODE_ENV === "production";
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction
        ? {
            rejectUnauthorized: false,
        }
        : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});
const initDatabase = async () => {
    try {
        const client = await exports.pool.connect();
        await client.query("SELECT 1");
        client.release();
        console.log("✅ Database connected successfully");
    }
    catch (error) {
        console.error("❌ Database connection failed:");
        console.error(error?.message || error);
        console.log("⚠️ Server will start without DB");
    }
};
exports.initDatabase = initDatabase;
const query = (text, params) => {
    return exports.pool.query(text, params);
};
exports.query = query;
//# sourceMappingURL=database.js.map