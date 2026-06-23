-- Create videos table for managing media content
CREATE TABLE IF NOT EXISTS videos (
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
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_videos_sport ON videos(sport);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_event_date ON videos(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_videos_published ON videos(is_published, deleted_at);

-- Add comments
COMMENT ON TABLE videos IS 'Video content library for media section';
COMMENT ON COLUMN videos.youtube_url IS 'YouTube video URL (supports youtube.com/watch and youtu.be formats)';
COMMENT ON COLUMN videos.category IS 'Video category: HIGHLIGHTS, FULL_MATCH, INTERVIEW, DOCUMENTARY, etc.';
COMMENT ON COLUMN videos.view_count IS 'View count (can be updated periodically)';
