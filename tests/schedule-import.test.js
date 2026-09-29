const assert = require('node:assert/strict');
const { test } = require('node:test');
const { parseScheduleCsv } = require('../src/modules/latest-updates/schedule-csv');
const { importRows } = require('../src/modules/bulk-import/bulk-import.service');
const fixture = { competition_id: 'competition', home_team_id: 'home', away_team_id: 'away', date: '2026-10-05', time: '15:30', sport: 'Cricket' };
function database() {
  const writes = [];
  return { writes, query: async (sql, params) => {
    if (/^(INSERT|UPDATE)/.test(sql)) { writes.push({ sql, params }); return { rows: [] }; }
    if (sql.startsWith('SELECT sport, association_id FROM competitions') || sql.startsWith('SELECT c.sport')) return { rows: [{ sport: 'Cricket', association_id: 'association' }] };
    if (sql.includes('FROM fixtures') && sql.includes('WHERE id=$1')) return { rows: [{ id: params[0] }] };
    if (sql.includes('FROM fixtures')) return { rows: [] };
    if (sql.includes('WHERE id=$1')) return { rows: [{ id: params[0], name: params[0] }] };
    return { rows: [] };
  } };
}
test('fixture import blocks cross-sport rows before writing', async () => {
  const client = database();
  const result = await importRows(client, 'fixtures', [fixture], true, { sport: 'Football' });
  assert.equal(result.errors.length, 1); assert.equal(client.writes.length, 0);
});
test('fixture import validates competition sport even when CSV uses IDs', async () => {
  const client = database();
  const result = await importRows(client, 'fixtures', [{ ...fixture, sport: 'Football' }], true, { sport: 'Football' });
  assert.match(result.errors[0].message, /Competition does not belong/); assert.equal(client.writes.length, 0);
});
test('dry run validates malformed dates, times, statuses and same-team fixtures', async () => {
  for (const overrides of [{ date: '2026-02-30' }, { date: '' }, { time: '25:90' }, { status: 'INVALID' }, { away_team_id: 'home' }]) {
    const client = database();
    const result = await importRows(client, 'fixtures', [{ ...fixture, ...overrides }], false, { sport: 'Cricket' });
    assert.equal(result.errors.length, 1, JSON.stringify(overrides)); assert.equal(client.writes.length, 0);
  }
});
test('selected sport fills blank CSV sport and preview makes no changes', async () => {
  const client = database();
  const result = await importRows(client, 'fixtures', [{ ...fixture, sport: '' }], false, { sport: 'Cricket' });
  assert.equal(result.errors.length, 0); assert.equal(result.created, 1); assert.equal(client.writes.length, 0);
});
test('association administrator cannot import another association fixture', async () => {
  const client = database();
  const result = await importRows(client, 'fixtures', [fixture], true, { sport: 'Cricket', associationId: 'other' });
  assert.match(result.errors[0].message, /your association/); assert.equal(client.writes.length, 0);
});
test('rescheduling by ID updates the fixture instead of inserting another', async () => {
  const client = database();
  const result = await importRows(client, 'fixtures', [{ ...fixture, id: 'existing', date: '2026-10-08' }], true, { sport: 'Cricket' });
  assert.equal(result.errors.length, 0); assert.equal(result.updated, 1); assert.equal(client.writes.length, 1);
  assert.match(client.writes[0].sql, /^UPDATE fixtures/); assert.equal(client.writes[0].params[4], '2026-10-08 15:30:00');
});
test('calendar CSV reads quoted titles and preserves multi-day events', () => {
  const result = parseScheduleCsv('title,sport,start_date,end_date,venue\n"Sailing, Junior Regatta",Sailing,2026-10-01,2026-10-03,Bridgetown');
  assert.equal(result[0].title, 'Sailing, Junior Regatta'); assert.equal(result[0].end_date, '2026-10-03');
});
test('calendar CSV accepts existing client extraction headers', () => {
  const result = parseScheduleCsv('name,sport,startDate,endDate\nRegatta,Sailing,2026-10-01,2026-10-02');
  assert.equal(result[0].start_date, '2026-10-01');
});
test('calendar CSV rejects impossible dates and reversed ranges', () => {
  assert.throws(() => parseScheduleCsv('title,start_date\nRace,2026-02-30'), /valid YYYY-MM-DD/);
  assert.throws(() => parseScheduleCsv('title,start_date,end_date\nRace,2026-10-03,2026-10-01'), /cannot precede/);
});
