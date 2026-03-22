"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTablesExist = checkTablesExist;
exports.checkDefaultUserExists = checkDefaultUserExists;
exports.createDefaultAdminUser = createDefaultAdminUser;
exports.initializeDatabase = initializeDatabase;
exports.ensureDatabaseSetup = ensureDatabaseSetup;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bcrypt = __importStar(require("bcrypt"));
const uuid_1 = require("uuid");
async function checkTablesExist(pool) {
    try {
        const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);
        return result.rows[0].exists;
    }
    catch (error) {
        console.error("❌ Error checking tables:", error);
        return false;
    }
}
async function checkDefaultUserExists(pool) {
    try {
        const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM users
        WHERE role = 'SUPER_ADMIN'
        AND deleted_at IS NULL
      );
    `);
        return result.rows[0].exists;
    }
    catch (error) {
        console.error("❌ Error checking default user:", error);
        return false;
    }
}
async function createDefaultAdminUser(pool) {
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
            id: (0, uuid_1.v4)(),
            name: "Super Admin",
            email: "admin@246sports.com",
            password: await bcrypt.hash("Admin@246", 10), // Default password
            role: "SUPER_ADMIN",
            association_id: null,
            club_id: null,
        };
        await pool.query(`INSERT INTO users (id, name, email, password, role, association_id, club_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
            defaultAdmin.id,
            defaultAdmin.name,
            defaultAdmin.email,
            defaultAdmin.password,
            defaultAdmin.role,
            defaultAdmin.association_id,
            defaultAdmin.club_id,
        ]);
        console.log("✅ Default admin user created successfully!");
        console.log("");
        console.log("🔐 Default Admin Credentials:");
        console.log("   Email:    admin@246sports.com");
        console.log("   Password: Admin@246");
        console.log("");
        console.log("⚠️  IMPORTANT: Change this password after first login!");
        console.log("");
    }
    catch (error) {
        console.error("❌ Error creating default admin user:", error?.message || error);
        throw error;
    }
}
async function initializeDatabase(pool) {
    try {
        console.log("🔧 Initializing database tables...");
        // Get the schema file path relative to the current file
        const schemaPath = path_1.default.join(__dirname, "../../database/schema.sql");
        const schema = fs_1.default.readFileSync(schemaPath, "utf8");
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
    }
    catch (error) {
        console.error("❌ Error initializing database:", error?.message || error);
        throw error;
    }
}
async function ensureDatabaseSetup(pool) {
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
        }
        else {
            console.log("⚠️  Database tables not found");
            console.log("🔧 Creating tables...");
            await initializeDatabase(pool);
            return true;
        }
    }
    catch (error) {
        console.error("❌ Failed to ensure database setup:", error);
        return false;
    }
}
//# sourceMappingURL=database-init.js.map