-- 246Sports Database Schema v2.0 - FIXED ORDER
-- PostgreSQL Database Schema for Multi-tenant Sports Platform
-- Enterprise Edition with all improvements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable full-text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- CORE TABLES (No foreign keys initially)
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('PUBLIC', 'SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'COMPETITION_MANAGER', 'CLUB_ADMIN', 'TEAM_MANAGER')),
    association_id UUID,
    club_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

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

CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    association_id UUID,
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

CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    association_id UUID,
    name VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    association_id UUID,
    season_id UUID,
    name VARCHAR(255) NOT NULL,
    sport VARCHAR(100),
    category VARCHAR(50) CHECK (category IN ('LEAGUE', 'CUP', 'TOURNAMENT')),
    status VARCHAR(50) CHECK (status IN ('UPCOMING', 'ONGOING', 'COMPLETED')),
    rules TEXT,
    points_win INTEGER DEFAULT 3,
    points_draw INTEGER DEFAULT 1,
    points_loss INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE venues (
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

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID,
    competition_id UUID,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('SENIOR', 'U23', 'U20', 'U18', 'U15', 'U13')),
    gender VARCHAR(20) CHECK (gender IN ('MALE', 'FEMALE', 'MIXED')),
    logo TEXT,
    coach_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID,
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
    deleted_at TIMESTAMP
);

CREATE TABLE fixtures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID,
    home_team_id UUID,
    away_team_id UUID,
    venue_id UUID,
    date_time TIMESTAMP,
    status VARCHAR(50) CHECK (status IN ('SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED')),
    round VARCHAR(100),
    stream_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fixture_id UUID UNIQUE NOT NULL,
    home_score INTEGER NOT NULL,
    away_score INTEGER NOT NULL,
    status VARCHAR(50) CHECK (status IN ('SUBMITTED', 'CONFIRMED', 'PUBLISHED')),
    submitted_by UUID,
    confirmed_by UUID,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE standings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID,
    team_id UUID,
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

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100),
    entity VARCHAR(100),
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- V2.0 NEW TABLES
-- ============================================

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP,
    revoked_by VARCHAR(50),
    device_info TEXT,
    user_agent TEXT
);

CREATE TABLE team_competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL,
    competition_id UUID NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registered_by UUID,
    UNIQUE(team_id, competition_id)
);

CREATE TABLE fixture_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fixture_id UUID NOT NULL,
    minute INTEGER,
    update_type VARCHAR(50) NOT NULL CHECK (update_type IN ('GOAL', 'CARD', 'SUBSTITUTION', 'INJURY', 'HALF_TIME', 'FULL_TIME', 'VAR', 'OTHER')),
    description TEXT NOT NULL,
    team_id UUID,
    player_id UUID,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_minute CHECK (minute IS NULL OR minute >= 0 AND minute <= 120)
);

CREATE TABLE result_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    result_id UUID NOT NULL,
    fixture_id UUID,
    home_score INTEGER NOT NULL,
    away_score INTEGER NOT NULL,
    status VARCHAR(20),
    changed_by UUID,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_reason TEXT
);

CREATE TABLE standings_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID,
    team_id UUID,
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

CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    association_id UUID,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    sport VARCHAR(100),
    category VARCHAR(50) CHECK (category IN ('BULLETIN', 'UPDATE', 'FEATURE', 'ANNOUNCEMENT')),
    region VARCHAR(100),
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    published_at TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    type VARCHAR(50) CHECK (type IN ('IMAGE', 'VIDEO', 'DOCUMENT', 'OTHER')),
    entity_type VARCHAR(100),
    entity_id UUID,
    uploaded_by UUID,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE background_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    status VARCHAR(20) DEFAULT 'PENDING',
    payload JSONB,
    result JSONB,
    error_message TEXT,
    priority INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- ============================================
-- INDEXES
-- ============================================

-- Users
CREATE UNIQUE INDEX users_email_unique ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_association ON users(association_id);
CREATE INDEX idx_users_club ON users(club_id);

-- Associations
CREATE INDEX idx_associations_name ON associations USING gin(to_tsvector('english', name));
CREATE INDEX idx_associations_search ON associations USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Clubs
CREATE INDEX idx_clubs_association ON clubs(association_id);
CREATE INDEX idx_clubs_name_search ON clubs USING gin(to_tsvector('english', name));

-- Competitions
CREATE INDEX idx_competitions_association_sport ON competitions(association_id, sport);
CREATE INDEX idx_competitions_season ON competitions(season_id);
CREATE INDEX idx_competitions_status ON competitions(status);

-- Fixtures
CREATE INDEX idx_fixtures_datetime_status ON fixtures(date_time, status);
CREATE INDEX idx_fixtures_competition_status ON fixtures(competition_id, status);
CREATE INDEX idx_fixtures_team_home ON fixtures(home_team_id);
CREATE INDEX idx_fixtures_team_away ON fixtures(away_team_id);
CREATE INDEX idx_fixtures_venue ON fixtures(venue_id);
CREATE INDEX idx_fixtures_date ON fixtures(date_time);

-- Results
CREATE INDEX idx_results_fixture ON results(fixture_id);
CREATE INDEX idx_results_status ON results(status);
CREATE INDEX idx_results_published ON results(published_at DESC);

-- Standings
CREATE INDEX idx_standings_competition_points ON standings(competition_id, points DESC);
CREATE INDEX idx_standings_team ON standings(team_id);

-- Teams
CREATE INDEX idx_teams_club ON teams(club_id);
CREATE INDEX idx_teams_competition ON teams(competition_id);
CREATE INDEX idx_teams_name_search ON teams USING gin(to_tsvector('english', name));

-- Players
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_players_is_active ON players(is_active);

-- Venues
CREATE INDEX idx_venues_name_search ON venues USING gin(to_tsvector('english', name || ' ' || COALESCE(address, '')));

-- News
CREATE UNIQUE INDEX news_slug_unique ON news(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_news_association ON news(association_id);
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_published ON news(published_at DESC);
CREATE INDEX idx_news_sport ON news(sport);
CREATE INDEX idx_news_search ON news USING gin(to_tsvector('english', title || ' ' || content));

-- Refresh Tokens
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Team Competitions
CREATE INDEX idx_team_competitions_team ON team_competitions(team_id);
CREATE INDEX idx_team_competitions_competition ON team_competitions(competition_id);

-- Fixture Updates
CREATE INDEX idx_fixture_updates_fixture ON fixture_updates(fixture_id, created_at);

-- Result History
CREATE INDEX idx_result_history_result ON result_history(result_id);
CREATE INDEX idx_result_history_fixture ON result_history(fixture_id);

-- Standings History
CREATE INDEX idx_standings_history_competition ON standings_history(competition_id, recorded_at DESC);
CREATE INDEX idx_standings_history_team ON standings_history(team_id);

-- Audit Logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Background Jobs
CREATE INDEX idx_background_jobs_status ON background_jobs(status);
CREATE INDEX idx_background_jobs_type ON background_jobs(job_type);
CREATE INDEX idx_background_jobs_scheduled ON background_jobs(scheduled_at);

-- ============================================
-- FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION recalculate_competition_standings(p_competition_id UUID)
RETURNS TABLE (
    id UUID,
    competition_id UUID,
    team_id UUID,
    points INTEGER,
    played INTEGER,
    won INTEGER,
    drawn INTEGER,
    lost INTEGER,
    goals_for INTEGER,
    goals_against INTEGER,
    goal_difference INTEGER
) AS $$
DECLARE
    v_competition_record RECORD;
BEGIN
    -- Lock competition to prevent concurrent updates
    PERFORM pg_advisory_xact_lock(hashtext('standings_' || p_competition_id::text));

    -- Get competition points system
    SELECT * INTO v_competition_record
    FROM competitions
    WHERE id = p_competition_id;

    -- Delete existing standings
    DELETE FROM standings WHERE competition_id = p_competition_id;

    -- Insert calculated standings
    INSERT INTO standings (id, competition_id, team_id, points, played, won, drawn, lost, goals_for, goals_against, goal_difference)
    SELECT
        uuid_generate_v4(),
        r.fixture_id,
        CASE
            WHEN r.home_team_id = t.id THEN t_home.id
            ELSE t_away.id
        END as team_id,
        COALESCE(SUM(
            CASE
                WHEN (r.home_team_id = t.id AND r.home_score > r.away_score) OR
                     (r.away_team_id = t.id AND r.away_score > r.home_score)
                THEN v_competition_record.points_win
                WHEN r.home_score = r.away_score
                THEN v_competition_record.points_draw
                ELSE v_competition_record.points_loss
            END
        ), 0) as points,
        COUNT(*) as played,
        COALESCE(SUM(
            CASE
                WHEN (r.home_team_id = t.id AND r.home_score > r.away_score) OR
                     (r.away_team_id = t.id AND r.away_score > r.home_score)
                THEN 1 ELSE 0
            END
        ), 0) as won,
        COALESCE(SUM(
            CASE
                WHEN r.home_score = r.away_score THEN 1 ELSE 0
            END
        ), 0) as drawn,
        COALESCE(SUM(
            CASE
                WHEN (r.home_team_id = t.id AND r.home_score < r.away_score) OR
                     (r.away_team_id = t.id AND r.away_score < r.home_score)
                THEN 1 ELSE 0
            END
        ), 0) as lost,
        COALESCE(SUM(
            CASE
                WHEN r.home_team_id = t.id THEN r.home_score
                ELSE r.away_score
            END
        ), 0) as goals_for,
        COALESCE(SUM(
            CASE
                WHEN r.home_team_id = t.id THEN r.away_score
                ELSE r.home_score
            END
        ), 0) as goals_against,
        COALESCE(SUM(
            CASE
                WHEN r.home_team_id = t.id THEN r.home_score - r.away_score
                ELSE r.away_score - r.home_score
            END
        ), 0) as goal_difference
    FROM results r
    JOIN fixtures f ON r.fixture_id = f.id
    JOIN teams t ON (f.home_team_id = t.id OR f.away_team_id = t.id)
    JOIN teams t_home ON f.home_team_id = t_home.id
    JOIN teams t_away ON f.away_team_id = t_away.id
    WHERE f.competition_id = p_competition_id
      AND r.status = 'PUBLISHED'
    GROUP BY t.id
    ORDER BY points DESC, goal_difference DESC;

    -- Save to history
    INSERT INTO standings_history (id, competition_id, team_id, points, played, won, drawn, lost, goals_for, goals_against, goal_difference, recorded_at)
    SELECT uuid_generate_v4(), s.*
    FROM standings s
    WHERE s.competition_id = p_competition_id;

    RETURN QUERY SELECT * FROM standings WHERE competition_id = p_competition_id ORDER BY points DESC, goal_difference DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEARCH INDEX (Materialized View)
-- ============================================

CREATE MATERIALIZED VIEW search_index AS
SELECT
    'ASSOCIATION' as entity_type,
    a.id as entity_id,
    a.name as title,
    COALESCE(a.description, '') as content,
    a.id as tenant_id,
    NULL as parent_id,
    '/associations/' || a.id as url_path,
    a.created_at
FROM associations a
WHERE a.deleted_at IS NULL

UNION ALL

SELECT
    'CLUB' as entity_type,
    c.id as entity_id,
    c.name as title,
    '' as content,
    c.association_id as tenant_id,
    c.association_id as parent_id,
    '/clubs/' || c.id as url_path,
    c.created_at
FROM clubs c
WHERE c.deleted_at IS NULL

UNION ALL

SELECT
    'TEAM' as entity_type,
    t.id as entity_id,
    t.name as title,
    '' as content,
    cl.association_id as tenant_id,
    t.club_id as parent_id,
    '/teams/' || t.id as url_path,
    t.created_at
FROM teams t
LEFT JOIN clubs cl ON t.club_id = cl.id
WHERE t.deleted_at IS NULL

UNION ALL

SELECT
    'VENUE' as entity_type,
    v.id as entity_id,
    v.name as title,
    COALESCE(v.address, '') as content,
    NULL as tenant_id,
    NULL as parent_id,
    '/venues/' || v.id as url_path,
    v.created_at
FROM venues v
WHERE v.deleted_at IS NULL

UNION ALL

SELECT
    'NEWS' as entity_type,
    n.id as entity_id,
    n.title as title,
    n.content,
    n.association_id as tenant_id,
    n.association_id as parent_id,
    '/news/' || n.slug as url_path,
    n.created_at
FROM news n
WHERE n.deleted_at IS NULL;

-- Create indexes on materialized view
CREATE INDEX idx_search_index_fulltext ON search_index USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX idx_search_index_type ON search_index(entity_type);
CREATE INDEX idx_search_index_tenant ON search_index(tenant_id);

-- Function to refresh search index
CREATE OR REPLACE FUNCTION refresh_search_index() RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY search_index;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS for Standings Calculation
-- ============================================

CREATE OR REPLACE FUNCTION trigger_recalculate_standings()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'PUBLISHED' THEN
        PERFORM recalculate_competition_standings(
            (SELECT competition_id FROM fixtures WHERE id = NEW.fixture_id)
        );

        -- Update fixture status to FINISHED
        UPDATE fixtures
        SET status = 'FINISHED'
        WHERE id = NEW.fixture_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_result_published
AFTER UPDATE ON results
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'PUBLISHED')
EXECUTE FUNCTION trigger_recalculate_standings();
