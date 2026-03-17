-- Add default positions for all sports
-- This script adds positions for sports that don't have any configured yet

-- Basketball (e9c31a91-9d99-4c15-b8c3-34fed7027fc4)
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('e9c31a91-9d99-4c15-b8c3-34fed7027fc4', 'Point Guard', 'PG', 'Primary ball handler and team leader', 1, true, NOW(), NOW()),
  ('e9c31a91-9d99-4c15-b8c3-34fed7027fc4', 'Shooting Guard', 'SG', 'Primary scorer and perimeter defender', 2, true, NOW(), NOW()),
  ('e9c31a91-9d99-4c15-b8c3-34fed7027fc4', 'Small Forward', 'SF', 'Versatile player on the wing', 3, true, NOW(), NOW()),
  ('e9c31a91-9d99-4c15-b8c3-34fed7027fc4', 'Power Forward', 'PF', 'Inside scorer and rebounder', 4, true, NOW(), NOW()),
  ('e9c31a91-9d99-4c15-b8c3-34fed7027fc4', 'Center', 'C', 'Main inside scorer and defensive anchor', 5, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Cricket (7772ed3b-dd79-47e7-9adb-36565402faaa)
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('7772ed3b-dd79-47e7-9adb-36565402faaa', 'Bowler', 'BWL', 'Player who delivers the ball to the batsman', 1, true, NOW(), NOW()),
  ('7772ed3b-dd79-47e7-9adb-36565402faaa', 'Batsman', 'BAT', 'Player who scores runs', 2, true, NOW(), NOW()),
  ('7772ed3b-dd79-47e7-9adb-36565402faaa', 'All-rounder', 'AR', 'Player skilled in both batting and bowling', 3, true, NOW(), NOW()),
  ('7772ed3b-dd79-47e7-9adb-36565402faaa', 'Wicket-keeper', 'WK', 'Player behind the stumps to catch balls', 4, true, NOW(), NOW()),
  ('7772ed3b-dd79-47e7-9adb-36565402faaa', 'Opening Batsman', 'OP', 'Batsman who faces the first ball', 5, true, NOW(), NOW()),
  ('7772ed3b-dd79-47e7-9adb-36565402faaa', 'Middle Order Batsman', 'MO', 'Batsman batting in the middle order', 6, true, NOW(), NOW()),
  ('7772ed3b-dd79-47e7-9adb-36565402faaa', 'Fast Bowler', 'FB', 'Bowler who delivers the ball at high speed', 7, true, NOW(), NOW()),
  ('7772ed3b-dd79-47e7-9adb-36565402faaa', 'Spin Bowler', 'SB', 'Bowler who uses spin to deceive the batsman', 8, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Tennis (ae9cb930-c18a-414c-80bf-849d32b0d075)
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('ae9cb930-c18a-414c-80bf-849d32b0d075', 'Singles Player', 'SINGLES', 'Player who competes in singles matches', 1, true, NOW(), NOW()),
  ('ae9cb930-c18a-414c-80bf-849d32b0d075', 'Doubles Player', 'DOUBLES', 'Player who competes in doubles matches', 2, true, NOW(), NOW()),
  ('ae9cb930-c18a-414c-80bf-849d32b0d075', 'Mixed Doubles Player', 'MIXED', 'Player who competes in mixed doubles', 3, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Swimming (f13a544a-0e65-45fa-b1b2-b1e109691dc0)
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('f13a544a-0e65-45fa-b1b2-b1e109691dc0', 'Freestyle', 'FREE', 'Swimmer specializing in freestyle events', 1, true, NOW(), NOW()),
  ('f13a544a-0e65-45fa-b1b2-b1e109691dc0', 'Backstroke', 'BACK', 'Swimmer specializing in backstroke events', 2, true, NOW(), NOW()),
  ('f13a544a-0e65-45fa-b1b2-b1e109691dc0', 'Breaststroke', 'BREAST', 'Swimmer specializing in breaststroke events', 3, true, NOW(), NOW()),
  ('f13a544a-0e65-45fa-b1b2-b1e109691dc0', 'Butterfly', 'FLY', 'Swimmer specializing in butterfly events', 4, true, NOW(), NOW()),
  ('f13a544a-0e65-45fa-b1b2-b1e109691dc0', 'Medley', 'MEDLEY', 'Swimmer competing in individual medley events', 5, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Track and Field (34739336-013e-417c-b655-a77fd15d52a0)
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('34739336-013e-417c-b655-a77fd15d52a0', 'Sprinter', 'SPRINT', 'Runner specializing in short distances', 1, true, NOW(), NOW()),
  ('34739336-013e-417c-b655-a77fd15d52a0', 'Middle Distance Runner', 'MID-D', 'Runner specializing in 800m-5000m events', 2, true, NOW(), NOW()),
  ('34739336-013e-417c-b655-a77fd15d52a0', 'Long Distance Runner', 'LONG-D', 'Runner specializing in 5000m+ events', 3, true, NOW(), NOW()),
  ('34739336-013e-417c-b655-a77fd15d52a0', 'Jumper', 'JUMP', 'Athlete specializing in jumping events', 4, true, NOW(), NOW()),
  ('34739336-013e-417c-b655-a77fd15d52a0', 'Thrower', 'THROW', 'Athlete specializing in throwing events', 5, true, NOW(), NOW()),
  ('34739336-013e-417c-b655-a77fd15d52a0', 'Hurdler', 'HURDLE', 'Runner specializing in hurdle events', 6, true, NOW(), NOW()),
  ('34739336-013e-417c-b655-a77fd15d52a0', 'Relay Runner', 'RELAY', 'Athlete competing in relay events', 7, true, NOW(), NOW()),
  ('34739336-013e-417c-b655-a77fd15d52a0', 'Decathlete', 'DEC', 'Athlete competing in decathlon', 8, true, NOW(), NOW()),
  ('34739336-013e-417c-b655-a77fd15d52a0', 'Heptathlete', 'HEPT', 'Athlete competing in heptathlon', 9, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Volleyball (e63be7de-c970-4516-923b-0a55bb67a3f9)
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('e63be7de-c970-4516-923b-0a55bb67a3f9', 'Setter', 'S', 'Player who sets the ball for attackers', 1, true, NOW(), NOW()),
  ('e63be7de-c970-4516-923b-0a55bb67a3f9', 'Outside Hitter', 'OH', 'Primary attacker on the left or right', 2, true, NOW(), NOW()),
  ('e63be7de-c970-4516-923b-0a55bb67a3f9', 'Middle Blocker', 'MB', 'Front-row player specializing in blocking', 3, true, NOW(), NOW()),
  ('e63be7de-c970-4516-923b-0a55bb67a3f9', 'Opposite', 'OPP', 'Primary attacker from the right side', 4, true, NOW(), NOW()),
  ('e63be7de-c970-4516-923b-0a55bb67a3f9', 'Libero', 'L', 'Defensive specialist in a different jersey', 5, true, NOW(), NOW()),
  ('e63be7de-c970-4516-923b-0a55bb67a3f9', 'Defensive Specialist', 'DS', 'Back-row defensive player', 6, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Rugby Union (413bd170-4594-4ab4-90e3-758f279365dd)
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('413bd170-4594-4ab4-90e3-758f279365dd', 'Prop', 'PROP', 'Front-row player in the scrum', 1, true, NOW(), NOW()),
  ('413bd170-4594-4ab4-90e3-758f279365dd', 'Hooker', 'HOOK', 'Front-row player who hooks the ball', 2, true, NOW(), NOW()),
  ('413bd170-4594-4ab4-90e3-758f279365dd', 'Lock', 'LOCK', 'Second-row player in the lineout', 3, true, NOW(), NOW()),
  ('413bd170-4594-4ab4-90e3-758f279365dd', 'Flanker', 'FLANK', 'Back-row forward', 4, true, NOW(), NOW()),
  ('413bd170-4594-4ab4-90e3-758f279365dd', 'Number 8', 'NO8', 'Back-row player who binds at the back', 5, true, NOW(), NOW()),
  ('413bd170-4594-4ab4-90e3-758f279365dd', 'Scrum-half', 'SH', 'Player who feeds the scrum', 6, true, NOW(), NOW()),
  ('413bd170-4594-4ab4-90e3-758f279365dd', 'Fly-half', 'FH', 'Primary playmaker and kicker', 7, true, NOW(), NOW()),
  ('413bd170-4594-4ab4-90e3-758f279365dd', 'Centre', 'C', 'Midfield back', 8, true, NOW(), NOW()),
  ('413bd170-4594-4ab4-90e3-758f279365dd', 'Winger', 'WING', 'Outside back or finisher', 9, true, NOW(), NOW()),
  ('413bd170-4594-4ab4-90e3-758f279365dd', 'Full-back', 'FB', 'Last line of defense', 10, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Baseball (c4194157-ccb1-4828-a348-e696b4e3e77b)
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('c4194157-ccb1-4828-a348-e696b4e3e77b', 'Pitcher', 'P', 'Player who throws the ball to batters', 1, true, NOW(), NOW()),
  ('c4194157-ccb1-4828-a348-e696b4e3e77b', 'Catcher', 'C', 'Player who catches pitches behind home plate', 2, true, NOW(), NOW()),
  ('c4194157-ccb1-4828-a348-e696b4e3e77b', 'Infielder', 'INF', 'Player who plays in the infield', 3, true, NOW(), NOW()),
  ('c4194157-ccb1-4828-a348-e696b4e3e77b', 'Outfielder', 'OF', 'Player who plays in the outfield', 4, true, NOW(), NOW()),
  ('c4194157-ccb1-4828-a348-e696b4e3e77b', 'Designated Hitter', 'DH', 'Player who bats but does not play in the field', 5, true, NOW(), NOW()),
  ('c4194157-ccb1-4828-a348-e696b4e3e77b', 'First Baseman', '1B', 'Infielder at first base', 6, true, NOW(), NOW()),
  ('c4194157-ccb1-4828-a348-e696b4e3e77b', 'Second Baseman', '2B', 'Infielder at second base', 7, true, NOW(), NOW()),
  ('c4194157-ccb1-4828-a348-e696b4e3e77b', 'Third Baseman', '3B', 'Infielder at third base', 8, true, NOW(), NOW()),
  ('c4194157-ccb1-4828-a348-e696b4e3e77b', 'Shortstop', 'SS', 'Infielder between second and third base', 9, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Ice Hockey (d5a4c596-ad2d-48bf-bf20-3f1076067f18)
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('d5a4c596-ad2d-48bf-bf20-3f1076067f18', 'Goalkeeper', 'G', 'Player who guards the net', 1, true, NOW(), NOW()),
  ('d5a4c596-ad2d-48bf-bf20-3f1076067f18', 'Defenseman', 'D', 'Player who defends and blocks shots', 2, true, NOW(), NOW()),
  ('d5a4c596-ad2d-48bf-bf20-3f1076067f18', 'Left Wing', 'LW', 'Forward on the left side', 3, true, NOW(), NOW()),
  ('d5a4c596-ad2d-48bf-bf20-3f1076067f18', 'Right Wing', 'RW', 'Forward on the right side', 4, true, NOW(), NOW()),
  ('d5a4c596-ad2d-48bf-bf20-3f1076067f18', 'Center', 'C', 'Forward in the middle of the ice', 5, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Netball (e469791e-940e-43cd-b8eb-4d9c38b10c9b)
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('e469791e-940e-43cd-b8eb-4d9c38b10c9b', 'Goal Shooter', 'GS', 'Scorer who shoots in the goal circle', 1, true, NOW(), NOW()),
  ('e469791e-940e-43cd-b8eb-4d9c38b10c9b', 'Goal Attack', 'GA', 'Attacking goal scorer and feeder', 2, true, NOW(), NOW()),
  ('e469791e-940e-43cd-b8eb-4d9c38b10c9b', 'Wing Attack', 'WA', 'Midcourt attacker and feeder', 3, true, NOW(), NOW()),
  ('e469791e-940e-43cd-b8eb-4d9c38b10c9b', 'Center', 'C', 'Midcourt player who links attack and defense', 4, true, NOW(), NOW()),
  ('e469791e-940e-43cd-b8eb-4d9c38b10c9b', 'Wing Defense', 'WD', 'Midcourt defender', 5, true, NOW(), NOW()),
  ('e469791e-940e-43cd-b8eb-4d9c38b10c9b', 'Goal Defense', 'GD', 'Defender who guards the goal circle', 6, true, NOW(), NOW()),
  ('e469791e-940e-43cd-b8eb-4d9c38b10c9b', 'Goal Keeper', 'GK', 'Defender who guards the goal', 7, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Boxing (6ad9f744-6254-4e1e-956c-421b47baf921)
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('6ad9f744-6254-4e1e-956c-421b47baf921', 'Boxer', 'BOX', 'Athlete who competes in boxing matches', 1, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Chess (47211a9c-887f-465f-9d57-5a3d43c54e13)
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('47211a9c-887f-465f-9d57-5a3d43c54e13', 'Chess Player', 'N/A', 'Player who competes in chess tournaments', 1, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Cycling (c83d360e-461f-4008-8f91-571533fa3ba2)
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('c83d360e-461f-4008-8f91-571533fa3ba2', 'Road Racer', 'ROAD', 'Cyclist who competes in road races', 1, true, NOW(), NOW()),
  ('c83d360e-461f-4008-8f91-571533fa3ba2', 'Track Cyclist', 'TRACK', 'Cyclist who competes in velodrome events', 2, true, NOW(), NOW()),
  ('c83d360e-461f-4008-8f91-571533fa3ba2', 'BMX Racer', 'BMX', 'Cyclist who competes in BMX events', 3, true, NOW(), NOW()),
  ('c83d360e-461f-4008-8f91-571533fa3ba2', 'Mountain Biker', 'MTB', 'Cyclist who competes in off-road events', 4, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Wrestling (17a43e4e-37bd-4e45-bd27-f8e546f192f2)
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('17a43e4e-37bd-4e45-bd27-f8e546f192f2', 'Wrestler', 'WREST', 'Athlete who competes in wrestling matches', 1, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Martial Arts (Karate, Judo, MMA, Taekwondo, Kickboxing)
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('0512bc75-6e5e-48d7-a32c-3d618096eb01', 'Karateka', 'KARATE', 'Practitioner of karate', 1, true, NOW(), NOW()),
  ('f0211edd-a760-4223-8b24-ad2c8dbe5c7b', 'Judoka', 'JUDO', 'Practitioner of judo', 1, true, NOW(), NOW()),
  ('a051d44f-baba-4461-94fe-37ced04cab85', 'MMA Fighter', 'MMA', 'Mixed martial arts fighter', 1, true, NOW(), NOW()),
  ('8786ddc4-52a9-43f9-8811-97c128431f9e', 'Taekwondo Practitioner', 'TKD', 'Practitioner of taekwondo', 1, true, NOW(), NOW()),
  ('4a9a7f59-416f-4ac9-a144-9d07e8cdc09e', 'Kickboxer', 'KB', 'Practitioner of kickboxing', 1, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Motor Sports
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('bc80d17e-6b13-41eb-80f2-fed5854db1bd', 'Formula 1 Driver', 'F1', 'Driver in Formula 1 racing', 1, true, NOW(), NOW()),
  ('f54f8789-87b1-4215-bda3-482e6d3ed282', 'MotoGP Rider', 'MOTOGP', 'Rider in MotoGP racing', 1, true, NOW(), NOW()),
  ('60279bcf-4782-4df4-b9ff-d6f0d22dd08d', 'NASCAR Driver', 'NASCAR', 'Driver in NASCAR racing', 1, true, NOW(), NOW()),
  ('3607a587-8456-42f6-862f-6636636b8416', 'Rally Driver', 'RALLY', 'Driver in rally racing', 1, true, NOW(), NOW()),
  ('2f6d48d5-0b58-4870-b101-4cfd3a031b5b', 'Kart Racer', 'KART', 'Driver in kart racing', 1, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Racket Sports (Badminton, Squash, Table Tennis)
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('2244ea22-929c-4a4e-ade6-4400bb9c9c2d', 'Singles Player', 'SINGLES', 'Badminton player in singles', 1, true, NOW(), NOW()),
  ('2244ea22-929c-4a4e-ade6-4400bb9c9c2d', 'Doubles Player', 'DOUBLES', 'Badminton player in doubles', 2, true, NOW(), NOW()),
  ('92bbb21f-024e-4b46-bcdd-b2d940a9c514', 'Singles Player', 'SINGLES', 'Squash player in singles', 1, true, NOW(), NOW()),
  ('92bbb21f-024e-4b46-bcdd-b2d940a9c514', 'Doubles Player', 'DOUBLES', 'Squash player in doubles', 2, true, NOW(), NOW()),
  ('30a92594-f7ec-4150-8258-05d5f7795e25', 'Singles Player', 'SINGLES', 'Table tennis player in singles', 1, true, NOW(), NOW()),
  ('30a92594-f7ec-4150-8258-05d5f7795e25', 'Doubles Player', 'DOUBLES', 'Table tennis player in doubles', 2, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Gymnastics
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('c57198e9-2e01-406b-b0ff-301201dd5017', 'Artistic Gymnast', 'ART', 'Gymnast competing in artistic events', 1, true, NOW(), NOW()),
  ('c57198e9-2e01-406b-b0ff-301201dd5017', 'Rhythmic Gymnast', 'RHYTHM', 'Gymnast competing in rhythmic events', 2, true, NOW(), NOW()),
  ('c57198e9-2e01-406b-b0ff-301201dd5017', 'Trampoline Gymnast', 'TRAMP', 'Gymnast competing in trampoline events', 3, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Diving
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('4e977496-81e2-4e73-b160-88ea156d8350', 'Springboard Diver', 'SPRING', 'Diver competing in springboard events', 1, true, NOW(), NOW()),
  ('4e977496-81e2-4e73-b160-88ea156d8350', 'Platform Diver', 'PLATFORM', 'Diver competing in platform events', 2, true, NOW(), NOW()),
  ('4e977496-81e2-4e73-b160-88ea156d8350', 'Synchronized Diver', 'SYNC', 'Diver competing in synchronized events', 3, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Equestrian
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('6bbac88e-fb77-420a-a97e-a5df6e7cbdbd', 'Dressage Rider', 'DRESSAGE', 'Equestrian competing in dressage', 1, true, NOW(), NOW()),
  ('6bbac88e-fb77-420a-a97e-a5df6e7cbdbd', 'Show Jumper', 'JUMP', 'Equestrian competing in show jumping', 2, true, NOW(), NOW()),
  ('6bbac88e-fb77-420a-a97e-a5df6e7cbdbd', 'Event Rider', 'EVENT', 'Equestrian competing in eventing', 3, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Fencing
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('139d0f90-e24f-4a33-9f0b-aeda7e7cdaa3', 'Foil Fencer', 'FOIL', 'Fencer competing with foil', 1, true, NOW(), NOW()),
  ('139d0f90-e24f-4a33-9f0b-aeda7e7cdaa3', 'Épée Fencer', 'EPEE', 'Fencer competing with épée', 2, true, NOW(), NOW()),
  ('139d0f90-e24f-4a33-9f0b-aeda7e7cdaa3', 'Sabre Fencer', 'SABRE', 'Fencer competing with sabre', 3, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Rowing
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('8bad16a9-3353-4f70-935f-7bdef79af7ad', 'Coxswain', 'COX', 'Person who steers the boat and directs the crew', 1, true, NOW(), NOW()),
  ('8bad16a9-3353-4f70-935f-7bdef79af7ad', 'Rower', 'ROW', 'Person who rows the boat', 2, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Shooting
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('ff730055-3232-4604-864d-5a97c9a84498', 'Rifle Shooter', 'RIFLE', 'Shooter specializing in rifle events', 1, true, NOW(), NOW()),
  ('ff730055-3232-4604-864d-5a97c9a84498', 'Pistol Shooter', 'PISTOL', 'Shooter specializing in pistol events', 2, true, NOW(), NOW()),
  ('ff730055-3232-4604-864d-5a97c9a84498', 'Shotgun Shooter', 'SHOTGUN', 'Shooter specializing in shotgun events', 3, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Archery
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('8f44dad0-c689-4a13-aacd-1647c04e78f3', 'Recurve Archer', 'RECURVE', 'Archer using a recurve bow', 1, true, NOW(), NOW()),
  ('8f44dad0-c689-4a13-aacd-1647c04e78f3', 'Compound Archer', 'COMPOUND', 'Archer using a compound bow', 2, true, NOW(), NOW()),
  ('8f44dad0-c689-4a13-aacd-1647c04e78f3', 'Barebow Archer', 'BAREBOW', 'Archer without sights or stabilizers', 3, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Golf
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('60f08da9-edd6-41ba-b7f3-8e7d35b152af', 'Golfer', 'GOLF', 'Player who competes in golf tournaments', 1, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Triathlon
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('c1cc4117-d12c-4055-9e4d-6c568dc941ca', 'Triathlete', 'TRI', 'Athlete competing in all three disciplines', 1, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Lacrosse
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('89624b48-2533-4ac3-8bc2-ed3f03989940', 'Attackman', 'ATT', 'Offensive player', 1, true, NOW(), NOW()),
  ('89624b48-2533-4ac3-8bc2-ed3f03989940', 'Midfielder', 'MID', 'Player who transitions between offense and defense', 2, true, NOW(), NOW()),
  ('89624b48-2533-4ac3-8bc2-ed3f03989940', 'Defender', 'DEF', 'Defensive player', 3, true, NOW(), NOW()),
  ('89624b48-2533-4ac3-8bc2-ed3f03989940', 'Goalkeeper', 'GK', 'Player who guards the goal', 4, true, NOW(), NOW()),
  ('89624b48-2533-4ac3-8bc2-ed3f03989940', 'Faceoff Specialist', 'FO', 'Player who takes faceoffs', 5, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Softball
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('1735d2fd-f423-4fb9-91b9-aa16b6923b43', 'Pitcher', 'P', 'Player who throws the ball', 1, true, NOW(), NOW()),
  ('1735d2fd-f423-4fb9-91b9-aa16b6923b43', 'Catcher', 'C', 'Player who catches the ball', 2, true, NOW(), NOW()),
  ('1735d2fd-f423-4fb9-91b9-aa16b6923b43', 'Infielder', 'INF', 'Player who plays in the infield', 3, true, NOW(), NOW()),
  ('1735d2fd-f423-4fb9-91b9-aa16b6923b43', 'Outfielder', 'OF', 'Player who plays in the outfield', 4, true, NOW(), NOW()),
  ('1735d2fd-f423-4fb9-91b9-aa16b6923b43', 'Designated Player', 'DP', 'Player who bats but does not play defense', 5, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- American Football
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('fcb0ee50-4254-4b56-87f4-6801f1e05d70', 'Quarterback', 'QB', 'Team leader who throws passes', 1, true, NOW(), NOW()),
  ('fcb0ee50-4254-4b56-87f4-6801f1e05d70', 'Running Back', 'RB', 'Ball carrier who runs with the ball', 2, true, NOW(), NOW()),
  ('fcb0ee50-4254-4b56-87f4-6801f1e05d70', 'Wide Receiver', 'WR', 'Pass catcher who runs routes', 3, true, NOW(), NOW()),
  ('fcb0ee50-4254-4b56-87f4-6801f1e05d70', 'Tight End', 'TE', 'Hybrid receiver and blocker', 4, true, NOW(), NOW()),
  ('fcb0ee50-4254-4b56-87f4-6801f1e05d70', 'Offensive Lineman', 'OL', 'Blocker on the offensive line', 5, true, NOW(), NOW()),
  ('fcb0ee50-4254-4b56-87f4-6801f1e05d70', 'Defensive Lineman', 'DL', 'Rusher on the defensive line', 6, true, NOW(), NOW()),
  ('fcb0ee50-4254-4b56-87f4-6801f1e05d70', 'Linebacker', 'LB', 'Defensive player who reads and reacts', 7, true, NOW(), NOW()),
  ('fcb0ee50-4254-4b56-87f4-6801f1e05d70', 'Defensive Back', 'DB', 'Defender in the secondary', 8, true, NOW(), NOW()),
  ('fcb0ee50-4254-4b56-87f4-6801f1e05d70', 'Kicker', 'K', 'Player who kicks field goals and extra points', 9, true, NOW(), NOW()),
  ('fcb0ee50-4254-4b56-87f4-6801f1e05d70', 'Punter', 'P', 'Player who punts the ball', 10, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Water Polo
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('f36a1aae-352c-4a01-807a-8ff5ae266408', 'Driver', 'D', 'Player who swims and shoots', 1, true, NOW(), NOW()),
  ('f36a1aae-352c-4a01-807a-8ff5ae266408', 'Goalkeeper', 'GK', 'Player who guards the goal', 2, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Handball
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('fe509d57-c08e-4fec-bef5-be7f260411d8', 'Goalkeeper', 'GK', 'Player who guards the goal', 1, true, NOW(), NOW()),
  ('fe509d57-c08e-4fec-bef5-be7f260411d8', 'Left Back', 'LB', 'Defender on the left wing', 2, true, NOW(), NOW()),
  ('fe509d57-c08e-4fec-bef5-be7f260411d8', 'Right Back', 'RB', 'Defender on the right wing', 3, true, NOW(), NOW()),
  ('fe509d57-c08e-4fec-bef5-be7f260411d8', 'Center Back', 'CB', 'Central defender', 4, true, NOW(), NOW()),
  ('fe509d57-c08e-4fec-bef5-be7f260411d8', 'Left Wing', 'LW', 'Attacker on the left side', 5, true, NOW(), NOW()),
  ('fe509d57-c08e-4fec-bef5-be7f260411d8', 'Right Wing', 'RW', 'Attacker on the right side', 6, true, NOW(), NOW()),
  ('fe509d57-c08e-4fec-bef5-be7f260411d8', 'Center', 'C', 'Playmaker in the middle', 7, true, NOW(), NOW()),
  ('fe509d57-c08e-4fec-bef5-be7f260411d8', 'Line Player', 'LP', 'Shooter and blocker', 8, true, NOW(), NOW()),
  ('fe509d57-c08e-4fec-bef5-be7f260411d8', 'Circle Runner', 'CR', 'Player who runs in the attacking zone', 9, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Field Hockey
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  ('f5498346-2fd8-4183-9a4d-4247186b1de6', 'Goalkeeper', 'GK', 'Player who guards the goal', 1, true, NOW(), NOW()),
  ('f5498346-2fd8-4183-9a4d-4247186b1de6', 'Defender', 'DEF', 'Player who prevents the opposition from scoring', 2, true, NOW(), NOW()),
  ('f5498346-2fd8-4183-9a4d-4247186b1de6', 'Midfielder', 'MID', 'Player who links defense and attack', 3, true, NOW(), NOW()),
  ('f5498346-2fd8-4183-9a4d-4247186b1de6', 'Forward', 'FWD', 'Attacking player who scores goals', 4, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Default positions for all other sports
INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
VALUES
  -- Default for sports without specific positions
  (SELECT id FROM sports WHERE slug = 'checkers' LIMIT 1, 'Player', 'N/A', 'Game participant', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'bridge' LIMIT 1, 'Player', 'N/A', 'Card game participant', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'cross-country' LIMIT 1, 'Runner', 'N/A', 'Distance runner', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'synchronized-swimming' LIMIT 1, 'Synchronized Swimmer', 'N/A', 'Swimmer in synchronized events', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'triathlon' LIMIT 1, 'Triathlete', 'N/A', 'Multi-sport athlete', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'marathon' LIMIT 1, 'Marathon Runner', 'N/A', 'Long-distance runner', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'pentathlon' LIMIT 1, 'Pentathlete', 'N/A', 'Multi-sport athlete', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'poker' LIMIT 1, 'Poker Player', 'N/A', 'Card game participant', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'skateboarding' LIMIT 1, 'Skateboarder', 'N/A', 'Skateboarding athlete', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'water-skiing' LIMIT 1, 'Water Skier', 'N/A', 'Water skiing athlete', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'esports' LIMIT 1, 'Esports Player', 'N/A', 'Competitive video gamer', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'race-walking' LIMIT 1, 'Race Walker', 'N/A', 'Race walking athlete', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'racquetball' LIMIT 1, 'Racquetball Player', 'N/A', 'Racquetball game participant', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'roller-skating' LIMIT 1, 'Roller Skater', 'N/A', 'Roller skating athlete', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'surfing' LIMIT 1, 'Surfer', 'N/A', 'Wave riding athlete', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'rugby-league' LIMIT 1, 'Rugby League Player', 'N/A', 'Rugby league athlete', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'aussie-rules' LIMIT 1, 'Australian Footballer', 'N/A', 'Australian rules football player', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'gaelic-football' LIMIT 1, 'Gaelic Footballer', 'N/A', 'Gaelic football athlete', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'beach-volleyball' LIMIT 1, 'Beach Volleyball Player', 'N/A', 'Beach volleyball athlete', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'canoeing' LIMIT 1, 'Canoeist', 'N/A', 'Canoeing athlete', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'sepak-takraw' LIMIT 1, 'Sepak Takraw Player', 'N/A', 'Sepak takraw athlete', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'darts' LIMIT 1, 'Darts Player', 'N/A', 'Darts game participant', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'snooker' LIMIT 1, 'Snooker Player', 'N/A', 'Snooker game participant', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'billiards' LIMIT 1, 'Billiards Player', 'N/A', 'Billiards game participant', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'futsal' LIMIT 1, 'Futsal Player', 'N/A', 'Futsal athlete', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'kayaking' LIMIT 1, 'Kayaker', 'N/A', 'Kayaking athlete', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'bowling' LIMIT 1, 'Bowler', 'N/A', 'Bowling athlete', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'trampoline' LIMIT 1, 'Trampolinist', 'N/A', 'Trampoline athlete', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'ultimate-frisbee' LIMIT 1, 'Ultimate Frisbee Player', 'N/A', 'Ultimate frisbee athlete', 1, true, NOW(), NOW()),
  (SELECT id FROM sports WHERE slug = 'horse-racing' LIMIT 1, 'Jockey', 'N/A', 'Horse racing rider', 1, true, NOW(), NOW())
ON CONFLICT DO NOTHING;
