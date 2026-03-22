import { Pool } from "pg";
import dotenv from "dotenv";
import { ensureDatabaseSetup } from "./database-init";

dotenv.config();

// ❌ DO NOT EXIT (important for Coolify)
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing!");
  console.log("⚠️ Continuing without DB...");
}

// ✅ NO SSL for Coolify local Postgres
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,

  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // faster fail
});

// ✅ safe DB init (non-blocking + timeout + auto-create tables)
export const initDatabase = async (): Promise<void> => {
  try {
    const client: any = await Promise.race([
      pool.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB connection timeout")), 5000)
      ),
    ]);

    await client.query("SELECT 1");
    client.release();

    console.log("✅ Database connected successfully");

    // 🎯 AUTO-CHECK: Create tables if they don't exist
    await ensureDatabaseSetup(pool);

  } catch (error: any) {
    console.error("❌ Database connection failed:");
    console.error(error?.message || error);

    console.log("⚠️ Skipping DB, server will still run");
  }
};

// ✅ query helper
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};