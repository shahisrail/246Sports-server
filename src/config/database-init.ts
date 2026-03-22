import { Pool } from "pg";
import fs from "fs";
import path from "path";

export async function checkTablesExist(pool: Pool): Promise<boolean> {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);
    return result.rows[0].exists;
  } catch (error) {
    console.error("❌ Error checking tables:", error);
    return false;
  }
}

export async function initializeDatabase(pool: Pool): Promise<void> {
  try {
    console.log("🔧 Initializing database tables...");

    // Get the schema file path relative to the current file
    const schemaPath = path.join(__dirname, "../../database/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    await pool.query(schema);

    console.log("✅ Database tables created successfully!");

    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`📊 Created ${result.rows.length} tables`);

  } catch (error: any) {
    console.error("❌ Error initializing database:", error?.message || error);
    throw error;
  }
}

export async function ensureDatabaseSetup(pool: Pool): Promise<boolean> {
  try {
    const tablesExist = await checkTablesExist(pool);

    if (tablesExist) {
      console.log("✅ Database tables already exist");
      return true;
    } else {
      console.log("⚠️  Database tables not found");
      console.log("🔧 Creating tables...");
      await initializeDatabase(pool);
      return true;
    }
  } catch (error) {
    console.error("❌ Failed to ensure database setup:", error);
    return false;
  }
}
