import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// ❌ DO NOT EXIT (IMPORTANT)
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing!");
  console.log("⚠️ Continuing without DB...");
}

const isProduction = process.env.NODE_ENV === "production";

export const pool = new Pool({
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

export const initDatabase = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();

    console.log("✅ Database connected successfully");
  } catch (error: any) {
    console.error("❌ Database connection failed:");
    console.error(error?.message || error);

    console.log("⚠️ Server will start without DB");
  }
};

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};