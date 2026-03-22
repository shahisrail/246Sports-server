"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTablesExist = checkTablesExist;
exports.initializeDatabase = initializeDatabase;
exports.ensureDatabaseSetup = ensureDatabaseSetup;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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