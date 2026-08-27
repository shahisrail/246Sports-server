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

export async function ensureSchemaUpdates(pool: Pool): Promise<void> {
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
      } catch (err: any) {
        if (err.code !== '42701') throw err; // Ignore duplicate column
      }
    }

    // 2. Ensure missing tables exist
    const missingTables = [
      // Videos table for media content
      `CREATE TABLE IF NOT EXISTS videos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        youtube_url VARCHAR(500) NOT NULL,
        thumbnail_url VARCHAR(500),
        sport VARCHAR(100),
        category VARCHAR(100) DEFAULT 'HIGHLIGHTS',
        event_date DATE,
        view_count INTEGER DEFAULT 0,
        is_published BOOLEAN DEFAULT false,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE
      )`,
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
      )`,
      `CREATE TABLE IF NOT EXISTS cms_pages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        page_key VARCHAR(100) NOT NULL UNIQUE,
        route_path VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
        content JSONB DEFAULT '{}',
        seo JSONB DEFAULT '{}',
        published_at TIMESTAMP,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS latest_updates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        sport VARCHAR(100),
        event_type VARCHAR(50) DEFAULT 'UPDATE',
        start_date DATE NOT NULL,
        end_date DATE,
        time VARCHAR(50),
        venue VARCHAR(255),
        location VARCHAR(255),
        home_team VARCHAR(255),
        away_team VARCHAR(255),
        source_file VARCHAR(255),
        source_type VARCHAR(50),
        confidence_score NUMERIC(4, 2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
        published_at TIMESTAMP,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
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
      'ALTER TABLE players ADD COLUMN IF NOT EXISTS sport_id UUID REFERENCES sports(id)',
      // Competition missing columns
      'ALTER TABLE competitions ADD COLUMN IF NOT EXISTS sport_id UUID REFERENCES sports(id)',
      'ALTER TABLE competitions ADD COLUMN IF NOT EXISTS sport VARCHAR(100)',
      'ALTER TABLE competitions ADD COLUMN IF NOT EXISTS format VARCHAR(100)',
      'ALTER TABLE competitions ADD COLUMN IF NOT EXISTS description TEXT',
      'ALTER TABLE competitions ADD COLUMN IF NOT EXISTS start_date DATE',
      'ALTER TABLE competitions ADD COLUMN IF NOT EXISTS end_date DATE',
      'ALTER TABLE competitions ADD COLUMN IF NOT EXISTS website TEXT',
      'ALTER TABLE competitions ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255)',
      'ALTER TABLE competitions ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50)',
      'ALTER TABLE competitions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP',
      // Email subscriptions missing columns
      'ALTER TABLE email_subscriptions DROP CONSTRAINT IF EXISTS email_subscriptions_email_key',
      'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS unsubscribe_token UUID DEFAULT uuid_generate_v4()',
      'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT \'{"news": true, "fixtures": true, "results": true}\'',
      'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS subscription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP',
      'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50)',
      'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP',
      'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT \'ACTIVE\'',
      'ALTER TABLE cms_pages ADD COLUMN IF NOT EXISTS route_path VARCHAR(255)',
      'ALTER TABLE cms_pages ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT \'DRAFT\'',
      'ALTER TABLE cms_pages ADD COLUMN IF NOT EXISTS content JSONB DEFAULT \'{}\'',
      'ALTER TABLE cms_pages ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT \'{}\'',
      'ALTER TABLE cms_pages ADD COLUMN IF NOT EXISTS published_at TIMESTAMP',
      'ALTER TABLE cms_pages ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id)',
      'ALTER TABLE cms_pages ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id)',
      'ALTER TABLE cms_pages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP',
      // We use a separate try-catch for constraints later or use a different approach
    ];

    for (const updateQuery of otherUpdates) {
      try {
        await pool.query(updateQuery);
      } catch (err: any) {
        // 42701: column already exists
        // 42P07: relation (table/index) already exists
        // 42710: duplicate_object (constraint already exists)
        // 42P16: duplicate_function or other invalid table definition errors
        const ignoredCodes = ['42701', '42P07', '42710', '42P16'];
        
        if (!ignoredCodes.includes(err.code)) {
          console.warn(`⚠️ Warning applying update: ${updateQuery}`);
          console.warn(`   Error: ${err.message} (Code: ${err.code})`);
        }
      }
    }

    // Add unique constraint separately to catch "already exists" error
    try {
      await pool.query('ALTER TABLE email_subscriptions ADD CONSTRAINT email_subscriptions_email_association_key UNIQUE (email, association_id)');
    } catch (err: any) {
      // 42710 is duplicate_object (for constraints)
      if (err.code !== '42710' && err.code !== '42P16') {
        console.warn('⚠️ Warning adding unique constraint to email_subscriptions:', err.message, `(Code: ${err.code})`);
      }
    }

    // 4. Create missing functions and views
    const additionalSchema = [
      `CREATE OR REPLACE FUNCTION is_subscribed_to_association(p_email TEXT, p_association_id UUID) 
       RETURNS BOOLEAN AS $$
       BEGIN
           RETURN EXISTS (
               SELECT 1 FROM email_subscriptions 
               WHERE LOWER(email) = LOWER(p_email) 
               AND association_id = p_association_id 
               AND status = 'ACTIVE'
               AND deleted_at IS NULL
           );
       END;
       $$ LANGUAGE plpgsql;`,

      `CREATE OR REPLACE FUNCTION unsubscribe_by_token(p_token UUID) 
       RETURNS BOOLEAN AS $$
       BEGIN
           UPDATE email_subscriptions 
           SET status = 'UNSUBSCRIBED', 
               unsubscribed_at = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE unsubscribe_token = p_token;
           
           RETURN FOUND;
       END;
       $$ LANGUAGE plpgsql;`,

      `CREATE OR REPLACE FUNCTION get_association_subscribers(p_association_id UUID) 
       RETURNS TABLE(id UUID, email VARCHAR, status VARCHAR, subscription_date TIMESTAMP, preferences JSONB) AS $$
       BEGIN
           RETURN QUERY 
           SELECT s.id, s.email, s.status, s.subscription_date, s.preferences
           FROM email_subscriptions s
           WHERE s.association_id = p_association_id
           AND s.deleted_at IS NULL;
       END;
       $$ LANGUAGE plpgsql;`,

      `CREATE OR REPLACE VIEW active_subscribers AS
       SELECT s.*, a.name as association_name
       FROM email_subscriptions s
       LEFT JOIN associations a ON s.association_id = a.id
       WHERE s.status = 'ACTIVE' AND s.deleted_at IS NULL;`
    ];

    for (const schemaQuery of additionalSchema) {
      try {
        await pool.query(schemaQuery);
      } catch (err: any) {
        console.error(`❌ Error creating schema object: ${err.message}`);
      }
    }

    const cmsIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_cms_pages_key ON cms_pages(page_key)',
      'CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON cms_pages(status)',
      'CREATE INDEX IF NOT EXISTS idx_cms_pages_route ON cms_pages(route_path)'
    ];

    for (const indexQuery of cmsIndexes) {
      try {
        await pool.query(indexQuery);
      } catch (err: any) {
        console.warn(`⚠️ Warning creating CMS index: ${err.message}`);
      }
    }

    // Create videos table indexes
    const videoIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_videos_sport ON videos(sport)',
      'CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category)',
      'CREATE INDEX IF NOT EXISTS idx_videos_event_date ON videos(event_date DESC)',
      'CREATE INDEX IF NOT EXISTS idx_videos_published ON videos(is_published, deleted_at)'
    ];

    for (const indexQuery of videoIndexes) {
      try {
        await pool.query(indexQuery);
      } catch (err: any) {
        console.warn(`⚠️ Warning creating videos index: ${err.message}`);
      }
    }

    const latestUpdateIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_latest_updates_date ON latest_updates(start_date DESC)',
      'CREATE INDEX IF NOT EXISTS idx_latest_updates_status ON latest_updates(status, deleted_at)',
      'CREATE INDEX IF NOT EXISTS idx_latest_updates_sport ON latest_updates(sport)',
      'CREATE INDEX IF NOT EXISTS idx_latest_updates_type ON latest_updates(event_type)'
    ];

    for (const indexQuery of latestUpdateIndexes) {
      try {
        await pool.query(indexQuery);
      } catch (err: any) {
        console.warn(`⚠️ Warning creating latest updates index: ${err.message}`);
      }
    }

    console.log("✅ Database schema is up to date");

  } catch (error: any) {
    console.error("❌ Error updating database schema:", error?.message || error);
  }
}

export async function ensureDefaultSportsAndPositions(pool: Pool): Promise<void> {
  try {
    // Check if sports table has anything
    const result = await pool.query('SELECT COUNT(*) FROM sports');
    const count = parseInt(result.rows[0].count);

    if (count === 0) {
      console.log("🌱 Seeding default sports and positions...");
      
      const seedPath = path.join(__dirname, "../../database/seed-sports.sql");
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, "utf8");
        await pool.query(seedSql);
        console.log("✅ Successfully seeded default sports and positions");
      } else {
        console.warn("⚠️  Seed file database/seed-sports.sql not found");
      }
    } else {
      console.log("✅ Sports data already exists, skipping seeding");
    }
  } catch (error: any) {
    console.error("❌ Error seeding sports data:", error?.message || error);
  }
}

export async function ensureEmailSubscriptionsFix(pool: Pool): Promise<void> {
  try {
    console.log("🔧 Checking email subscriptions fix...");

    // Check if the function needs to be fixed
    const functionCheck = await pool.query(`
      SELECT routine_name, routine_type
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_name = 'get_association_subscribers'
    `);

    if (functionCheck.rows.length > 0) {
      console.log("⚠️  Function exists but may have wrong signature, fixing...");

      // Drop and recreate with correct signature
      await pool.query(`
        DROP FUNCTION IF EXISTS get_association_subscribers(UUID);

        CREATE OR REPLACE FUNCTION get_association_subscribers(p_association_id UUID)
        RETURNS TABLE(id UUID, email VARCHAR, status VARCHAR, subscription_date TIMESTAMP, preferences JSONB) AS $$
        BEGIN
            RETURN QUERY
            SELECT s.id, s.email, s.status, s.subscription_date, s.preferences
            FROM email_subscriptions s
            WHERE s.association_id = p_association_id
            AND s.deleted_at IS NULL;
        END;
        $$ LANGUAGE plpgsql;
      `);

      console.log("✅ Email subscriptions function fixed");
    }

    // Ensure the view exists
    await pool.query(`
      DROP VIEW IF EXISTS active_subscribers;
      CREATE VIEW active_subscribers AS
      SELECT s.*, a.name as association_name
      FROM email_subscriptions s
      LEFT JOIN associations a ON s.association_id = a.id
      WHERE s.status = 'ACTIVE' AND s.deleted_at IS NULL;
    `);

    console.log("✅ Email subscriptions fix applied");
  } catch (error: any) {
    console.warn("⚠️  Email subscriptions fix warning:", error?.message || error);
    // Don't throw - this is not critical
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

      // ALWAYS run schema updates to ensure production is in sync
      await ensureSchemaUpdates(pool);

      // CRITICAL: Fix email subscriptions (this fixes the 500 error)
      await ensureEmailSubscriptionsFix(pool);

      // Ensure sports and positions are seeded
      await ensureDefaultSportsAndPositions(pool);

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
