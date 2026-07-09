#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { Pool } = require("pg");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "tmp", "client-data-import");
const extractPath = path.join(outputDir, "client-data-extract.json");
const apply = process.argv.includes("--apply");
const skipExtract = process.argv.includes("--skip-extract");
const cache = {
  sports: new Map(),
  associations: new Map(),
  venues: new Map(),
  teams: new Map(),
  competitions: new Map(),
};

function runExtraction() {
  if (skipExtract && fs.existsSync(extractPath)) return;
  const script = path.join(__dirname, "extract-client-data.py");
  const result = spawnSync("python3", [script], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function normalize(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function slugify(value) {
  return normalize(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "item";
}

function parseTimestamp(date, time) {
  if (!date) return null;
  const safeTime = time && /^\d{1,2}:\d{2}$/.test(time) ? time : "15:00";
  return `${date} ${safeTime}:00`;
}

function uniqBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!key || map.has(key)) continue;
    map.set(key, item);
  }
  return Array.from(map.values());
}

async function findOne(client, sql, params) {
  const result = await client.query(sql, params);
  return result.rows[0] || null;
}

async function ensureSport(client, name, counters) {
  name = normalize(name);
  if (!name) return null;
  const cacheKey = name.toLowerCase();
  if (cache.sports.has(cacheKey)) return cache.sports.get(cacheKey);
  const existing = await findOne(
    client,
    "SELECT id FROM sports WHERE lower(name) = lower($1) AND deleted_at IS NULL LIMIT 1",
    [name]
  );
  if (existing) {
    counters.sports.existing += 1;
    cache.sports.set(cacheKey, existing.id);
    return existing.id;
  }
  if (!apply) {
    counters.sports.toCreate += 1;
    const dryId = `dry-sport:${slugify(name)}`;
    cache.sports.set(cacheKey, dryId);
    return dryId;
  }
  const inserted = await findOne(
    client,
    `INSERT INTO sports (name, slug, category, is_active, is_popular, display_order, metadata)
     VALUES ($1, $2, 'OTHER', true, false, 999, '{}')
     RETURNING id`,
    [name, slugify(name)]
  );
  counters.sports.created += 1;
  cache.sports.set(cacheKey, inserted.id);
  return inserted.id;
}

async function ensureAssociation(client, federation, counters) {
  const name = normalize(federation.name || federation.association);
  if (!name) return null;
  const cacheKey = name.toLowerCase();
  if (cache.associations.has(cacheKey)) return cache.associations.get(cacheKey);
  const existing = await findOne(
    client,
    "SELECT id FROM associations WHERE lower(name) = lower($1) AND deleted_at IS NULL LIMIT 1",
    [name]
  );
  if (existing) {
    counters.associations.existing += 1;
    cache.associations.set(cacheKey, existing.id);
    return existing.id;
  }
  if (!apply) {
    counters.associations.toCreate += 1;
    const dryId = `dry-association:${slugify(name)}`;
    cache.associations.set(cacheKey, dryId);
    return dryId;
  }
  const description = [
    federation.sport ? `Sporting discipline: ${federation.sport}` : "",
    federation.primaryContact ? `Primary contact: ${federation.primaryContact}` : "",
    federation.primaryPosition ? `Position: ${federation.primaryPosition}` : "",
    federation.notes ? `Notes: ${federation.notes}` : "",
  ].filter(Boolean).join(" | ");
  const inserted = await findOne(
    client,
    `INSERT INTO associations
       (name, abbreviation, description, website, contact_email, contact_phone, address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      name,
      normalize(federation.abbreviation).slice(0, 20) || null,
      description || null,
      normalize(federation.website) || null,
      normalize(federation.email) || null,
      normalize(federation.phone) || null,
      normalize(federation.address) || null,
    ]
  );
  counters.associations.created += 1;
  cache.associations.set(cacheKey, inserted.id);
  return inserted.id;
}

async function ensureVenue(client, name, counters) {
  name = normalize(name);
  if (!name || name === "..." || name.toLowerCase() === "tbd") return null;
  const cacheKey = name.toLowerCase();
  if (cache.venues.has(cacheKey)) return cache.venues.get(cacheKey);
  const existing = await findOne(
    client,
    "SELECT id FROM venues WHERE lower(name) = lower($1) AND deleted_at IS NULL LIMIT 1",
    [name]
  );
  if (existing) {
    counters.venues.existing += 1;
    cache.venues.set(cacheKey, existing.id);
    return existing.id;
  }
  if (!apply) {
    counters.venues.toCreate += 1;
    const dryId = `dry-venue:${slugify(name)}`;
    cache.venues.set(cacheKey, dryId);
    return dryId;
  }
  const inserted = await findOne(
    client,
    "INSERT INTO venues (name) VALUES ($1) RETURNING id",
    [name]
  );
  counters.venues.created += 1;
  cache.venues.set(cacheKey, inserted.id);
  return inserted.id;
}

async function ensureTeam(client, item, competitionId, counters) {
  const name = normalize(item.name);
  if (!name) return null;
  const cacheKey = name.toLowerCase();
  if (cache.teams.has(cacheKey)) return cache.teams.get(cacheKey);
  const existing = await findOne(
    client,
    "SELECT id FROM teams WHERE lower(name) = lower($1) AND deleted_at IS NULL LIMIT 1",
    [name]
  );
  if (existing) {
    counters.teams.existing += 1;
    cache.teams.set(cacheKey, existing.id);
    return existing.id;
  }
  if (!apply) {
    counters.teams.toCreate += 1;
    const dryId = `dry-team:${slugify(name)}`;
    cache.teams.set(cacheKey, dryId);
    return dryId;
  }
  const inserted = await findOne(
    client,
    `INSERT INTO teams (name, abbreviation, competition_id, category, gender)
     VALUES ($1, $2, $3, 'SENIOR', 'MIXED')
     RETURNING id`,
    [name, name.length <= 20 ? name : null, competitionId || null]
  );
  counters.teams.created += 1;
  cache.teams.set(cacheKey, inserted.id);
  return inserted.id;
}

async function ensureCompetition(client, item, associationId, sportId, counters) {
  const name = normalize(item.name || item.competition);
  if (!name) return null;
  const cacheKey = `${normalize(item.association).toLowerCase()}::${name.toLowerCase()}`;
  if (cache.competitions.has(cacheKey)) return cache.competitions.get(cacheKey);
  const existing = await findOne(
    client,
    `SELECT id FROM competitions
     WHERE lower(name) = lower($1)
       AND ($2::uuid IS NULL OR association_id = $2)
       AND deleted_at IS NULL
     LIMIT 1`,
    [name, apply && associationId && !String(associationId).startsWith("dry-") ? associationId : null]
  );
  if (existing) {
    counters.competitions.existing += 1;
    cache.competitions.set(cacheKey, existing.id);
    return existing.id;
  }
  if (!apply) {
    counters.competitions.toCreate += 1;
    const dryId = `dry-competition:${slugify(name)}`;
    cache.competitions.set(cacheKey, dryId);
    return dryId;
  }
  const inserted = await findOne(
    client,
    `INSERT INTO competitions
       (association_id, sport_id, name, sport, category, status, format, description, start_date, end_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      associationId || null,
      sportId || null,
      name,
      normalize(item.sport) || null,
      item.category || "OTHER",
      item.status || "UPCOMING",
      item.format || null,
      item.description || `Imported from ${item.source || "client data"}`,
      item.startDate || null,
      item.endDate || item.startDate || null,
    ]
  );
  counters.competitions.created += 1;
  cache.competitions.set(cacheKey, inserted.id);
  return inserted.id;
}

async function fixtureExists(client, competitionId, homeTeamId, awayTeamId, dateTime) {
  if (!apply || !competitionId || !homeTeamId || !awayTeamId) return false;
  const existing = await findOne(
    client,
    `SELECT id FROM fixtures
     WHERE competition_id = $1
       AND home_team_id = $2
       AND away_team_id = $3
       AND COALESCE(date_time, '1900-01-01'::timestamp) = COALESCE($4::timestamp, '1900-01-01'::timestamp)
       AND deleted_at IS NULL
     LIMIT 1`,
    [competitionId, homeTeamId, awayTeamId, dateTime]
  );
  return Boolean(existing);
}

async function main() {
  runExtraction();
  const data = JSON.parse(fs.readFileSync(extractPath, "utf8"));

  const counters = {
    sports: { existing: 0, toCreate: 0, created: 0 },
    associations: { existing: 0, toCreate: 0, created: 0 },
    venues: { existing: 0, toCreate: 0, created: 0 },
    teams: { existing: 0, toCreate: 0, created: 0 },
    competitions: { existing: 0, toCreate: 0, created: 0 },
    fixtures: { existing: 0, toCreate: 0, created: 0, skipped: 0 },
  };

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing in 246Sports-server/.env");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const sportIds = new Map();
    for (const sport of data.sports) {
      sportIds.set(sport.name, await ensureSport(client, sport.name, counters));
    }

    const federationByName = new Map(data.federations.map((item) => [normalize(item.name), item]));
    const neededAssociations = uniqBy(
      [
        ...data.federations,
        ...data.competitions.map((item) => ({ name: item.association })),
      ],
      (item) => normalize(item.name || item.association).toLowerCase()
    );

    const associationIds = new Map();
    for (const association of neededAssociations) {
      const name = normalize(association.name || association.association);
      const federation = federationByName.get(name) || association;
      associationIds.set(name, await ensureAssociation(client, federation, counters));
    }

    const competitionIds = new Map();
    for (const competition of data.competitions) {
      const sportId = sportIds.get(competition.sport) || await ensureSport(client, competition.sport, counters);
      const associationId = associationIds.get(normalize(competition.association));
      const id = await ensureCompetition(client, competition, associationId, sportId, counters);
      competitionIds.set(`${normalize(competition.association)}::${normalize(competition.name)}`, id);
      if (competition.venue) {
        await ensureVenue(client, competition.venue, counters);
      }
    }

    for (const fixture of data.fixtures) {
      const competitionKey = `${normalize(fixture.association)}::${normalize(fixture.competition)}`;
      const competitionId = competitionIds.get(competitionKey);
      if (!competitionId) {
        counters.fixtures.skipped += 1;
        continue;
      }
      const venueId = await ensureVenue(client, fixture.venue, counters);
      const homeTeamId = await ensureTeam(client, { name: fixture.homeTeam }, competitionId, counters);
      const awayTeamId = await ensureTeam(client, { name: fixture.awayTeam }, competitionId, counters);
      const dateTime = parseTimestamp(fixture.date, fixture.time);

      if (!homeTeamId || !awayTeamId) {
        counters.fixtures.skipped += 1;
        continue;
      }
      if (await fixtureExists(client, competitionId, homeTeamId, awayTeamId, dateTime)) {
        counters.fixtures.existing += 1;
        continue;
      }
      if (!apply) {
        counters.fixtures.toCreate += 1;
        continue;
      }
      await client.query(
        `INSERT INTO fixtures
           (competition_id, home_team_id, away_team_id, venue_id, date_time, status, round, stream_url)
         VALUES ($1, $2, $3, $4, $5, 'SCHEDULED', $6, $7)`,
        [
          competitionId,
          homeTeamId,
          awayTeamId,
          venueId,
          dateTime,
          normalize(fixture.round) || null,
          `import:${fixture.source}`,
        ]
      );
      counters.fixtures.created += 1;
    }

    if (apply) {
      await client.query("COMMIT");
    } else {
      await client.query("ROLLBACK");
    }
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }

  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", extract: data.summary, import: counters }, null, 2));
  if (!apply) {
    console.log("Dry-run only. Re-run with --apply to write to the database.");
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
