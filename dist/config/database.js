"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.initDatabase = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ❌ DO NOT EXIT (important for Coolify)
if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is missing!");
    console.log("⚠️ Continuing without DB...");
}
// ✅ NO SSL for Coolify local Postgres
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000, // faster fail
});
// ✅ safe DB init (non-blocking + timeout)
const initDatabase = async () => {
    try {
        const client = await Promise.race([
            exports.pool.connect(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("DB connection timeout")), 5000)),
        ]);
        await client.query("SELECT 1");
        client.release();
        console.log("✅ Database connected successfully");
    }
    catch (error) {
        console.error("❌ Database connection failed:");
        console.error(error?.message || error);
        console.log("⚠️ Skipping DB, server will still run");
    }
};
exports.initDatabase = initDatabase;
// ✅ query helper
const query = (text, params) => {
    return exports.pool.query(text, params);
};
exports.query = query;
//# sourceMappingURL=database.js.map