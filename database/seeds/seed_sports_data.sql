-- ============================================================
-- SEED DATA: SPORTS TABLE SYSTEM
-- Comprehensive Multi-Sport Platform Data
-- Version: 1.0.0
-- Date: 2026-03-13
-- ============================================================

-- This file contains seed data for the sports management system
-- Run this AFTER running the 001_add_sports_table_system.sql migration

-- ============================================================
-- TEAM SPORTS
-- ============================================================

INSERT INTO sports (id, name, slug, category, description, is_popular, display_order) VALUES
-- Football
(uuid_generate_v4(), 'Football', 'football', 'TEAM_SPORTS',
 'Association football, also known as soccer, is the most popular sport globally.', true, 1),

-- Basketball
(uuid_generate_v4(), 'Basketball', 'basketball', 'TEAM_SPORTS',
 'A team sport played with a ball on a rectangular court.', true, 2),

-- Cricket
(uuid_generate_v4(), 'Cricket', 'cricket', 'TEAM_SPORTS',
 'A bat-and-ball game played between two teams of eleven players.', true, 3),

-- Rugby Union
(uuid_generate_v4(), 'Rugby Union', 'rugby-union', 'TEAM_SPORTS',
 'A close-contact team sport played with an oval ball.', false, 4),

-- Rugby League
(uuid_generate_v4(), 'Rugby League', 'rugby-league', 'TEAM_SPORTS',
 'A full-contact team sport played with an oval ball.', false, 5),

-- Volleyball
(uuid_generate_v4(), 'Volleyball', 'volleyball', 'TEAM_SPORTS',
 'A team sport in which two teams of six players are separated by a net.', false, 6),

-- Beach Volleyball
(uuid_generate_v4(), 'Beach Volleyball', 'beach-volleyball', 'TEAM_SPORTS',
 'A team sport played by two teams of two players on a sand court divided by a net.', false, 7),

-- Handball
(uuid_generate_v4(), 'Handball', 'handball', 'TEAM_SPORTS',
 'A team sport in which two teams of seven players pass a ball using their hands.', false, 8),

-- Field Hockey
(uuid_generate_v4(), 'Field Hockey', 'field-hockey', 'TEAM_SPORTS',
 'A team sport played on a grass or turf field with curved sticks and a ball.', false, 9),

-- Ice Hockey
(uuid_generate_v4(), 'Ice Hockey', 'ice-hockey', 'TEAM_SPORTS',
 'A team sport played on ice with skates, sticks, and a puck.', false, 10),

-- Netball
(uuid_generate_v4(), 'Netball', 'netball', 'TEAM_SPORTS',
 'A ball sport played by two teams of seven players.', false, 11),

-- Baseball
(uuid_generate_v4(), 'Baseball', 'baseball', 'TEAM_SPORTS',
 'A bat-and-ball game played between two teams.', false, 12),

-- Softball
(uuid_generate_v4(), 'Softball', 'softball', 'TEAM_SPORTS',
 'A variant of baseball played with a larger ball.', false, 13),

-- American Football
(uuid_generate_v4(), 'American Football', 'american-football', 'TEAM_SPORTS',
 'A team sport played by two teams of eleven players on a rectangular field.', false, 14),

-- Aussie Rules Football
(uuid_generate_v4(), 'Aussie Rules Football', 'aussie-rules', 'TEAM_SPORTS',
 'A contact sport played with an oval ball on a large oval field.', false, 15),

-- Gaelic Football
(uuid_generate_v4(), 'Gaelic Football', 'gaelic-football', 'TEAM_SPORTS',
 'An Irish team sport played with a spherical ball.', false, 16),

-- Water Polo
(uuid_generate_v4(), 'Water Polo', 'water-polo', 'TEAM_SPORTS',
 'A team water sport played in a swimming pool.', false, 17);

-- ============================================================
-- RACKET SPORTS
-- ============================================================

INSERT INTO sports (id, name, slug, category, description, is_popular, display_order) VALUES
-- Tennis
(uuid_generate_v4(), 'Tennis', 'tennis', 'RACKET_SPORTS',
 'A racket sport played individually or in pairs.', true, 1),

-- Badminton
(uuid_generate_v4(), 'Badminton', 'badminton', 'RACKET_SPORTS',
 'A racket sport played using racquets to hit a shuttlecock across a net.', false, 2),

-- Table Tennis
(uuid_generate_v4(), 'Table Tennis', 'table-tennis', 'RACKET_SPORTS',
 'A racket sport played on a table with small rackets and a light ball.', false, 3),

-- Squash
(uuid_generate_v4(), 'Squash', 'squash', 'RACKET_SPORTS',
 'A racket sport played by two or four players in a four-walled court.', false, 4),

-- Racquetball
(uuid_generate_v4(), 'Racquetball', 'racquetball', 'RACKET_SPORTS',
 'A racket sport played with a hollow rubber ball in an indoor court.', false, 5);

-- ============================================================
-- AQUATICS
-- ============================================================

INSERT INTO sports (id, name, slug, category, description, is_popular, display_order) VALUES
-- Swimming
(uuid_generate_v4(), 'Swimming', 'swimming', 'AQUATICS',
 'Individual or team racing sport in water.', true, 1),

-- Diving
(uuid_generate_v4(), 'Diving', 'diving', 'AQUATICS',
 'The sport of jumping or falling into water from a platform.', false, 2),

-- Synchronized Swimming
(uuid_generate_v4(), 'Synchronized Swimming', 'synchronized-swimming', 'AQUATICS',
 'A hybrid form of swimming, dance, and gymnastics.', false, 3),

-- Water Skiing
(uuid_generate_v4(), 'Water Skiing', 'water-skiing', 'AQUATICS',
 'A surface water sport being pulled on skis behind a boat.', false, 4),

-- Surfing
(uuid_generate_v4(), 'Surfing', 'surfing', 'AQUATICS',
 'A surface water sport riding on a surfboard.', false, 5),

-- Rowing
(uuid_generate_v4(), 'Rowing', 'rowing', 'AQUATICS',
 'A sport of propelling boats using oars.', false, 6),

-- Canoeing
(uuid_generate_v4(), 'Canoeing', 'canoeing', 'AQUATICS',
 'A paddle sport involving propelling a canoe.', false, 7),

-- Kayaking
(uuid_generate_v4(), 'Kayaking', 'kayaking', 'AQUATICS',
 'A paddle sport involving propelling a kayak.', false, 8);

-- ============================================================
-- ATHLETICS (TRACK & FIELD)
-- ============================================================

INSERT INTO sports (id, name, slug, category, description, is_popular, display_order) VALUES
-- Track & Field
(uuid_generate_v4(), 'Track and Field', 'track-and-field', 'ATHLETICS',
 'Athletics competitions including running, jumping, and throwing.', true, 1),

-- Cross Country
(uuid_generate_v4(), 'Cross Country', 'cross-country', 'ATHLETICS',
 'Long-distance running over open terrain.', false, 2),

-- Road Racing
(uuid_generate_v4(), 'Road Racing', 'road-racing', 'ATHLETICS',
 'Running races conducted on paved roads.', false, 3),

-- Marathon
(uuid_generate_v4(), 'Marathon', 'marathon', 'ATHLETICS',
 'Long-distance running race of 42.195 kilometers.', false, 4),

-- Race Walking
(uuid_generate_v4(), 'Race Walking', 'race-walking', 'ATHLETICS',
 'A long-distance athletic discipline with specific rules.', false, 5);

-- ============================================================
-- COMBAT SPORTS
-- ============================================================

INSERT INTO sports (id, name, slug, category, description, is_popular, display_order) VALUES
-- Boxing
(uuid_generate_v4(), 'Boxing', 'boxing', 'COMBAT_SPORTS',
 'A combat sport where two people throw punches at each other.', true, 1),

-- Wrestling
(uuid_generate_v4(), 'Wrestling', 'wrestling', 'COMBAT_SPORTS',
 'A combat sport involving grappling techniques.', false, 2),

-- Judo
(uuid_generate_v4(), 'Judo', 'judo', 'COMBAT_SPORTS',
 'A modern martial art and combat sport.', false, 3),

-- Karate
(uuid_generate_v4(), 'Karate', 'karate', 'COMBAT_SPORTS',
 'A martial art developed in the Ryukyu Kingdom.', false, 4),

-- Taekwondo
(uuid_generate_v4(), 'Taekwondo', 'taekwondo', 'COMBAT_SPORTS',
 'A Korean martial art and Olympic sport.', false, 5),

-- MMA (Mixed Martial Arts)
(uuid_generate_v4(), 'Mixed Martial Arts', 'mma', 'COMBAT_SPORTS',
 'A full-contact combat sport based on striking and grappling.', false, 6),

-- Fencing
(uuid_generate_v4(), 'Fencing', 'fencing', 'COMBAT_SPORTS',
 'A combat sport using three types of swords.', false, 7),

-- Kickboxing
(uuid_generate_v4(), 'Kickboxing', 'kickboxing', 'COMBAT_SPORTS',
 'A group of stand-up combat sports based on kicking and punching.', false, 8);

-- ============================================================
-- INDIVIDUAL SPORTS
-- ============================================================

INSERT INTO sports (id, name, slug, category, description, is_popular, display_order) VALUES
-- Cycling
(uuid_generate_v4(), 'Cycling', 'cycling', 'INDIVIDUAL',
 'The use of bicycles for transport, recreation, or sport.', true, 1),

-- Gymnastics
(uuid_generate_v4(), 'Gymnastics', 'gymnastics', 'INDIVIDUAL',
 'Exercises requiring balance, strength, flexibility, and control.', false, 2),

-- Golf
(uuid_generate_v4(), 'Golf', 'golf', 'INDIVIDUAL',
 'A club-and-ball sport in which players use clubs to hit balls.', false, 3),

-- Skateboarding
(uuid_generate_v4(), 'Skateboarding', 'skateboarding', 'INDIVIDUAL',
 'An action sport riding on and performing tricks with a skateboard.', false, 4),

-- Roller Skating
(uuid_generate_v4(), 'Roller Skating', 'roller-skating', 'INDIVIDUAL',
 'Traveling on surfaces with roller skates.', false, 5),

-- Archery
(uuid_generate_v4(), 'Archery', 'archery', 'INDIVIDUAL',
 'The art, sport, or skill of using a bow to propel arrows.', false, 6),

-- Shooting
(uuid_generate_v4(), 'Shooting', 'shooting', 'INDIVIDUAL',
 'A competitive sport involving tests of proficiency using various types of guns.', false, 7),

-- Darts
(uuid_generate_v4(), 'Darts', 'darts', 'INDIVIDUAL',
 'A sport in which small missiles are thrown at a circular target.', false, 8),

-- Bowling
(uuid_generate_v4(), 'Bowling', 'bowling', 'INDIVIDUAL',
 'A target sport and recreational activity in which a player rolls a ball.', false, 9),

-- Billiards/Pool
(uuid_generate_v4(), 'Billiards', 'billiards', 'INDIVIDUAL',
 'A group of games played on a table with a cue and balls.', false, 10),

-- Trampoline
(uuid_generate_v4(), 'Trampoline', 'trampoline', 'INDIVIDUAL',
 'A competitive sport involving acrobatic movements on a trampoline.', false, 11);

-- ============================================================
-- MIND GAMES
-- ============================================================

INSERT INTO sports (id, name, slug, category, description, is_popular, display_order) VALUES
-- Chess
(uuid_generate_v4(), 'Chess', 'chess', 'MIND_GAMES',
 'A board game for two players involving strategy and tactics.', true, 1),

-- Checkers/Draughts
(uuid_generate_v4(), 'Checkers', 'checkers', 'MIND_GAMES',
 'A group of strategy board games for two players.', false, 2),

-- Bridge (Card Game)
(uuid_generate_v4(), 'Bridge', 'bridge', 'MIND_GAMES',
 'A trick-taking card game using a standard 52-card deck.', false, 3),

-- Poker
(uuid_generate_v4(), 'Poker', 'poker', 'MIND_GAMES',
 'A family of card games combining gambling, strategy, and skill.', false, 4),

-- E-Sports
(uuid_generate_v4(), 'E-Sports', 'esports', 'MIND_GAMES',
 'Competitive video gaming at a professional level.', false, 5);

-- ============================================================
-- MOTOR SPORTS
-- ============================================================

INSERT INTO sports (id, name, slug, category, description, is_popular, display_order) VALUES
-- Formula 1
(uuid_generate_v4(), 'Formula 1', 'formula-1', 'MOTOR_SPORTS',
 'The highest class of international auto racing.', false, 1),

-- MotoGP
(uuid_generate_v4(), 'MotoGP', 'motogp', 'MOTOR_SPORTS',
 'The premier class of motorcycle road racing.', false, 2),

-- NASCAR
(uuid_generate_v4(), 'NASCAR', 'nascar', 'MOTOR_SPORTS',
 'American auto racing known for stock car racing.', false, 3),

-- Rally Racing
(uuid_generate_v4(), 'Rally Racing', 'rally', 'MOTOR_SPORTS',
 'Road racing on public or private roads.', false, 4),

-- Kart Racing
(uuid_generate_v4(), 'Kart Racing', 'kart-racing', 'MOTOR_SPORTS',
 'Racing with open-wheel, four-wheeled vehicles known as karts.', false, 5);

-- ============================================================
-- OTHER SPORTS
-- ============================================================

INSERT INTO sports (id, name, slug, category, description, is_popular, display_order) VALUES
-- Horse Racing
(uuid_generate_v4(), 'Horse Racing', 'horse-racing', 'OTHER',
 'Equestrian performance sport involving racing horses.', false, 1),

-- Equestrian
(uuid_generate_v4(), 'Equestrian', 'equestrian', 'OTHER',
 'Competitive horse riding disciplines.', false, 2),

-- Triathlon
(uuid_generate_v4(), 'Triathlon', 'triathlon', 'OTHER',
 'A multisport race involving swimming, cycling, and running.', false, 3),

-- Pentathlon
(uuid_generate_v4(), 'Modern Pentathlon', 'pentathlon', 'OTHER',
 'A contest featuring five events: fencing, swimming, riding, running, and shooting.', false, 4),

-- Lacrosse
(uuid_generate_v4(), 'Lacrosse', 'lacrosse', 'OTHER',
 'A team sport played with a lacrosse stick and a lacrosse ball.', false, 5),

-- Ultimate Frisbee
(uuid_generate_v4(), 'Ultimate Frisbee', 'ultimate-frisbee', 'OTHER',
 'A team sport played with a flying disc.', false, 6),

-- Sepak Takraw
(uuid_generate_v4(), 'Sepak Takraw', 'sepak-takraw', 'OTHER',
 'A team sport native to Southeast Asia.', false, 7),

-- Futsal
(uuid_generate_v4(), 'Futsal', 'futsal', 'OTHER',
 'A variant of association football played on a hard court.', false, 8),

-- Snooker
(uuid_generate_v4(), 'Snooker', 'snooker', 'OTHER',
 'A cue sport played on a table with pockets.', false, 9);

-- ============================================================
-- SEEDING COMPLETE
-- ============================================================

-- Verify seeded data
SELECT category, COUNT(*) as sport_count
FROM sports
WHERE deleted_at IS NULL
GROUP BY category
ORDER BY sport_count DESC;

-- Display all seeded sports
SELECT
    category,
    name,
    is_popular,
    display_order
FROM sports
WHERE deleted_at IS NULL
ORDER BY category, display_order, name;

COMMIT;
