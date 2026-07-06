-- 246Sports Database Schema
-- Clean, simple schema for production

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'PUBLIC' CHECK (role IN ('PUBLIC', 'SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'COMPETITION_MANAGER', 'CLUB_ADMIN', 'TEAM_MANAGER')),
    association_id UUID,
    club_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP,
    revoked_by VARCHAR(50),
    device_info TEXT,
    user_agent TEXT
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token UUID NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Associations table
CREATE TABLE IF NOT EXISTS associations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logo TEXT,
    abbreviation VARCHAR(20),
    founded_year INTEGER,
    description TEXT,
    website TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Clubs table
CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    association_id UUID REFERENCES associations(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    logo TEXT,
    founded_year INTEGER,
    colors TEXT[],
    address TEXT,
    website TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Seasons table
CREATE TABLE IF NOT EXISTS seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    association_id UUID REFERENCES associations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    year VARCHAR(20),
    status VARCHAR(50),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Competitions table
CREATE TABLE IF NOT EXISTS competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    association_id UUID REFERENCES associations(id) ON DELETE CASCADE,
    season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
    sport_id UUID REFERENCES sports(id),
    name VARCHAR(255) NOT NULL,
    sport VARCHAR(100),
    category VARCHAR(50) CHECK (category IN ('LEAGUE', 'CUP', 'TOURNAMENT', 'OTHER')),
    status VARCHAR(50) CHECK (status IN ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED')),
    format VARCHAR(100),
    description TEXT,
    rules TEXT,
    start_date DATE,
    end_date DATE,
    website TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    points_win INTEGER DEFAULT 3,
    points_draw INTEGER DEFAULT 1,
    points_loss INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Venues table
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INTEGER,
    surface VARCHAR(50) CHECK (surface IN ('GRASS', 'ARTIFICIAL', 'HYBRID', 'INDOOR')),
    photo TEXT,
    amenities TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('SENIOR', 'U23', 'U20', 'U18', 'U15', 'U13')),
    gender VARCHAR(20) CHECK (gender IN ('MALE', 'FEMALE', 'MIXED')),
    abbreviation VARCHAR(20),
    logo TEXT,
    coach_name VARCHAR(255),
    founded_year INTEGER,
    colors TEXT[],
    description TEXT,
    website TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Team competitions junction table
CREATE TABLE IF NOT EXISTS team_competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registered_by UUID REFERENCES users(id),
    UNIQUE(team_id, competition_id)
);

-- Team users junction table
CREATE TABLE IF NOT EXISTS team_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id)
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    photo TEXT,
    position VARCHAR(100),
    squad_number INTEGER,
    date_of_birth DATE,
    nationality VARCHAR(100),
    height INTEGER,
    weight INTEGER,
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    sport_id UUID REFERENCES sports(id)
);

-- Player sports junction table
CREATE TABLE IF NOT EXISTS player_sports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    position_id UUID REFERENCES sport_positions(id),
    is_primary BOOLEAN DEFAULT false,
    jersey_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fixtures table
CREATE TABLE IF NOT EXISTS fixtures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    home_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    date_time TIMESTAMP,
    status VARCHAR(50) CHECK (status IN ('SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED')),
    round VARCHAR(100),
    stream_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Fixture updates table
CREATE TABLE IF NOT EXISTS fixture_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
    minute INTEGER,
    update_type VARCHAR(50) NOT NULL CHECK (update_type IN ('GOAL', 'CARD', 'SUBSTITUTION', 'INJURY', 'HALF_TIME', 'FULL_TIME', 'VAR', 'OTHER')),
    description TEXT NOT NULL,
    team_id UUID REFERENCES teams(id),
    player_id UUID REFERENCES players(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_minute CHECK (minute IS NULL OR minute >= 0 AND minute <= 120)
);

-- Results table
CREATE TABLE IF NOT EXISTS results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fixture_id UUID UNIQUE NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
    home_score INTEGER NOT NULL,
    away_score INTEGER NOT NULL,
    status VARCHAR(50) CHECK (status IN ('SUBMITTED', 'CONFIRMED', 'PUBLISHED')),
    submitted_by UUID REFERENCES users(id),
    confirmed_by UUID REFERENCES users(id),
    confirmed_at TIMESTAMP,
    published_by UUID REFERENCES users(id),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Result history table
CREATE TABLE IF NOT EXISTS result_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    result_id UUID NOT NULL REFERENCES results(id) ON DELETE CASCADE,
    fixture_id UUID REFERENCES fixtures(id) ON DELETE SET NULL,
    home_score INTEGER NOT NULL,
    away_score INTEGER NOT NULL,
    status VARCHAR(20),
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_reason TEXT
);

-- Standings table
CREATE TABLE IF NOT EXISTS standings (
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
    UNIQUE(competition_id, team_id)
);

-- Standings history table
CREATE TABLE IF NOT EXISTS standings_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    points INTEGER,
    played INTEGER,
    won INTEGER,
    drawn INTEGER,
    lost INTEGER,
    goals_for INTEGER,
    goals_against INTEGER,
    goal_difference INTEGER,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News table
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    association_id UUID REFERENCES associations(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    sport VARCHAR(100),
    sport_id_new UUID,
    category VARCHAR(50) CHECK (category IN ('BULLETIN', 'UPDATE', 'FEATURE', 'ANNOUNCEMENT')),
    region VARCHAR(100),
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    published_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Media table
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    type VARCHAR(50) CHECK (type IN ('IMAGE', 'VIDEO', 'DOCUMENT', 'OTHER')),
    entity_type VARCHAR(100),
    entity_id UUID,
    uploaded_by UUID REFERENCES users(id),
    metadata JSONB,a
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CMS pages table
CREATE TABLE IF NOT EXISTS cms_pages (
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
);

-- Email subscriptions table
CREATE TABLE IF NOT EXISTS email_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    association_id UUID REFERENCES associations(id) ON DELETE CASCADE,
    unsubscribe_token UUID DEFAULT uuid_generate_v4(),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'UNSUBSCRIBED', 'BOUNCED')),
    preferences JSONB DEFAULT '{"news": true, "fixtures": true, "results": true}',
    ip_address VARCHAR(50),
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subscription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE(email, association_id)
);

-- Email subscription functions and views
CREATE OR REPLACE FUNCTION is_subscribed_to_association(p_email TEXT, p_association_id UUID) 
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
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION unsubscribe_by_token(p_token UUID) 
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE email_subscriptions 
    SET status = 'UNSUBSCRIBED', 
        unsubscribed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE unsubscribe_token = p_token;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

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

CREATE OR REPLACE VIEW active_subscribers AS
SELECT s.*, a.name as association_name
FROM email_subscriptions s
LEFT JOIN associations a ON s.association_id = a.id
WHERE s.status = 'ACTIVE' AND s.deleted_at IS NULL;

-- User invitations table
CREATE TABLE IF NOT EXISTS user_invitations (
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
);

-- Sports table
CREATE TABLE IF NOT EXISTS sports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100),
    icon TEXT,
    description TEXT,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Sport positions table
CREATE TABLE IF NOT EXISTS sport_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(20),
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE(sport_id, name)
);

-- Background jobs table
CREATE TABLE IF NOT EXISTS background_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')),
    payload JSONB,
    result JSONB,
    error_message TEXT,
    priority INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100),
    entity VARCHAR(100),
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schema migrations table
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    checksum VARCHAR(255),
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_association ON users(association_id);
CREATE INDEX IF NOT EXISTS idx_users_club ON users(club_id);

-- Refresh tokens indexes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Password reset tokens indexes
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Associations indexes
CREATE INDEX IF NOT EXISTS idx_associations_abbreviation ON associations(abbreviation);

-- Competitions indexes
CREATE INDEX IF NOT EXISTS idx_competitions_association_sport ON competitions(association_id, sport);
CREATE INDEX IF NOT EXISTS idx_competitions_season ON competitions(season_id);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_sport ON competitions(sport_id);
CREATE INDEX IF NOT EXISTS idx_competitions_dates ON competitions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_competitions_status_dates ON competitions(status, start_date);

-- Fixtures indexes
CREATE INDEX IF NOT EXISTS idx_fixtures_datetime_status ON fixtures(status, date_time);
CREATE INDEX IF NOT EXISTS idx_fixtures_competition_status ON fixtures(competition_id, status);
CREATE INDEX IF NOT EXISTS idx_fixtures_team_home ON fixtures(home_team_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_team_away ON fixtures(away_team_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_venue ON fixtures(venue_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_date ON fixtures(date_time);

-- Results indexes
CREATE INDEX IF NOT EXISTS idx_results_fixture ON results(fixture_id);
CREATE INDEX IF NOT EXISTS idx_results_status ON results(status);
CREATE INDEX IF NOT EXISTS idx_results_fixture_status ON results(fixture_id, status);
CREATE INDEX IF NOT EXISTS idx_results_published ON results(published_at);

-- Standings indexes
CREATE INDEX IF NOT EXISTS idx_standings_competition_points ON standings(competition_id, points DESC);
CREATE INDEX IF NOT EXISTS idx_standings_team ON standings(team_id);

-- News indexes
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_association ON news(association_id);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sport ON news(sport);

-- CMS indexes
CREATE INDEX IF NOT EXISTS idx_cms_pages_key ON cms_pages(page_key);
CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON cms_pages(status);
CREATE INDEX IF NOT EXISTS idx_cms_pages_route ON cms_pages(route_path);

-- Email subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_association ON email_subscriptions(association_id);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_status ON email_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_ip ON email_subscriptions(ip_address);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_unsubscribe_token ON email_subscriptions(unsubscribe_token);

-- Sports indexes
CREATE INDEX IF NOT EXISTS idx_sports_slug ON sports(slug);
CREATE INDEX IF NOT EXISTS idx_sports_category ON sports(category);
CREATE INDEX IF NOT EXISTS idx_sports_popular ON sports(is_popular);
CREATE INDEX IF NOT EXISTS idx_sports_active ON sports(is_active);

-- Sport positions indexes
CREATE INDEX IF NOT EXISTS idx_sport_positions_sport ON sport_positions(sport_id);
CREATE INDEX IF NOT EXISTS idx_sport_positions_active ON sport_positions(is_active);
CREATE INDEX IF NOT EXISTS idx_sport_positions_order ON sport_positions(sport_id, display_order);

-- Team competitions indexes
CREATE INDEX IF NOT EXISTS idx_team_competitions_team ON team_competitions(team_id);
CREATE INDEX IF NOT EXISTS idx_team_competitions_competition ON team_competitions(competition_id);

-- Team users indexes
CREATE INDEX IF NOT EXISTS idx_team_users_team ON team_users(team_id);
CREATE INDEX IF NOT EXISTS idx_team_users_user ON team_users(user_id);
CREATE INDEX IF NOT EXISTS idx_team_users_role ON team_users(role);

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_club ON teams(club_id);
CREATE INDEX IF NOT EXISTS idx_teams_competition ON teams(competition_id);
CREATE INDEX IF NOT EXISTS idx_teams_club_id ON teams(club_id);
CREATE INDEX IF NOT EXISTS idx_teams_competition_id ON teams(competition_id);

-- Players indexes
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_sport ON players(sport_id);
CREATE INDEX IF NOT EXISTS idx_players_is_active ON players(is_active);

-- Player sports indexes
CREATE INDEX IF NOT EXISTS idx_player_sports_player ON player_sports(player_id);
CREATE INDEX IF NOT EXISTS idx_player_sports_sport ON player_sports(sport_id);
CREATE INDEX IF NOT EXISTS idx_player_sports_primary ON player_sports(player_id, is_primary);

-- User invitations indexes
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_expires_at ON user_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_invitations_association ON user_invitations(association_id);

-- Fixture updates indexes
CREATE INDEX IF NOT EXISTS idx_fixture_updates_fixture ON fixture_updates(fixture_id, created_at);

-- Standings history indexes
CREATE INDEX IF NOT EXISTS idx_standings_history_competition ON standings_history(competition_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_standings_history_team ON standings_history(team_id);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- Background jobs indexes
CREATE INDEX IF NOT EXISTS idx_background_jobs_type ON background_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_background_jobs_status ON background_jobs(status);
CREATE INDEX IF NOT EXISTS idx_background_jobs_scheduled ON background_jobs(scheduled_at);

-- Venues indexes
CREATE INDEX IF NOT EXISTS idx_venues_gps_coordinates ON venues(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_venues_with_gps ON venues(name, address, latitude, longitude);
