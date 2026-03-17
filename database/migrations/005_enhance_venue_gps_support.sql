-- ============================================================
-- PHASE 2: VENUE GPS ENHANCEMENT MIGRATION
-- Improve venue location support for directions
-- Version: 1.0.0
-- Date: 2026-03-17
-- ============================================================

-- This migration enhances the venues table with better GPS support,
-- indexes for location-based queries, and helper functions

-- ============================================================
-- STEP 1: VERIFY AND ENSURE GPS COLUMNS EXIST
-- ============================================================

-- Add latitude and longitude columns if they don't exist
DO $$
BEGIN
    -- Add latitude column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'venues'
        AND column_name = 'latitude'
    ) THEN
        ALTER TABLE venues ADD COLUMN latitude DECIMAL(10, 8);
        RAISE NOTICE '✅ Added latitude column to venues table';
    ELSE
        RAISE NOTICE 'ℹ️  latitude column already exists in venues table';
    END IF;

    -- Add longitude column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'venues'
        AND column_name = 'longitude'
    ) THEN
        ALTER TABLE venues ADD COLUMN longitude DECIMAL(11, 8);
        RAISE NOTICE '✅ Added longitude column to venues table';
    ELSE
        RAISE NOTICE 'ℹ️  longitude column already exists in venues table';
    END IF;
END $$;

-- ============================================================
-- STEP 2: ADD GPS DATA VALIDATION CONSTRAINTS
-- ============================================================

-- Add CHECK constraints for valid latitude range (-90 to 90)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'venues_latitude_check'
    ) THEN
        ALTER TABLE venues ADD CONSTRAINT venues_latitude_check
        CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));
        RAISE NOTICE '✅ Added latitude range constraint';
    ELSE
        RAISE NOTICE 'ℹ️  latitude constraint already exists';
    END IF;
END $$;

-- Add CHECK constraints for valid longitude range (-180 to 180)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'venues_longitude_check'
    ) THEN
        ALTER TABLE venues ADD CONSTRAINT venues_longitude_check
        CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));
        RAISE NOTICE '✅ Added longitude range constraint';
    ELSE
        RAISE NOTICE 'ℹ️  longitude constraint already exists';
    END IF;
END $$;

-- ============================================================
-- STEP 3: CREATE INDEXES FOR GPS QUERIES
-- ============================================================

-- B-tree index for combined latitude/longitude queries
CREATE INDEX IF NOT EXISTS idx_venues_gps_coordinates
ON venues(latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND deleted_at IS NULL;

-- Partial index for venues with valid GPS coordinates
CREATE INDEX IF NOT EXISTS idx_venues_with_gps
ON venues(id, name, address, latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND deleted_at IS NULL;

-- ============================================================
-- STEP 4: CREATE HELPER FUNCTIONS FOR GPS OPERATIONS
-- ============================================================

-- Function to calculate distance between two coordinates (Haversine formula)
-- Returns distance in kilometers
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL,
    lon1 DECIMAL,
    lat2 DECIMAL,
    lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    earth_radius DECIMAL := 6371; -- Earth's radius in kilometers
    d_lat DECIMAL;
    d_lon DECIMAL;
    a DECIMAL;
    c DECIMAL;
    distance DECIMAL;
BEGIN
    -- Convert degrees to radians
    d_lat := RADIANS(lat2 - lat1);
    d_lon := RADIANS(lon2 - lon1);

    -- Haversine formula
    a := SIN(d_lat / 2) * SIN(d_lat / 2) +
         COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
         SIN(d_lon / 2) * SIN(d_lon / 2);

    c := 2 * ATAN2(SQRT(a), SQRT(1 - a));
    distance := earth_radius * c;

    RETURN distance;
END;
$$ LANGUAGE plpgsql;

-- Function to find venues near a location within a given radius
CREATE OR REPLACE FUNCTION find_venues_near_location(
    center_lat DECIMAL,
    center_lon DECIMAL,
    radius_km DECIMAL DEFAULT 10
) RETURNS TABLE (
    venue_id UUID,
    venue_name VARCHAR(255),
    venue_address TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.id as venue_id,
        v.name as venue_name,
        v.address as venue_address,
        v.latitude,
        v.longitude,
        calculate_distance(center_lat, center_lon, v.latitude, v.longitude) as distance_km
    FROM venues v
    WHERE v.latitude IS NOT NULL
    AND v.longitude IS NOT NULL
    AND v.deleted_at IS NULL
    AND calculate_distance(center_lat, center_lon, v.latitude, v.longitude) <= radius_km
    ORDER BY calculate_distance(center_lat, center_lon, v.latitude, v.longitude) ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to validate GPS coordinates
CREATE OR REPLACE FUNCTION validate_gps_coordinates(
    lat DECIMAL,
    lon DECIMAL
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN lat IS NOT NULL
       AND lon IS NOT NULL
       AND lat >= -90 AND lat <= 90
       AND lon >= -180 AND lon <= 180;
END;
$$ LANGUAGE plpgsql;

-- Function to format coordinates for Google Maps URL
CREATE OR REPLACE FUNCTION format_google_maps_url(
    lat DECIMAL,
    lon DECIMAL,
    venue_name VARCHAR DEFAULT NULL
) RETURNS TEXT AS $$
BEGIN
    IF NOT validate_gps_coordinates(lat, lon) THEN
        RETURN NULL;
    END IF;

    -- Return search URL with venue name and coordinates
    IF venue_name IS NOT NULL THEN
        RETURN format('https://www.google.com/maps/search/?api=1&query=%s',
                     encode(uri_encode(venue_name), 'escape'));
    ELSE
        RETURN format('https://www.google.com/maps/search/?api=1&query=%s,%s',
                     lat::TEXT, lon::TEXT);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to format coordinates for Apple Maps URL
CREATE OR REPLACE FUNCTION format_apple_maps_url(
    lat DECIMAL,
    lon DECIMAL
) RETURNS TEXT AS $$
BEGIN
    IF NOT validate_gps_coordinates(lat, lon) THEN
        RETURN NULL;
    END IF;

    RETURN format('http://maps.apple.com/?daddr=%s,%s&dirflg=d',
                 lat::TEXT, lon::TEXT);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- STEP 5: CREATE TRIGGER FOR GPS VALIDATION
-- ============================================================

-- Function to validate GPS coordinates before insert/update
CREATE OR REPLACE FUNCTION validate_venue_gps()
RETURNS TRIGGER AS $$
BEGIN
    -- Only validate if coordinates are provided
    IF NEW.latitude IS NOT NULL OR NEW.longitude IS NOT NULL THEN
        -- Both must be provided together
        IF NEW.latitude IS NULL OR NEW.longitude IS NULL THEN
            RAISE EXCEPTION 'Both latitude and longitude must be provided together';
        END IF;

        -- Validate ranges
        IF NOT validate_gps_coordinates(NEW.latitude, NEW.longitude) THEN
            RAISE EXCEPTION 'Invalid GPS coordinates: latitude must be between -90 and 90, longitude between -180 and 180';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS validate_venue_gps_trigger ON venues;
CREATE TRIGGER validate_venue_gps_trigger
    BEFORE INSERT OR UPDATE OF latitude, longitude ON venues
    FOR EACH ROW
    EXECUTE FUNCTION validate_venue_gps();

-- ============================================================
-- STEP 6: ADD COMMENTS FOR DOCUMENTATION
-- ============================================================

COMMENT ON COLUMN venues.latitude IS 'Venue latitude coordinate (-90 to 90). NULL if not available.';
COMMENT ON COLUMN venues.longitude IS 'Venue longitude coordinate (-180 to 180). NULL if not available.';
COMMENT ON FUNCTION calculate_distance(lat1 DECIMAL, lon1 DECIMAL, lat2 DECIMAL, lon2 DECIMAL) IS 'Calculate distance between two GPS coordinates using Haversine formula. Returns distance in kilometers.';
COMMENT ON FUNCTION find_venues_near_location(center_lat DECIMAL, center_lon DECIMAL, radius_km DECIMAL) IS 'Find all venues within a specified radius (in km) of a location. Returns venues sorted by distance.';
COMMENT ON FUNCTION validate_gps_coordinates(lat DECIMAL, lon DECIMAL) IS 'Validate that GPS coordinates are within valid ranges.';
COMMENT ON FUNCTION format_google_maps_url(lat DECIMAL, lon DECIMAL, venue_name VARCHAR) IS 'Generate a Google Maps search URL for the venue.';
COMMENT ON FUNCTION format_apple_maps_url(lat DECIMAL, lon DECIMAL) IS 'Generate an Apple Maps directions URL for the venue.';

-- ============================================================
-- STEP 7: CREATE VIEW FOR VENUES WITH GPS
-- ============================================================

CREATE OR REPLACE VIEW venues_with_gps AS
SELECT
    v.id,
    v.name,
    v.address,
    v.latitude,
    v.longitude,
    v.capacity,
    v.surface,
    v.photo,
    format_google_maps_url(v.latitude, v.longitude, v.name) as google_maps_url,
    format_apple_maps_url(v.latitude, v.longitude) as apple_maps_url,
    v.created_at,
    v.updated_at
FROM venues v
WHERE v.latitude IS NOT NULL
AND v.longitude IS NOT NULL
AND v.deleted_at IS NULL;

COMMENT ON VIEW venues_with_gps IS 'View of venues that have valid GPS coordinates with map URLs pre-generated';

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

-- Verification query
DO $$
DECLARE
    venue_count INTEGER;
    gps_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO venue_count FROM venues WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO gps_count FROM venues WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND deleted_at IS NULL;

    RAISE NOTICE '✅ Venue GPS enhancement migration completed successfully';
    RAISE NOTICE '📊 Total venues: %', venue_count;
    RAISE NOTICE '📍 Venues with GPS coordinates: %', gps_count;
    RAISE NOTICE '🔧 Created indexes for GPS queries';
    RAISE NOTICE '🧮 Created helper functions: calculate_distance, find_venues_near_location, validate_gps_coordinates';
    RAISE NOTICE '🗺️  Created map URL functions: format_google_maps_url, format_apple_maps_url';
    RAISE NOTICE '✅ Added GPS validation trigger';
END $$;
