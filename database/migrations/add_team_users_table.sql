-- Create team_users junction table
-- This table links users to teams with specific roles (TEAM_ADMIN, COACH, etc.)

CREATE TABLE IF NOT EXISTS team_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('TEAM_ADMIN', 'COACH', 'ASSISTANT_COACH', 'MANAGER', 'MEDICAL_STAFF')),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,
    UNIQUE(team_id, user_id, role)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_users_team ON team_users(team_id);
CREATE INDEX IF NOT EXISTS idx_team_users_user ON team_users(user_id);
CREATE INDEX IF NOT EXISTS idx_team_users_role ON team_users(role);

-- Add foreign key constraints
ALTER TABLE team_users DROP CONSTRAINT IF EXISTS fk_team_users_team;
ALTER TABLE team_users DROP CONSTRAINT IF EXISTS fk_team_users_user;

ALTER TABLE team_users
    ADD CONSTRAINT fk_team_users_team
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_team_users_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add comment
COMMENT ON TABLE team_users IS 'Junction table linking users to teams with specific roles';
COMMENT ON COLUMN team_users.role IS 'Role of the user in the team (TEAM_ADMIN, COACH, etc.)';
