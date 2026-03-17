-- ============================================================
-- SEED DATA: SPORT POSITIONS
-- Position data for major sports
-- Version: 1.0.0
-- Date: 2026-03-13
-- ============================================================

-- This file seeds position data for popular sports
-- Run this AFTER seed_sports_data.sql

-- ============================================================
-- HELPER FUNCTION TO GET SPORT IDs
-- ============================================================

DO $$
DECLARE
    football_id UUID;
    basketball_id UUID;
    cricket_id UUID;
    rugby_union_id UUID;
    rugby_league_id UUID;
    volleyball_id UUID;
    baseball_id UUID;
    netball_id UUID;
    hockey_id UUID;
    handball_id UUID;
    american_football_id UUID;
    tennis_id UUID;
    boxing_id UUID;
BEGIN
    -- Get Football ID
    SELECT id INTO football_id FROM sports WHERE slug = 'football' LIMIT 1;

    -- Get Basketball ID
    SELECT id INTO basketball_id FROM sports WHERE slug = 'basketball' LIMIT 1;

    -- Get Cricket ID
    SELECT id INTO cricket_id FROM sports WHERE slug = 'cricket' LIMIT 1;

    -- Get Rugby Union ID
    SELECT id INTO rugby_union_id FROM sports WHERE slug = 'rugby-union' LIMIT 1;

    -- Get Rugby League ID
    SELECT id INTO rugby_league_id FROM sports WHERE slug = 'rugby-league' LIMIT 1;

    -- Get Volleyball ID
    SELECT id INTO volleyball_id FROM sports WHERE slug = 'volleyball' LIMIT 1;

    -- Get Baseball ID
    SELECT id INTO baseball_id FROM sports WHERE slug = 'baseball' LIMIT 1;

    -- Get Netball ID
    SELECT id INTO netball_id FROM sports WHERE slug = 'netball' LIMIT 1;

    -- Get Field Hockey ID
    SELECT id INTO hockey_id FROM sports WHERE slug = 'field-hockey' LIMIT 1;

    -- Get Handball ID
    SELECT id INTO handball_id FROM sports WHERE slug = 'handball' LIMIT 1;

    -- Get American Football ID
    SELECT id INTO american_football_id FROM sports WHERE slug = 'american-football' LIMIT 1;

    -- Get Tennis ID
    SELECT id INTO tennis_id FROM sports WHERE slug = 'tennis' LIMIT 1;

    -- Get Boxing ID
    SELECT id INTO boxing_id FROM sports WHERE slug = 'boxing' LIMIT 1;

    -- ============================================================
    -- FOOTBALL POSITIONS
    -- ============================================================

    IF football_id IS NOT NULL THEN
        INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order) VALUES
        -- Goalkeepers
        (football_id, 'Goalkeeper', 'GK', 'The player responsible for preventing the opposing team from scoring', 1),

        -- Defenders
        (football_id, 'Center Back', 'CB', 'Central defender who marks opposing forwards', 10),
        (football_id, 'Full Back', 'FB', 'Defender who plays on the left or right flank', 11),
        (football_id, 'Left Back', 'LB', 'Defender who plays on the left side of defense', 12),
        (football_id, 'Right Back', 'RB', 'Defender who plays on the right side of defense', 13),
        (football_id, 'Wing Back', 'WB', 'Defender who plays wide and pushes forward', 14),
        (football_id, 'Sweeper', 'SW', 'Libero who plays behind the defensive line', 15),

        -- Midfielders
        (football_id, 'Central Midfielder', 'CM', 'Midfielder who operates in the center of the pitch', 20),
        (football_id, 'Defensive Midfielder', 'CDM', 'Holding midfielder who protects the defense', 21),
        (football_id, 'Attacking Midfielder', 'CAM', 'Creative midfielder who plays behind the strikers', 22),
        (football_id, 'Left Midfielder', 'LM', 'Midfielder who plays on the left side', 23),
        (football_id, 'Right Midfielder', 'RM', 'Midfielder who plays on the right side', 24),
        (football_id, 'Wide Midfielder', 'WM', 'Midfielder who plays on the wings', 25),

        -- Forwards
        (football_id, 'Center Forward', 'CF', 'Striker who plays in the center of attack', 30),
        (football_id, 'Striker', 'ST', 'Primary goal scorer for the team', 31),
        (football_id, 'Second Striker', 'SS', 'Support striker who plays behind the main striker', 32),
        (football_id, 'Left Winger', 'LW', 'Forward who plays on the left wing', 33),
        (football_id, 'Right Winger', 'RW', 'Forward who plays on the right wing', 34),
        (football_id, 'Winger', 'WG', 'Forward who plays on either wing', 35);
    END IF;

    -- ============================================================
    -- BASKETBALL POSITIONS
    -- ============================================================

    IF basketball_id IS NOT NULL THEN
        INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order) VALUES
        (basketball_id, 'Point Guard', 'PG', 'Primary ball handler and playmaker', 1),
        (basketball_id, 'Shooting Guard', 'SG', 'Specialist in three-point and mid-range shooting', 2),
        (basketball_id, 'Small Forward', 'SF', 'Versatile player on the wing', 3),
        (basketball_id, 'Power Forward', 'PF', 'Strong inside scorer and rebounder', 4),
        (basketball_id, 'Center', 'C', 'Tallest player, anchors defense and rebounds', 5);
    END IF;

    -- ============================================================
    -- CRICKET POSITIONS
    -- ============================================================

    IF cricket_id IS NOT NULL THEN
        INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order) VALUES
        -- Batsmen
        (cricket_id, 'Opening Batsman', 'OP', 'Batsman who faces the first over of the innings', 1),
        (cricket_id, 'Top Order Batsman', 'TB', 'Batsman batting in positions 1-3', 2),
        (cricket_id, 'Middle Order Batsman', 'MB', 'Batsman batting in positions 4-6', 3),
        (cricket_id, 'Lower Order Batsman', 'LB', 'Batsman batting in positions 7-9', 4),

        -- Bowlers
        (cricket_id, 'Fast Bowler', 'FB', 'Bowler who relies on pace', 10),
        (cricket_id, 'Swing Bowler', 'SB', 'Bowler who swings the ball', 11),
        (cricket_id, 'Spin Bowler', 'SP', 'Bowler who uses spin to deceive batsmen', 12),
        (cricket_id, 'Wrist Spin Bowler', 'WS', 'Bowler who uses wrist spin', 13),
        (cricket_id, 'Finger Spin Bowler', 'FS', 'Bowler who uses finger spin', 14),

        -- All-rounders
        (cricket_id, 'All-Rounder', 'AR', 'Player skilled in both batting and bowling', 20),
        (cricket_id, 'Bowling All-Rounder', 'BA', 'All-rounder who specializes in bowling', 21),
        (cricket_id, 'Batting All-Rounder', 'BR', 'All-rounder who specializes in batting', 22),

        -- Wicket-keeper
        (cricket_id, 'Wicket-Keeper', 'WK', 'Player who stands behind the stumps to catch balls', 30);
    END IF;

    -- ============================================================
    -- RUGBY UNION POSITIONS
    -- ============================================================

    IF rugby_union_id IS NOT NULL THEN
        INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order) VALUES
        -- Forwards (1-8)
        (rugby_union_id, 'Loosehead Prop', '1', 'Front row forward, number 1', 1),
        (rugby_union_id, 'Hooker', '2', 'Front row forward who throws in at lineouts', 2),
        (rugby_union_id, 'Tighthead Prop', '3', 'Front row forward, number 3', 3),
        (rugby_union_id, 'Lock', '4/5', 'Second row forward, jumper in lineout', 4),
        (rugby_union_id, 'Flanker', '6/7', 'Back row forward, openside or blindside', 5),
        (rugby_union_id, 'Number 8', '8', 'Back row forward at the back of the scrum', 6),

        -- Backs (9-15)
        (rugby_union_id, 'Scrum-Half', '9', 'Links forwards and backs, feeds scrum', 10),
        (rugby_union_id, 'Fly-Half', '10', 'Primary playmaker and kicker', 11),
        (rugby_union_id, 'Center', '12/13', 'Midfield back, inside or outside center', 12),
        (rugby_union_id, 'Winger', '11/14', 'Back who plays on the wing', 13),
        (rugby_union_id, 'Full Back', '15', 'Last line of defense', 14);
    END IF;

    -- ============================================================
    -- RUGBY LEAGUE POSITIONS
    -- ============================================================

    IF rugby_league_id IS NOT NULL THEN
        INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order) VALUES
        -- Forwards
        (rugby_league_id, 'Prop', 'PROP', 'Front row forward', 1),
        (rugby_league_id, 'Hooker', 'HOOKER', 'Front row forward, dummy half', 2),
        (rugby_league_id, 'Second Row', '2RF', 'Middle forward', 3),
        (rugby_league_id, 'Lock', 'LOCK', 'Middle forward or playmaker', 4),
        (rugby_league_id, 'Edge Forward', 'EDGE', 'Wide running forward', 5),

        -- Backs
        (rugby_league_id, 'Halfback', 'HF', 'Primary playmaker', 10),
        (rugby_league_id, 'Five-Eighth', '5/8', 'Second playmaker', 11),
        (rugby_league_id, 'Center', 'CTR', 'Midfield back', 12),
        (rugby_league_id, 'Winger', 'WNG', 'Outside back', 13),
        (rugby_league_id, 'Fullback', 'FB', 'Last line of defense', 14);
    END IF;

    -- ============================================================
    -- VOLLEYBALL POSITIONS
    -- ============================================================

    IF volleyball_id IS NOT NULL THEN
        INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order) VALUES
        (volleyball_id, 'Setter', 'S', 'Playmaker who sets up attacks', 1),
        (volleyball_id, 'Outside Hitter', 'OH', 'Primary attacker on the left side', 2),
        (volleyball_id, 'Opposite Hitter', 'OPP', 'Attacker on the right side', 3),
        (volleyball_id, 'Middle Blocker', 'MB', 'Blocker and quick attacker in the middle', 4),
        (volleyball_id, 'Libero', 'L', 'Defensive specialist in the back row', 5),
        (volleyball_id, 'Defensive Specialist', 'DS', 'Back row defensive player', 6);
    END IF;

    -- ============================================================
    -- BASEBALL POSITIONS
    -- ============================================================

    IF baseball_id IS NOT NULL THEN
        INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order) VALUES
        -- Infield
        (baseball_id, 'Pitcher', 'P', 'Throws the ball to the batter', 1),
        (baseball_id, 'Catcher', 'C', 'Catches pitches behind home plate', 2),
        (baseball_id, 'First Baseman', '1B', 'Fields balls hit to first base area', 3),
        (baseball_id, 'Second Baseman', '2B', 'Fields balls hit to second base area', 4),
        (baseball_id, 'Third Baseman', '3B', 'Fields balls hit to third base area', 5),
        (baseball_id, 'Shortstop', 'SS', 'Fields balls between second and third base', 6),

        -- Outfield
        (baseball_id, 'Left Fielder', 'LF', 'Outfielder on the left side', 10),
        (baseball_id, 'Center Fielder', 'CF', 'Outfielder in the middle', 11),
        (baseball_id, 'Right Fielder', 'RF', 'Outfielder on the right side', 12),

        -- Designated Hitter
        (baseball_id, 'Designated Hitter', 'DH', 'Bats in place of the pitcher', 20);
    END IF;

    -- ============================================================
    -- NETBALL POSITIONS
    -- ============================================================

    IF netball_id IS NOT NULL THEN
        INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order) VALUES
        (netball_id, 'Goal Shooter', 'GS', 'Scores goals in the shooting circle', 1),
        (netball_id, 'Goal Attack', 'GA', 'Attacks and shoots goals', 2),
        (netball_id, 'Wing Attack', 'WA', 'Feeds the ball to shooters', 3),
        (netball_id, 'Center', 'C', 'Links attack and defense', 4),
        (netball_id, 'Wing Defense', 'WD', 'Defends against wing attack', 5),
        (netball_id, 'Goal Defense', 'GD', 'Defends in the shooting circle', 6),
        (netball_id, 'Goal Keeper', 'GK', 'Defends the goal shooter', 7);
    END IF;

    -- ============================================================
    -- FIELD HOCKEY POSITIONS
    -- ============================================================

    IF hockey_id IS NOT NULL THEN
        INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order) VALUES
        (hockey_id, 'Goalkeeper', 'GK', 'Protects the goal', 1),
        (hockey_id, 'Full Back', 'FB', 'Defender on the left or right', 2),
        (hockey_id, 'Half Back', 'HB', 'Midfield defender', 3),
        (hockey_id, 'Midfielder', 'MF', 'Center of the pitch player', 4),
        (hockey_id, 'Forward', 'FW', 'Attacking player', 5),
        (hockey_id, 'Striker', 'ST', 'Primary goal scorer', 6);
    END IF;

    -- ============================================================
    -- HANDBALL POSITIONS
    -- ============================================================

    IF handball_id IS NOT NULL THEN
        INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order) VALUES
        (handball_id, 'Goalkeeper', 'GK', 'Protects the goal', 1),
        (handball_id, 'Left Back', 'LB', 'Back court player on left', 2),
        (handball_id, 'Center Back', 'CB', 'Central back court player', 3),
        (handball_id, 'Right Back', 'RB', 'Back court player on right', 4),
        (handball_id, 'Left Wing', 'LW', 'Wing player on left', 5),
        (handball_id, 'Right Wing', 'RW', 'Wing player on right', 6),
        (handball_id, 'Pivot', 'PV', 'Line player in front of goal', 7);
    END IF;

    -- ============================================================
    -- AMERICAN FOOTBALL POSITIONS
    -- ============================================================

    IF american_football_id IS NOT NULL THEN
        INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order) VALUES
        -- Offense
        (american_football_id, 'Quarterback', 'QB', 'Team leader, throws passes', 1),
        (american_football_id, 'Running Back', 'RB', 'Runs with the ball', 2),
        (american_football_id, 'Wide Receiver', 'WR', 'Catches passes', 3),
        (american_football_id, 'Tight End', 'TE', 'Blocks and catches passes', 4),
        (american_football_id, 'Offensive Lineman', 'OL', 'Blocks for the quarterback and running backs', 5),
        (american_football_id, 'Center', 'C', 'Snaps the ball', 6),
        (american_football_id, 'Guard', 'G', 'Interior offensive lineman', 7),
        (american_football_id, 'Tackle', 'T', 'Offensive lineman on the outside', 8),

        -- Defense
        (american_football_id, 'Defensive Lineman', 'DL', 'Rushes the quarterback', 10),
        (american_football_id, 'Defensive End', 'DE', 'Edge rusher', 11),
        (american_football_id, 'Defensive Tackle', 'DT', 'Interior defensive lineman', 12),
        (american_football_id, 'Linebacker', 'LB', 'Defends against runs and passes', 13),
        (american_football_id, 'Cornerback', 'CB', 'Covers wide receivers', 14),
        (american_football_id, 'Safety', 'S', 'Last line of defense', 15),

        -- Special Teams
        (american_football_id, 'Kicker', 'K', 'Kicks field goals and extra points', 20),
        (american_football_id, 'Punter', 'P', 'Punts the ball', 21),
        (american_football_id, 'Return Specialist', 'RS', 'Returns kicks and punts', 22);
    END IF;

    -- ============================================================
    -- TENNIS POSITIONS (Playing Styles)
    -- ============================================================

    IF tennis_id IS NOT NULL THEN
        INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order) VALUES
        (tennis_id, 'Singles Player', 'S', 'Competes in singles matches', 1),
        (tennis_id, 'Doubles Player', 'D', 'Competes in doubles matches', 2),
        (tennis_id, 'All-Rounder', 'AR', 'Skilled in both singles and doubles', 3);
    END IF;

    -- ============================================================
    -- BOXING POSITIONS
    -- ============================================================

    IF boxing_id IS NOT NULL THEN
        INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order) VALUES
        (boxing_id, 'Orthodox Stance', 'ORT', 'Right-handed boxer', 1),
        (boxing_id, 'Southpaw Stance', 'SP', 'Left-handed boxer', 2);
    END IF;

END $$;

-- ============================================================
-- VERIFY SEEDED POSITIONS
-- ============================================================

-- Show positions by sport
SELECT
    s.name as sport,
    sp.name as position,
    sp.abbreviation,
    sp.description
FROM sport_positions sp
JOIN sports s ON sp.sport_id = s.id
WHERE sp.deleted_at IS NULL
ORDER BY s.name, sp.display_order;

-- Count positions per sport
SELECT
    s.name as sport,
    COUNT(*) as position_count
FROM sport_positions sp
JOIN sports s ON sp.sport_id = s.id
WHERE sp.deleted_at IS NULL
GROUP BY s.name
ORDER BY position_count DESC;

COMMIT;
