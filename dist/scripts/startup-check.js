#!/usr/bin/env ts-node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
const database_init_1 = require("../config/database-init");
dotenv_1.default.config();
const PORT = Number(process.env.PORT) || 4000;
async function startupCheck() {
    console.log("🔍 246Sports Startup Check");
    console.log("=".repeat(40));
    console.log("");
    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL is missing!");
        console.error("Please check your .env file");
        process.exit(1);
    }
    const pool = new pg_1.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false,
    });
    try {
        console.log("🔌 Connecting to database...");
        await pool.query("SELECT 1");
        console.log("✅ Database connection OK");
        console.log("");
        console.log("🔍 Checking tables...");
        const setupSuccess = await (0, database_init_1.ensureDatabaseSetup)(pool);
        if (setupSuccess) {
            console.log("");
            console.log("=".repeat(40));
            console.log("✅ Startup check PASSED");
            console.log("");
            console.log(`🚀 Ready to start server on port ${PORT}`);
            console.log("");
            console.log("Run: npm start");
            console.log("=".repeat(40));
            process.exit(0);
        }
        else {
            console.error("❌ Startup check FAILED");
            process.exit(1);
        }
    }
    catch (error) {
        console.error("❌ Startup check FAILED:");
        console.error(error?.message || error);
        process.exit(1);
    }
    finally {
        await pool.end();
    }
}
startupCheck();
//# sourceMappingURL=startup-check.js.map