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
exports.ensureSchemaUpdates = ensureSchemaUpdates;
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
async function ensureSchemaUpdates(pool) {
    try {
        console.log("🔄 Checking for database schema updates...");
        // 1. Fix teams table missing columns (Fixes 500 errors in teams module)
        const teamsColumns = [
            { name: 'competition_id', type: 'UUID REFERENCES competitions(id) ON DELETE SET NULL' },
            { name: 'abbreviation', type: 'VARCHAR(20)' },
            { name: 'founded_year', type: 'INTEGER' },
            { name: 'colors', type: 'TEXT[]' },
            { name: 'description', type: 'TEXT' },
            { name: 'website', type: 'TEXT' },
            { name: 'contact_email', type: 'VARCHAR(255)' },
            { name: 'contact_phone', type: 'VARCHAR(50)' }
        ];
        for (const col of teamsColumns) {
            try {
                await pool.query(`ALTER TABLE teams ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
            }
            catch (err) {
                if (err.code !== '42701')
                    throw err; // Ignore duplicate column
            }
        }
        // 2. Ensure missing tables exist
        const missingTables = [
            `CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token UUID NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
            `CREATE TABLE IF NOT EXISTS team_users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        assigned_by UUID REFERENCES users(id)
      )`,
            `CREATE TABLE IF NOT EXISTS player_sports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
        position_id UUID REFERENCES sport_positions(id),
        is_primary BOOLEAN DEFAULT false,
        jersey_number INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
            `CREATE TABLE IF NOT EXISTS user_invitations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) NOT NULL,
        association_id UUID REFERENCES associations(id),
        club_id UUID REFERENCES clubs(id),
        invited_by UUID NOT NULL REFERENCES users(id),
        token UUID NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        accepted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
        ];
        for (const tableQuery of missingTables) {
            await pool.query(tableQuery);
        }
        // 3. Add other missing columns found during sync
        const otherUpdates = [
            'ALTER TABLE seasons ADD COLUMN IF NOT EXISTS year VARCHAR(20)',
            'ALTER TABLE seasons ADD COLUMN IF NOT EXISTS status VARCHAR(50)',
            'ALTER TABLE results ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP',
            'ALTER TABLE results ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES users(id)',
            'ALTER TABLE news ADD COLUMN IF NOT EXISTS sport_id_new UUID',
            'ALTER TABLE sports ADD COLUMN IF NOT EXISTS category VARCHAR(100)',
            'ALTER TABLE sports ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false',
            'ALTER TABLE sports ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0',
            'ALTER TABLE sports ADD COLUMN IF NOT EXISTS metadata JSONB',
            'ALTER TABLE sports ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP',
            'ALTER TABLE players ADD COLUMN IF NOT EXISTS sport_id UUID REFERENCES sports(id)'
        ];
        for (const updateQuery of otherUpdates) {
            try {
                await pool.query(updateQuery);
            }
            catch (err) {
                if (err.code !== '42701')
                    throw err;
            }
        }
        console.log("✅ Database schema is up to date");
    }
    catch (error) {
        console.error("❌ Error updating database schema:", error?.message || error);
        // We don't throw here to avoid stopping the server if it's already in a workable state
        // but we log it as a major error
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
            // ALWAYS run schema updates to ensure production is in sync
            await ensureSchemaUpdates(pool);
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