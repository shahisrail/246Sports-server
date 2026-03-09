-- 246Sports Database Schema
-- PostgreSQL Database Schema for Multi-tenant Sports Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('PUBLIC', 'SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'COMPETITION_MANAGER', 'CLUB_ADMIN', 'TEAM_MANAGER')),
    association_id UUID REFERENCES associations(id) ON DELETE SET NULL,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ASSOCIATIONS
-- ============================================

CREATE TABLE associations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logo TEXT,
    description TEXT,
    website TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ============================================
-- SEASONS
-- ============================================

CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    association_id UUID NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
    year VARCHAR(50) NOT NULL, -- e.g., "2024-2025"
    status VARCHAR(20) DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'ONGOING', 'COMPLETED')),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- COMPETITIONS
-- ============================================

CREATE TABLE competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    association_id UUID NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sport VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'LEAGUE' CHECK (category IN ('LEAGUE', 'CUP', 'TOURNAMENT')),
    status VARCHAR(20) DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'ONGOING', 'COMPLETED')),
    rules TEXT,
    points_win INTEGER DEFAULT 3,
    points_draw INTEGER DEFAULT 1,
    points_loss INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ============================================
-- CLUBS
-- ============================================

CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    association_id UUID NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    logo TEXT,
    founded_year INTEGER,
    colors TEXT[], -- Array of color codes
    address TEXT,
    website TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ============================================
-- TEAMS
-- ============================================

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'SENIOR' CHECK (category IN ('SENIOR', 'U23', 'U20', 'U18', 'U15', 'U13')),
    gender VARCHAR(20) DEFAULT 'MALE' CHECK (gender IN ('MALE', 'FEMALE', 'MIXED')),
    logo TEXT,
    coach_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ============================================
-- PLAYERS
-- ============================================

CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    photo TEXT,
    position VARCHAR(100),
    squad_number INTEGER,
    date_of_birth DATE,
    nationality VARCHAR(100),
    height INTEGER, -- in cm
    weight INTEGER, -- in kg
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ============================================
-- VENUES
-- ============================================

CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INTEGER,
    surface VARCHAR(50) DEFAULT 'GRASS' CHECK (surface IN ('GRASS', 'ARTIFICIAL', 'HYBRID', 'INDOOR')),
    photo TEXT,
    amenities TEXT[], -- e.g., ['Parking', 'Changing Rooms', 'Floodlights']
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ============================================
-- FIXTURES
-- ============================================

CREATE TABLE fixtures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    home_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    date_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED')),
    round VARCHAR(100),
    stream_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Ensure home and away teams are different
    CONSTRAINT different_teams CHECK (home_team_id != away_team_id)
);

-- ============================================
-- RESULTS
-- ============================================

CREATE TABLE results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fixture_id UUID NOT NULL UNIQUE REFERENCES fixtures(id) ON DELETE CASCADE,
    home_score INTEGER NOT NULL,
    away_score INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'CONFIRMED', 'PUBLISHED')),
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    confirmed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- STANDINGS
-- ============================================

CREATE TABLE standings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    played INTEGER DEFAULT 0,
    won INTEGER DEFAULT 0,
    drawn INTEGER DEFAULT 0,
    lost INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    goal_difference INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure one standing per team per competition
    UNIQUE(competition_id, team_id)
);

-- ============================================
-- AUDIT LOGS
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PUBLISH')),
    entity VARCHAR(100) NOT NULL, -- e.g., 'USER', 'FIXTURE', 'COMPETITION'
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- LIVE STREAMS (Optional)
-- ============================================

CREATE TABLE live_streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
    platform VARCHAR(100) NOT NULL, -- e.g., 'YOUTUBE', 'FACEBOOK', 'TWITCH'
    stream_url TEXT NOT NULL,
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT true,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- FIXTURE UPDATES (for live commentary)
-- ============================================

CREATE TABLE fixture_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
    minute INTEGER,
    update_type VARCHAR(50) NOT NULL CHECK (update_type IN ('GOAL', 'CARD', 'SUBSTITUTION', 'INJURY', 'HALF_TIME', 'FULL_TIME', 'OTHER')),
    description TEXT NOT NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_association ON users(association_id);

-- Associations
CREATE INDEX idx_associations_name ON associations(name);

-- Competitions
CREATE INDEX idx_competitions_association ON competitions(association_id);
CREATE INDEX idx_competitions_season ON competitions(season_id);
CREATE INDEX idx_competitions_sport ON competitions(sport);
CREATE INDEX idx_competitions_status ON competitions(status);

-- Clubs
CREATE INDEX idx_clubs_association ON clubs(association_id);
CREATE INDEX idx_clubs_name ON clubs(name);

-- Teams
CREATE INDEX idx_teams_club ON teams(club_id);
CREATE INDEX idx_teams_competition ON teams(competition_id);

-- Players
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_players_name ON players(name);

-- Fixtures
CREATE INDEX idx_fixtures_competition ON fixtures(competition_id);
CREATE INDEX idx_fixtures_home_team ON fixtures(home_team_id);
CREATE INDEX idx_fixtures_away_team ON fixtures(away_team_id);
CREATE INDEX idx_fixtures_venue ON fixtures(venue_id);
CREATE INDEX idx_fixtures_date_time ON fixtures(date_time);
CREATE INDEX idx_fixtures_status ON fixtures(status);

-- Results
CREATE INDEX idx_results_fixture ON results(fixture_id);
CREATE INDEX idx_results_status ON results(status);

-- Standings
CREATE INDEX idx_standings_competition ON standings(competition_id);
CREATE INDEX idx_standings_team ON standings(team_id);

-- Audit Logs
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_associations_updated_at BEFORE UPDATE ON associations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON seasons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitions_updated_at BEFORE UPDATE ON competitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fixtures_updated_at BEFORE UPDATE ON fixtures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_standings_updated_at BEFORE UPDATE ON standings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Optional - for development)
-- ============================================

-- Insert default Super Admin user (password: Admin123)
-- Password hash for 'Admin123' (remove this in production!)
INSERT INTO users (id, name, email, password, role)
VALUES (
    uuid_generate_v4(),
    'Super Admin',
    'admin@246sports.bb',
    '$2b$10$xYZ123ABC...REPLACE_WITH_ACTUAL_HASH',
    'SUPER_ADMIN'
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- VIEWS
-- ============================================

-- View for fixture details with teams and venue
CREATE VIEW fixture_details AS
SELECT
    f.id,
    f.date_time,
    f.status,
    f.round,
    f.stream_url,
    c.name as competition_name,
    c.sport,
    ht.name as home_team_name,
    ht.logo as home_team_logo,
    at.name as away_team_name,
    at.logo as away_team_logo,
    v.name as venue_name,
    v.address as venue_address,
    v.latitude as venue_latitude,
    v.longitude as venue_longitude,
    r.home_score,
    r.away_score,
    r.status as result_status
FROM fixtures f
LEFT JOIN competitions c ON f.competition_id = c.id
LEFT JOIN teams ht ON f.home_team_id = ht.id
LEFT JOIN teams at ON f.away_team_id = at.id
LEFT JOIN venues v ON f.venue_id = v.id
LEFT JOIN results r ON f.id = r.fixture_id
WHERE f.deleted_at IS NULL;

-- ============================================
-- END OF SCHEMA
-- ============================================
