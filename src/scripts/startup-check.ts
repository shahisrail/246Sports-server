#!/usr/bin/env ts-node

import dotenv from "dotenv";
import { Pool } from "pg";
import { ensureDatabaseSetup } from "../config/database-init";

dotenv.config();

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

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
  });

  try {
    console.log("🔌 Connecting to database...");
    await pool.query("SELECT 1");
    console.log("✅ Database connection OK");
    console.log("");

    console.log("🔍 Checking tables...");
    const setupSuccess = await ensureDatabaseSetup(pool);

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
    } else {
      console.error("❌ Startup check FAILED");
      process.exit(1);
    }

  } catch (error: any) {
    console.error("❌ Startup check FAILED:");
    console.error(error?.message || error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

startupCheck();
