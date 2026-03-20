import { Pool, PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// Pool configuration
const poolConfig: PoolConfig = process.env.DATABASE_URL
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
export const pool = new Pool({
  ...poolConfig,
  max: 20,  
  idleTimeoutMillis: 30000,  
  connectionTimeoutMillis: 10000,  
});

// Initialize database connection
export const initDatabase = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1"); // test query
    client.release();

    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    // process.exit(1);
  }
};

// Query helper
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};
