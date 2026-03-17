-- Add missing columns to teams table
ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS abbreviation VARCHAR(50),
  ADD COLUMN IF NOT EXISTS colors TEXT[],
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS founded_year INTEGER,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_club_id ON teams(club_id);
CREATE INDEX IF NOT EXISTS idx_teams_competition_id ON teams(competition_id);
CREATE INDEX IF NOT EXISTS idx_teams_association_id ON teams(club_id)
  WHERE club_id IS NOT NULL;