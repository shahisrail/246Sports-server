const { query } = require('../src/config/database');

// Default positions for sports that don't have specific positions configured
const defaultPositionsBySport = {
  'checkers': [{ name: 'Player', abbreviation: 'N/A', description: 'Checkers game participant', display_order: 1 }],
  'bridge': [{ name: 'Player', abbreviation: 'N/A', description: 'Bridge game participant', display_order: 1 }],
  'cross-country': [{ name: 'Runner', abbreviation: 'N/A', description: 'Cross country runner', display_order: 1 }],
  'synchronized-swimming': [{ name: 'Synchronized Swimmer', abbreviation: 'N/A', description: 'Synchronized swimming athlete', display_order: 1 }],
  'marathon': [{ name: 'Marathon Runner', abbreviation: 'N/A', description: 'Long-distance runner', display_order: 1 }],
  'pentathlon': [{ name: 'Pentathlete', abbreviation: 'N/A', description: 'Multi-sport athlete', display_order: 1 }],
  'poker': [{ name: 'Poker Player', abbreviation: 'N/A', description: 'Card game participant', display_order: 1 }],
  'skateboarding': [{ name: 'Skateboarder', abbreviation: 'N/A', description: 'Skateboarding athlete', display_order: 1 }],
  'water-skiing': [{ name: 'Water Skier', abbreviation: 'N/A', description: 'Water skiing athlete', display_order: 1 }],
  'esports': [{ name: 'Esports Player', abbreviation: 'N/A', description: 'Competitive video gamer', display_order: 1 }],
  'race-walking': [{ name: 'Race Walker', abbreviation: 'N/A', description: 'Race walking athlete', display_order: 1 }],
  'racquetball': [{ name: 'Racquetball Player', abbreviation: 'N/A', description: 'Racquetball game participant', display_order: 1 }],
  'roller-skating': [{ name: 'Roller Skater', abbreviation: 'N/A', description: 'Roller skating athlete', display_order: 1 }],
  'surfing': [{ name: 'Surfer', abbreviation: 'N/A', description: 'Wave riding athlete', display_order: 1 }],
  'rugby-league': [{ name: 'Rugby League Player', abbreviation: 'N/A', description: 'Rugby league athlete', display_order: 1 }],
  'aussie-rules': [{ name: 'Australian Footballer', abbreviation: 'N/A', description: 'Australian rules football player', display_order: 1 }],
  'gaelic-football': [{ name: 'Gaelic Footballer', abbreviation: 'N/A', description: 'Gaelic football athlete', display_order: 1 }],
  'beach-volleyball': [{ name: 'Beach Volleyball Player', abbreviation: 'N/A', description: 'Beach volleyball athlete', display_order: 1 }],
  'canoeing': [{ name: 'Canoeist', abbreviation: 'N/A', description: 'Canoeing athlete', display_order: 1 }],
  'sepak-takraw': [{ name: 'Sepak Takraw Player', abbreviation: 'N/A', description: 'Sepak takraw athlete', display_order: 1 }],
  'darts': [{ name: 'Darts Player', abbreviation: 'N/A', description: 'Darts game participant', display_order: 1 }],
  'snooker': [{ name: 'Snooker Player', abbreviation: 'N/A', description: 'Snooker game participant', display_order: 1 }],
  'billiards': [{ name: 'Billiards Player', abbreviation: 'N/A', description: 'Billiards game participant', display_order: 1 }],
  'futsal': [{ name: 'Futsal Player', abbreviation: 'N/A', description: 'Futsal athlete', display_order: 1 }],
  'kayaking': [{ name: 'Kayaker', abbreviation: 'N/A', description: 'Kayaking athlete', display_order: 1 }],
  'bowling': [{ name: 'Bowler', abbreviation: 'N/A', description: 'Bowling athlete', display_order: 1 }],
  'trampoline': [{ name: 'Trampolinist', abbreviation: 'N/A', description: 'Trampoline athlete', display_order: 1 }],
  'ultimate-frisbee': [{ name: 'Ultimate Frisbee Player', abbreviation: 'N/A', description: 'Ultimate frisbee athlete', display_order: 1 }],
  'horse-racing': [{ name: 'Jockey', abbreviation: 'N/A', description: 'Horse racing rider', display_order: 1 }]
};

async function addDefaultPositions() {
  try {
    console.log('Adding default positions for sports...');

    for (const [slug, positions] of Object.entries(defaultPositionsBySport)) {
      // Get sport ID by slug
      const sportResult = await query(
        'SELECT id FROM sports WHERE slug = $1 AND is_active = true LIMIT 1',
        [slug]
      );

      if (sportResult.rows.length === 0) {
        console.log(`❌ Sport not found: ${slug}`);
        continue;
      }

      const sportId = sportResult.rows[0].id;

      // Check if positions already exist
      const existingPositions = await query(
        'SELECT COUNT(*) as count FROM sport_positions WHERE sport_id = $1',
        [sportId]
      );

      if (parseInt(existingPositions.rows[0].count) > 0) {
        console.log(`✓ ${slug} already has ${existingPositions.rows[0].count} position(s)`);
        continue;
      }

      // Add positions
      for (const position of positions) {
        await query(
          `INSERT INTO sport_positions (sport_id, name, abbreviation, description, display_order, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
           ON CONFLICT DO NOTHING`,
          [sportId, position.name, position.abbreviation, position.description, position.display_order]
        );
      }

      console.log(`✓ Added ${positions.length} position(s) for ${slug}`);
    }

    console.log('\n✅ Default positions added successfully!');

    // Show summary
    const summary = await query(`
      SELECT s.name, COUNT(sp.id) as position_count
      FROM sports s
      LEFT JOIN sport_positions sp ON s.id = sp.sport_id
      WHERE s.is_active = true
      GROUP BY s.id, s.name
      ORDER BY position_count DESC, s.name
    `);

    console.log('\n📊 Position Summary:');
    console.log('-------------------');
    summary.rows.forEach(row => {
      console.log(`${row.name}: ${row.position_count} position(s)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding positions:', error);
    process.exit(1);
  }
}

// Run the script
addDefaultPositions();
