import { PoolClient } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export type ImportEntity =
  | 'sports'
  | 'associations'
  | 'clubs'
  | 'teams'
  | 'players'
  | 'venues'
  | 'competitions'
  | 'fixtures';

type CsvRow = Record<string, string>;

export interface ImportSummary {
  entity: ImportEntity;
  apply: boolean;
  totalRows: number;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; message: string; data: CsvRow }>;
  warnings: Array<{ row: number; message: string; data: CsvRow }>;
  actions: Array<{ row: number; action: 'create' | 'update' | 'skip'; entity: ImportEntity; name: string; id?: string }>;
}

const ENTITY_ORDER: ImportEntity[] = [
  'sports',
  'associations',
  'clubs',
  'teams',
  'players',
  'venues',
  'competitions',
  'fixtures',
];

const TEMPLATES: Record<ImportEntity, string> = {
  sports: [
    'id,name,slug,category,is_active,is_popular,display_order',
    ',Cricket,cricket,TEAM_SPORTS,true,true,1',
    ',Football,football,TEAM_SPORTS,true,true,2',
  ].join('\n'),
  associations: [
    'id,name,abbreviation,sport,logo,website,contact_email,contact_phone,address,founded_year',
    ',Barbados Cricket Association,BCA,Cricket,,https://example.com,info@example.com,+1 246 000 0000,Barbados,1933',
  ].join('\n'),
  clubs: [
    'id,name,association_id,association_name,logo,website,contact_email,contact_phone,address,founded_year,colors',
    ',Empire Club,,Barbados Cricket Association,,https://example.com,club@example.com,+1 246 000 0000,Barbados,1914,"Blue;White"',
  ].join('\n'),
  teams: [
    'id,name,club_id,club_name,association_name,competition_id,competition_name,category,gender,abbreviation,coach_name,logo,contact_email,contact_phone,colors',
    ',Empire Senior Team,,Empire Club,Barbados Cricket Association,,T20 Cup Zone B,SENIOR,MIXED,EM,Coach Name,,team@example.com,+1 246 000 0000,"Blue;White"',
  ].join('\n'),
  players: [
    'id,name,team_id,team_name,club_name,association_name,sport_id,sport,position,squad_number,date_of_birth,nationality,height,weight,photo,is_active,bio',
    ',John Smith,,Empire Senior Team,Empire Club,Barbados Cricket Association,,Cricket,Batter,10,1999-01-31,Barbados,180,75,,true,Right handed batter',
  ].join('\n'),
  venues: [
    'id,name,address,latitude,longitude,capacity,surface,photo,amenities',
    ',Bank Hall,Bridgetown Barbados,13.1132,-59.5988,5000,GRASS,,"Parking;Lights;Changing rooms"',
  ].join('\n'),
  competitions: [
    'id,name,sport_id,sport,association_id,association_name,category,status,format,description,start_date,end_date,website,contact_email,contact_phone,points_win,points_draw,points_loss',
    ',T20 Cup Zone B,,Cricket,,Barbados Cricket Association,TOURNAMENT,UPCOMING,T20,Imported T20 competition,2026-10-01,2026-11-30,https://example.com,info@example.com,+1 246 000 0000,2,1,0',
  ].join('\n'),
  fixtures: [
    'id,competition_id,competition_name,sport,home_team_id,home_team,away_team_id,away_team,venue_id,venue,date,time,status,round,stream_url',
    ',,T20 Cup Zone B,Cricket,,Empire Senior Team,,St. Catherine Senior Team,,Bank Hall,2026-10-10,15:00,SCHEDULED,Round Series 5,https://youtube.com/watch?v=example',
  ].join('\n'),
};

export function getImportEntities() {
  return ENTITY_ORDER;
}

export function getTemplate(entity: ImportEntity) {
  return TEMPLATES[entity];
}

export function isImportEntity(value: string): value is ImportEntity {
  return ENTITY_ORDER.includes(value as ImportEntity);
}

export function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field);
      field = '';
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((cell) => cell.trim() !== '')) rows.push(row);
  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => normalizeHeader(header));
  return rows.slice(1).map((values) => {
    const record: CsvRow = {};
    headers.forEach((header, index) => {
      record[header] = normalize(values[index]);
    });
    return record;
  });
}

export function toCsv(rows: Record<string, any>[]) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ].join('\n');
}

export async function exportReference(client: PoolClient, entity: ImportEntity) {
  const queries: Record<ImportEntity, string> = {
    sports: `SELECT id, name, slug, category, is_active FROM sports WHERE deleted_at IS NULL ORDER BY name`,
    associations: `SELECT id, name, abbreviation, contact_email FROM associations WHERE deleted_at IS NULL ORDER BY name`,
    clubs: `
      SELECT c.id, c.name, c.association_id, a.name AS association_name, c.contact_email
      FROM clubs c
      LEFT JOIN associations a ON a.id = c.association_id
      WHERE c.deleted_at IS NULL
      ORDER BY a.name NULLS LAST, c.name
    `,
    teams: `
      SELECT t.id, t.name, t.club_id, c.name AS club_name, c.association_id, a.name AS association_name,
             t.competition_id, comp.name AS competition_name
      FROM teams t
      LEFT JOIN clubs c ON c.id = t.club_id
      LEFT JOIN associations a ON a.id = c.association_id
      LEFT JOIN competitions comp ON comp.id = t.competition_id
      WHERE t.deleted_at IS NULL
      ORDER BY a.name NULLS LAST, c.name NULLS LAST, t.name
    `,
    players: `
      SELECT p.id, p.name, p.team_id, t.name AS team_name, c.name AS club_name, a.name AS association_name,
             p.position, p.squad_number
      FROM players p
      LEFT JOIN teams t ON t.id = p.team_id
      LEFT JOIN clubs c ON c.id = t.club_id
      LEFT JOIN associations a ON a.id = c.association_id
      WHERE p.deleted_at IS NULL
      ORDER BY t.name NULLS LAST, p.name
    `,
    venues: `SELECT id, name, address, latitude, longitude FROM venues WHERE deleted_at IS NULL ORDER BY name`,
    competitions: `
      SELECT c.id, c.name, c.sport, c.sport_id, c.association_id, a.name AS association_name, c.category, c.status
      FROM competitions c
      LEFT JOIN associations a ON a.id = c.association_id
      WHERE c.deleted_at IS NULL
      ORDER BY c.sport NULLS LAST, c.name
    `,
    fixtures: `
      SELECT f.id, f.competition_id, comp.name AS competition_name, comp.sport, f.home_team_id, ht.name AS home_team,
             f.away_team_id, at.name AS away_team, f.venue_id, v.name AS venue, f.date_time, f.status, f.round
      FROM fixtures f
      LEFT JOIN competitions comp ON comp.id = f.competition_id
      LEFT JOIN teams ht ON ht.id = f.home_team_id
      LEFT JOIN teams at ON at.id = f.away_team_id
      LEFT JOIN venues v ON v.id = f.venue_id
      WHERE f.deleted_at IS NULL
      ORDER BY f.date_time DESC NULLS LAST
      LIMIT 2000
    `,
  };

  const result = await client.query(queries[entity]);
  return toCsv(result.rows);
}

export async function importRows(client: PoolClient, entity: ImportEntity, rows: CsvRow[], apply: boolean): Promise<ImportSummary> {
  const summary: ImportSummary = {
    entity,
    apply,
    totalRows: rows.length,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    warnings: [],
    actions: [],
  };

  for (let index = 0; index < rows.length; index += 1) {
    const rowNumber = index + 2;
    const row = rows[index];
    try {
      if (isBlankRow(row)) {
        summary.skipped += 1;
        summary.actions.push({ row: rowNumber, action: 'skip', entity, name: 'Blank row' });
        continue;
      }

      const action = await importOne(client, entity, row, apply);
      summary[action.action === 'create' ? 'created' : action.action === 'update' ? 'updated' : 'skipped'] += 1;
      summary.actions.push({ row: rowNumber, entity, ...action });
    } catch (error: any) {
      summary.errors.push({ row: rowNumber, message: error?.message || 'Import failed', data: row });
    }
  }

  return summary;
}

async function importOne(client: PoolClient, entity: ImportEntity, row: CsvRow, apply: boolean) {
  switch (entity) {
    case 'sports':
      return importSport(client, row, apply);
    case 'associations':
      return importAssociation(client, row, apply);
    case 'clubs':
      return importClub(client, row, apply);
    case 'teams':
      return importTeam(client, row, apply);
    case 'players':
      return importPlayer(client, row, apply);
    case 'venues':
      return importVenue(client, row, apply);
    case 'competitions':
      return importCompetition(client, row, apply);
    case 'fixtures':
      return importFixture(client, row, apply);
    default:
      throw new Error('Unsupported import entity');
  }
}

async function importSport(client: PoolClient, row: CsvRow, apply: boolean) {
  const name = required(row.name, 'name');
  const existing = await findByIdOrName(client, 'sports', row.id, name);
  const slug = row.slug || slugify(name);
  const category = enumValue(row.category, 'OTHER').replace(/ /g, '_');
  const values = [
    name,
    slug,
    category,
    boolValue(row.is_active, true),
    boolValue(row.is_popular, false),
    intValue(row.display_order, 0),
  ];

  if (!apply) return actionFor(existing, name);
  if (existing) {
    await client.query(
      `UPDATE sports SET name=$1, slug=$2, category=$3, is_active=$4, is_popular=$5, display_order=$6, updated_at=CURRENT_TIMESTAMP WHERE id=$7`,
      [...values, existing.id]
    );
    return { action: 'update' as const, name, id: existing.id };
  }
  const id = row.id || uuidv4();
  await client.query(
    `INSERT INTO sports (id, name, slug, category, is_active, is_popular, display_order, metadata) VALUES ($1,$2,$3,$4,$5,$6,$7,'{}')`,
    [id, ...values]
  );
  return { action: 'create' as const, name, id };
}

async function importAssociation(client: PoolClient, row: CsvRow, apply: boolean) {
  const name = required(row.name, 'name');
  const existing = await findByIdOrName(client, 'associations', row.id, name);
  if (!apply) return actionFor(existing, name);
  const values = [
    name,
    row.logo || null,
    row.abbreviation || null,
    intOrNull(row.founded_year),
    row.description || (row.sport ? `Sporting discipline: ${row.sport}` : null),
    row.website || null,
    row.contact_email || null,
    row.contact_phone || null,
    row.address || null,
  ];
  if (existing) {
    await client.query(
      `UPDATE associations SET name=$1, logo=$2, abbreviation=$3, founded_year=$4, description=$5, website=$6, contact_email=$7, contact_phone=$8, address=$9, updated_at=CURRENT_TIMESTAMP WHERE id=$10`,
      [...values, existing.id]
    );
    return { action: 'update' as const, name, id: existing.id };
  }
  const id = row.id || uuidv4();
  await client.query(
    `INSERT INTO associations (id, name, logo, abbreviation, founded_year, description, website, contact_email, contact_phone, address) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [id, ...values]
  );
  return { action: 'create' as const, name, id };
}

async function importClub(client: PoolClient, row: CsvRow, apply: boolean) {
  const name = required(row.name, 'name');
  const associationId = await resolveAssociation(client, row.association_id, row.association_name);
  const existing = row.id ? await findById(client, 'clubs', row.id) : await findClub(client, name, associationId);
  if (!apply) return actionFor(existing, name);
  const values = [
    associationId,
    name,
    row.logo || null,
    intOrNull(row.founded_year),
    arrayValue(row.colors),
    row.address || null,
    row.website || null,
    row.contact_email || null,
    row.contact_phone || null,
  ];
  if (existing) {
    await client.query(
      `UPDATE clubs SET association_id=$1, name=$2, logo=$3, founded_year=$4, colors=$5, address=$6, website=$7, contact_email=$8, contact_phone=$9, updated_at=CURRENT_TIMESTAMP WHERE id=$10`,
      [...values, existing.id]
    );
    return { action: 'update' as const, name, id: existing.id };
  }
  const id = row.id || uuidv4();
  await client.query(
    `INSERT INTO clubs (id, association_id, name, logo, founded_year, colors, address, website, contact_email, contact_phone) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [id, ...values]
  );
  return { action: 'create' as const, name, id };
}

async function importTeam(client: PoolClient, row: CsvRow, apply: boolean) {
  const name = required(row.name, 'name');
  const clubId = await resolveClub(client, row.club_id, row.club_name, row.association_name, false);
  const competitionId = await resolveCompetition(client, row.competition_id, row.competition_name, row.sport, false);
  const existing = row.id ? await findById(client, 'teams', row.id) : await findTeam(client, name, clubId, competitionId);
  if (!apply) return actionFor(existing, name);
  const values = [
    clubId,
    competitionId,
    name,
    enumValue(row.category, 'SENIOR'),
    enumValue(row.gender, 'MIXED'),
    row.abbreviation || null,
    row.logo || null,
    row.coach_name || null,
    intOrNull(row.founded_year),
    arrayValue(row.colors),
    row.description || null,
    row.website || null,
    row.contact_email || null,
    row.contact_phone || null,
  ];
  if (existing) {
    await client.query(
      `UPDATE teams SET club_id=$1, competition_id=$2, name=$3, category=$4, gender=$5, abbreviation=$6, logo=$7, coach_name=$8, founded_year=$9, colors=$10, description=$11, website=$12, contact_email=$13, contact_phone=$14, updated_at=CURRENT_TIMESTAMP WHERE id=$15`,
      [...values, existing.id]
    );
    return { action: 'update' as const, name, id: existing.id };
  }
  const id = row.id || uuidv4();
  await client.query(
    `INSERT INTO teams (id, club_id, competition_id, name, category, gender, abbreviation, logo, coach_name, founded_year, colors, description, website, contact_email, contact_phone) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
    [id, ...values]
  );
  if (competitionId) {
    await client.query(
      `INSERT INTO team_competitions (team_id, competition_id) VALUES ($1,$2) ON CONFLICT (team_id, competition_id) DO NOTHING`,
      [id, competitionId]
    );
  }
  return { action: 'create' as const, name, id };
}

async function importPlayer(client: PoolClient, row: CsvRow, apply: boolean) {
  const name = required(row.name, 'name');
  const teamId = await resolveTeam(client, row.team_id, row.team_name, row.club_name, row.association_name, true);
  const sportId = await resolveSport(client, row.sport_id, row.sport, false);
  const existing = row.id ? await findById(client, 'players', row.id) : await findPlayer(client, name, teamId, row.squad_number);
  if (!apply) return actionFor(existing, name);
  const values = [
    name,
    teamId,
    row.photo || null,
    row.position || null,
    intOrNull(row.squad_number),
    dateOrNull(row.date_of_birth),
    row.nationality || null,
    intOrNull(row.height),
    intOrNull(row.weight),
    row.bio || null,
    boolValue(row.is_active, true),
    sportId,
  ];
  if (existing) {
    await client.query(
      `UPDATE players SET name=$1, team_id=$2, photo=$3, position=$4, squad_number=$5, date_of_birth=$6, nationality=$7, height=$8, weight=$9, bio=$10, is_active=$11, sport_id=$12, updated_at=CURRENT_TIMESTAMP WHERE id=$13`,
      [...values, existing.id]
    );
    return { action: 'update' as const, name, id: existing.id };
  }
  const id = row.id || uuidv4();
  await client.query(
    `INSERT INTO players (id, name, team_id, photo, position, squad_number, date_of_birth, nationality, height, weight, bio, is_active, sport_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [id, ...values]
  );
  return { action: 'create' as const, name, id };
}

async function importVenue(client: PoolClient, row: CsvRow, apply: boolean) {
  const name = required(row.name, 'name');
  const existing = await findByIdOrName(client, 'venues', row.id, name);
  if (!apply) return actionFor(existing, name);
  const values = [
    name,
    row.address || null,
    numberOrNull(row.latitude),
    numberOrNull(row.longitude),
    intOrNull(row.capacity),
    row.surface ? enumValue(row.surface, 'GRASS') : null,
    row.photo || null,
    arrayValue(row.amenities),
  ];
  if (existing) {
    await client.query(
      `UPDATE venues SET name=$1, address=$2, latitude=$3, longitude=$4, capacity=$5, surface=$6, photo=$7, amenities=$8, updated_at=CURRENT_TIMESTAMP WHERE id=$9`,
      [...values, existing.id]
    );
    return { action: 'update' as const, name, id: existing.id };
  }
  const id = row.id || uuidv4();
  await client.query(
    `INSERT INTO venues (id, name, address, latitude, longitude, capacity, surface, photo, amenities) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [id, ...values]
  );
  return { action: 'create' as const, name, id };
}

async function importCompetition(client: PoolClient, row: CsvRow, apply: boolean) {
  const name = required(row.name, 'name');
  const sportId = await resolveSport(client, row.sport_id, row.sport, false);
  const associationId = await resolveAssociation(client, row.association_id, row.association_name, false);
  const existing = row.id ? await findById(client, 'competitions', row.id) : await findCompetition(client, name, sportId, row.sport, associationId);
  if (!apply) return actionFor(existing, name);
  const values = [
    associationId,
    sportId,
    name,
    row.sport || null,
    enumValue(row.category, 'OTHER'),
    enumValue(row.status, 'UPCOMING'),
    row.format || null,
    row.description || null,
    dateOrNull(row.start_date),
    dateOrNull(row.end_date),
    row.website || null,
    row.contact_email || null,
    row.contact_phone || null,
    intValue(row.points_win, 3),
    intValue(row.points_draw, 1),
    intValue(row.points_loss, 0),
  ];
  if (existing) {
    await client.query(
      `UPDATE competitions SET association_id=$1, sport_id=$2, name=$3, sport=$4, category=$5, status=$6, format=$7, description=$8, start_date=$9, end_date=$10, website=$11, contact_email=$12, contact_phone=$13, points_win=$14, points_draw=$15, points_loss=$16, updated_at=CURRENT_TIMESTAMP WHERE id=$17`,
      [...values, existing.id]
    );
    return { action: 'update' as const, name, id: existing.id };
  }
  const id = row.id || uuidv4();
  await client.query(
    `INSERT INTO competitions (id, association_id, sport_id, name, sport, category, status, format, description, start_date, end_date, website, contact_email, contact_phone, points_win, points_draw, points_loss) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
    [id, ...values]
  );
  return { action: 'create' as const, name, id };
}

async function importFixture(client: PoolClient, row: CsvRow, apply: boolean) {
  const competitionId = await resolveCompetition(client, row.competition_id, row.competition_name, row.sport, true);
  const homeTeamId = await resolveTeam(client, row.home_team_id, row.home_team, undefined, undefined, true);
  const awayTeamId = await resolveTeam(client, row.away_team_id, row.away_team, undefined, undefined, true);
  const venueId = await resolveVenue(client, row.venue_id, row.venue, false);
  const dateTime = combineDateTime(row.date, row.time);
  const name = `${row.home_team || homeTeamId} vs ${row.away_team || awayTeamId}`;
  const existing = row.id ? await findById(client, 'fixtures', row.id) : await findFixture(client, competitionId, homeTeamId, awayTeamId, dateTime);
  if (!apply) return actionFor(existing, name);
  const values = [
    competitionId,
    homeTeamId,
    awayTeamId,
    venueId,
    dateTime,
    enumValue(row.status, 'SCHEDULED'),
    row.round || null,
    row.stream_url || null,
  ];
  if (existing) {
    await client.query(
      `UPDATE fixtures SET competition_id=$1, home_team_id=$2, away_team_id=$3, venue_id=$4, date_time=$5, status=$6, round=$7, stream_url=$8, updated_at=CURRENT_TIMESTAMP WHERE id=$9`,
      [...values, existing.id]
    );
    return { action: 'update' as const, name, id: existing.id };
  }
  const id = row.id || uuidv4();
  await client.query(
    `INSERT INTO fixtures (id, competition_id, home_team_id, away_team_id, venue_id, date_time, status, round, stream_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [id, ...values]
  );
  return { action: 'create' as const, name, id };
}

async function findById(client: PoolClient, table: string, id?: string) {
  if (!id) return null;
  const selectName = table === 'fixtures' ? 'id::text AS name' : 'name';
  const result = await client.query(`SELECT id, ${selectName} FROM ${table} WHERE id=$1 AND deleted_at IS NULL LIMIT 1`, [id]);
  return result.rows[0] || null;
}

async function findByIdOrName(client: PoolClient, table: string, id?: string, name?: string) {
  if (id) {
    const byId = await findById(client, table, id);
    if (byId) return byId;
  }
  if (!name) return null;
  const result = await client.query(`SELECT id, name FROM ${table} WHERE lower(name)=lower($1) AND deleted_at IS NULL LIMIT 1`, [name]);
  return result.rows[0] || null;
}

async function resolveSport(client: PoolClient, id?: string, name?: string, requiredValue = false) {
  if (!id && !name) {
    if (requiredValue) throw new Error('sport_id or sport is required');
    return null;
  }
  const found = await findByIdOrName(client, 'sports', id, name);
  if (!found && requiredValue) throw new Error(`Sport not found: ${id || name}`);
  return found?.id || null;
}

async function resolveAssociation(client: PoolClient, id?: string, name?: string, requiredValue = true) {
  if (!id && !name) {
    if (requiredValue) throw new Error('association_id or association_name is required');
    return null;
  }
  const found = await findByIdOrName(client, 'associations', id, name);
  if (!found && requiredValue) throw new Error(`Association not found: ${id || name}`);
  return found?.id || null;
}

async function resolveClub(client: PoolClient, id?: string, name?: string, associationName?: string, requiredValue = true) {
  if (id) {
    const found = await findById(client, 'clubs', id);
    if (found) return found.id;
  }
  if (!name) {
    if (requiredValue) throw new Error('club_id or club_name is required');
    return null;
  }
  const associationId = associationName ? await resolveAssociation(client, undefined, associationName, false) : null;
  const found = await findClub(client, name, associationId);
  if (!found && requiredValue) throw new Error(`Club not found: ${name}`);
  return found?.id || null;
}

async function resolveTeam(client: PoolClient, id?: string, name?: string, clubName?: string, associationName?: string, requiredValue = true) {
  if (id) {
    const found = await findById(client, 'teams', id);
    if (found) return found.id;
  }
  if (!name) {
    if (requiredValue) throw new Error('team_id or team_name is required');
    return null;
  }
  const clubId = clubName ? await resolveClub(client, undefined, clubName, associationName, false) : null;
  const found = await findTeam(client, name, clubId, null);
  if (!found && requiredValue) throw new Error(`Team not found: ${name}`);
  return found?.id || null;
}

async function resolveVenue(client: PoolClient, id?: string, name?: string, requiredValue = false) {
  if (!id && !name) {
    if (requiredValue) throw new Error('venue_id or venue is required');
    return null;
  }
  const found = await findByIdOrName(client, 'venues', id, name);
  if (!found && requiredValue) throw new Error(`Venue not found: ${id || name}`);
  return found?.id || null;
}

async function resolveCompetition(client: PoolClient, id?: string, name?: string, sport?: string, requiredValue = true) {
  if (id) {
    const found = await findById(client, 'competitions', id);
    if (found) return found.id;
  }
  if (!name) {
    if (requiredValue) throw new Error('competition_id or competition_name is required');
    return null;
  }
  const found = await findCompetition(client, name, null, sport, null);
  if (!found && requiredValue) throw new Error(`Competition not found: ${name}`);
  return found?.id || null;
}

async function findClub(client: PoolClient, name: string, associationId?: string | null) {
  const result = await client.query(
    `SELECT id, name FROM clubs WHERE lower(name)=lower($1) AND ($2::uuid IS NULL OR association_id=$2) AND deleted_at IS NULL LIMIT 1`,
    [name, associationId || null]
  );
  return result.rows[0] || null;
}

async function findTeam(client: PoolClient, name: string, clubId?: string | null, competitionId?: string | null) {
  const result = await client.query(
    `SELECT id, name FROM teams
     WHERE lower(name)=lower($1)
       AND ($2::uuid IS NULL OR club_id=$2)
       AND ($3::uuid IS NULL OR competition_id=$3)
       AND deleted_at IS NULL
     LIMIT 1`,
    [name, clubId || null, competitionId || null]
  );
  return result.rows[0] || null;
}

async function findPlayer(client: PoolClient, name: string, teamId: string | null, squadNumber?: string) {
  const result = await client.query(
    `SELECT id, name FROM players
     WHERE lower(name)=lower($1)
       AND ($2::uuid IS NULL OR team_id=$2)
       AND ($3::int IS NULL OR squad_number=$3)
       AND deleted_at IS NULL
     LIMIT 1`,
    [name, teamId || null, intOrNull(squadNumber)]
  );
  return result.rows[0] || null;
}

async function findCompetition(client: PoolClient, name: string, sportId?: string | null, sport?: string, associationId?: string | null) {
  const result = await client.query(
    `SELECT id, name FROM competitions
     WHERE lower(name)=lower($1)
       AND ($2::uuid IS NULL OR sport_id=$2)
       AND ($3::text IS NULL OR lower(coalesce(sport,''))=lower($3))
       AND ($4::uuid IS NULL OR association_id=$4)
       AND deleted_at IS NULL
     LIMIT 1`,
    [name, sportId || null, sport || null, associationId || null]
  );
  return result.rows[0] || null;
}

async function findFixture(client: PoolClient, competitionId: string | null, homeTeamId: string | null, awayTeamId: string | null, dateTime: string | null) {
  const result = await client.query(
    `SELECT id, id::text AS name FROM fixtures
     WHERE competition_id=$1 AND home_team_id=$2 AND away_team_id=$3
       AND COALESCE(date_time, '1900-01-01'::timestamp)=COALESCE($4::timestamp, '1900-01-01'::timestamp)
       AND deleted_at IS NULL
     LIMIT 1`,
    [competitionId, homeTeamId, awayTeamId, dateTime]
  );
  return result.rows[0] || null;
}

function normalizeHeader(value: string) {
  return normalize(value).toLowerCase().replace(/\s+/g, '_');
}

function normalize(value: any) {
  return String(value ?? '').trim();
}

function required(value: any, field: string) {
  const normalized = normalize(value);
  if (!normalized) throw new Error(`${field} is required`);
  return normalized;
}

function isBlankRow(row: CsvRow) {
  return Object.values(row).every((value) => !normalize(value));
}

function actionFor(existing: any, name: string) {
  return existing
    ? { action: 'update' as const, name, id: existing.id }
    : { action: 'create' as const, name };
}

function enumValue(value: any, fallback: string) {
  return normalize(value || fallback).toUpperCase().replace(/[\s-]+/g, '_');
}

function boolValue(value: any, fallback: boolean) {
  const normalized = normalize(value).toLowerCase();
  if (!normalized) return fallback;
  return ['true', '1', 'yes', 'y', 'active'].includes(normalized);
}

function intValue(value: any, fallback: number) {
  const parsed = Number.parseInt(normalize(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function intOrNull(value: any) {
  const normalized = normalize(value);
  if (!normalized) return null;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function numberOrNull(value: any) {
  const normalized = normalize(value);
  if (!normalized) return null;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function dateOrNull(value: any) {
  const normalized = normalize(value);
  return normalized || null;
}

function arrayValue(value: any) {
  const normalized = normalize(value);
  if (!normalized) return null;
  return normalized.split(/[;|]/).map((item) => item.trim()).filter(Boolean);
}

function combineDateTime(date: string, time?: string) {
  const safeDate = normalize(date);
  if (!safeDate) return null;
  const safeTime = normalize(time) || '15:00';
  return `${safeDate} ${safeTime}:00`;
}

function slugify(value: string) {
  return normalize(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';
}

function csvEscape(value: any) {
  const text = value == null ? '' : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}
