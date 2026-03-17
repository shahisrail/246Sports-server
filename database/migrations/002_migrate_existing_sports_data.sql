-- ============================================================
-- DATA MIGRATION: CONVERT VARCHAR SPORTS TO FOREIGN KEYS
-- Migrates existing sport data to new sports table structure
-- Version: 1.0.0
-- Date: 2026-03-13
-- ============================================================

-- This script migrates existing sport VARCHAR values to the new sports table
-- Run this AFTER:
--   1. 001_add_sports_table_system.sql
--   2. seed_sports_data.sql
--   3. seed_sport_positions.sql

-- ============================================================
-- STEP 1: CREATE MAPPING FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION get_sport_id_from_name(sport_name VARCHAR)
RETURNS UUID AS $$
DECLARE
    sport_id UUID;
    normalized_name VARCHAR;
BEGIN
    -- Normalize sport name (trim, uppercase, remove special chars)
    normalized_name := UPPER(TRIM(sport_name));

    -- Map common sport names to slugs
    IF normalized_name LIKE '%FOOTBALL%' OR normalized_name LIKE '%SOCCER%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'football' LIMIT 1;
    ELSIF normalized_name LIKE '%CRICKET%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'cricket' LIMIT 1;
    ELSIF normalized_name LIKE '%BASKETBALL%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'basketball' LIMIT 1;
    ELSIF normalized_name LIKE '%NETBALL%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'netball' LIMIT 1;
    ELSIF normalized_name LIKE '%HOCKEY%' AND normalized_name LIKE '%FIELD%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'field-hockey' LIMIT 1;
    ELSIF normalized_name LIKE '%HOCKEY%' AND normalized_name LIKE '%ICE%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'ice-hockey' LIMIT 1;
    ELSIF normalized_name LIKE '%RUGBY%' AND normalized_name LIKE '%UNION%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'rugby-union' LIMIT 1;
    ELSIF normalized_name LIKE '%RUGBY%' AND normalized_name LIKE '%LEAGUE%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'rugby-league' LIMIT 1;
    ELSIF normalized_name LIKE '%RUGBY%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'rugby-union' LIMIT 1;
    ELSIF normalized_name LIKE '%VOLLEYBALL%' AND normalized_name LIKE '%BEACH%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'beach-volleyball' LIMIT 1;
    ELSIF normalized_name LIKE '%VOLLEYBALL%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'volleyball' LIMIT 1;
    ELSIF normalized_name LIKE '%TENNIS%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'tennis' LIMIT 1;
    ELSIF normalized_name LIKE '%BADMINTON%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'badminton' LIMIT 1;
    ELSIF normalized_name LIKE '%TABLE TENNIS%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'table-tennis' LIMIT 1;
    ELSIF normalized_name LIKE '%SWIMMING%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'swimming' LIMIT 1;
    ELSIF normalized_name LIKE '%ATHLETICS%' OR normalized_name LIKE '%TRACK%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'track-and-field' LIMIT 1;
    ELSIF normalized_name LIKE '%BOXING%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'boxing' LIMIT 1;
    ELSIF normalized_name LIKE '%CYCLING%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'cycling' LIMIT 1;
    ELSIF normalized_name LIKE '%GOLF%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'golf' LIMIT 1;
    ELSIF normalized_name LIKE '%BASEBALL%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'baseball' LIMIT 1;
    ELSIF normalized_name LIKE '%SOFTBALL%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'softball' LIMIT 1;
    ELSIF normalized_name LIKE '%AMERICAN FOOTBALL%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'american-football' LIMIT 1;
    ELSIF normalized_name LIKE '%HANDBALL%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'handball' LIMIT 1;
    ELSIF normalized_name LIKE '%CHESS%' THEN
        SELECT id INTO sport_id FROM sports WHERE slug = 'chess' LIMIT 1;
    ELSE
        -- Try exact match first
        SELECT id INTO sport_id FROM sports WHERE UPPER(name) = normalized_name LIMIT 1;

        -- If no match, try slug match
        IF sport_id IS NULL THEN
            SELECT id INTO sport_id FROM sports WHERE slug = LOWER(REGEXP_REPLACE(normalized_name, '[^A-Z0-9]', '-', 'g')) LIMIT 1;
        END IF;

        -- If still no match, log it and return NULL
        IF sport_id IS NULL THEN
            RAISE NOTICE 'No matching sport found for: %', sport_name;
        END IF;
    END IF;

    RETURN sport_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- STEP 2: MIGRATE COMPETITIONS SPORT DATA
-- ============================================================

-- First, let's see what sports we have in competitions
DO $$
DECLARE
    competition_record RECORD;
    sport_id UUID;
    migrated_count INTEGER := 0;
    error_count INTEGER := 0;
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'MIGRATING COMPETITIONS SPORT DATA';
    RAISE NOTICE '===========================================';

    -- Check if competitions table has sport column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'competitions' AND column_name = 'sport'
    ) THEN
        -- Loop through all competitions with sport data
        FOR competition_record IN
            SELECT id, sport FROM competitions WHERE sport IS NOT NULL AND sport_id IS NULL
        LOOP
            BEGIN
                -- Get the sport_id from the sport name
                sport_id := get_sport_id_from_name(competition_record.sport);

                -- Update the competition
                IF sport_id IS NOT NULL THEN
                    UPDATE competitions
                    SET sport_id = sport_id
                    WHERE id = competition_record.id;

                    migrated_count := migrated_count + 1;
                    RAISE NOTICE 'Migrated competition % (sport: %)', competition_record.id, competition_record.sport;
                ELSE
                    error_count := error_count + 1;
                    RAISE WARNING 'Could not find sport_id for competition % with sport: %', competition_record.id, competition_record.sport;
                END IF;
            EXCEPTION WHEN OTHERS THEN
                error_count := error_count + 1;
                RAISE WARNING 'Error migrating competition %: %', competition_record.id, SQLERRM;
            END;
        END LOOP;

        RAISE NOTICE 'Competitions migrated successfully: %', migrated_count;
        RAISE NOTICE 'Competitions with errors: %', error_count;
    ELSE
        RAISE NOTICE 'No sport column found in competitions table';
    END IF;
END $$;

-- ============================================================
-- STEP 3: MIGRATE NEWS SPORT DATA
-- ============================================================

DO $$
DECLARE
    news_record RECORD;
    sport_id UUID;
    migrated_count INTEGER := 0;
    error_count INTEGER := 0;
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'MIGRATING NEWS SPORT DATA';
    RAISE NOTICE '===========================================';

    -- Check if news table has sport column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'news' AND column_name = 'sport'
    ) THEN
        -- Loop through all news with sport data
        FOR news_record IN
            SELECT id, sport FROM news WHERE sport IS NOT NULL AND sport_id_new IS NULL
        LOOP
            BEGIN
                -- Get the sport_id from the sport name
                sport_id := get_sport_id_from_name(news_record.sport);

                -- Update the news
                IF sport_id IS NOT NULL THEN
                    UPDATE news
                    SET sport_id_new = sport_id
                    WHERE id = news_record.id;

                    migrated_count := migrated_count + 1;
                    RAISE NOTICE 'Migrated news % (sport: %)', news_record.id, news_record.sport;
                ELSE
                    error_count := error_count + 1;
                    RAISE WARNING 'Could not find sport_id for news % with sport: %', news_record.id, news_record.sport;
                END IF;
            EXCEPTION WHEN OTHERS THEN
                error_count := error_count + 1;
                RAISE WARNING 'Error migrating news %: %', news_record.id, SQLERRM;
            END;
        END LOOP;

        RAISE NOTICE 'News items migrated successfully: %', migrated_count;
        RAISE NOTICE 'News items with errors: %', error_count;
    ELSE
        RAISE NOTICE 'No sport column found in news table';
    END IF;
END $$;

-- ============================================================
-- STEP 4: DROP OLD SPORT COLUMNS (AFTER VERIFICATION)
-- ============================================================

-- WARNING: Only run this section after verifying the migration was successful!
-- Comment this section out until you've verified all data was migrated correctly

/*
-- Drop old sport column from competitions (after verification)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'competitions' AND column_name = 'sport'
    ) THEN
        ALTER TABLE competitions DROP COLUMN sport;
        RAISE NOTICE 'Dropped sport column from competitions table';
    END IF;
END $$;

-- Drop old sport column from news and rename sport_id_new (after verification)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'news' AND column_name = 'sport'
    ) THEN
        ALTER TABLE news DROP COLUMN sport;
        RAISE NOTICE 'Dropped sport column from news table';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'news' AND column_name = 'sport_id_new'
    ) THEN
        ALTER TABLE news RENAME COLUMN sport_id_new TO sport_id;
        RAISE NOTICE 'Renamed sport_id_new to sport_id in news table';
    END IF;
END $$;
*/

-- ============================================================
-- STEP 5: VERIFICATION QUERIES
-- ============================================================

-- Check competitions migration status
SELECT
    COUNT(*) as total_competitions,
    COUNT(sport_id) as competitions_with_sport_id,
    COUNT(sport) as competitions_with_old_sport_column,
    COUNT(*) - COUNT(sport_id) as competitions_missing_sport_id
FROM competitions;

-- Show any competitions that couldn't be migrated
SELECT id, name, sport, sport_id
FROM competitions
WHERE sport IS NOT NULL AND sport_id IS NULL
LIMIT 10;

-- Check news migration status
SELECT
    COUNT(*) as total_news,
    COUNT(sport_id_new) as news_with_sport_id,
    COUNT(sport) as news_with_old_sport_column,
    COUNT(*) - COUNT(sport_id_new) as news_missing_sport_id
FROM news;

-- Show any news that couldn't be migrated
SELECT id, title, sport, sport_id_new
FROM news
WHERE sport IS NOT NULL AND sport_id_new IS NULL
LIMIT 10;

-- Summary by sport
SELECT
    s.name as sport_name,
    COUNT(c.id) as competition_count
FROM sports s
LEFT JOIN competitions c ON c.sport_id = s.id
GROUP BY s.name
ORDER BY competition_count DESC;

COMMIT;

-- ============================================================
-- POST-MIGRATION CHECKLIST
-- ============================================================

-- [ ] Verify all competitions have sport_id populated
-- [ ] Verify sport_id_new is populated in news table
-- [ ] Test application with new sport_id foreign keys
-- [ ] Backup database before dropping old columns
-- [ ] Uncomment and run STEP 4 to drop old columns
-- [ ] Update application code to use sport_id instead of sport
-- [ ] Test all CRUD operations for competitions
-- [ ] Test all CRUD operations for news
-- [ ] Verify search functionality works with new structure
-- [ ] Update API documentation to reflect new structure

-- ============================================================
-- ROLLBACK SCRIPT (IF NEEDED)
-- ============================================================

/*
-- If you need to rollback the migration:

-- Restore sport column from sport_id
UPDATE competitions SET sport = s.name
FROM sports s
WHERE competitions.sport_id = s.id;

UPDATE news SET sport = s.name
FROM sports s
WHERE news.sport_id_new = s.id;

-- Drop foreign key columns
ALTER TABLE competitions DROP COLUMN IF EXISTS sport_id;
ALTER TABLE news DROP COLUMN IF EXISTS sport_id_new;

-- Drop the mapping function
DROP FUNCTION IF EXISTS get_sport_id_from_name(VARCHAR);

*/
