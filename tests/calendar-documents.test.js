const assert = require('node:assert/strict');
const { test } = require('node:test');
const records = [];
const operations = [];
const client = {
  release() {},
  async query(sql, params) {
    operations.push(sql);
    if (sql.startsWith('SELECT id FROM latest_updates')) {
      const found = records.find((row) => row.title === params[0] && row.sport === params[1] && row.start_date === params[2]);
      return { rows: found ? [found] : [] };
    }
    if (sql.includes('INSERT INTO latest_updates')) {
      const row = { id: params[0], title: params[1], sport: params[3], start_date: params[5], end_date: params[6], status: params[15] };
      records.push(row); return { rows: [row] };
    }
    if (sql.includes('UPDATE latest_updates SET')) {
      const row = records.find((r) => r.id === params[10]);
      row.end_date = params[1]; row.status = params[9] ? 'PUBLISHED' : 'DRAFT';
      return { rows: [row] };
    }
    return { rows: [] };
  },
};
const databasePath = require.resolve('../src/config/database');
require.cache[databasePath] = { id: databasePath, filename: databasePath, loaded: true, exports: {
  query: async () => ({ rows: [{ id: 'sport' }] }), pool: { connect: async () => client },
} };
const { importLatestUpdates } = require('../src/modules/latest-updates/latest-updates.controller');
const { parseDatedUpdates } = require('../src/modules/latest-updates/latest-updates.controller');
function response() { return { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } }; }
function request(csv, publish = false) { return {
  query: { publish: String(publish) }, body: { sport: 'Sailing' }, user: { userId: 'admin', role: 'SUPER_ADMIN' },
  file: { originalname: 'schedule.csv', buffer: Buffer.from(csv) },
}; }

test('calendar import publishes selected sport, then updates without duplicating on re-import', async () => {
  records.length = 0; operations.length = 0;
  const csv = 'title,start_date,end_date\nRegatta,2026-10-01,2026-10-02';
  const first = response();
  await importLatestUpdates(request(csv, true), first);
  assert.equal(first.statusCode, 201);
  assert.equal(records.length, 1);
  assert.equal(records[0].sport, 'Sailing');
  assert.equal(records[0].status, 'PUBLISHED');
  const second = response();
  await importLatestUpdates(request(csv.replace('2026-10-02', '2026-10-03')), second);
  assert.equal(second.statusCode, 201);
  assert.equal(records.length, 1);
  assert.equal(records[0].end_date, '2026-10-03');
  assert.equal(records[0].status, 'DRAFT');
  assert.equal(operations.filter((sql) => sql === 'COMMIT').length, 2);
});

test('invalid calendar CSV returns validation error without starting an import', async () => {
  operations.length = 0;
  const res = response();
  await importLatestUpdates(request('title,start_date\nRegatta,2026-02-30'), res);
  assert.equal(res.statusCode, 400);
  assert.equal(operations.length, 0);
});

test('calendar document reads date-first Word or TXT table rows', () => {
  const updates = parseDatedUpdates([
    'Date\tSport\tEvent\tTime\tVenue',
    'Mon 19 Oct 2026\tCricket\tIMC Over-40s Cricket World Cup: Colombia v Namibia\t09:30\tLusignan Community Centre Ground',
    'Tue 20 Oct 2026\tFootball\tPrime Minister’s Cup: Pinelands vs St Andrew Lions\t21:00\tSpeightstown',
  ].join('\n'));
  assert.equal(updates.length, 2);
  assert.deepEqual(updates[0], {
    title: 'IMC Over-40s Cricket World Cup: Colombia v Namibia',
    description: 'IMC Over-40s Cricket World Cup: Colombia v Namibia',
    sport: 'Cricket', event_type: 'FIXTURE', start_date: '2026-10-19', end_date: '2026-10-19',
    time: '09:30', venue: 'Lusignan Community Centre Ground', location: 'Lusignan Community Centre Ground',
    home_team: 'IMC Over-40s Cricket World Cup: Colombia', away_team: 'Namibia', confidence_score: 0.98,
  });
  assert.equal(updates[1].start_date, '2026-10-20');
  assert.equal(updates[1].sport, 'Football');
});
