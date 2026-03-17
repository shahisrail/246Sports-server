-- ============================================================
-- PHASE 1: SPORTS TABLE SYSTEM MIGRATION
-- Multi-Sport Platform Enhancement
-- Version: 1.0.0
-- Date: 2026-03-13
-- ============================================================

-- This migration creates a proper sports management system
-- to replace the hardcoded sport VARCHAR fields

-- ============================================================
-- STEP 1: CREATE SPORTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS sports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'TEAM_SPORTS',
        'RACKET_SPORTS',
        'AQUATICS',
        'ATHLETICS',
        'COMBAT_SPORTS',
        'INDIVIDUAL',
        'MIND_GAMES',
        'MOTOR_SPORTS',
        'OTHER'
    )),
    description TEXT,
    icon TEXT,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ============================================================
-- STEP 2: CREATE SPORT_POSITIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS sport_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(10),
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE(sport_id, name)
);

-- ============================================================
-- STEP 3: ADD SPORT_ID TO COMPETITIONS TABLE
-- ============================================================

-- Add sport_id column to competitions
ALTER TABLE competitions
ADD COLUMN IF NOT EXISTS sport_id UUID REFERENCES sports(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_competitions_sport ON competitions(sport_id);

-- ============================================================
-- STEP 4: ADD SPORT_ID TO PLAYERS TABLE
-- ============================================================

-- Add sport_id column to players
ALTER TABLE players
ADD COLUMN IF NOT EXISTS sport_id UUID REFERENCES sports(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_players_sport ON players(sport_id);

-- ============================================================
-- STEP 5: CREATE PLAYER_SPORTS TABLE (Multi-sport players)
-- ============================================================

-- For athletes who participate in multiple sports
CREATE TABLE IF NOT EXISTS player_sports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    position_id UUID REFERENCES sport_positions(id) ON DELETE SET NULL,
    is_primary BOOLEAN DEFAULT false,
    jersey_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, sport_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_player_sports_player ON player_sports(player_id);
CREATE INDEX IF NOT EXISTS idx_player_sports_sport ON player_sports(sport_id);
CREATE INDEX IF NOT EXISTS idx_player_sports_primary ON player_sports(player_id, is_primary);

-- ============================================================
-- STEP 6: ADD SPORT_ID TO NEWS TABLE
-- ============================================================

-- Add sport_id as foreign key to news (currently just VARCHAR)
ALTER TABLE news
ADD COLUMN IF NOT EXISTS sport_id_new UUID REFERENCES sports(id) ON DELETE SET NULL;

-- ============================================================
-- STEP 7: CREATE INDEXES FOR SPORT QUERIES
-- ============================================================

-- Sports table indexes
CREATE INDEX IF NOT EXISTS idx_sports_category ON sports(category);
CREATE INDEX IF NOT EXISTS idx_sports_active ON sports(is_active);
CREATE INDEX IF NOT EXISTS idx_sports_popular ON sports(is_popular);
CREATE INDEX IF NOT EXISTS idx_sports_slug ON sports(slug);
CREATE INDEX IF NOT EXISTS idx_sports_name_search ON sports USING gin(to_tsvector('english', name));

-- Sport positions indexes
CREATE INDEX IF NOT EXISTS idx_sport_positions_sport ON sport_positions(sport_id);
CREATE INDEX IF NOT EXISTS idx_sport_positions_active ON sport_positions(is_active);

-- ============================================================
-- STEP 8: CREATE TRIGGER FOR UPDATED_AT
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to sports table
CREATE TRIGGER update_sports_updated_at
    BEFORE UPDATE ON sports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to sport_positions table
CREATE TRIGGER update_sport_positions_updated_at
    BEFORE UPDATE ON sport_positions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to player_sports table
CREATE TRIGGER update_player_sports_updated_at
    BEFORE UPDATE ON player_sports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- STEP 9: CREATE HELPER FUNCTIONS
-- ============================================================

-- Function to get sports by category
CREATE OR REPLACE FUNCTION get_sports_by_category(p_category VARCHAR)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    slug VARCHAR,
    category VARCHAR,
    description TEXT,
    is_popular BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.name, s.slug, s.category, s.description, s.is_popular
    FROM sports s
    WHERE s.category = p_category
      AND s.is_active = true
      AND s.deleted_at IS NULL
    ORDER BY s.display_order ASC, s.name ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get positions for a sport
CREATE OR REPLACE FUNCTION get_sport_positions(p_sport_id UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    abbreviation VARCHAR(10),
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT sp.id, sp.name, sp.abbreviation, sp.description
    FROM sport_positions sp
    WHERE sp.sport_id = p_sport_id
      AND sp.is_active = true
      AND sp.deleted_at IS NULL
    ORDER BY sp.display_order ASC, sp.name ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

-- Notes:
-- 1. Run seed_sports.sql after this migration to populate initial sports data
-- 2. Run migrate_sports_data.sql to migrate existing VARCHAR sport data to new structure
-- 3. Update application code to use sports table instead of hardcoded values
-- 4. After migration is complete and verified, drop old sport VARCHAR columns

COMMIT;
