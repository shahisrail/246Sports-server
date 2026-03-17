-- ============================================================
-- ROLLBACK: Venue GPS Enhancement
-- This file reverses migration 005_enhance_venue_gps_support.sql
-- ============================================================

-- WARNING: This will remove GPS indexes and functions!
-- Latitude and longitude columns will be preserved.

-- ============================================================
-- STEP 1: DROP VIEWS
-- ============================================================

DROP VIEW IF EXISTS venues_with_gps;

-- ============================================================
-- STEP 2: DROP TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS validate_venue_gps_trigger ON venues;

-- ============================================================
-- STEP 3: DROP FUNCTIONS
-- ============================================================

DROP FUNCTION IF EXISTS validate_venue_gps();
DROP FUNCTION IF EXISTS calculate_distance(DECIMAL, DECIMAL, DECIMAL, DECIMAL);
DROP FUNCTION IF EXISTS find_venues_near_location(DECIMAL, DECIMAL, DECIMAL);
DROP FUNCTION IF EXISTS validate_gps_coordinates(DECIMAL, DECIMAL);
DROP FUNCTION IF EXISTS format_google_maps_url(DECIMAL, DECIMAL, VARCHAR);
DROP FUNCTION IF EXISTS format_apple_maps_url(DECIMAL, DECIMAL);

-- ============================================================
-- STEP 4: DROP INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_venues_gps_coordinates;
DROP INDEX IF EXISTS idx_venues_with_gps;

-- ============================================================
-- STEP 5: DROP CONSTRAINTS (Optional - keeps data integrity)
-- ============================================================

-- Uncomment these lines if you want to remove the GPS validation constraints
-- ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_latitude_check;
-- ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_longitude_check;

-- ============================================================
-- ROLLBACK COMPLETE
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Venue GPS enhancement rollback completed';
    RAISE NOTICE 'ℹ️  Latitude and longitude columns have been preserved';
    RAISE NOTICE 'ℹ️  GPS indexes and helper functions have been removed';
END $$;
