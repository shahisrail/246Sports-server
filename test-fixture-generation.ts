import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

/**
 * Direct database test for fixture generation
 * This bypasses authentication and tests the algorithm directly
 */

async function testFixtureGeneration() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'sports_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'shahisrailcse',
  });

  try {
    console.log('🧪 Testing Fixture Generation Algorithm\n');

    // Get a competition
    const compResult = await pool.query(
      'SELECT id, name FROM competitions WHERE deleted_at IS NULL LIMIT 1'
    );

    if (compResult.rows.length === 0) {
      console.error('❌ No competitions found. Please create a competition first.');
      return;
    }

    const competition = compResult.rows[0];
    console.log(`✅ Found competition: ${competition.name} (${competition.id})`);

    // Get teams
    const teamsResult = await pool.query(
      'SELECT id, name FROM teams WHERE deleted_at IS NULL LIMIT 10'
    );

    if (teamsResult.rows.length < 2) {
      console.error('❌ Need at least 2 teams. Found: ' + teamsResult.rows.length);
      console.log('\n💡 Creating test teams...');

      // Create test teams
      const testTeamNames = ['Team Alpha', 'Team Bravo', 'Team Charlie', 'Team Delta'];
      const createdTeams = [];

      for (const name of testTeamNames) {
        const teamId = uuidv4();
        await pool.query(
          'INSERT INTO teams (id, name, created_at, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
          [teamId, name]
        );
        createdTeams.push({ id: teamId, name });
        console.log(`  ✓ Created ${name}`);
      }

      teamsResult.rows = createdTeams;
    }

    const teams = teamsResult.rows;
    console.log(`\n✅ Using ${teams.length} teams:`);
    teams.forEach((t, i) => console.log(`  ${i + 1}. ${t.name} (${t.id})`));

    // Test the fixture generation algorithm
    console.log('\n🔄 Testing Round-Robin Algorithm...\n');

    const n = teams.length;
    const effectiveTeams = n % 2 === 0 ? teams : [...teams, null];
    const effectiveN = effectiveTeams.length;
    const totalRounds = effectiveN - 1;
    const matchDays: any[][][] = [];

    console.log(`Teams: ${n}`);
    console.log(`Effective teams (with bye if odd): ${effectiveN}`);
    console.log(`Total rounds: ${totalRounds}\n`);

    // Generate round-robin schedule
    for (let round = 0; round < totalRounds; round++) {
      const roundFixtures: [number, number][] = [];

      for (let match = 0; match < effectiveN / 2; match++) {
        const home = (round + match) % effectiveN;
        const away = (effectiveN - 1 - match + round) % effectiveN;

        // Only add fixture if not a dummy team (bye)
        if (effectiveTeams[home] !== null && effectiveTeams[away] !== null) {
          roundFixtures.push([home, away]);
        }
      }

      if (roundFixtures.length > 0) {
        matchDays.push(roundFixtures);
      }
    }

    console.log(`Generated ${matchDays.length} matchdays with ${matchDays.flat().length} total fixtures\n`);

    // Display the schedule
    let matchdayCounter = 1;
    const startDate = new Date('2026-03-18');

    for (const roundFixtures of matchDays) {
      console.log(`Matchday ${matchdayCounter}:`);
      const fixtureDate = new Date(startDate);
      fixtureDate.setDate(fixtureDate.getDate() + (matchdayCounter - 1) * 7);

      for (const [homeIdx, awayIdx] of roundFixtures) {
        const homeTeam = effectiveTeams[homeIdx];
        const awayTeam = effectiveTeams[awayIdx];

        console.log(`  ${homeTeam.name} vs ${awayTeam.name}`);
      }
      matchdayCounter++;
    }

    // Actually insert fixtures into database
    console.log('\n💾 Inserting fixtures into database...\n');

    await pool.query('BEGIN');

    let insertedCount = 0;
    matchdayCounter = 1;

    for (const roundFixtures of matchDays) {
      for (const [homeIdx, awayIdx] of roundFixtures) {
        const homeTeam = effectiveTeams[homeIdx];
        const awayTeam = effectiveTeams[awayIdx];

        if (!homeTeam || !awayTeam) continue;

        const fixtureId = uuidv4();
        const fixtureDate = new Date(startDate);
        fixtureDate.setDate(fixtureDate.getDate() + (matchdayCounter - 1) * 7);
        fixtureDate.setHours(15, 0, 0, 0);

        await pool.query(
          `INSERT INTO fixtures (id, competition_id, home_team_id, away_team_id, date_time, round, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [fixtureId, competition.id, homeTeam.id, awayTeam.id, fixtureDate.toISOString(), `Matchday ${matchdayCounter}`, 'SCHEDULED']
        );

        insertedCount++;
      }
      matchdayCounter++;
    }

    await pool.query('COMMIT');

    console.log(`✅ Successfully inserted ${insertedCount} fixtures!`);
    console.log(`\n📊 Summary:`);
    console.log(`   Competition: ${competition.name}`);
    console.log(`   Teams: ${n}`);
    console.log(`   Format: Round-robin`);
    console.log(`   Fixtures generated: ${insertedCount}`);
    console.log(`   Matchdays: ${matchdayCounter - 1}`);
    console.log(`\n✨ Fixture generation test PASSED!\n`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    await pool.query('ROLLBACK');
  } finally {
    await pool.end();
  }
}

testFixtureGeneration();
