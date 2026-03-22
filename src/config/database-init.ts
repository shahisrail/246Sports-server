import { Pool } from "pg";
import fs from "fs";
import path from "path";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

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

export async function checkDefaultUserExists(pool: Pool): Promise<boolean> {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM users
        WHERE role = 'SUPER_ADMIN'
        AND deleted_at IS NULL
      );
    `);
    return result.rows[0].exists;
  } catch (error) {
    console.error("❌ Error checking default user:", error);
    return false;
  }
}

export async function createDefaultAdminUser(pool: Pool): Promise<void> {
  try {
    console.log("👤 Creating default admin user...");

    // Check if admin already exists
    const adminExists = await checkDefaultUserExists(pool);
    if (adminExists) {
      console.log("✅ Admin user already exists");
      return;
    }

    // Default admin credentials
    const defaultAdmin = {
      id: uuidv4(),
      name: "Super Admin",
      email: "admin@246sports.com",
      password: await bcrypt.hash("Admin@246", 10), // Default password
      role: "SUPER_ADMIN",
      association_id: null,
      club_id: null,
    };

    await pool.query(
      `INSERT INTO users (id, name, email, password, role, association_id, club_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        defaultAdmin.id,
        defaultAdmin.name,
        defaultAdmin.email,
        defaultAdmin.password,
        defaultAdmin.role,
        defaultAdmin.association_id,
        defaultAdmin.club_id,
      ]
    );

    console.log("✅ Default admin user created successfully!");
    console.log("");
    console.log("🔐 Default Admin Credentials:");
    console.log("   Email:    admin@246sports.com");
    console.log("   Password: Admin@246");
    console.log("");
    console.log("⚠️  IMPORTANT: Change this password after first login!");
    console.log("");

  } catch (error: any) {
    console.error("❌ Error creating default admin user:", error?.message || error);
    throw error;
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

    // Create default admin user
    await createDefaultAdminUser(pool);

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

      // Check if default admin user exists
      const adminExists = await checkDefaultUserExists(pool);
      if (!adminExists) {
        console.log("⚠️  No admin user found, creating default admin...");
        await createDefaultAdminUser(pool);
      }

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
