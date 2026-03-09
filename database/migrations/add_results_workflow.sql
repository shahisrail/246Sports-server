-- Add result status fields and tracking
ALTER TABLE results
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'SUBMITTED'
CHECK (status IN ('SUBMITTED', 'CONFIRMED', 'PUBLISHED')),
ADD COLUMN IF NOT EXISTS confirmed_by UUID,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS published_by UUID,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;

-- Add index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_results_status ON results(status);
CREATE INDEX IF NOT EXISTS idx_results_fixture_status ON results(fixture_id, status);
