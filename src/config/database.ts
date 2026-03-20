import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Ensure DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing!");
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === "production";

// Create pool (ONLY DATABASE_URL)
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

// Initialize database connection
export const initDatabase = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();

    console.log("✅ Database connected successfully");
  } catch (error: any) {
    console.error("❌ Database connection failed:");
    console.error(error?.message || error);

    // ❗ DO NOT crash container (important for Coolify)
    console.log("⚠️ Server will start without DB connection");
  }
};

// Query helper
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};
